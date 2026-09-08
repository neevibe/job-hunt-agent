import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { db } from '@/db';
import { job, jobScore, jobIntelligence } from '@/db/schema';
import { getCandidateDNA } from '@/lib/candidate-dna';

/**
 * JOB SCORING AGENT
 * 
 * Scores every job from 0-100 based on candidate fit.
 * Explains WHY the score was assigned and provides actionable recommendations.
 */

const jobScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  aiRelevanceScore: z.number().min(0).max(100),
  productOwnershipScore: z.number().min(0).max(100),
  pmExperienceScore: z.number().min(0).max(100),
  domainScore: z.number().min(0).max(100),
  leadershipScore: z.number().min(0).max(100),
  analyticsScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  locationScore: z.number().min(0).max(100),
  explanation: z.string(),
  recommendation: z.enum(['auto-apply', 'apply', 'review', 'skip']),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
});

export async function scoreJob(jobId: number, candidateId: number) {
  console.log(`🎯 Scoring job ${jobId} for candidate ${candidateId}...`);

  // Get job details
  const jobData = await db.query.job.findFirst({
    where: (j, { eq }) => eq(j.id, jobId),
    with: {
      company: true,
      intelligence: true,
    },
  });

  if (!jobData) {
    throw new Error(`Job ${jobId} not found`);
  }

  // Get candidate DNA
  const candidateData = await getCandidateDNA(candidateId);
  
  if (!candidateData) {
    throw new Error(`Candidate ${candidateId} not found`);
  }

  // Create scoring prompt
  const prompt = `You are an expert AI Product Manager recruiter. Score this job against the candidate's profile.

JOB:
Company: ${jobData.company?.name}
Title: ${jobData.title}
Location: ${jobData.location} ${jobData.isRemote ? '(Remote)' : ''}
Experience: ${jobData.experienceMin}-${jobData.experienceMax} years
Description: ${jobData.description}
Required Skills: ${jobData.requiredSkills?.join(', ')}
Preferred Skills: ${jobData.preferredSkills?.join(', ')}

AI Maturity: ${jobData.intelligence?.aiRelevance}/100
Role Type: ${jobData.intelligence?.roleType}
AI Requirements: ${jobData.intelligence?.aiRequirements?.join(', ')}
Product Requirements: ${jobData.intelligence?.productRequirements?.join(', ')}

CANDIDATE:
Name: ${candidateData.name}
Total Experience: 10+ years in AI and analytics roles
Current Location: ${candidateData.location}
Preferred: ${candidateData.preferredLocations?.join(', ')}
Compensation Target: ${candidateData.compensationMin ? `₹${candidateData.compensationMin / 100000}L` : 'Not specified'}

EXPERIENCE:
${candidateData.experiences?.map(exp => `
- ${exp.company} | ${exp.jobTitle} (${exp.startDate} - ${exp.endDate || 'Present'})
  Products: ${exp.productsOwned?.join(', ')}
  AI Exposure: ${exp.aiExposure}
  Business Impact: ${exp.businessImpact}
`).join('\n')}

KEY ACHIEVEMENTS:
${candidateData.experiences?.flatMap(exp => 
  exp.achievements?.map(ach => `- ${ach.title}: ${ach.metric}`)
).join('\n')}

SKILLS:
${candidateData.skills?.map(skill => `${skill.skillName} (${skill.proficiency}, ${skill.yearsExperience}y)`).join(', ')}

SCORING WEIGHTS:
- AI/ML relevance: 25%
- Product ownership: 20%
- PM experience: 15%
- Domain relevance: 10%
- Leadership: 10%
- Analytics/Data: 10%
- Seniority fit: 5%
- Location/compensation: 5%

EVALUATION CRITERIA:
1. Does the candidate have PROVEN AI/ML product experience? (not just interest)
2. Has the candidate owned products end-to-end (0→1, scale, platform)?
3. Does their PM experience level match the role?
4. Is there domain overlap (FinTech, SaaS, Enterprise, etc.)?
5. Do they have the required leadership experience?
6. Is their analytics/data background relevant?
7. Does seniority align (not too junior, not overqualified)?
8. Location and compensation compatible?

STRENGTHS = What makes this candidate EXCELLENT for this role
GAPS = What's missing (be honest, don't invent solutions)

RECOMMENDATION:
- auto-apply: 85-100 (Excellent match, minimal gaps)
- apply: 75-84 (Strong match, addressable gaps)
- review: 65-74 (Potential match, needs human judgment)
- skip: <65 (Weak match, too many gaps)

Be honest. Don't inflate scores. Identify real gaps instead of pretending they don't exist.`;

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-5-20250929'),
    schema: jobScoreSchema,
    prompt,
  });

  // Store score in database
  const [scoreRecord] = await db.insert(jobScore).values({
    jobId,
    candidateId,
    overallScore: result.object.overallScore,
    aiRelevanceScore: result.object.aiRelevanceScore,
    productOwnershipScore: result.object.productOwnershipScore,
    pmExperienceScore: result.object.pmExperienceScore,
    domainScore: result.object.domainScore,
    leadershipScore: result.object.leadershipScore,
    analyticsScore: result.object.analyticsScore,
    seniorityScore: result.object.seniorityScore,
    locationScore: result.object.locationScore,
    explanation: result.object.explanation,
    recommendation: result.object.recommendation,
    strengths: result.object.strengths,
    gaps: result.object.gaps,
  }).returning();

  console.log(`✅ Job scored: ${result.object.overallScore}/100 (${result.object.recommendation})`);

  return {
    score: scoreRecord,
    details: result.object,
  };
}

export async function getTopMatches(candidateId: number, minScore: number = 75, limit: number = 20) {
  const topJobs = await db.query.jobScore.findMany({
    where: (score, { eq, and, gte }) => and(
      eq(score.candidateId, candidateId),
      gte(score.overallScore, minScore)
    ),
    with: {
      job: {
        with: {
          company: true,
        },
      },
    },
    orderBy: (score, { desc }) => [desc(score.overallScore)],
    limit,
  });

  return topJobs;
}

export function getMatchLevel(score: number): {
  emoji: string;
  label: string;
  color: string;
} {
  if (score >= 85) return { emoji: '🔥', label: 'Excellent Match', color: 'red' };
  if (score >= 75) return { emoji: '🟢', label: 'Strong Match', color: 'green' };
  if (score >= 65) return { emoji: '🟡', label: 'Potential Match', color: 'yellow' };
  if (score >= 50) return { emoji: '🟠', label: 'Weak Match', color: 'orange' };
  return { emoji: '🔴', label: 'Skip', color: 'gray' };
}
