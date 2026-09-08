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
 * Curated list of top tech & AI companies utilizing Greenhouse boards
 */
const DEFAULT_GREENHOUSE_BOARDS: string[] = [
  'anthropic',
  'openai',
  'scaleai',
  'cohere',
  'perplexity',
  'glean',
  'figma',
  'stripe',
  'datadog',
  'brex',
  'ramp',
  'benchling',
  'jasper',
  'cursor',
  'replit',
  'groq',
  'togetherai',
  'langchain',
  'pinecone',
  'weaviate',
];

interface GreenhouseJobSummary {
  id: number;
  internal_job_id?: number;
  title: string;
  updated_at: string;
  absolute_url: string;
  location?: {
    name: string;
  };
  metadata?: Array<{
    id: number;
    name: string;
    value: unknown;
    value_type: string;
  }>;
  content?: string;
  departments?: Array<{ id: number; name: string }>;
  offices?: Array<{ id: number; name: string; location?: string }>;
}

/**
 * Strips HTML formatting into plain text while preserving structure
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<h[1-6][^>]*>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts board token and job ID from common Greenhouse URL formats
 */
function parseGreenhouseUrl(url: string): { boardToken?: string; jobId?: string } {
  try {
    const parsed = new URL(url);

    // Format: boards.greenhouse.io/{board_token}/jobs/{job_id}
    // or job-boards.greenhouse.io/{board_token}/jobs/{job_id}
    const pathMatch = parsed.pathname.match(/\/([^/]+)\/jobs\/(\d+)/);
    if (pathMatch) {
      return { boardToken: pathMatch[1], jobId: pathMatch[2] };
    }

    // Format: boards.greenhouse.io/embed/job_app?for={board_token}&token={job_id}
    const forParam = parsed.searchParams.get('for');
    const tokenParam = parsed.searchParams.get('token');
    if (forParam && tokenParam) {
      return { boardToken: forParam, jobId: tokenParam };
    }

    // Format: {board_token}.greenhouse.io/jobs/{job_id}
    const hostMatch = parsed.hostname.match(/^([^.]+)\.greenhouse\.io$/);
    const directJobMatch = parsed.pathname.match(/\/jobs\/(\d+)/);
    if (hostMatch && directJobMatch && hostMatch[1] !== 'boards' && hostMatch[1] !== 'api') {
      return { boardToken: hostMatch[1], jobId: directJobMatch[1] };
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
 * Greenhouse ATS Job Source Adapter
 * Supports public boards job discovery and API application submission with browser automation fallback.
 */
export class GreenhouseAdapter implements JobSourceAdapter {
  readonly platform: Platform = 'greenhouse';
  readonly name = 'Greenhouse';

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
   * Search for jobs matching the query across known Greenhouse boards
   */
  async searchJobs(query: SearchQuery): Promise<DiscoveredJob[]> {
    const discovered: DiscoveredJob[] = [];
    const boardsToSearch = [...DEFAULT_GREENHOUSE_BOARDS];

    // Add company names matching keywords or titles if applicable
    for (const kw of query.keywords || []) {
      const sanitized = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sanitized && !boardsToSearch.includes(sanitized) && sanitized.length >= 3) {
        boardsToSearch.push(sanitized);
      }
    }

    // Search target boards (up to 15 per run)
    const activeBoards = boardsToSearch.slice(0, 15);

    for (const board of activeBoards) {
      try {
        const url = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`;
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'JobHuntAgent/1.0',
          },
        });

        if (!res.ok) {
          continue;
        }

        const data = (await res.json()) as { jobs?: GreenhouseJobSummary[] };
        if (!data.jobs || !Array.isArray(data.jobs)) {
          continue;
        }

        for (const rawJob of data.jobs) {
          const title = rawJob.title || '';
          const locationName = rawJob.location?.name || '';
          const content = rawJob.content ? stripHtml(rawJob.content) : '';
          const fullText = `${title} ${locationName} ${content}`.toLowerCase();
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

          // Avoid unrelated non-product software engineering or accounting roles
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

          // Remote detection
          const isRemote =
            locationName.toLowerCase().includes('remote') ||
            title.toLowerCase().includes('remote') ||
            fullText.includes('remote');

          const postedDate = rawJob.updated_at ? new Date(rawJob.updated_at) : new Date();
          const jobSkills = extractSkills(`${title} ${content}`);

          discovered.push({
            externalId: `greenhouse-${board}-${rawJob.id}`,
            title,
            company: board.charAt(0).toUpperCase() + board.slice(1),
            location: locationName || 'Remote',
            isRemote,
            description: content || title,
            requiredSkills: jobSkills.slice(0, 5).length > 0 ? jobSkills.slice(0, 5) : ['AI/ML', 'Product Strategy', 'GenAI'],
            preferredSkills: jobSkills.slice(5),
            applicationUrl: rawJob.absolute_url,
            source: 'greenhouse',
            datePosted: postedDate,
            rawData: {
              boardToken: board,
              jobId: rawJob.id,
              departments: rawJob.departments,
              offices: rawJob.offices,
            },
          });
        }
      } catch (err) {
        console.warn(`[GreenhouseAdapter] Failed fetching board '${board}':`, err);
      }
    }

    return discovered;
  }

  /**
   * Get detailed job information from Greenhouse API
   */
  async getJobDetails(jobUrl: string): Promise<DiscoveredJob | null> {
    const { boardToken, jobId } = parseGreenhouseUrl(jobUrl);
    if (!boardToken || !jobId) {
      console.warn(`[GreenhouseAdapter] Could not parse board and jobId from ${jobUrl}`);
      return null;
    }

    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs/${jobId}`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'JobHuntAgent/1.0',
        },
      });

      if (!res.ok) {
        return null;
      }

      const rawJob = (await res.json()) as GreenhouseJobSummary;
      const content = rawJob.content ? stripHtml(rawJob.content) : '';
      const locationName = rawJob.location?.name || '';
      const isRemote =
        locationName.toLowerCase().includes('remote') ||
        rawJob.title.toLowerCase().includes('remote');
      const skills = extractSkills(`${rawJob.title} ${content}`);

      return {
        externalId: `greenhouse-${boardToken}-${jobId}`,
        title: rawJob.title,
        company: boardToken.charAt(0).toUpperCase() + boardToken.slice(1),
        location: locationName || 'Unknown',
        isRemote,
        description: content,
        requiredSkills: skills.slice(0, 5),
        preferredSkills: skills.slice(5),
        applicationUrl: rawJob.absolute_url || jobUrl,
        source: 'greenhouse',
        datePosted: rawJob.updated_at ? new Date(rawJob.updated_at) : undefined,
        rawData: {
          boardToken,
          jobId: rawJob.id,
          departments: rawJob.departments,
          offices: rawJob.offices,
        },
      };
    } catch (err) {
      console.error(`[GreenhouseAdapter] getJobDetails error for ${jobUrl}:`, err);
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
   * Start an application lifecycle for the specified job
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
   * Fill application form state
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
   * Stage answers to custom job application questions
   */
  async answerQuestions(
    _questions: string[],
    answers: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    this.answers = { ...this.answers, ...answers };
    return { success: true };
  }

  /**
   * Submit the application via Greenhouse API if accessible, falling back to browser automation
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

    const { boardToken, jobId } = parseGreenhouseUrl(this.currentJob.applicationUrl);
    if (!boardToken || !jobId) {
      const res: ApplicationResult = {
        success: false,
        requiresHumanReview: true,
        humanReviewReason:
          'Could not parse Greenhouse board token and job ID from application URL. Browser automation needed.',
        failedAtStep: 'parse_url',
      };
      this.lastResult = res;
      return res;
    }

    try {
      const nameParts = this.currentApplicationData.candidateName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Applicant';
      const lastName = nameParts.slice(1).join(' ') || '.';

      // Prepare application payload
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('email', this.currentApplicationData.email);
      if (this.currentApplicationData.phone) {
        formData.append('phone', this.currentApplicationData.phone);
      }
      if (this.currentApplicationData.resumeContent) {
        formData.append('resume_text', this.currentApplicationData.resumeContent);
      }
      if (this.currentApplicationData.coverLetter) {
        formData.append('cover_letter_text', this.currentApplicationData.coverLetter);
      }

      // Add custom answers
      for (const [key, value] of Object.entries(this.answers)) {
        formData.append(`question_${key}`, value);
      }

      const submitUrl = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs/${jobId}/application`;
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
          confirmationId: (responseData.id as string) || `gh-${Date.now()}`,
          confirmationMessage: 'Application successfully submitted via Greenhouse Job Board API',
        };
        this.lastResult = result;
        return result;
      }

      // If board requires captcha, authentication, or complex custom fields
      const errorText = await res.text().catch(() => res.statusText);
      const result: ApplicationResult = {
        success: false,
        requiresHumanReview: true,
        humanReviewReason: `Greenhouse API returned ${res.status} (${errorText.slice(0, 150)}). Requires browser automation or manual review for custom fields/captcha.`,
        failedAtStep: 'api_submit',
      };
      this.lastResult = result;
      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const result: ApplicationResult = {
        success: false,
        requiresHumanReview: true,
        humanReviewReason: `Greenhouse API network error (${errorMsg}). Browser automation needed.`,
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
export const greenhouseAdapter = new GreenhouseAdapter();
