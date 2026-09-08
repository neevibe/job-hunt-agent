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
 * LinkedIn Job Source Adapter (Stub)
 * LinkedIn does not offer a public job search/application API.
 * This adapter acts as a placeholder requiring browser automation or manual intervention.
 */
export class LinkedInAdapter implements JobSourceAdapter {
  readonly platform: Platform = 'linkedin';
  readonly name = 'LinkedIn';

  readonly rateLimit: PlatformRateLimit = {
    maxRequestsPerMinute: 5,
    maxRequestsPerHour: 50,
    maxApplicationsPerDay: 15,
    minDelayBetweenRequestsMs: 3000,
    maxDelayBetweenRequestsMs: 10000,
  };

  /**
   * Stub search: Logs note that browser automation or manual import is required
   */
  async searchJobs(query: SearchQuery): Promise<DiscoveredJob[]> {
    console.log(
      `[LinkedInAdapter] searchJobs called with ${query.titles.length} titles and ${query.keywords.length} keywords. Stub adapter: LinkedIn requires browser automation or manual job import.`
    );
    return [];
  }

  /**
   * Stub details: LinkedIn requires session/browser authentication
   */
  async getJobDetails(jobUrl: string): Promise<DiscoveredJob | null> {
    console.log(`[LinkedInAdapter] getJobDetails called for ${jobUrl}. Browser automation required.`);
    return null;
  }

  /**
   * Check eligibility
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
      error: 'LinkedIn requires manual application or browser automation',
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
      error: 'LinkedIn requires manual application or browser automation',
    };
  }

  /**
   * Upload resume
   */
  async uploadResume(_resumePath: string): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'LinkedIn requires manual application or browser automation',
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
      error: 'LinkedIn requires manual application or browser automation',
    };
  }

  /**
   * Submit application - flags for human review
   */
  async submitApplication(): Promise<ApplicationResult> {
    return {
      success: false,
      requiresHumanReview: true,
      humanReviewReason: 'LinkedIn requires manual application',
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
      humanReviewReason: 'LinkedIn confirmation requires manual review or browser check',
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
export const linkedInAdapter = new LinkedInAdapter();
