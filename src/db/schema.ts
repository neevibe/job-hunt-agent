import { pgTable, text, serial, timestamp, integer, boolean, jsonb, varchar, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ========================================
// CANDIDATE TABLES
// ========================================

export const candidate = pgTable('candidate', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  location: text('location'),
  linkedinUrl: text('linkedin_url'),
  portfolioUrl: text('portfolio_url'),
  githubUrl: text('github_url'),
  noticePeriod: text('notice_period'),
  preferredLocations: text('preferred_locations').array(),
  remotePreference: text('remote_preference'), // remote, hybrid, onsite
  compensationMin: integer('compensation_min'),
  compensationMax: integer('compensation_max'),
  compensationCurrency: text('compensation_currency').default('INR'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const experience = pgTable('experience', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id').references(() => candidate.id),
  company: text('company').notNull(),
  jobTitle: text('job_title').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  isCurrent: boolean('is_current').default(false),
  responsibilities: text('responsibilities').array(),
  productsOwned: text('products_owned').array(),
  problemsSolved: text('problems_solved').array(),
  technologies: text('technologies').array(),
  aiExposure: text('ai_exposure'),
  dataExposure: text('data_exposure'),
  leadership: text('leadership'),
  businessImpact: text('business_impact'),
  productImpact: text('product_impact'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const achievement = pgTable('achievement', {
  id: serial('id').primaryKey(),
  experienceId: integer('experience_id').references(() => experience.id),
  title: text('title').notNull(),
  situation: text('situation'),
  problem: text('problem'),
  action: text('action'),
  productOwnership: text('product_ownership'),
  technology: text('technology'),
  stakeholders: text('stakeholders'),
  metric: text('metric'),
  businessImpact: text('business_impact'),
  userImpact: text('user_impact'),
  evidenceSource: text('evidence_source'),
  isVerified: boolean('is_verified').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const candidateSkill = pgTable('candidate_skill', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id').references(() => candidate.id),
  skillName: text('skill_name').notNull(),
  category: text('category'), // ai, product, technical, domain, soft
  proficiency: text('proficiency'), // expert, advanced, intermediate, basic
  yearsExperience: integer('years_experience'),
  evidenceIds: integer('evidence_ids').array(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// JOB TABLES
// ========================================

export const company = pgTable('company', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  domain: text('domain'),
  industry: text('industry'),
  size: text('size'),
  aiMaturity: text('ai_maturity'), // ai-native, ai-first, ai-enabled, traditional, minimal
  businessModel: text('business_model'),
  products: text('products').array(),
  websiteUrl: text('website_url'),
  careerPageUrl: text('career_page_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const job = pgTable('job', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').unique(),
  companyId: integer('company_id').references(() => company.id),
  title: text('title').notNull(),
  location: text('location'),
  isRemote: boolean('is_remote').default(false),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  salaryCurrency: text('salary_currency'),
  experienceMin: integer('experience_min'),
  experienceMax: integer('experience_max'),
  description: text('description').notNull(),
  requiredSkills: text('required_skills').array(),
  preferredSkills: text('preferred_skills').array(),
  applicationUrl: text('application_url').notNull(),
  source: text('source').notNull(), // linkedin, naukri, company, etc.
  dateDiscovered: timestamp('date_discovered').defaultNow(),
  datePosted: timestamp('date_posted'),
  isActive: boolean('is_active').default(true),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const jobIntelligence = pgTable('job_intelligence', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => job.id).unique(),
  roleType: text('role_type'), // 0-to-1, scaling, platform, b2b, b2c, enterprise, etc.
  aiRelevance: integer('ai_relevance'), // 0-100
  productOwnership: integer('product_ownership'), // 0-100
  leadershipExpectation: text('leadership_expectation'),
  technicalDepth: text('technical_depth'),
  domainRequirements: text('domain_requirements').array(),
  aiRequirements: text('ai_requirements').array(),
  productRequirements: text('product_requirements').array(),
  culturalSignals: text('cultural_signals').array(),
  redFlags: text('red_flags').array(),
  parsedAt: timestamp('parsed_at').defaultNow(),
});

export const jobScore = pgTable('job_score', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => job.id),
  candidateId: integer('candidate_id').references(() => candidate.id),
  overallScore: integer('overall_score').notNull(), // 0-100
  aiRelevanceScore: integer('ai_relevance_score'),
  productOwnershipScore: integer('product_ownership_score'),
  pmExperienceScore: integer('pm_experience_score'),
  domainScore: integer('domain_score'),
  leadershipScore: integer('leadership_score'),
  analyticsScore: integer('analytics_score'),
  seniorityScore: integer('seniority_score'),
  locationScore: integer('location_score'),
  explanation: text('explanation'),
  recommendation: text('recommendation'), // auto-apply, apply, review, skip
  strengths: text('strengths').array(),
  gaps: text('gaps').array(),
  scoredAt: timestamp('scored_at').defaultNow(),
});

// ========================================
// CV TABLES
// ========================================

export const cv = pgTable('cv', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id').references(() => candidate.id),
  jobId: integer('job_id').references(() => job.id),
  version: text('version').notNull(),
  content: text('content').notNull(),
  format: text('format').default('markdown'), // markdown, pdf, docx
  filePath: text('file_path'),
  atsScore: integer('ats_score'),
  requiredKeywordCoverage: integer('required_keyword_coverage'),
  preferredKeywordCoverage: integer('preferred_keyword_coverage'),
  matchedKeywords: text('matched_keywords').array(),
  missingKeywords: text('missing_keywords').array(),
  riskyElements: text('risky_elements').array(),
  changesSummary: text('changes_summary'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// APPLICATION TABLES
// ========================================

export const application = pgTable('application', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id').references(() => candidate.id),
  jobId: integer('job_id').references(() => job.id),
  cvId: integer('cv_id').references(() => cv.id),
  status: text('status').notNull().default('discovered'), // discovered, shortlisted, cv_tailored, ready, applied, recruiter_screen, interview, final_round, offer, rejected, withdrawn
  appliedAt: timestamp('applied_at'),
  recruiterName: text('recruiter_name'),
  hiringManagerName: text('hiring_manager_name'),
  interviewStage: text('interview_stage'),
  nextAction: text('next_action'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  notes: text('notes'),
  rejectionReason: text('rejection_reason'),
  applicationMode: text('application_mode'), // manual, approval, auto
  createdAt: timestamp('created_at').defaultNow(),
});

export const applicationAnswer = pgTable('application_answer', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').references(() => application.id),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  evidenceIds: integer('evidence_ids').array(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const applicationEvent = pgTable('application_event', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').references(() => application.id),
  eventType: text('event_type').notNull(), // status_change, email_received, interview_scheduled, etc.
  eventData: jsonb('event_data'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// ========================================
// INTERVIEW TABLES
// ========================================

export const interview = pgTable('interview', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').references(() => application.id),
  round: integer('round'),
  interviewType: text('interview_type'), // screening, behavioral, technical, case, final
  scheduledAt: timestamp('scheduled_at'),
  completedAt: timestamp('completed_at'),
  interviewerName: text('interviewer_name'),
  interviewerRole: text('interviewer_role'),
  outcome: text('outcome'), // pass, fail, pending
  feedback: text('feedback'),
  confidence: integer('confidence'), // 1-5
  createdAt: timestamp('created_at').defaultNow(),
});

export const interviewQuestion = pgTable('interview_question', {
  id: serial('id').primaryKey(),
  interviewId: integer('interview_id').references(() => interview.id),
  question: text('question').notNull(),
  answer: text('answer'),
  answeredWell: boolean('answered_well'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// RESEARCH & OUTREACH TABLES
// ========================================

export const companyResearch = pgTable('company_research', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => company.id),
  overview: text('overview'),
  aiStrategy: text('ai_strategy'),
  recentInitiatives: text('recent_initiatives').array(),
  competitors: text('competitors').array(),
  productCulture: text('product_culture'),
  challenges: text('challenges').array(),
  whyCandidateFits: text('why_candidate_fits'),
  interviewTopics: text('interview_topics').array(),
  researchedAt: timestamp('researched_at').defaultNow(),
});

export const outreach = pgTable('outreach', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').references(() => application.id),
  outreachType: text('outreach_type'), // recruiter, hiring_manager, referral, linkedin
  recipientName: text('recipient_name'),
  recipientRole: text('recipient_role'),
  message: text('message').notNull(),
  sentAt: timestamp('sent_at'),
  responded: boolean('responded').default(false),
  responseAt: timestamp('response_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// AGENT TABLES
// ========================================

export const agentRun = pgTable('agent_run', {
  id: serial('id').primaryKey(),
  agentName: text('agent_name').notNull(),
  agentType: text('agent_type'), // discovery, scoring, cv_tailoring, application, research, analytics
  jobId: integer('job_id'),
  applicationId: integer('application_id'),
  input: jsonb('input'),
  output: jsonb('output'),
  status: text('status').notNull(), // running, success, failed
  errorMessage: text('error_message'),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// ========================================
// AUTONOMOUS MODE CONFIGURATION
// ========================================

export const autonomousConfig = pgTable('autonomous_config', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id').references(() => candidate.id),
  isEnabled: boolean('is_enabled').default(false),
  dailyApplicationLimit: integer('daily_application_limit').default(100),
  minimumMatchScore: integer('minimum_match_score').default(75),
  autoApplyThreshold: integer('auto_apply_threshold').default(85),
  humanReviewThreshold: integer('human_review_threshold').default(65),
  maxApplicationsPerPlatform: integer('max_applications_per_platform').default(30),
  targetLocations: text('target_locations').array(),
  targetTitles: text('target_titles').array(),
  targetCompanies: text('target_companies').array(),
  blacklistedCompanies: text('blacklisted_companies').array(),
  preferredIndustries: text('preferred_industries').array(),
  preferredPlatforms: text('preferred_platforms').array(),
  remotePreference: text('remote_preference').default('any'), // remote, hybrid, onsite, any
  minExperience: integer('min_experience'),
  maxExperience: integer('max_experience'),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  salaryCurrency: text('salary_currency').default('INR'),
  visaRequirements: text('visa_requirements'),
  autoSubmitEnabled: boolean('auto_submit_enabled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// APPLICATION QUEUE
// ========================================

export const applicationQueue = pgTable('application_queue', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => job.id).notNull(),
  candidateId: integer('candidate_id').references(() => candidate.id).notNull(),
  applicationId: integer('application_id').references(() => application.id),
  cvId: integer('cv_id').references(() => cv.id),
  status: text('status').notNull().default('discovered'),
  priority: integer('priority').default(50),
  matchScore: integer('match_score'),
  platform: text('platform').notNull(),
  retryCount: integer('retry_count').default(0),
  maxRetries: integer('max_retries').default(3),
  failureReason: text('failure_reason'),
  failedAtStep: text('failed_at_step'),
  humanReviewReason: text('human_review_reason'),
  confirmationId: text('confirmation_id'),
  screenshotPath: text('screenshot_path'),
  scheduledFor: timestamp('scheduled_for'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  lockedBy: text('locked_by'),
  lockedAt: timestamp('locked_at'),
  deduplicationHash: text('deduplication_hash'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// EVIDENCE BANK
// ========================================

export const evidenceBank = pgTable('evidence_bank', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id').references(() => candidate.id),
  category: text('category').notNull(), // achievement, metric, skill, project, responsibility
  title: text('title').notNull(),
  context: text('context'),
  situation: text('situation'),
  problem: text('problem'),
  action: text('action'),
  result: text('result'),
  productOwnership: text('product_ownership'),
  technology: text('technology'),
  stakeholders: text('stakeholders'),
  metric: text('metric'),
  businessImpact: text('business_impact'),
  userImpact: text('user_impact'),
  source: text('source'),
  isVerified: boolean('is_verified').default(true),
  tags: text('tags').array(),
  relatedExperienceId: integer('related_experience_id').references(() => experience.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// AGENT ACTIVITY LOG
// ========================================

export const agentActivity = pgTable('agent_activity', {
  id: serial('id').primaryKey(),
  agentName: text('agent_name').notNull(),
  actionType: text('action_type').notNull(), // search, analyze, score, tailor_cv, apply, verify, error, info
  message: text('message').notNull(),
  details: jsonb('details'),
  jobId: integer('job_id'),
  applicationId: integer('application_id'),
  severity: text('severity').default('info'), // info, warning, error, success
  timestamp: timestamp('timestamp').defaultNow(),
});

// ========================================
// LEARNING & ANALYTICS
// ========================================

export const learningInsight = pgTable('learning_insight', {
  id: serial('id').primaryKey(),
  insightType: text('insight_type').notNull(),
  dimension: text('dimension').notNull(),
  metric: text('metric').notNull(),
  value: integer('value'),
  sampleSize: integer('sample_size'),
  recommendation: text('recommendation'),
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dailyReport = pgTable('daily_report', {
  id: serial('id').primaryKey(),
  reportDate: text('report_date').notNull().unique(),
  applicationsSubmitted: integer('applications_submitted').default(0),
  jobsDiscovered: integer('jobs_discovered').default(0),
  jobsAnalyzed: integer('jobs_analyzed').default(0),
  jobsQualified: integer('jobs_qualified').default(0),
  cvsGenerated: integer('cvs_generated').default(0),
  averageMatchScore: integer('average_match_score'),
  averageAtsScore: integer('average_ats_score'),
  platformBreakdown: jsonb('platform_breakdown'),
  responsesReceived: integer('responses_received').default(0),
  interviewsScheduled: integer('interviews_scheduled').default(0),
  topOpportunity: jsonb('top_opportunity'),
  bestPerformingCV: text('best_performing_cv'),
  recommendations: text('recommendations').array(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const platformAllocationTable = pgTable('platform_allocation', {
  id: serial('id').primaryKey(),
  platform: text('platform').notNull(),
  dailyTarget: integer('daily_target').default(20),
  usedToday: integer('used_today').default(0),
  isActive: boolean('is_active').default(true),
  lastResetAt: timestamp('last_reset_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// RELATIONS
// ========================================

export const candidateRelations = relations(candidate, ({ many, one }) => ({
  experiences: many(experience),
  skills: many(candidateSkill),
  cvs: many(cv),
  applications: many(application),
  jobScores: many(jobScore),
  autonomousConfig: one(autonomousConfig),
  evidence: many(evidenceBank),
}));

export const experienceRelations = relations(experience, ({ one, many }) => ({
  candidate: one(candidate, {
    fields: [experience.candidateId],
    references: [candidate.id],
  }),
  achievements: many(achievement),
  evidence: many(evidenceBank),
}));

export const achievementRelations = relations(achievement, ({ one }) => ({
  experience: one(experience, {
    fields: [achievement.experienceId],
    references: [experience.id],
  }),
}));

export const jobRelations = relations(job, ({ one, many }) => ({
  company: one(company, {
    fields: [job.companyId],
    references: [company.id],
  }),
  intelligence: one(jobIntelligence),
  scores: many(jobScore),
  cvs: many(cv),
  applications: many(application),
  queueItems: many(applicationQueue),
}));

export const applicationRelations = relations(application, ({ one, many }) => ({
  candidate: one(candidate, {
    fields: [application.candidateId],
    references: [candidate.id],
  }),
  job: one(job, {
    fields: [application.jobId],
    references: [job.id],
  }),
  cv: one(cv, {
    fields: [application.cvId],
    references: [cv.id],
  }),
  answers: many(applicationAnswer),
  events: many(applicationEvent),
  interviews: many(interview),
  outreach: many(outreach),
}));

export const applicationQueueRelations = relations(applicationQueue, ({ one }) => ({
  job: one(job, {
    fields: [applicationQueue.jobId],
    references: [job.id],
  }),
  candidate: one(candidate, {
    fields: [applicationQueue.candidateId],
    references: [candidate.id],
  }),
  application: one(application, {
    fields: [applicationQueue.applicationId],
    references: [application.id],
  }),
  cv: one(cv, {
    fields: [applicationQueue.cvId],
    references: [cv.id],
  }),
}));

export const autonomousConfigRelations = relations(autonomousConfig, ({ one }) => ({
  candidate: one(candidate, {
    fields: [autonomousConfig.candidateId],
    references: [candidate.id],
  }),
}));

export const evidenceBankRelations = relations(evidenceBank, ({ one }) => ({
  candidate: one(candidate, {
    fields: [evidenceBank.candidateId],
    references: [candidate.id],
  }),
  experience: one(experience, {
    fields: [evidenceBank.relatedExperienceId],
    references: [experience.id],
  }),
}));
