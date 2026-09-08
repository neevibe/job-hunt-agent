import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { db } from '@/db';
import { companyResearch } from '@/db/schema';

/**
 * Researches companies for high-value opportunities based on model training data.
 * @param companyId The ID of the company
 * @param companyName The name of the company
 * @param jobTitle The title of the job being applied for
 * @returns Structured company research data
 */
export async function researchCompany(companyId: number, companyName: string, jobTitle: string) {
  try {
    console.log(`🏢 [CompanyResearchAgent] Researching company: ${companyName}...`);

    const result = await generateObject({
      model: anthropic('claude-sonnet-4-20250514'),
      schema: z.object({
        overview: z.string().describe('A brief overview of what the company does and its market position'),
        aiStrategy: z.string().describe('The company\'s known or likely strategy regarding AI and Machine Learning'),
        recentInitiatives: z.array(z.string()).describe('Recent major initiatives, product launches, or news'),
        competitors: z.array(z.string()).describe('List of main competitors in the industry'),
        productCulture: z.string().describe('Assessment of their product and engineering culture'),
        challenges: z.array(z.string()).describe('Potential business or technical challenges they might be facing'),
        whyCandidateFits: z.string().describe(`Why a candidate applying for ${jobTitle} might be a strong fit`),
        interviewTopics: z.array(z.string()).describe('Potential topics to bring up during an interview')
      }),
      prompt: `Generate comprehensive research for the company "${companyName}". Focus on information relevant to a candidate applying for a "${jobTitle}" role. Use your internal knowledge base.`
    });

    const data = result.object;

    await db.insert(companyResearch).values({
      companyId,
      overview: data.overview,
      aiStrategy: data.aiStrategy,
      recentInitiatives: data.recentInitiatives,
      competitors: data.competitors,
      productCulture: data.productCulture,
      challenges: data.challenges,
      whyCandidateFits: data.whyCandidateFits,
      interviewTopics: data.interviewTopics
    });

    console.log(`✅ 🏢 [CompanyResearchAgent] Successfully researched ${companyName}`);
    return data;
  } catch (error) {
    console.error(`❌ 🏢 [CompanyResearchAgent] Error researching ${companyName}:`, error);
    throw error;
  }
}
