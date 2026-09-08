/**
 * AUTONOMOUS APPLICATION EXECUTOR
 * 
 * Orchestrates the full autonomous application pipeline for a specific job:
 * 1. Verification & Idempotency check
 * 2. AI CV Tailoring (grounded in real evidence)
 * 3. AI Application Answer generation (STAR format)
 * 4. Browser/API form submission or assisted-apply prep
 * 5. Outcome recording & activity logging
 */

import { db } from '@/db';
import { 
  job, 
  company, 
  application, 
  applicationAnswer, 
  applicationEvent, 
  applicationQueue, 
  agentActivity 
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { tailorCV } from '@/lib/agents/cv-tailoring-agent';
import { generateBatchAnswers } from '@/lib/agents/application-answer-agent';
import { BrowserAutomation } from '@/lib/browser/automation';
import { ensureCandidateInDB } from '@/lib/engines/candidate-sync';
import { checkApplicationIdempotency } from '@/lib/engines/idempotency';
import { transitionStatus } from '@/lib/engines/application-queue';
import { platformRegistry } from '@/lib/platforms/registry';
import { getCandidateDNA } from '@/lib/candidate-dna';

export interface ApplyJobInput {
  jobId?: number | string;
  candidateId?: number;
  jobTitle?: string;
  company?: string;
  location?: string;
  applicationUrl?: string;
  description?: string;
  requiredSkills?: string[];
  autoSubmit?: boolean;
}

export interface ApplyJobResult {
  success: boolean;
  applicationId?: number;
  status: 'submitted' | 'prepared' | 'human_review' | 'failed' | 'duplicate';
  company: string;
  role: string;
  cvVersion?: string;
  answersGenerated: number;
  message: string;
  confirmationId?: string;
  error?: string;
}

const COMMON_QUESTIONS = [
  'Why are you interested in this role?',
  'Describe your AI/ML product management experience.',
  'Tell us about a product you launched from 0 to 1.',
  'What are your compensation expectations?',
];

export async function executeApplicationForJob(input: ApplyJobInput): Promise<ApplyJobResult> {
  const candidateId = input.candidateId || 1;
  await ensureCandidateInDB(candidateId);

  let targetJobId: number;
  let jobRecord: any = null;

  // Resolve or create job record
  if (input.jobId && !isNaN(Number(input.jobId))) {
    targetJobId = Number(input.jobId);
    jobRecord = await db.query.job.findFirst({
      where: (j, { eq }) => eq(j.id, targetJobId),
      with: { company: true },
    });
  }

  const jobTitle = input.jobTitle || jobRecord?.title || 'AI Product Manager';
  const companyName = input.company || jobRecord?.company?.name || 'Target Company';
  const applicationUrl = input.applicationUrl || jobRecord?.applicationUrl || 'https://careers.google.com';
  const description = input.description || jobRecord?.description || `AI Product Manager role at ${companyName}`;
  const requiredSkills = input.requiredSkills || jobRecord?.requiredSkills || ['AI', 'Product Strategy', 'LLMs'];

  // If job wasn't in DB, insert it
  if (!jobRecord) {
    try {
      let companyId: number | null = null;
      const existingCompany = await db.query.company.findFirst({
        where: (c, { eq }) => eq(c.name, companyName),
      });

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const [newComp] = await db.insert(company).values({ name: companyName }).returning();
        companyId = newComp.id;
      }

      const [newJob] = await db.insert(job).values({
        companyId,
        title: jobTitle,
        description,
        location: input.location || 'Remote',
        applicationUrl,
        requiredSkills,
        source: 'direct',
      }).returning();

      targetJobId = newJob.id;
      jobRecord = newJob;
    } catch {
      targetJobId = 1;
    }
  } else {
    targetJobId = jobRecord.id;
  }

  // 1. Idempotency Check
  const idempotency = await checkApplicationIdempotency(targetJobId, candidateId);
  if (!idempotency.canApply) {
    console.log(`⚠️ Application already exists for job ${targetJobId}: ${idempotency.reason}`);
    return {
      success: true,
      status: 'duplicate',
      company: companyName,
      role: jobTitle,
      answersGenerated: 0,
      message: idempotency.reason || 'Already applied or queued',
      applicationId: idempotency.existingApplicationId,
    };
  }

  console.log(`🤖 [ApplicationAgent] Automatically applying to ${companyName} (${jobTitle})...`);

  // 2. Tailor CV with AI
  let cvId: number | undefined;
  let cvVersion = `${companyName.replace(/\s+/g, '_')}_AI_PM_v1`;
  try {
    const tailored = await tailorCV({ candidateId, jobId: targetJobId });
    cvId = tailored.cvRecord.id;
    cvVersion = tailored.cvRecord.version;
  } catch (err) {
    console.warn('CV tailoring fallback:', err);
  }

  // 3. Generate Truthful STAR Answers
  let generatedAnswers: Record<string, string> = {};
  try {
    const answersList = await generateBatchAnswers(
      COMMON_QUESTIONS,
      jobTitle,
      companyName,
      description
    );
    for (let i = 0; i < COMMON_QUESTIONS.length; i++) {
      generatedAnswers[COMMON_QUESTIONS[i]] = answersList[i]?.answer || '';
    }
  } catch (err) {
    console.warn('Answer generation fallback:', err);
    generatedAnswers = {
      'Why are you interested in this role?': `I'm eager to bring 10+ years of product leadership and enterprise AI platform building experience (such as BIAL's EKO platform) to ${companyName}.`,
    };
  }

  // 4. Try Direct ATS API Submission (Greenhouse / Lever) if matching URL or platform
  let automationResult: any = null;
  const candidateDNA = getCandidateDNA();
  const lowerUrl = applicationUrl.toLowerCase();

  const isGreenhouse = lowerUrl.includes('greenhouse.io') || jobRecord?.source === 'greenhouse';
  const isLever = lowerUrl.includes('lever.co') || jobRecord?.source === 'lever';

  if (isGreenhouse) {
    try {
      const ghAdapter = platformRegistry.getAdapter('greenhouse');
      if (ghAdapter) {
        const discoveredPayload = {
          externalId: String(targetJobId),
          title: jobTitle,
          company: companyName,
          location: input.location || 'Remote',
          isRemote: true,
          description,
          requiredSkills,
          preferredSkills: [],
          applicationUrl,
          source: 'greenhouse' as const,
        };
        await ghAdapter.startApplication(discoveredPayload);
        await ghAdapter.fillApplication(discoveredPayload, {
          candidateName: candidateDNA.name,
          email: candidateDNA.email,
          phone: candidateDNA.phone,
          linkedinUrl: candidateDNA.linkedinUrl,
          portfolioUrl: candidateDNA.portfolioUrl,
          resumePath: '',
          resumeContent: `Candidate: ${candidateDNA.name} (${candidateDNA.email})\nTarget: ${jobTitle} at ${companyName}\nLinkedIn: ${candidateDNA.linkedinUrl}\nPortfolio: ${candidateDNA.portfolioUrl}`,
          answers: generatedAnswers,
        });
        const ghResult = await ghAdapter.submitApplication();
        if (ghResult.success) {
          automationResult = ghResult;
        }
      }
    } catch (err: any) {
      console.warn('Greenhouse ATS API submission fallback:', err.message);
    }
  } else if (isLever) {
    try {
      const leverAdapter = platformRegistry.getAdapter('lever');
      if (leverAdapter) {
        const discoveredPayload = {
          externalId: String(targetJobId),
          title: jobTitle,
          company: companyName,
          location: input.location || 'Remote',
          isRemote: true,
          description,
          requiredSkills,
          preferredSkills: [],
          applicationUrl,
          source: 'lever' as const,
        };
        await leverAdapter.startApplication(discoveredPayload);
        await leverAdapter.fillApplication(discoveredPayload, {
          candidateName: candidateDNA.name,
          email: candidateDNA.email,
          phone: candidateDNA.phone,
          linkedinUrl: candidateDNA.linkedinUrl,
          portfolioUrl: candidateDNA.portfolioUrl,
          resumePath: '',
          resumeContent: `Candidate: ${candidateDNA.name} (${candidateDNA.email})\nTarget: ${jobTitle} at ${companyName}\nLinkedIn: ${candidateDNA.linkedinUrl}\nPortfolio: ${candidateDNA.portfolioUrl}`,
          answers: generatedAnswers,
        });
        const leverResult = await leverAdapter.submitApplication();
        if (leverResult.success) {
          automationResult = leverResult;
        }
      }
    } catch (err: any) {
      console.warn('Lever ATS API submission fallback:', err.message);
    }
  }

  // Fallback to BrowserAutomation / Assisted Mode if not an API platform or if API couldn't complete
  if (!automationResult) {
    automationResult = await BrowserAutomation.runApplication({
      applicationUrl,
      jobTitle,
      companyName,
      customAnswers: generatedAnswers,
      autoSubmit: input.autoSubmit ?? true,
    });
  }

  // Determine actual status
  const isDirectlySubmitted = automationResult.success && !automationResult.requiresHumanReview;
  const appStatus = isDirectlySubmitted ? 'applied' : 'in_review';
  const confirmationMessage = automationResult.confirmationMessage || 
    (automationResult.requiresHumanReview 
      ? `Assisted Mode: Application package generated (Tailored CV + STAR Answers). Ready for 1-click submission.`
      : `Application submitted via Agent`);

  // 5. Persist Application Record in Database
  let appId: number | undefined;
  try {
    const [appRecord] = await db.insert(application).values({
      candidateId,
      jobId: targetJobId,
      cvId,
      status: appStatus,
      appliedAt: new Date(),
      notes: confirmationMessage,
    }).returning();

    appId = appRecord.id;

    // Save Q&A pairs
    for (const [q, a] of Object.entries(generatedAnswers)) {
      await db.insert(applicationAnswer).values({
        applicationId: appRecord.id,
        question: q,
        answer: a,
        isVerified: true,
      }).catch(() => {});
    }

    // Save submission event
    await db.insert(applicationEvent).values({
      applicationId: appRecord.id,
      eventType: 'auto_applied',
      eventData: {
        company: companyName,
        role: jobTitle,
        cvVersion,
        confirmationId: automationResult.confirmationId,
      },
      timestamp: new Date(),
    }).catch(() => {});

    // Update or insert queue status
    const existingQueue = await db.query.applicationQueue.findFirst({
      where: (q, { and, eq }) => and(eq(q.jobId, targetJobId), eq(q.candidateId, candidateId)),
    });

    if (existingQueue) {
      await transitionStatus(existingQueue.id, 'submitted', {
        applicationId: appRecord.id,
        cvId,
        confirmationId: automationResult.confirmationId,
      });
    } else {
      await db.insert(applicationQueue).values({
        jobId: targetJobId,
        candidateId,
        applicationId: appRecord.id,
        cvId,
        status: 'submitted',
        platform: 'direct',
        priority: 90,
        completedAt: new Date(),
      }).catch(() => {});
    }

    // Log Agent Activity
    await db.insert(agentActivity).values({
      agentName: 'ApplicationAgent',
      actionType: 'apply',
      message: `🚀 Auto-applied to ${companyName} for ${jobTitle}`,
      details: {
        company: companyName,
        jobTitle,
        applicationId: appRecord.id,
        cvVersion,
      },
      severity: 'info',
      timestamp: new Date(),
    }).catch(() => {});
  } catch (dbErr) {
    console.warn('Database save warning:', dbErr);
  }

  return {
    success: true,
    status: automationResult.requiresHumanReview ? 'human_review' : 'submitted',
    applicationId: appId,
    company: companyName,
    role: jobTitle,
    cvVersion,
    answersGenerated: Object.keys(generatedAnswers).length,
    confirmationId: automationResult.confirmationId,
    message: automationResult.confirmationMessage || `AI Agent applied to ${companyName} (${jobTitle}) with tailored CV & STAR answers!`,
  };
}
