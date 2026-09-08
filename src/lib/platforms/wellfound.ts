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
 * Wellfound (AngelList Talent) Job Source Adapter (Stub)
 * Wellfound requires browser session or GraphQL authentication.
 * This adapter acts as a placeholder requiring browser automation or manual intervention.
 */
export class WellfoundAdapter implements JobSourceAdapter {
  readonly platform: Platform = 'wellfound';
  readonly name = 'Wellfound';

  readonly rateLimit: PlatformRateLimit = {
    maxRequestsPerMinute: 10,
    maxRequestsPerHour: 80,
    maxApplicationsPerDay: 20,
    minDelayBetweenRequestsMs: 2500,
    maxDelayBetweenRequestsMs: 7000,
  };

  /**
   * Stub search: Logs note that browser automation or manual import is required
   */
  async searchJobs(query: SearchQuery): Promise<DiscoveredJob[]> {
    console.log(
      `[WellfoundAdapter] searchJobs called with ${query.titles.length} titles and ${query.keywords.length} keywords. Stub adapter: Wellfound requires browser automation or manual import.`
    );
    return [];
  }

  /**
   * Stub details: Wellfound requires session/browser authentication
   */
  async getJobDetails(jobUrl: string): Promise<DiscoveredJob | null> {
    console.log(`[WellfoundAdapter] getJobDetails called for ${jobUrl}. Browser automation required.`);
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
      error: 'Wellfound requires manual application or browser automation',
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
      error: 'Wellfound requires manual application or browser automation',
    };
  }

  /**
   * Upload resume
   */
  async uploadResume(_resumePath: string): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Wellfound requires manual application or browser automation',
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
      error: 'Wellfound requires manual application or browser automation',
    };
  }

  /**
   * Submit application - flags for human review
   */
  async submitApplication(): Promise<ApplicationResult> {
    return {
      success: false,
      requiresHumanReview: true,
      humanReviewReason: 'Wellfound requires manual application or browser automation',
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
      humanReviewReason: 'Wellfound confirmation requires manual review or browser verification',
    };
  }

  /**
   * Full automation is not supported via public API
   */
  supportsAutoSubmit(): boolean {
    return false;
  }
}

// Export default instance
export const wellfoundAdapter = new WellfoundAdapter();
