import {
  type JobSourceAdapter,
  type Platform,
  type PlatformRateLimit,
  type DiscoveredJob,
  type SearchQuery,
  type ApplicationData,
  type ApplicationResult,
  DEFAULT_SEARCH_KEYWORDS,
} from './types';

/**
 * Curated list of top companies using Lever ATS
 */
const DEFAULT_LEVER_COMPANIES: string[] = [
  'spotify',
  'palantir',
  'airtable',
  'benchling',
  'affirm',
  'courier',
  'atlassian',
  'pagerduty',
  'wealthfront',
  'gusto',
  'reddit',
];

interface LeverPosting {
  id: string;
  text: string;
  createdAt: number;
  hostedUrl: string;
  applyUrl: string;
  description?: string;
  descriptionPlain?: string;
  additional?: string;
  additionalPlain?: string;
  categories?: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
    allLocations?: string[];
  };
  workplaceType?: 'remote' | 'hybrid' | 'onsite' | 'unspecified';
  lists?: Array<{
    text: string;
    content: string;
  }>;
}

/**
 * Parses company and posting ID from Lever URLs
 */
function parseLeverUrl(url: string): { company?: string; postingId?: string } {
  try {
    const parsed = new URL(url);

    // Format: jobs.lever.co/{company}/{posting_id}
    const matchJobs = parsed.pathname.match(/\/([^/]+)\/([a-f0-9-]+)/i);
    if (matchJobs) {
      return { company: matchJobs[1], postingId: matchJobs[2] };
    }

    // Format: api.lever.co/v0/postings/{company}/{posting_id}
    const matchApi = parsed.pathname.match(/\/postings\/([^/]+)\/([a-f0-9-]+)/i);
    if (matchApi) {
      return { company: matchApi[1], postingId: matchApi[2] };
    }
  } catch {
    // Malformed URL
  }
  return {};
}

/**
 * Extract relevant skills from job text by matching against known keywords
 */
function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const matched = new Set<string>();
  for (const kw of DEFAULT_SEARCH_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      matched.add(kw);
    }
  }
  return Array.from(matched);
}

/**
 * Lever ATS Job Source Adapter
 * Supports public postings discovery and API application submission with browser automation fallback.
 */
export class LeverAdapter implements JobSourceAdapter {
  readonly platform: Platform = 'lever';
  readonly name = 'Lever';

  readonly rateLimit: PlatformRateLimit = {
    maxRequestsPerMinute: 30,
    maxRequestsPerHour: 500,
    maxApplicationsPerDay: 50,
    minDelayBetweenRequestsMs: 1000,
    maxDelayBetweenRequestsMs: 3000,
  };

  private currentJob: DiscoveredJob | null = null;
  private currentApplicationData: ApplicationData | null = null;
  private resumePath: string | null = null;
  private answers: Record<string, string> = {};
  private lastResult: ApplicationResult | null = null;

  /**
   * Search for jobs matching the query across known Lever company boards
   */
  async searchJobs(query: SearchQuery): Promise<DiscoveredJob[]> {
    const discovered: DiscoveredJob[] = [];
    const companiesToSearch = [...DEFAULT_LEVER_COMPANIES];

    // Add potential companies from keywords
    for (const kw of query.keywords || []) {
      const sanitized = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sanitized && !companiesToSearch.includes(sanitized) && sanitized.length >= 3) {
        companiesToSearch.push(sanitized);
      }
    }

    const activeCompanies = companiesToSearch.slice(0, 10);

