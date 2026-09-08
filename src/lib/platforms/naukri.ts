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
 * Naukri Job Source Adapter (Stub)
 * Naukri does not provide an open public API. Requires browser automation or manual import.
 */
export class NaukriAdapter implements JobSourceAdapter {
  readonly platform: Platform = 'naukri';
  readonly name = 'Naukri';

  readonly rateLimit: PlatformRateLimit = {
    maxRequestsPerMinute: 10,
    maxRequestsPerHour: 100,
    maxApplicationsPerDay: 25,
    minDelayBetweenRequestsMs: 2000,
    maxDelayBetweenRequestsMs: 6000,
  };

  /**
   * Stub search: Logs note that browser automation or manual import is required
   */
  async searchJobs(query: SearchQuery): Promise<DiscoveredJob[]> {
    console.log(
      `[NaukriAdapter] searchJobs called with ${query.titles.length} titles and ${query.keywords.length} keywords. Stub adapter: Naukri requires browser automation or manual import.`
    );
    return [];
  }

  /**
   * Stub details: Naukri requires session/browser authentication
   */
  async getJobDetails(jobUrl: string): Promise<DiscoveredJob | null> {
    console.log(`[NaukriAdapter] getJobDetails called for ${jobUrl}. Browser automation required.`);
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
      error: 'Naukri requires manual application or browser automation',
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
      error: 'Naukri requires manual application or browser automation',
    };
  }

  /**
   * Upload resume
   */
  async uploadResume(_resumePath: string): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Naukri requires manual application or browser automation',
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
      error: 'Naukri requires manual application or browser automation',
    };
  }

  /**
   * Submit application - flags for human review
   */
  async submitApplication(): Promise<ApplicationResult> {
    return {
      success: false,
      requiresHumanReview: true,
      humanReviewReason: 'Naukri requires manual application or browser automation',
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
      humanReviewReason: 'Naukri confirmation requires manual review or browser verification',
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
export const naukriAdapter = new NaukriAdapter();
