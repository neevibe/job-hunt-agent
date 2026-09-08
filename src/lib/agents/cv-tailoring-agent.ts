import { db } from '@/db';
import { cv, job, candidate, experience, achievement, candidateSkill, jobIntelligence } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

/**
 * CV TAILORING AGENT
 * 
 * Creates role-specific CVs from Candidate DNA + Job Description.
 * ABSOLUTE RULE: NEVER fabricate experience, metrics, or skills.
 */

interface TailorCVInput {
  candidateId: number;
  jobId: number;
}

interface CVSection {
  title: string;
  content: string;
  isCustomized: boolean;
  originalVersion: string;
}

interface TailoredCV {
  candidateName: string;
  contactInfo: {
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
  };
  professionalSummary: CVSection;
  experience: Array<{
    company: string;
    title: string;
    dates: string;
    highlights: string[];
    isReordered: boolean;
  }>;
  projects: Array<{
    name: string;
    description: string;
    tech: string[];
    relevance: string;
  }>;
  skills: {
    primary: string[];
    secondary: string[];
    reordered: boolean;
  };
  education: string[];
  certifications: string[];
  atsMetadata: {
    matchedKeywords: string[];
    missingKeywords: string[];
    score: number;
  };
}

export async function tailorCV({ candidateId, jobId }: TailorCVInput) {
  console.log(`📄 Tailoring CV for candidate ${candidateId}, job ${jobId}...`);

  // Fetch candidate DNA
  const candidateData = await db.query.candidate.findFirst({
    where: (c, { eq }) => eq(c.id, candidateId),
    with: {
      experiences: {
        with: { achievements: true },
        orderBy: (exp, { desc }) => [desc(exp.startDate)],
      },
      skills: true,
    },
  });

  if (!candidateData) throw new Error('Candidate not found');

  // Fetch job
  const jobData = await db.query.job.findFirst({
    where: (j, { eq }) => eq(j.id, jobId),
    with: {
      company: true,
      intelligence: true,
    },
  });

  if (!jobData) throw new Error('Job not found');

  // Store versions of original CV
  const originalCV = generateOriginalCV(candidateData);

  // Generate tailored CV using AI
  const tailoredContent = await generateTailoredContent(candidateData, jobData);

  // Calculate ATS match
  const atsAnalysis = calculateATSMatch(tailoredContent, jobData);

  // Store version
  const versionName = `${jobData.company?.name?.replace(/\s+/g, '_')}_${jobData.title?.replace(/\s+/g, '_')}_v1`;

  const [cvRecord] = await db.insert(cv).values({
    candidateId,
    jobId,
    version: versionName,
    content: JSON.stringify(tailoredContent),
    format: 'markdown',
    atsScore: atsAnalysis.score,
    requiredKeywordCoverage: atsAnalysis.requiredCoverage,
    preferredKeywordCoverage: atsAnalysis.preferredCoverage,
    matchedKeywords: atsAnalysis.matchedKeywords,
    missingKeywords: atsAnalysis.missingKeywords,
    riskyElements: atsAnalysis.riskyElements,
    changesSummary: tailoredContent.changesSummary,
  }).returning();

  console.log(`✅ CV tailored: ATS Score ${atsAnalysis.score}/100`);

  return {
    cvRecord,
    original: originalCV,
    tailored: tailoredContent,
    atsAnalysis,
  };
}

function generateOriginalCV(candidateData: any) {
  return {
    name: candidateData.name,
    email: candidateData.email,
    phone: candidateData.phone,
    location: candidateData.location,
    linkedin: candidateData.linkedinUrl,
    portfolio: candidateData.portfolioUrl,
    experience: candidateData.experiences,
    skills: candidateData.skills,
  };
}

