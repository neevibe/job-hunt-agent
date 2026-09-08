/**
 * AUTONOMOUS SCHEDULER
 *
 * Manages the daily application pipeline: discovers jobs, scores them,
 * generates CVs, queues applications, and distributes them across platforms
 * with rate limiting and capacity management.
 *
 * Target: 100 quality applications/day (configurable)
 */

import { db } from '@/db';
import {
  autonomousConfig,
  applicationQueue,
  agentActivity,
  dailyReport,
  job,
  jobScore,
  company,
} from '@/db/schema';
import { eq, and, sql, count, desc } from 'drizzle-orm';
import { runDiscovery } from '@/lib/engines/discovery';
import { enqueue, transitionStatus, getTodayApplicationCount, getQueueStats } from '@/lib/engines/application-queue';
import { scoreJob } from '@/lib/agents/job-scoring-agent';
import { analyzeJobDescription } from '@/lib/agents/job-intelligence-agent';
import { makeApplicationDecision } from '@/lib/agents/decision-engine';
import { generateDeduplicationHash, sleep, randomDelay } from '@/lib/utils';

export interface SchedulerStatus {
  isRunning: boolean;
  dailyTarget: number;
  applicationsToday: number;
  remaining: number;
  jobsDiscovered: number;
  jobsAnalyzed: number;
  jobsQualified: number;
  cvsGenerated: number;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
}

let schedulerRunning = false;
let lastRunAt: Date | null = null;

/**
 * Get the current scheduler status
 */
export async function getSchedulerStatus(candidateId: number = 1): Promise<SchedulerStatus> {
  const config = await db
    .select()
    .from(autonomousConfig)
    .where(eq(autonomousConfig.candidateId, candidateId))
    .limit(1);

  const dailyTarget = config[0]?.dailyApplicationLimit ?? 100;
  const applicationsToday = await getTodayApplicationCount();
  const queueStats = await getQueueStats();

  return {
    isRunning: schedulerRunning,
    dailyTarget,
    applicationsToday,
    remaining: Math.max(0, dailyTarget - applicationsToday),
    jobsDiscovered: queueStats.total,
    jobsAnalyzed: queueStats.total - queueStats.discovered,
    jobsQualified: queueStats.qualified + queueStats.cv_generating + queueStats.ready + queueStats.queued + queueStats.applying + queueStats.submitted,
    cvsGenerated: queueStats.ready + queueStats.queued + queueStats.applying + queueStats.submitted,
    lastRunAt,
    nextRunAt: null,
  };
}

/**
 * Run one cycle of the autonomous pipeline
 *
 * Pipeline:
 * 1. Discover new jobs across platforms
 * 2. Analyze and score discovered jobs
 * 3. Make application decisions
 * 4. Queue qualified jobs
 * 5. Log progress
 */
