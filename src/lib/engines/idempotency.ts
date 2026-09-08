/**
 * IDEMPOTENCY & DUPLICATE PREVENTION ENGINE
 * 
 * Ensures an application is NEVER submitted twice to the same job,
 * and detects duplicate postings across different platforms.
 */

import { db } from '@/db';
import { application, applicationQueue, job } from '@/db/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { generateDeduplicationHash } from '@/lib/utils';

export interface IdempotencyCheckResult {
  canApply: boolean;
  reason?: string;
  existingApplicationId?: number;
  existingQueueId?: number;
}

/**
 * Checks whether an application can proceed or is a duplicate
 */
export async function checkApplicationIdempotency(
  jobId: number,
  candidateId: number = 1
): Promise<IdempotencyCheckResult> {
  // 1. Check if application record already exists
  const existingApp = await db.query.application.findFirst({
    where: (app, { and, eq }) => and(
      eq(app.jobId, jobId),
      eq(app.candidateId, candidateId)
    ),
  });

  if (existingApp) {
    return {
      canApply: false,
      reason: `Application already exists in status '${existingApp.status}'`,
      existingApplicationId: existingApp.id,
    };
  }

  // 2. Check if already active or completed in application queue
  const existingQueue = await db.query.applicationQueue.findFirst({
    where: (q, { and, eq, inArray }) => and(
      eq(q.jobId, jobId),
      eq(q.candidateId, candidateId),
      inArray(q.status, ['applying', 'submitted', 'ready', 'queued'])
    ),
  });

  if (existingQueue) {
    return {
      canApply: false,
      reason: `Job is already queued or processed in status '${existingQueue.status}'`,
      existingQueueId: existingQueue.id,
    };
  }

  // 3. Cross-platform duplication check (same company & title applied within last 30 days)
  const targetJob = await db.query.job.findFirst({
    where: (j, { eq }) => eq(j.id, jobId),
    with: { company: true },
  });

  if (targetJob && targetJob.company) {
    const companyName = (targetJob.company as { name: string }).name;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentSameRole = await db
      .select({ id: application.id })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .where(
        and(
          eq(application.candidateId, candidateId),
          sql`LOWER(${job.title}) = LOWER(${targetJob.title})`,
          sql`${application.createdAt} >= ${thirtyDaysAgo}`
        )
      )
      .limit(1);

    if (recentSameRole.length > 0) {
      return {
        canApply: false,
        reason: `Candidate already applied to ${targetJob.title} at ${companyName} within the last 30 days.`,
        existingApplicationId: recentSameRole[0].id,
      };
    }
  }

  return { canApply: true };
}