async function generateTailoredContent(candidateData: any, jobData: any) {
  // This is where Claude generates the tailored CV
  // For now, we'll create a structured template that gets populated
  
  const requirements = extractRequirements(jobData);
  const matchingExperience = findMatchingExperience(candidateData.experiences, requirements);
  const matchingSkills = findMatchingSkills(candidateData.skills, requirements);
  const matchingProjects = findMatchingProjects(jobData);

  return {
    // Summary tailored to the role
    professionalSummary: await generateSummary(matchingExperience, jobData),
    
    // Experience reordered by relevance
    experience: reorderExperience(matchingExperience, jobData),
    
    // Projects highlighted by relevance
    projects: matchingProjects,
    
    // Skills reordered to match JD
    skills: {
      primary: matchingSkills.primary,
      secondary: matchingSkills.secondary,
      reordered: matchingSkills.reordered,
    },
    
    // Unchanged
    education: candidateData.education || [
      'PGP Product Management — IIM Visakhapatnam',
      'Minor in AI — IIT Ropar',
      'Data Science & Business Analytics — Great Lakes',
    ],
    
    certifications: [
      'Certified ScrumMaster (CSM)',
      'Microsoft Azure AZ-900',
      'Data Analytics — Deloitte (Virtual)',
      'Data Analytics & Visualization — Accenture (Virtual)',
    ],
    
    // Tracking
    changesSummary: generateChangesSummary(matchingExperience, jobData),
  };
}

function extractRequirements(jobData: any) {
  return {
    requiredSkills: jobData.requiredSkills || [],
    preferredSkills: jobData.preferredSkills || [],
    aiRequirements: jobData.intelligence?.aiRequirements || [],
    productRequirements: jobData.intelligence?.productRequirements || [],
    domain: jobData.intelligence?.roleType || '',
    seniority: jobData.experienceMin || 5,
    experienceLevel: jobData.intelligence?.leadershipExpectation || 'IC',
  };
}

