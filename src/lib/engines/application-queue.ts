/**
 * APPLICATION QUEUE ENGINE
 *
 * Persistent queue with state machine for managing the lifecycle of job applications.
 * Uses PostgreSQL with row-level locking for concurrency safety.
 *
 * States: DISCOVERED → ANALYZING → QUALIFIED → CV_GENERATING → CV_VALIDATING →
 *         READY → QUEUED → APPLYING → SUBMITTED | SUBMISSION_UNCONFIRMED |
 *         FAILED → RETRY → HUMAN_REVIEW | SKIPPED | DUPLICATE
 */

import { db } from '@/db';
import { applicationQueue, agentActivity, job, application } from '@/db/schema';
import { eq, and, lt, isNull, desc, asc, sql, count, ne } from 'drizzle-orm';
import type { QueueStatus } from '@/lib/utils';

export interface QueueItem {
  id: number;
  jobId: number;
  candidateId: number;
  applicationId: number | null;
  cvId: number | null;
  status: QueueStatus;
  priority: number;
  matchScore: number | null;
  platform: string;
  retryCount: number;
  failureReason: string | null;
  failedAtStep: string | null;
  humanReviewReason: string | null;
  deduplicationHash: string | null;
  createdAt: Date | null;
}

export interface QueueStats {
  total: number;
  discovered: number;
  analyzing: number;
  qualified: number;
  cv_generating: number;
  ready: number;
  queued: number;
  applying: number;
  submitted: number;
  submission_unconfirmed: number;
  failed: number;
  retry: number;
  human_review: number;
  skipped: number;
  duplicate: number;
}

/**
 * Add a job to the application queue
 */