    for (const company of activeCompanies) {
      try {
        const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'JobHuntAgent/1.0',
          },
        });

        if (!res.ok) {
          continue;
        }

        const postings = (await res.json()) as LeverPosting[];
        if (!Array.isArray(postings)) {
          continue;
        }

        for (const posting of postings) {
          const title = posting.text || '';
          const locationName =
            posting.categories?.location ||
            posting.categories?.allLocations?.join(', ') ||
            '';
          const description =
            posting.descriptionPlain ||
            posting.description ||
            posting.additionalPlain ||
            '';
          const fullText = `${title} ${locationName} ${description}`.toLowerCase();
          const lowerTitle = title.toLowerCase();

          // Match PM, AI Product, Strategy, Solutions & Technical PM roles
          const isTargetRole =
            lowerTitle.includes('product') ||
            lowerTitle.includes('pm') ||
            lowerTitle.includes('ai') ||
            lowerTitle.includes('strategy') ||
            lowerTitle.includes('advisory') ||
            lowerTitle.includes('solutions') ||
            lowerTitle.includes('lead') ||
            (query.titles || []).some((t) => lowerTitle.includes(t.toLowerCase()));

          const isExcluded =
            lowerTitle.includes('recruiter') ||
            lowerTitle.includes('accountant') ||
            lowerTitle.includes('paralegal') ||
            lowerTitle.includes('sales development rep') ||
            lowerTitle.includes('facilities') ||
            lowerTitle.includes('counsel');

          if (!isTargetRole || isExcluded) {
            continue;
          }

          const isRemote =
            posting.workplaceType === 'remote' ||
            locationName.toLowerCase().includes('remote') ||
            title.toLowerCase().includes('remote') ||
            fullText.includes('remote');

          const postedDate = posting.createdAt ? new Date(posting.createdAt) : new Date();
          const jobSkills = extractSkills(`${title} ${description}`);

          discovered.push({
            externalId: `lever-${company}-${posting.id}`,
            title,
            company: company.charAt(0).toUpperCase() + company.slice(1),
            location: locationName || 'Remote',
            isRemote,
            description: description || title,
            requiredSkills: jobSkills.slice(0, 5).length > 0 ? jobSkills.slice(0, 5) : ['AI/ML', 'Product Strategy', 'GenAI'],
            preferredSkills: jobSkills.slice(5),
            applicationUrl: posting.hostedUrl || posting.applyUrl,
            source: 'lever',
            datePosted: postedDate,
            rawData: {
              company,
              postingId: posting.id,
              categories: posting.categories,
              workplaceType: posting.workplaceType,
            },
          });
        }
      } catch (err) {
        console.warn(`[LeverAdapter] Failed fetching company '${company}':`, err);
      }
    }

    return discovered;
  }

  /**
   * Get detailed job information from Lever API
   */
  async getJobDetails(jobUrl: string): Promise<DiscoveredJob | null> {
    const { company, postingId } = parseLeverUrl(jobUrl);
    if (!company || !postingId) {
      console.warn(`[LeverAdapter] Could not parse company and postingId from ${jobUrl}`);
      return null;
    }

    try {
      const url = `https://api.lever.co/v0/postings/${company}/${postingId}`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'JobHuntAgent/1.0',
        },
      });

      if (!res.ok) {
        return null;
      }

      const posting = (await res.json()) as LeverPosting;
      const description =
        posting.descriptionPlain ||
        posting.description ||
        posting.additionalPlain ||
        '';
      const locationName =
        posting.categories?.location ||
        posting.categories?.allLocations?.join(', ') ||
        '';
      const isRemote =
        posting.workplaceType === 'remote' ||
        locationName.toLowerCase().includes('remote') ||
        posting.text.toLowerCase().includes('remote');
      const skills = extractSkills(`${posting.text} ${description}`);

      return {
        externalId: `lever-${company}-${postingId}`,
        title: posting.text,
        company: company.charAt(0).toUpperCase() + company.slice(1),
        location: locationName || 'Unknown',
        isRemote,
        description,
        requiredSkills: skills.slice(0, 5),
        preferredSkills: skills.slice(5),
        applicationUrl: posting.hostedUrl || posting.applyUrl || jobUrl,
        source: 'lever',
        datePosted: posting.createdAt ? new Date(posting.createdAt) : undefined,
        rawData: {
          company,
          postingId: posting.id,
          categories: posting.categories,
          workplaceType: posting.workplaceType,
        },
      };
    } catch (err) {
      console.error(`[LeverAdapter] getJobDetails error for ${jobUrl}:`, err);
      return null;
    }
  }

  /**
   * Basic eligibility check on job criteria
   */
  async checkEligibility(job: DiscoveredJob): Promise<{ eligible: boolean; reason?: string }> {
    if (!job.description || job.description.trim().length === 0) {
      return { eligible: false, reason: 'Job description is empty' };
    }
    return { eligible: true };
  }

  /**
   * Start application lifecycle for the specified Lever job
   */
  async startApplication(job: DiscoveredJob): Promise<{ success: boolean; error?: string }> {
    if (!job.applicationUrl) {
      return { success: false, error: 'Job application URL is missing' };
    }
    this.currentJob = job;
    this.currentApplicationData = null;
    this.resumePath = null;
    this.answers = {};
    this.lastResult = null;
    return { success: true };
  }

  /**
   * Fill application form fields with candidate details
   */
  async fillApplication(
    job: DiscoveredJob,
    data: ApplicationData
  ): Promise<{ success: boolean; error?: string }> {
    this.currentJob = job;
    this.currentApplicationData = data;
    if (data.answers) {
      this.answers = { ...this.answers, ...data.answers };
    }
    return { success: true };
  }

  /**
   * Stage candidate resume for upload
   */
  async uploadResume(resumePath: string): Promise<{ success: boolean; error?: string }> {
    if (!resumePath) {
      return { success: false, error: 'Resume path is empty' };
    }
    this.resumePath = resumePath;
    return { success: true };
  }

  /**
   * Stage answers to custom application questions
   */
  async answerQuestions(
    _questions: string[],
    answers: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    this.answers = { ...this.answers, ...answers };
    return { success: true };
  }

  /**
   * Submit application to Lever API, falling back to browser automation if captcha or auth is required
   */
  async submitApplication(): Promise<ApplicationResult> {
    if (!this.currentJob || !this.currentApplicationData) {
      const res: ApplicationResult = {
        success: false,
        error: 'Missing active job or application data',
        failedAtStep: 'validate_context',
      };
      this.lastResult = res;
      return res;
    }

    const { company, postingId } = parseLeverUrl(this.currentJob.applicationUrl);
    if (!company || !postingId) {
      const res: ApplicationResult = {
        success: false,
        requiresHumanReview: true,
        humanReviewReason:
          'Could not parse Lever company and posting ID from application URL. Browser automation needed.',
        failedAtStep: 'parse_url',
      };
      this.lastResult = res;
      return res;
    }

    try {
      const formData = new FormData();
      formData.append('name', this.currentApplicationData.candidateName);
      formData.append('email', this.currentApplicationData.email);
      if (this.currentApplicationData.phone) {
        formData.append('phone', this.currentApplicationData.phone);
      }
      if (this.currentApplicationData.resumeContent) {
        formData.append('comments', this.currentApplicationData.resumeContent);
      }
      if (this.currentApplicationData.linkedinUrl) {
        formData.append('urls[LinkedIn]', this.currentApplicationData.linkedinUrl);
      }
      if (this.currentApplicationData.portfolioUrl) {
        formData.append('urls[Portfolio]', this.currentApplicationData.portfolioUrl);
      }
      if (this.currentApplicationData.coverLetter) {
        formData.append('comments', this.currentApplicationData.coverLetter);
      }

      for (const [key, value] of Object.entries(this.answers)) {
        formData.append(`answers[${key}]`, value);
      }

      const submitUrl = `https://api.lever.co/v0/postings/${company}/${postingId}`;
      const res = await fetch(submitUrl, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'JobHuntAgent/1.0',
        },
      });

      if (res.ok) {
        const responseData = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        const result: ApplicationResult = {
          success: true,
          confirmationId: (responseData.data as { id?: string })?.id || `lever-${Date.now()}`,
          confirmationMessage: 'Application successfully submitted via Lever Postings API',
        };
        this.lastResult = result;
        return result;
      }

      // If Lever API requires browser submission or captcha
      const errorText = await res.text().catch(() => res.statusText);
      const result: ApplicationResult = {
        success: false,
        requiresHumanReview: true,
        humanReviewReason: `Lever API returned ${res.status} (${errorText.slice(0, 150)}). Requires browser automation or manual submission.`,
        failedAtStep: 'api_submit',
      };
      this.lastResult = result;
      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const result: ApplicationResult = {
        success: false,
        requiresHumanReview: true,
        humanReviewReason: `Lever API network error (${errorMsg}). Browser automation needed.`,
        failedAtStep: 'network_submit',
      };
      this.lastResult = result;
      return result;
    }
  }

  /**
   * Get confirmation details of previous submission
   */
  async getConfirmation(): Promise<ApplicationResult> {
    if (this.lastResult) {
      return this.lastResult;
    }
    return {
      success: false,
      error: 'No application has been submitted yet',
    };
  }

  /**
   * Indicates whether this adapter supports automated submission
   */
  supportsAutoSubmit(): boolean {
    return true;
  }
}

// Export default instance
export const leverAdapter = new LeverAdapter();
