/**
 * INTERVIEW PREPARATION WORKSPACE
 *
 * Automatically generates interview preparation materials
 * when an application transitions to interview stage.
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getCandidateDNA, GITHUB_PROJECTS } from '@/lib/candidate-dna';
import { db } from '@/db';
import { companyResearch, interview, application, job, company } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface InterviewPrep {
  company: string;
  role: string;
  companyOverview: string;
  roleAnalysis: string;
  whyThisCompany: string;
  whyThisRole: string;
  tellMeAboutYourself: string;
  likelyQuestions: {
    category: string;
    questions: string[];
  }[];
  behavioralStories: {
    question: string;
    story: string;
  }[];
  technicalTopics: string[];
  questionsToAsk: string[];
}

/**
 * Generate comprehensive interview preparation
 */
export async function generateInterviewPrep(
  applicationId: number
): Promise<InterviewPrep> {
  console.log(`📚 Generating interview prep for application ${applicationId}...`);

  // Get application details
  const app = await db.query.application.findFirst({
    where: (a, { eq }) => eq(a.id, applicationId),
    with: {
      job: {
        with: { company: true },
      },
    },
  });

  if (!app || !app.job) {
    throw new Error('Application or job not found');
  }

  const jobData = app.job;
  const companyName = (jobData.company as { name: string } | null)?.name || 'Unknown Company';
  const candidate = getCandidateDNA();

  // Get existing company research
  let research = null;
  if (jobData.companyId) {
    const researchData = await db
      .select()
      .from(companyResearch)
      .where(eq(companyResearch.companyId, jobData.companyId))
      .limit(1);
    research = researchData[0] || null;
  }

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: `You are an expert interview coach preparing a candidate for a product management interview.
      
The candidate is: ${candidate.name}
Experience: ${candidate.experiences.map(e => `${e.jobTitle} at ${e.company}`).join(', ')}
Key achievements: ${candidate.experiences.flatMap(e => e.achievements.map(a => a.title)).join(', ')}
Projects: ${GITHUB_PROJECTS.map(p => p.name).join(', ')}

RULES:
- Only reference REAL experience and achievements
- Be specific with metrics and examples
- Tailor everything to this specific company and role
- NEVER fabricate experience, metrics, or claims`,
      prompt: `Prepare interview materials for:

Company: ${companyName}
Role: ${jobData.title}
Job Description: ${jobData.description}
${research ? `Company Research: ${research.overview}\nAI Strategy: ${research.aiStrategy}` : ''}

Generate a JSON response with:
1. companyOverview: 2-3 sentence overview
2. roleAnalysis: What this role really needs
3. whyThisCompany: Authentic answer using candidate's real experience
4. whyThisRole: Authentic answer connecting candidate's journey to this role
5. tellMeAboutYourself: 60-second pitch using real achievements
6. likelyQuestions: Array of { category, questions[] } covering:
   - Product Sense (3 questions)
   - AI/ML Technical (3 questions)
   - Behavioral/Leadership (3 questions)
   - Role-Specific (2 questions)
7. behavioralStories: 3 STAR stories from real experience matching likely questions
8. technicalTopics: 5 topics to brush up on
9. questionsToAsk: 5 intelligent questions for the interviewer

Return valid JSON only.`,
    });

    const parsed = JSON.parse(text);

    return {
      company: companyName,
      role: jobData.title,
      companyOverview: parsed.companyOverview || '',
      roleAnalysis: parsed.roleAnalysis || '',
      whyThisCompany: parsed.whyThisCompany || '',
      whyThisRole: parsed.whyThisRole || '',
      tellMeAboutYourself: parsed.tellMeAboutYourself || '',
      likelyQuestions: parsed.likelyQuestions || [],
      behavioralStories: parsed.behavioralStories || [],
      technicalTopics: parsed.technicalTopics || [],
      questionsToAsk: parsed.questionsToAsk || [],
    };
  } catch (error) {
    console.error('Interview prep generation failed:', error);

    // Fallback with basic prep
    return {
      company: companyName,
      role: jobData.title,
      companyOverview: `${companyName} is hiring for ${jobData.title}.`,
      roleAnalysis: `This role focuses on ${jobData.requiredSkills?.join(', ') || 'product management'}.`,
      whyThisCompany: `My experience building AI products at BIAL and scaling SaaS platforms at Bidgely aligns with ${companyName}'s mission.`,
      whyThisRole: `As someone who has built enterprise GenAI platforms from 0→1, I'm excited about the opportunity to drive AI product strategy at ${companyName}.`,
      tellMeAboutYourself: `I'm an AI Product Manager with 10+ years of experience. Most recently, I built EKO, an enterprise GenAI analytics platform at Bangalore International Airport that enabled ₹500Cr+ in commercial decisions. I've also built Xyrenis, a production AI-powered project intelligence platform, and Jarvis, a digital-twin agent with 9-tier memory.`,
      likelyQuestions: [
        { category: 'Product Sense', questions: ['How would you prioritize features for an AI product?', 'Describe your approach to product discovery.', 'How do you measure AI product success?'] },
        { category: 'AI/ML', questions: ['Explain how you would evaluate an LLM for production use.', 'What is RAG and when would you use it?', 'How do you handle AI model costs at scale?'] },
        { category: 'Behavioral', questions: ['Tell me about a product failure.', 'Describe a difficult stakeholder situation.', 'How do you drive alignment across teams?'] },
      ],
      behavioralStories: [
        { question: 'Tell me about a product you built from scratch', story: 'At BIAL, I conceived and shipped EKO, our enterprise GenAI platform. Data was fragmented across 50+ systems, manual reporting took weeks. I owned the full lifecycle — concept, architecture, development, deployment, adoption. Within 6 months: 50 users, 200+ queries/week, 35% faster decisions.' },
      ],
      technicalTopics: ['LLM architectures', 'RAG systems', 'Prompt engineering', 'ML model evaluation', 'Data pipelines'],
      questionsToAsk: [
        'What does the AI roadmap look like for the next 12 months?',
        'How is the AI/ML team structured?',
        'What are the biggest product challenges you\'re facing?',
        'How do you measure success for this role?',
        'What does the tech stack look like?',
      ],
    };
  }
}