export async function enqueue(
  jobId: number,
  candidateId: number,
  platform: string,
  matchScore?: number,
  deduplicationHash?: string,
  priority?: number
): Promise<QueueItem | null> {
  // Check for duplicates
  if (deduplicationHash) {
    const existing = await db
      .select()
      .from(applicationQueue)
      .where(
        and(
          eq(applicationQueue.deduplicationHash, deduplicationHash),
          ne(applicationQueue.status, 'failed')
        )
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏭️ Duplicate detected for job ${jobId}, skipping`);
      return null;
    }
  }

  // Check if already in queue for this job
  const existingJob = await db
    .select()
    .from(applicationQueue)
    .where(
      and(
        eq(applicationQueue.jobId, jobId),
        eq(applicationQueue.candidateId, candidateId)
      )
    )
    .limit(1);

  if (existingJob.length > 0) {
    console.log(`⏭️ Job ${jobId} already in queue`);
    return null;
  }

  const [item] = await db
    .insert(applicationQueue)
    .values({
      jobId,
      candidateId,
      platform,
      matchScore: matchScore ?? null,
      deduplicationHash: deduplicationHash ?? null,
      priority: priority ?? (matchScore ? matchScore : 50),
      status: 'discovered',
    })
    .returning();

  await logActivity('queue', 'enqueue', `Job ${jobId} added to queue`, { jobId, platform, matchScore });

  return item as QueueItem;
}

/**
 * Transition a queue item to the next status
 */
export async function transitionStatus(
  queueId: number,
  newStatus: QueueStatus,
  additionalData?: Partial<{
    applicationId: number;
    cvId: number;
    failureReason: string;
    failedAtStep: string;
    humanReviewReason: string;
    confirmationId: string;
    screenshotPath: string;
  }>
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status: newStatus,
    updatedAt: new Date(),
  };

  if (additionalData?.applicationId) updateData.applicationId = additionalData.applicationId;
  if (additionalData?.cvId) updateData.cvId = additionalData.cvId;
  if (additionalData?.failureReason) updateData.failureReason = additionalData.failureReason;
  if (additionalData?.failedAtStep) updateData.failedAtStep = additionalData.failedAtStep;
  if (additionalData?.humanReviewReason) updateData.humanReviewReason = additionalData.humanReviewReason;
  if (additionalData?.confirmationId) updateData.confirmationId = additionalData.confirmationId;

  if (newStatus === 'applying') {
    updateData.startedAt = new Date();
  }
  if (['submitted', 'submission_unconfirmed', 'failed', 'skipped'].includes(newStatus)) {
    updateData.completedAt = new Date();
  }
  if (newStatus === 'retry') {
    updateData.retryCount = sql`${applicationQueue.retryCount} + 1`;
  }

  await db
    .update(applicationQueue)
    .set(updateData)
    .where(eq(applicationQueue.id, queueId));

  await logActivity('queue', 'transition', `Queue item ${queueId} → ${newStatus}`, {
    queueId,
    newStatus,
    ...additionalData,
  });
}

/**
 * Get the next item to process (with row-level locking)
 */
export async function dequeueNext(
  workerId: string,
  status: QueueStatus = 'queued'
): Promise<QueueItem | null> {
  // Find the highest priority unlocked item
  const items = await db
    .select()
    .from(applicationQueue)
    .where(
      and(
        eq(applicationQueue.status, status),
        isNull(applicationQueue.lockedBy)
      )
    )
    .orderBy(desc(applicationQueue.priority), asc(applicationQueue.createdAt))
    .limit(1);

  if (items.length === 0) return null;

  const item = items[0];

  // Lock the item
  await db
    .update(applicationQueue)
    .set({
      lockedBy: workerId,
      lockedAt: new Date(),
    })
    .where(
      and(
        eq(applicationQueue.id, item.id),
        isNull(applicationQueue.lockedBy)
      )
    );

  return item as QueueItem;
}

/**
 * Release a lock on a queue item
 */
export async function releaseLock(queueId: number): Promise<void> {
  await db
    .update(applicationQueue)
    .set({
      lockedBy: null,
      lockedAt: null,
    })
    .where(eq(applicationQueue.id, queueId));
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<QueueStats> {
  const results = await db
    .select({
      status: applicationQueue.status,
      count: count(),
    })
    .from(applicationQueue)
    .groupBy(applicationQueue.status);

  const stats: QueueStats = {
    total: 0,
    discovered: 0,
    analyzing: 0,
    qualified: 0,
    cv_generating: 0,
    ready: 0,
    queued: 0,
    applying: 0,
    submitted: 0,
    submission_unconfirmed: 0,
    failed: 0,
    retry: 0,
    human_review: 0,
    skipped: 0,
    duplicate: 0,
  };

  for (const row of results) {
    const status = row.status as keyof QueueStats;
    if (status in stats) {
      (stats as unknown as Record<string, number>)[status] = Number(row.count);
    }
    stats.total += Number(row.count);
  }

  return stats;
}

/**
 * Get items needing human review
 */
export async function getHumanReviewItems(limit: number = 20): Promise<QueueItem[]> {
  return await db
    .select()
    .from(applicationQueue)
    .where(eq(applicationQueue.status, 'human_review'))
    .orderBy(desc(applicationQueue.priority))
    .limit(limit) as QueueItem[];
}

/**
 * Get items that should be retried
 */
export async function getRetryItems(): Promise<QueueItem[]> {
  return await db
    .select()
    .from(applicationQueue)
    .where(
      and(
        eq(applicationQueue.status, 'retry'),
        lt(applicationQueue.retryCount, sql`${applicationQueue.maxRetries}`)
      )
    )
    .orderBy(desc(applicationQueue.priority)) as QueueItem[];
}

/**
 * Mark failed items that exceeded max retries as human_review
 */
export async function escalateExhaustedRetries(): Promise<number> {
  const result = await db
    .update(applicationQueue)
    .set({
      status: 'human_review',
      humanReviewReason: 'Max retries exceeded',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(applicationQueue.status, 'retry'),
        sql`${applicationQueue.retryCount} >= ${applicationQueue.maxRetries}`
      )
    )
    .returning();

  return result.length;
}

/**
 * Get today's application count
 */
export async function getTodayApplicationCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: count() })
    .from(applicationQueue)
    .where(
      and(
        eq(applicationQueue.status, 'submitted'),
        sql`${applicationQueue.completedAt} >= ${today}`
      )
    );

  return Number(result[0]?.count ?? 0);
}

/**
 * Log agent activity
 */
async function logActivity(
  agentName: string,
  actionType: string,
  message: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await db.insert(agentActivity).values({
      agentName,
      actionType,
      message,
      details: details ?? null,
      severity: 'info',
    });
  } catch {
    // Don't fail the main operation if logging fails
    console.error('Failed to log activity:', message);
  }
}
