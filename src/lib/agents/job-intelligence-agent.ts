import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { db } from '@/db';
import { jobIntelligence } from '@/db/schema';

/**
 * Extracts structured intelligence from a raw job description using Claude.
 * @param jobId The ID of the job
 * @param title The job title
 * @param company The company name
 * @param description The raw job description
 * @returns Parsed intelligence data
 */
export async function analyzeJobDescription(
  jobId: number,
  title: string,
  company: string,
  description: string
) {
  try {
    console.log(`🧠 [JobIntelligenceAgent] Analyzing job ${jobId}: ${title} at ${company}...`);

    const result = await generateObject({
      model: anthropic('claude-sonnet-4-20250514'),
      schema: z.object({
        roleType: z.string().describe('The primary type of role (e.g., Frontend, Fullstack, AI/ML, Product Manager)'),
        aiRelevance: z.number().min(0).max(100).describe('Score 0-100 indicating how relevant the role is to AI/LLM development'),
        productOwnership: z.number().min(0).max(100).describe('Score 0-100 indicating level of product ownership/autonomy expected'),
        leadershipExpectation: z.string().describe('Description of leadership or mentorship expectations'),
        technicalDepth: z.string().describe('Assessment of the technical depth required'),
        domainRequirements: z.array(z.string()).describe('List of domain-specific requirements'),
        aiRequirements: z.array(z.string()).describe('List of AI/ML specific requirements'),
        productRequirements: z.array(z.string()).describe('List of product/business specific requirements'),
        culturalSignals: z.array(z.string()).describe('Cultural values or signals extracted from the JD'),
        redFlags: z.array(z.string()).describe('Potential red flags or negative signals (e.g., poor work-life balance, vague requirements)')
      }),
      prompt: `Analyze the following job description for a "${title}" at "${company}". Extract structured intelligence according to the schema.
      
Job Description:
${description}`
    });

    const data = result.object;

    // Store in database
    await db.insert(jobIntelligence).values({
      jobId,
      roleType: data.roleType,
      aiRelevance: data.aiRelevance,
      productOwnership: data.productOwnership,
      leadershipExpectation: data.leadershipExpectation,
      technicalDepth: data.technicalDepth,
      domainRequirements: data.domainRequirements,
      aiRequirements: data.aiRequirements,
      productRequirements: data.productRequirements,
      culturalSignals: data.culturalSignals,
      redFlags: data.redFlags
    });

    console.log(`✅ 🧠 [JobIntelligenceAgent] Successfully analyzed job ${jobId}`);
    return data;
  } catch (error) {
    console.error(`❌ 🧠 [JobIntelligenceAgent] Error analyzing job ${jobId}:`, error);
    throw error;
  }
}
