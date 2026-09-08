import {
  type JobSourceAdapter,
  type Platform,
  type PlatformRateLimit,
  type DiscoveredJob,
  type SearchQuery,
  type ApplicationData,
  type ApplicationResult,
} from './types';

/**
 * Workday Job Source Adapter (Stub)
 * Workday utilizes proprietary tenant portals with multi-step auth and reCAPTCHA.
 * This adapter acts as a placeholder requiring browser automation or manual intervention.
 */
export class WorkdayAdapter implements JobSourceAdapter {
  readonly platform: Platform = 'workday';
  readonly name = 'Workday';

  readonly rateLimit: PlatformRateLimit = {
    maxRequestsPerMinute: 5,
    maxRequestsPerHour: 30,
    maxApplicationsPerDay: 10,
    minDelayBetweenRequestsMs: 4000,
    maxDelayBetweenRequestsMs: 12000,
  };

  /**
   * Stub search: Logs note that browser automation or manual import is required
   */
  async searchJobs(query: SearchQuery): Promise<DiscoveredJob[]> {
    console.log(
      `[WorkdayAdapter] searchJobs called with ${query.titles.length} titles and ${query.keywords.length} keywords. Stub adapter: Workday requires browser automation or manual import.`
    );
    return [];
  }

  /**
   * Stub details: Workday requires tenant session authentication
   */
  async getJobDetails(jobUrl: string): Promise<DiscoveredJob | null> {
    console.log(`[WorkdayAdapter] getJobDetails called for ${jobUrl}. Browser automation required.`);
    return null;
  }

  /**
   * Check candidate eligibility
   */
  async checkEligibility(_job: DiscoveredJob): Promise<{ eligible: boolean; reason?: string }> {
    return { eligible: true };
  }

  /**
   * Start application
   */
  async startApplication(_job: DiscoveredJob): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Workday requires manual account creation and multi-step application form',
    };
  }

  /**
   * Fill application
   */
  async fillApplication(
    _job: DiscoveredJob,
    _data: ApplicationData
  ): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Workday requires manual account creation and multi-step application form',
    };
  }

  /**
   * Upload resume
   */
  async uploadResume(_resumePath: string): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Workday requires manual account creation and multi-step application form',
    };
  }

  /**
   * Answer questions
   */
  async answerQuestions(
    _questions: string[],
    _answers: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Workday requires manual account creation and multi-step application form',
    };
  }

  /**
   * Submit application - flags for human review
   */
  async submitApplication(): Promise<ApplicationResult> {
    return {
      success: false,
      requiresHumanReview: true,
      humanReviewReason:
        'Workday requires manual account creation and multi-step application form',
      failedAtStep: 'submit',
    };
  }

  /**
   * Get confirmation
   */
  async getConfirmation(): Promise<ApplicationResult> {
    return {
      success: false,
      requiresHumanReview: true,
      humanReviewReason:
        'Workday confirmation requires manual review or browser portal verification',
    };
  }

  /**
   * Automation not supported via public API
   */
  supportsAutoSubmit(): boolean {
    return false;
  }
}

// Export default instance
export const workdayAdapter = new WorkdayAdapter();
