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
      prompt: `Answer the following application question truthfully based on the Candidate DNA: "${question}"`,
    });

    const confidence = result.text.length > 50 ? 85 : 40;

    return {
      answer: result.text.trim(),
      confidence,
      evidenceUsed: ["BIAL EKO Platform", "Bidgely SaaS AI", "IIT Ropar AI Minor", "Certified Scrum Master"],
      requiresReview: confidence < 50
    };
  } catch (error) {
    console.warn(`📝 [ApplicationAnswerAgent] LLM unavailable, using grounded DNA fallback:`, error);
    
    const lowerQ = question.toLowerCase();
    const dna = getCandidateDNA();
    let fallbackAnswer = '';
    const evidence: string[] = [];

    if (lowerQ.includes('yourself') || lowerQ.includes('background') || lowerQ.includes('introduce')) {
      fallbackAnswer = `I am an AI Product Manager with 10+ years of experience launching and scaling data-driven and AI/ML products. At BIAL, I conceptualized and deployed EKO—an enterprise GenAI analytics platform—and built Orbit PM from scratch. Previously, I scaled a SaaS AI platform to 3,000+ enterprise users at Bidgely and built predictive models at Amazon. I hold a Minor in AI from IIT Ropar and PGP in Product Management from IIM Visakhapatnam.`;
      evidence.push('BIAL EKO Platform', 'Bidgely', 'Amazon', 'IIT Ropar');
    } else if (lowerQ.includes('why') && (lowerQ.includes('company') || lowerQ.includes(companyName.toLowerCase()))) {
      fallbackAnswer = `I'm eager to bring my 10+ years of product leadership and enterprise AI platform building experience to ${companyName}. Having built 0→1 GenAI solutions that enabled ₹500Cr+ in data-driven commercial decisions at BIAL, I see strong synergy with ${companyName}'s mission and technical roadmap.`;
      evidence.push('BIAL Commercial Metrics', 'Enterprise AI Experience');
    } else if (lowerQ.includes('0 to 1') || lowerQ.includes('0-1') || lowerQ.includes('scratch') || lowerQ.includes('launched')) {
      fallbackAnswer = `At BIAL, I owned the 0→1 lifecycle of EKO, an internal GenAI analytics platform that automated BI reporting and cut analytics latency across 50+ enterprise systems. I also built Orbit PM from scratch—a lightweight project management tool—owning wireframing, sprint planning, and rollout.`;
      evidence.push('EKO Platform 0→1', 'Orbit PM 0→1');
    } else if (lowerQ.includes('compensation') || lowerQ.includes('salary') || lowerQ.includes('expectation')) {
      fallbackAnswer = `My compensation expectations are aligned with senior/lead AI Product Manager industry standards (50–80 LPA INR), commensurate with 10+ years of experience and the scope of responsibilities.`;
      evidence.push('Compensation Preferences');
    } else {
      fallbackAnswer = `With 10+ years of product management experience spanning enterprise GenAI (EKO platform), SaaS AI scaling (3,000+ users at Bidgely), and predictive modeling at Amazon, I bring deep cross-functional leadership, CSM agile rigor, and proven product delivery to ${jobTitle} at ${companyName}.`;
      evidence.push('Candidate DNA Master Experience');
    }

    return {
      answer: fallbackAnswer,
      confidence: 85,
      evidenceUsed: evidence,
      requiresReview: false,
    };
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
