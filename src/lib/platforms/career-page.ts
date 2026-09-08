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
 * Career Page Job Source Adapter (Stub)
 * Custom company career pages require bespoke DOM scrapers or manual import.
 * This adapter acts as a placeholder requiring browser automation or manual intervention.
 */
export class CareerPageAdapter implements JobSourceAdapter {
  readonly platform: Platform = 'career_page';
  readonly name = 'Career Page';

  readonly rateLimit: PlatformRateLimit = {
    maxRequestsPerMinute: 10,
    maxRequestsPerHour: 60,
    maxApplicationsPerDay: 20,
    minDelayBetweenRequestsMs: 2000,
    maxDelayBetweenRequestsMs: 5000,
  };

  /**
   * Stub search: Logs note that browser automation or manual import is required
   */
  async searchJobs(query: SearchQuery): Promise<DiscoveredJob[]> {
    console.log(
      `[CareerPageAdapter] searchJobs called with ${query.titles.length} titles and ${query.keywords.length} keywords. Stub adapter: Custom career pages require tailored automation or manual import.`
    );
    return [];
  }

  /**
   * Stub details: Custom career pages require bespoke scraping or manual entry
   */
  async getJobDetails(jobUrl: string): Promise<DiscoveredJob | null> {
    console.log(`[CareerPageAdapter] getJobDetails called for ${jobUrl}. Browser automation required.`);
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
      error: 'Custom career pages require tailored automation or manual review',
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
      error: 'Custom career pages require tailored automation or manual review',
    };
  }

  /**
   * Upload resume
   */
  async uploadResume(_resumePath: string): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Custom career pages require tailored automation or manual review',
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
      error: 'Custom career pages require tailored automation or manual review',
    };
  }

  /**
   * Submit application - flags for human review
   */
  async submitApplication(): Promise<ApplicationResult> {
    return {
      success: false,
      requiresHumanReview: true,
      humanReviewReason: 'Custom career pages require tailored automation or manual review',
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
      humanReviewReason: 'Career page application confirmation requires manual review',
    };
  }

  /**
   * Full automation is not supported via generic adapter
   */
  supportsAutoSubmit(): boolean {
    return false;
  }
}

// Export default instance
export const careerPageAdapter = new CareerPageAdapter();