function findMatchingExperience(experiences: any[], requirements: any) {
  // Score each experience by relevance
  return experiences
    .map(exp => ({
      ...exp,
      relevanceScore: calculateExperienceRelevance(exp, requirements),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function calculateExperienceRelevance(experience: any, requirements: any) {
  let score = 0;
  
  // AI exposure match
  if (requirements.aiRequirements.some((r: string) => 
    experience.aiExposure?.toLowerCase().includes(r.toLowerCase())
  )) score += 30;
  
  // Product ownership match
  if (requirements.productRequirements.some((r: string) => 
    experience.productsOwned?.some((p: string) => p.toLowerCase().includes(r.toLowerCase()))
  )) score += 25;
  
  // Domain match
  if (requirements.domain.includes('GenAI') && experience.technologies?.includes('GenAI')) score += 20;
  if (requirements.domain.includes('AI') && experience.technologies?.some((t: string) => t.includes('AI'))) score += 15;
  if (requirements.domain.includes('FinTech') && experience.company?.includes('Bank')) score += 20;
  
  // Leadership match
  if (requirements.experienceLevel === 'Lead' && experience.leadership) score += 15;
  
  return score;
}

function findMatchingSkills(skills: any[], requirements: any) {
  const requiredMatches: string[] = [];
  const preferredMatches: string[] = [];
  
  for (const skill of skills) {
    if (requirements.requiredSkills.some((r: string) => 
      skill.skillName.toLowerCase().includes(r.toLowerCase())
    )) {
      requiredMatches.push(skill.skillName);
    }
    
    if (requirements.preferredSkills.some((p: string) => 
      skill.skillName.toLowerCase().includes(p.toLowerCase())
    )) {
      preferredMatches.push(skill.skillName);
    }
  }
  
  return {
    primary: requiredMatches,
    secondary: preferredMatches,
    reordered: requiredMatches.length > 0,
  };
}

function findMatchingProjects(jobData: any) {
  // Neeraj's verified resume and GitHub projects
  const allProjects = [
    {
      name: 'OrbitPM AI (orbitpm-ai / Xyrenis)',
      description: 'AI-Powered Enterprise Project Intelligence Platform for BIAL Commercial Department. Production system with hybrid AI copilot (Heuristic router + LLM fallback), RBAC, real-time Supabase data.',
      tech: ['Next.js 16', 'React 19', 'TypeScript', 'Supabase', 'Claude Opus 4.8', 'Gemini 2.5 Flash', 'Tailwind CSS v4'],
      relevance: 'Production AI platform, hybrid AI architecture, enterprise project governance',
      keywords: ['GenAI', 'LLM', 'RBAC', 'production', 'AI copilot', 'enterprise', 'project management'],
    },
    {
      name: 'Majdoor AI (majdoor)',
      description: 'Autonomous AI workforce orchestration platform managing asynchronous task execution and background agent schedules.',
      tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Agent Workflows'],
      relevance: 'Autonomous agent orchestration, asynchronous job queues, real-time streaming',
      keywords: ['AI agent', 'autonomous', 'workflow', 'orchestration', 'queue'],
    },
    {
      name: 'Xyro & Xyro-UI (Jarvis)',
      description: 'Digital-twin agent with durable identity, 9-tier memory system, personality drift prevention, voice (push-to-talk, VAD, barge-in) on Claude Agent SDK. UI powered by Three.js procedural GLSL energy core.',
      tech: ['Claude Agent SDK', 'TypeScript', 'Three.js', 'GLSL', 'Whisper.cpp', 'ElevenLabs'],
      relevance: 'AI agent with memory, personality, voice. Cutting-edge agentic AI.',
      keywords: ['AI agent', 'memory', 'LLM', 'voice', 'personality', 'agentic', '3D', 'WebGL'],
    },
    {
      name: 'A/B Experimentation and Conversion Funnel Evaluation',
      description: 'Controlled experiment analysing behavioral activity from 20,000 user sessions with SQL CTE pipelines, window functions, and two-proportion hypothesis testing in Python.',
      tech: ['SQL', 'Python', 'Power BI', 'Statistical Testing'],
      relevance: 'Rigorous A/B testing, conversion funnels, hypothesis validation, product analytics',
      keywords: ['A/B Testing', 'experimentation', 'funnel', 'conversion', 'statistics', 'Python', 'SQL'],
    },
    {
      name: 'B2B Sales Intelligence & Customer Behavior Dashboard',
      description: 'Interactive Tableau analytical interface consolidating 3 operational datasets covering 5,000+ orders, demand trends, and relationship management strategies for 10 high-value clients.',
      tech: ['Tableau', 'SQL', 'Data Modeling', 'Business Intelligence'],
      relevance: 'Enterprise BI, sales intelligence, executive reporting, customer retention',
      keywords: ['BI', 'Tableau', 'sales intelligence', 'retention', 'enterprise'],
    },
    {
      name: 'Innovation Scout',
      description: 'Market intelligence aggregation platform for BIAL researching global airport innovations across metropolitan hubs with automated relevance ranking.',
      tech: ['Next.js', 'Postgres', 'Vercel', 'Tavily', 'SerpAPI'],
      relevance: 'Analytics product, data platform, business intelligence',
      keywords: ['analytics', 'data platform', 'market intelligence', 'business intelligence'],
    },
    {
      name: 'BLR Airport WhatsApp Assistant',
      description: 'Conversational assistant providing real-time flight tracking, gate notifications, and commercial retail offers for Bangalore International Airport.',
      tech: ['Node.js', 'WhatsApp Business API', 'NLP', 'Airport APIs'],
      relevance: 'Conversational AI, passenger experience, real-time messaging',
      keywords: ['conversational AI', 'chatbot', 'NLP', 'customer experience'],
    },
  ];
  
  return allProjects.filter(p => 
    p.keywords.some(k => 
      jobData.intelligence?.aiRequirements?.includes(k) ||
      jobData.intelligence?.productRequirements?.includes(k)
    )
  );
}

async function generateSummary(experiences: any[], jobData: any): Promise<string> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { text } = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: `You are an executive CV writer tailoring an AI Product Manager's summary for a specific role.
ABSOLUTE RULE: NEVER fabricate or exaggerate experience, metrics, or technologies.
Only use the verified experience from Neeraj Prakash's resume:
- 10+ years building data-driven products and AI/ML-powered solutions across airports, fintech, SaaS, and e-commerce.
- Proven track record of launching 5+ products that delivered 27% revenue growth and 24% improvement in customer retention.
- BIAL: Conceptualised, built, and deployed EKO (enterprise GenAI platform, internal ChatGPT) automating BI reporting; built Orbit PM internal project tool; designed operational dashboards improving efficiency by 9%; passenger satisfaction +13%; OPEX reduced by 7%; ₹500Cr+ decisions enabled.
- Bidgely: Scaled SaaS AI platform to 3,000+ enterprise users across utility clients.
- Micro Technoid India: Boosted product adoption by 33% through targeted A/B testing and user analytics; accelerated delivery velocity by 5%.
- Amazon: Predictive customer behavior models and automated BI dashboards.
- Axis Bank: Assistant Manager - Digital Banking Products, analytics-driven customer segmentation.
- Production GitHub Projects: OrbitPM AI, Majdoor AI, Xyro (Claude Agent SDK digital twin with 9-tier memory), BLR Airport WhatsApp Bot.
- Education: IIT Ropar (Minor in AI), IIM Visakhapatnam (PGP Product Management), Certified Scrum Master (CSM).`,
        prompt: `Write a punchy 3-4 sentence professional summary tailored specifically for this role:
Title: ${jobData.title}
Company: ${jobData.company?.name || 'Target Company'}
Key requirements: ${(jobData.requiredSkills || []).join(', ')}`,
      });
      if (text.trim()) return text.trim();
    } catch (e) {
      console.warn('LLM summary generation failed, using template:', e);
    }
  }
  return `Results-driven AI Product Manager with 10+ years of experience building data-driven products and AI/ML-powered solutions across airports, fintech, SaaS, and e-commerce. Proven track record of launching 5+ products that delivered 27% revenue growth and 24% improvement in customer retention. Built products from scratch - including EKO (enterprise GenAI analytics platform) and Orbit PM (internal project management tool) - owning the full product lifecycle from ideation to deployment. Deep expertise in GenAI, LLM integration, product roadmap execution, Agile/Scrum, and cross-functional stakeholder management.`;
}

