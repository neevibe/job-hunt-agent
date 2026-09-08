/**
 * Platform Adapter Architecture
 * Each job platform (LinkedIn, Naukri, Greenhouse, etc.) implements this interface.
 */

export interface DiscoveredJob {
  externalId: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceMin?: number;
  experienceMax?: number;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  applicationUrl: string;
  source: Platform;
  datePosted?: Date;
  rawData?: Record<string, unknown>;
}

export type Platform =
  | 'linkedin'
  | 'naukri'
  | 'wellfound'
  | 'instahyre'
  | 'greenhouse'
  | 'lever'
  | 'workday'
  | 'career_page'
  | 'other';

export interface SearchQuery {
  titles: string[];
  keywords: string[];
  locations: string[];
  remote?: boolean;
  experienceMin?: number;
  experienceMax?: number;
  postedWithinDays?: number;
}

export interface ApplicationData {
  candidateName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  portfolioUrl: string;
  resumePath: string;
  resumeContent: string;
  coverLetter?: string;
  answers: Record<string, string>;
  additionalInfo?: Record<string, string>;
}

export interface ApplicationResult {
  success: boolean;
  confirmationId?: string;
  confirmationMessage?: string;
  screenshotPath?: string;
  error?: string;
  failedAtStep?: string;
  requiresHumanReview?: boolean;
  humanReviewReason?: string;
}

export interface PlatformRateLimit {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxApplicationsPerDay: number;
  minDelayBetweenRequestsMs: number;
  maxDelayBetweenRequestsMs: number;
}

export interface JobSourceAdapter {
  readonly platform: Platform;
  readonly name: string;
  readonly rateLimit: PlatformRateLimit;

  /** Search for jobs matching the query */
  searchJobs(query: SearchQuery): Promise<DiscoveredJob[]>;

  /** Get detailed job information */
  getJobDetails(jobUrl: string): Promise<DiscoveredJob | null>;

  /** Check if the candidate is eligible (basic checks) */
  checkEligibility(job: DiscoveredJob): Promise<{ eligible: boolean; reason?: string }>;

  /** Start an application (open the page, navigate to form) */
  startApplication(job: DiscoveredJob): Promise<{ success: boolean; error?: string }>;

  /** Fill application form fields */
  fillApplication(job: DiscoveredJob, data: ApplicationData): Promise<{ success: boolean; error?: string }>;

  /** Upload resume/CV */
  uploadResume(resumePath: string): Promise<{ success: boolean; error?: string }>;

  /** Answer application questions */
  answerQuestions(questions: string[], answers: Record<string, string>): Promise<{ success: boolean; error?: string }>;

  /** Submit the application */
  submitApplication(): Promise<ApplicationResult>;

  /** Get confirmation after submission */
  getConfirmation(): Promise<ApplicationResult>;

  /** Whether this adapter supports full automation */
  supportsAutoSubmit(): boolean;
}

/** Default search queries for AI PM roles */
export const DEFAULT_SEARCH_TITLES: string[] = [
  'AI Product Manager',
  'Product Manager AI',
  'Senior Product Manager AI',
  'GenAI Product Manager',
  'AI Product Lead',
  'AI/ML Product Manager',
  'Product Manager ML',
  'AI Platform Product Manager',
  'Technical Product Manager AI',
  'Data & AI Product Manager',
  'AI Product Strategy',
  'Product Lead GenAI',
];

export const DEFAULT_SEARCH_KEYWORDS: string[] = [
  'AI',
  'Artificial Intelligence',
  'Machine Learning',
  'GenAI',
  'Generative AI',
  'LLM',
  'Agents',
  'AI Platform',
  'ML Platform',
  'NLP',
  'Computer Vision',
  'Data Products',
  'AI Strategy',
];