export async function runAutonomousCycle(candidateId: number = 1): Promise<{
  discovered: number;
  analyzed: number;
  qualified: number;
  queued: number;
  errors: string[];
}> {
  if (schedulerRunning) {
    return { discovered: 0, analyzed: 0, qualified: 0, queued: 0, errors: ['Scheduler already running'] };
  }

  schedulerRunning = true;
  lastRunAt = new Date();
  const errors: string[] = [];
  let discovered = 0;
  let analyzed = 0;
  let qualified = 0;
  let queued = 0;

  try {
    await logActivity('scheduler', 'cycle_start', '🚀 Starting autonomous cycle');

    // Step 1: Check daily capacity
    const todayCount = await getTodayApplicationCount();
    const config = await db
      .select()
      .from(autonomousConfig)
      .where(eq(autonomousConfig.candidateId, candidateId))
      .limit(1);

    const dailyLimit = config[0]?.dailyApplicationLimit ?? 100;
    const minScore = config[0]?.minimumMatchScore ?? 75;

    if (todayCount >= dailyLimit) {
      await logActivity('scheduler', 'capacity_full', `📊 Daily limit reached: ${todayCount}/${dailyLimit}`);
      return { discovered: 0, analyzed: 0, qualified: 0, queued: 0, errors: [] };
    }

    const remainingCapacity = dailyLimit - todayCount;

    // Step 2: Discover new jobs
    await logActivity('scheduler', 'discovery_start', '🔎 Starting job discovery');

    try {
      const discoveryResult = await runDiscovery();
      discovered = discoveryResult.newJobs;
      await logActivity('scheduler', 'discovery_complete', `📥 Discovered ${discovered} new jobs`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown discovery error';
      errors.push(`Discovery failed: ${msg}`);
      await logActivity('scheduler', 'discovery_error', `❌ Discovery error: ${msg}`, undefined, 'error');
    }

    // Step 3: Analyze and score unprocessed jobs
    const unprocessedJobs = await db
      .select()
      .from(applicationQueue)
      .where(eq(applicationQueue.status, 'discovered'))
      .orderBy(desc(applicationQueue.priority))
      .limit(50); // Process in batches

    for (const queueItem of unprocessedJobs) {
      try {
        await transitionStatus(queueItem.id, 'analyzing');

        // Get job data
        const jobData = await db
          .select()
          .from(job)
          .where(eq(job.id, queueItem.jobId))
          .limit(1);

        if (!jobData[0]) continue;
        const j = jobData[0];

        // Get company
        let companyName = 'Unknown';
        if (j.companyId) {
          const comp = await db
            .select()
            .from(company)
            .where(eq(company.id, j.companyId))
            .limit(1);
          companyName = comp[0]?.name || 'Unknown';
        }

        // Analyze JD
        try {
          await analyzeJobDescription(j.id, j.title, companyName, j.description);
        } catch {
          // Non-critical, continue with heuristic scoring
        }

        // Score the job
        const score = scoreJob({
          id: j.id,
          company: companyName,
          title: j.title,
          location: j.location || '',
          isRemote: j.isRemote || false,
          salaryMin: j.salaryMin ?? undefined,
          salaryMax: j.salaryMax ?? undefined,
          experienceMin: j.experienceMin ?? undefined,
          experienceMax: j.experienceMax ?? undefined,
          description: j.description,
          requiredSkills: j.requiredSkills || [],
          preferredSkills: j.preferredSkills || [],
        });

        // Store score
        await db.insert(jobScore).values({
          jobId: j.id,
          candidateId,
          overallScore: score.overallScore,
          aiRelevanceScore: score.aiRelevanceScore,
          productOwnershipScore: score.productOwnershipScore,
          pmExperienceScore: score.pmExperienceScore,
          domainScore: score.domainScore,
          leadershipScore: score.leadershipScore,
          analyticsScore: score.analyticsScore,
          seniorityScore: score.seniorityScore,
          locationScore: score.locationScore,
          explanation: score.explanation,
          recommendation: score.recommendation,
          strengths: score.strengths,
          gaps: score.gaps,
        });

        analyzed++;

        // Update queue with score
        await db
          .update(applicationQueue)
          .set({ matchScore: score.overallScore })
          .where(eq(applicationQueue.id, queueItem.id));

        // Step 4: Make application decision
        const decision = await makeApplicationDecision(
          j.id,
          candidateId,
          score.overallScore,
          { title: j.title, company: companyName, location: j.location || '' }
        );

        if (decision.shouldApply && score.overallScore >= minScore) {
          await transitionStatus(queueItem.id, 'qualified');
          qualified++;

          if (qualified <= remainingCapacity) {
            await transitionStatus(queueItem.id, 'queued');
            queued++;
          }

          await logActivity('scheduler', 'qualified', `🔥 ${companyName} - ${j.title}: ${score.overallScore}% → ${decision.action}`);
        } else {
          await transitionStatus(queueItem.id, 'skipped', {
            failureReason: decision.reason,
          });
          await logActivity('scheduler', 'skipped', `⏭️ ${companyName} - ${j.title}: ${score.overallScore}% → Skip: ${decision.reason}`);
        }

        // Rate limiting between analyses
        await randomDelay(200, 500);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Analysis failed for queue item ${queueItem.id}: ${msg}`);
        await transitionStatus(queueItem.id, 'failed', {
          failureReason: msg,
          failedAtStep: 'analysis',
        });
      }
    }

    await logActivity(
      'scheduler',
      'cycle_complete',
      `✅ Cycle complete: ${discovered} discovered, ${analyzed} analyzed, ${qualified} qualified, ${queued} queued`
    );
  } finally {
    schedulerRunning = false;
  }

  return { discovered, analyzed, qualified, queued, errors };
}

/**
 * Toggle autonomous mode
 */
export async function toggleAutonomousMode(
  candidateId: number,
  enabled: boolean
): Promise<void> {
  const existing = await db
    .select()
    .from(autonomousConfig)
    .where(eq(autonomousConfig.candidateId, candidateId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(autonomousConfig)
      .set({ isEnabled: enabled, updatedAt: new Date() })
      .where(eq(autonomousConfig.candidateId, candidateId));
  } else {
    await db.insert(autonomousConfig).values({
      candidateId,
      isEnabled: enabled,
    });
  }

  await logActivity(
    'scheduler',
    'mode_change',
    `${enabled ? '🟢' : '🔴'} Autonomous mode ${enabled ? 'enabled' : 'disabled'}`
  );
}

/**
 * Update autonomous configuration
 */
export async function updateAutonomousConfig(
  candidateId: number,
  updates: Partial<{
    dailyApplicationLimit: number;
    minimumMatchScore: number;
    autoApplyThreshold: number;
    humanReviewThreshold: number;
    maxApplicationsPerPlatform: number;
    targetLocations: string[];
    targetTitles: string[];
    targetCompanies: string[];
    blacklistedCompanies: string[];
    preferredPlatforms: string[];
    remotePreference: string;
    autoSubmitEnabled: boolean;
  }>
): Promise<void> {
  const existing = await db
    .select()
    .from(autonomousConfig)
    .where(eq(autonomousConfig.candidateId, candidateId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(autonomousConfig)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(autonomousConfig.candidateId, candidateId));
  } else {
    await db.insert(autonomousConfig).values({
      candidateId,
      ...updates,
    });
  }
}

/**
 * Generate end-of-day report
 */
export async function generateDailyReport(candidateId: number = 1): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const stats = await getQueueStats();
  const todayCount = await getTodayApplicationCount();

  await db.insert(dailyReport).values({
    reportDate: today,
    applicationsSubmitted: todayCount,
    jobsDiscovered: stats.total,
    jobsAnalyzed: stats.total - stats.discovered,
    jobsQualified: stats.qualified + stats.submitted,
    recommendations: ['Continue targeting GenAI Product Manager roles'],
  });

  await logActivity('scheduler', 'daily_report', `📊 Daily report generated: ${todayCount} applications submitted`);
}

/**
 * Log activity helper
 */
async function logActivity(
  agentName: string,
  actionType: string,
  message: string,
  details?: Record<string, unknown>,
  severity: string = 'info'
): Promise<void> {
  try {
    await db.insert(agentActivity).values({
      agentName,
      actionType,
      message,
      details: details ?? null,
      severity,
    });
    console.log(message);
  } catch {
    console.error('Failed to log activity:', message);
  }
}
