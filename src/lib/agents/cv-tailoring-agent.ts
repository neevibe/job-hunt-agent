import { db } from '@/db';
import { cv, job, candidate, experience, achievement, candidateSkill, jobIntelligence } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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
    professionalSummary: generateSummary(matchingExperience, jobData),
    
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
  // Neeraj's portfolio projects
  const allProjects = [
    {
      name: 'Xyrenis (orbitpm-ai)',
      description: 'AI-Powered Enterprise Project Intelligence Platform. Production system with hybrid AI copilot (Heuristic router + LLM fallback), RBAC, real-time Supabase data.',
      tech: ['Next.js 16', 'React 19', 'TypeScript', 'Supabase', 'Claude Opus 4.8', 'Gemini 2.5 Flash', 'Tailwind CSS v4'],
      relevance: 'Production AI platform, hybrid AI architecture, zero-engineering team',
      keywords: ['GenAI', 'LLM', 'RBAC', 'production', 'AI copilot', 'enterprise'],
    },
    {
      name: 'Jarvis (Xyro)',
      description: 'Digital-twin agent with durable identity, 9-tier memory system, personality drift prevention, voice (push-to-talk, VAD, barge-in). Built on Claude Agent SDK.',
      tech: ['Claude Agent SDK', 'TypeScript', 'Whisper.cpp', 'ElevenLabs', 'Swift'],
      relevance: 'AI agent with memory, personality, voice. Cutting-edge agentic AI.',
      keywords: ['AI agent', 'memory', 'LLM', 'voice', 'personality', 'agentic'],
    },
    {
      name: 'Innovation Scout',
      description: 'Market intelligence tool for BIAL. Multi-source research across cities, scoring markets, connecting evidence to airport-applicable moves.',
      tech: ['Next.js', 'Postgres', 'Vercel', 'Tavily', 'SerpAPI'],
      relevance: 'Analytics product, data platform, business intelligence',
      keywords: ['analytics', 'data platform', 'market intelligence', 'business intelligence'],
    },
    {
      name: 'xyro-ui',
      description: 'AI Lifeform Interface with procedural AI energy core using Three.js and custom GLSL shaders.',
      tech: ['Three.js', 'GLSL', 'WebGL', 'HTML'],
      relevance: 'Advanced UI/3D, AI visualization',
      keywords: ['3D', 'WebGL', 'AI visualization'],
    },
  ];
  
  return allProjects.filter(p => 
    p.keywords.some(k => 
      jobData.intelligence?.aiRequirements?.includes(k) ||
      jobData.intelligence?.productRequirements?.includes(k)
    )
  );
}

function generateSummary(experiences: any[], jobData: any) {
  const topExperience = experiences[0];
  return `AI Product Manager with 10+ years building and shipping AI/ML products from concept to production. Built and deployed enterprise GenAI platform (EKO) at Bangalore International Airport processing 150M+ data points, enabling ₹500Cr+ in commercial decisions. Most recently built Xyrenis — a production AI-powered project intelligence platform with hybrid AI copilot (heuristic router + LLM fallback), shipped with zero engineering team. Also built Jarvis — a digital-twin agent with 9-tier memory system and voice capabilities on Claude Agent SDK. Expertise spans GenAI, LLMs, predictive analytics, product strategy, and cross-functional leadership of 15+ person teams.`;
}

function reorderExperience(experiences: any[], jobData: any) {
  return experiences.slice(0, 3).map(exp => ({
    company: exp.company,
    title: exp.jobTitle,
    dates: `${exp.startDate} - ${exp.endDate || 'Present'}`,
    highlights: [
      ...(exp.responsibilities?.slice(0, 3) || []),
      ...(exp.achievements?.slice(0, 2).map((a: any) => `${a.title}: ${a.metric}`) || []),
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
