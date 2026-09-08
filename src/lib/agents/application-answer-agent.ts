import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getCandidateDNA, GITHUB_PROJECTS } from '@/lib/candidate-dna';

export interface AnswerResult {
  answer: string;
  confidence: number;
  evidenceUsed: string[];
  requiresReview: boolean;
}

/**
 * Generates an answer to a specific application question using candidate evidence.
 * @param question The question to answer
 * @param jobTitle The job title being applied for
 * @param companyName The company being applied to
 * @param jobDescription The job description for context
 * @returns An answer result including the generated text, confidence, and used evidence
 */
export async function generateApplicationAnswer(
  question: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string
): Promise<AnswerResult> {
  try {
    console.log(`📝 [ApplicationAnswerAgent] Generating answer for question: "${question}"`);
    
    const dna = await getCandidateDNA();

    const systemPrompt = `You are a highly skilled candidate answering application questions for a ${jobTitle} role at ${companyName}.
CRITICAL RULES:
1. NEVER fabricate or invent experience, skills, metrics, or background information.
2. Use ONLY the provided candidate DNA and actual evidence.
3. Be concise, specific, and professional but human-sounding.
4. Mention real metrics and outcomes from the candidate's history when relevant.
5. If the DNA doesn't support a strong answer, provide a generalized but truthful response based on principles.

Candidate DNA:
${JSON.stringify(dna, null, 2)}

GitHub Projects (for reference):
${JSON.stringify(GITHUB_PROJECTS, null, 2)}

Job Description Context:
${jobDescription}`;

    const result = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      prompt: `Answer the following application question truthfully based on the Candidate DNA: "${question}"`
    });

    // In a full implementation, we might parse structured output to determine confidence and evidence.
    // Here we'll use a simple heuristic or prompt structural extraction if needed.
    // For now, we simulate confidence calculation.
    const confidence = result.text.length > 50 ? 85 : 40;
    
    return {
      answer: result.text.trim(),
      confidence,
      evidenceUsed: ["Candidate DNA"], // Mocked for simplicity
      requiresReview: confidence < 50
    };
  } catch (error) {
    console.error(`❌ 📝 [ApplicationAnswerAgent] Error generating answer:`, error);
    throw error;
  }
}

/**
 * Generates answers for multiple application questions in a batch.
 * @param questions List of questions
 * @param jobTitle The job title
 * @param companyName The company name
 * @param jobDescription The job description
 * @returns Array of answer results
 */
export async function generateBatchAnswers(
  questions: string[],
  jobTitle: string,
  companyName: string,
  jobDescription: string
): Promise<AnswerResult[]> {
  console.log(`📝 [ApplicationAnswerAgent] Generating ${questions.length} batch answers...`);
  const results: AnswerResult[] = [];
  
  for (const q of questions) {
    const ans = await generateApplicationAnswer(q, jobTitle, companyName, jobDescription);
    results.push(ans);
  }
  
  return results;
}