function reorderExperience(experiences: any[], jobData: any) {
  return experiences.map(exp => ({
    company: exp.company,
    title: exp.jobTitle,
    dates: `${exp.startDate} - ${exp.endDate || 'Present'}`,
    highlights: [
      ...(exp.responsibilities || []),
      ...(exp.achievements?.map((a: any) => `${a.title}: ${a.metric}`) || []),
    ],
    isReordered: true,
  }));
}

function generateChangesSummary(experiences: any[], jobData: any) {
  const changes: string[] = [];
  
  if (experiences[0]?.company.includes('BIAL')) {
    changes.push('Prioritized BIAL EKO experience as most relevant');
  }
  
  if (jobData.intelligence?.aiRequirements?.includes('GenAI')) {
    changes.push('Emphasized GenAI/LLM expertise in summary');
  }
  
  if (jobData.intelligence?.roleType?.includes('0-to-1')) {
    changes.push('Highlighted 0→1 product building track record');
  }
  
  if (jobData.intelligence?.roleType?.includes('enterprise')) {
    changes.push('Emphasized enterprise experience and stakeholder management');
  }
  
  return changes.join('; ');
}

function calculateATSMatch(tailoredContent: any, jobData: any) {
  const allJobKeywords = [
    ...(jobData.requiredSkills || []),
    ...(jobData.preferredSkills || []),
    ...(jobData.intelligence?.aiRequirements || []),
    ...(jobData.intelligence?.productRequirements || []),
  ];
  
  const candidateText = JSON.stringify(tailoredContent).toLowerCase();
  
  const matched = allJobKeywords.filter((keyword: string) => 
    candidateText.includes(keyword.toLowerCase())
  );
  
  const missing = allJobKeywords.filter((keyword: string) => 
    !candidateText.includes(keyword.toLowerCase())
  );
  
  const risky: string[] = [];
  
  // Check for skills we DON'T have
  if (jobData.requiredSkills?.some((s: string) => s.includes('B2B SaaS')) && 
      !candidateText.includes('b2b saas')) {
    missing.push('B2B SaaS (gap)');
  }
  
  const score = Math.min(100, Math.round((matched.length / allJobKeywords.length) * 100));
  
  return {
    score,
    requiredCoverage: Math.min(100, Math.round((matched.filter(m => 
      jobData.requiredSkills?.includes(m)
    ).length / (jobData.requiredSkills?.length || 1)) * 100)),
    preferredCoverage: Math.min(100, Math.round((matched.filter(m => 
      jobData.preferredSkills?.includes(m)
    ).length / (jobData.preferredSkills?.length || 1)) * 100)),
    matchedKeywords: matched,
    missingKeywords: missing,
    riskyElements: risky,
  };
}
