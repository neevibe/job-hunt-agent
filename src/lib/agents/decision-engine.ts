import { db } from '@/db';
import { autonomousConfig, application, applicationQueue } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface ApplicationDecision {
  shouldApply: boolean;
  action: 'priority_auto_apply' | 'auto_apply' | 'apply_if_capacity' | 'review' | 'skip';
  reason: string;
  skipReason?: string;
}

/**
 * Application decision engine that determines whether to apply to a specific job.
 * @param jobId The job ID
 * @param candidateId The candidate ID
 * @param matchScore The AI-calculated match score for the job (0-100)
 * @param jobData Additional job metadata (e.g., location, company)
 * @returns Decision on whether to apply and the recommended action
 */
export async function makeApplicationDecision(
  jobId: number,
  candidateId: number,
  matchScore: number,
  jobData: any
): Promise<ApplicationDecision> {
  console.log(`⚖️ [DecisionEngine] Evaluating job ${jobId} (Score: ${matchScore})`);

  try {
    // Check if already applied
    const existingApp = await db.query.application.findFirst({
      where: eq(application.jobId, jobId)
    });

    if (existingApp) {
      return {
        shouldApply: false,
        action: 'skip',
        reason: 'Already applied',
        skipReason: 'duplicate'
      };
    }

    // Load autonomous config (mocked fetching for demonstration if not fully implemented in schema yet)
    // const config = await db.query.autonomousConfig.findFirst({ where: eq(autonomousConfig.candidateId, candidateId) });
    const config = {
      dailyCapacity: 10,
      blacklistedCompanies: ['BadCorp', 'EvilInc']
    };

    if (config.blacklistedCompanies.includes(jobData.company)) {
      return {
        shouldApply: false,
        action: 'skip',
        reason: 'Company is blacklisted',
        skipReason: 'blacklist'
      };
    }

    // Check daily capacity remaining (mocked)
    const appsToday = 5; 
    const capacityRemaining = config.dailyCapacity - appsToday;

    let action: ApplicationDecision['action'] = 'skip';
    let shouldApply = false;
    let reason = '';

    if (matchScore >= 90) {
      shouldApply = true;
      action = 'priority_auto_apply';
      reason = 'Exceptional match score (>= 90)';
    } else if (matchScore >= 85) {
      shouldApply = true;
      action = 'auto_apply';
      reason = 'Strong match score (85-89)';
    } else if (matchScore >= 75) {
      if (capacityRemaining > 0) {
        shouldApply = true;
        action = 'apply_if_capacity';
        reason = 'Good match score (75-84) and capacity available';
      } else {
        shouldApply = false;
        action = 'skip';
        reason = 'Good match score but daily capacity reached';
        skipReason: 'capacity';
      }
    } else if (matchScore >= 65) {
      shouldApply = false;
      action = 'review';
      reason = 'Moderate match score (65-74), requires manual review';
    } else {
      shouldApply = false;
      action = 'skip';
      reason = 'Low match score (< 65)';
      skipReason: 'low_score';
    }

    return { shouldApply, action, reason };
  } catch (error) {
    console.error(`❌ ⚖️ [DecisionEngine] Error making decision for job ${jobId}:`, error);
    throw error;
  }
}
