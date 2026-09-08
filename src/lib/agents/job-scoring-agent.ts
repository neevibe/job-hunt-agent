import { z } from 'zod';
import { getCandidateDNA, type CandidateProfile } from '@/lib/candidate-dna';

/**
 * JOB SCORING AGENT
 * 
 * Scores every job from 0-100 based on candidate fit.
 * Explains WHY the score was assigned and provides actionable recommendations.
 */

export interface JobData {
  id: number;
  company: string;
  title: string;
  location: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  experienceMin?: number;
  experienceMax?: number;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  aiRequirements?: string[];
  productRequirements?: string[];
  roleType?: string;
}

export interface JobScore {
  overallScore: number;
  aiRelevanceScore: number;
  productOwnershipScore: number;
  pmExperienceScore: number;
  domainScore: number;
  leadershipScore: number;
  analyticsScore: number;
  seniorityScore: number;
  locationScore: number;
  explanation: string;
  recommendation: 'auto-apply' | 'apply' | 'review' | 'skip';
  strengths: string[];
  gaps: string[];
}

export function scoreJob(jobData: JobData): JobScore {
  const candidateData = getCandidateDNA();
  
  // Calculate individual scores
  const aiRelevanceScore = calculateAIScore(jobData, candidateData);
  const productOwnershipScore = calculateProductScore(jobData, candidateData);
  const pmExperienceScore = calculatePMScore(candidateData);
  const domainScore = calculateDomainScore(jobData, candidateData);
  const leadershipScore = calculateLeadershipScore(jobData, candidateData);
  const analyticsScore = calculateAnalyticsScore(candidateData);
  const seniorityScore = calculateSeniorityScore(jobData, candidateData);
  const locationScore = calculateLocationScore(jobData, candidateData);

  // Weighted overall score
  const overallScore = Math.round(
    aiRelevanceScore * 0.25 +
    productOwnershipScore * 0.20 +
    pmExperienceScore * 0.15 +
    domainScore * 0.10 +
    leadershipScore * 0.10 +
    analyticsScore * 0.10 +
    seniorityScore * 0.05 +
    locationScore * 0.05
  );

  // Determine recommendation
  let recommendation: JobScore['recommendation'] = 'skip';
  if (overallScore >= 85) recommendation = 'auto-apply';
  else if (overallScore >= 75) recommendation = 'apply';
  else if (overallScore >= 65) recommendation = 'review';

  // Identify strengths and gaps
  const { strengths, gaps } = identifyStrengthsAndGaps(jobData, candidateData);

  // Generate explanation
  const explanation = generateExplanation(overallScore, strengths, gaps);

  return {
    overallScore,
    aiRelevanceScore,
    productOwnershipScore,
    pmExperienceScore,
    domainScore,
    leadershipScore,
    analyticsScore,
    seniorityScore,
    locationScore,
    explanation,
    recommendation,
    strengths,
    gaps,
  };
}

function calculateAIScore(job: JobData, candidate: CandidateProfile): number {
  let score = 0;
  
  // Check AI requirements match across title, description, and skill tags
  const aiKeywords = ['genai', 'generative', 'llm', 'ai', 'ml', 'machine learning', 'rag', 'prompt', 'agent', 'agentic', 'nlp', 'deep learning', 'vision'];
  const allSkills = [...(job.requiredSkills || []), ...(job.preferredSkills || [])].join(' ');
  const jobText = `${job.title} ${job.description} ${allSkills}`.toLowerCase();
  
  if (aiKeywords.some(k => jobText.includes(k))) {
    score += 50;
    
    // Bonus for specific deep AI matches
    if (jobText.includes('genai') || jobText.includes('generative')) score += 15;
    if (jobText.includes('llm') || jobText.includes('language model')) score += 15;
    if (jobText.includes('rag') || jobText.includes('vector')) score += 10;
    if (jobText.includes('prompt')) score += 10;
    if (jobText.includes('agent') || jobText.includes('agentic')) score += 10;
  }
  
  return Math.min(100, score);
}

function calculateProductScore(job: JobData, candidate: CandidateProfile): number {
  let score = 0;
  
  // Check product experience across title, description, and skill tags
  const productKeywords = ['product manager', 'product owner', 'product strategy', 'product lead', 'pm', '0-1', '0→1', 'zero to one'];
  const allSkills = [...(job.requiredSkills || []), ...(job.preferredSkills || [])].join(' ');
  const jobText = `${job.title} ${job.description} ${allSkills}`.toLowerCase();
  
  if (productKeywords.some(k => jobText.includes(k))) {
    score += 60;
    
    // Bonus for 0→1 experience
    if (jobText.includes('0-1') || jobText.includes('0→1') || jobText.includes('zero to one') || jobText.includes('greenfield')) {
      score += 20;
    }
    
    // Bonus for platform/enterprise
    if (jobText.includes('enterprise') || jobText.includes('platform')) {
      score += 20;
    }
  }
  
  return Math.min(100, score);
}

function calculatePMScore(candidate: CandidateProfile): number {
  // Candidate has 10+ years PM experience
  return 90;
}

function calculateDomainScore(job: JobData, candidate: CandidateProfile): number {
  let score = 50; // Base score
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  
  // FinTech bonus (Axis Bank experience)
  if (jobText.includes('fintech') || jobText.includes('payments') || jobText.includes('banking')) {
    score += 25;
  }
  
  // SaaS bonus (Bidgely experience)
  if (jobText.includes('saas') || jobText.includes('b2b')) {
    score += 15;
  }
  
  // Enterprise bonus (BIAL experience)
  if (jobText.includes('enterprise')) {
    score += 10;
  }
  
  return Math.min(100, score);
}

function calculateLeadershipScore(job: JobData, candidate: CandidateProfile): number {
  const jobText = job.description.toLowerCase();
  
  // Check if leadership is required
  if (jobText.includes('lead') || jobText.includes('manager') || jobText.includes('team')) {
    return 85; // Candidate has leadership experience
  }
  
  return 70;
}

function calculateAnalyticsScore(candidate: CandidateProfile): number {
  // Candidate has strong analytics background
  return 90;
}

function calculateSeniorityScore(job: JobData, candidate: CandidateProfile): number {
  const expMin = job.experienceMin || 5;
  const expMax = job.experienceMax || 15;
  const candidateExp = 10;
  
  if (candidateExp >= expMin && candidateExp <= expMax) {
    return 100;
  } else if (candidateExp > expMax) {
    return 80; // Slightly overqualified
  } else {
    return 60;
  }
}

function calculateLocationScore(job: JobData, candidate: CandidateProfile): number {
  if (job.isRemote) return 100;
  
  const jobLocation = job.location.toLowerCase();
  if (jobLocation.includes('bangalore') || jobLocation.includes('bengaluru')) {
    return 100;
  }
  
  if (candidate.preferredLocations.some(loc => jobLocation.includes(loc.toLowerCase()))) {
    return 80;
  }
  
  return 50;
}

function identifyStrengthsAndGaps(job: JobData, candidate: CandidateProfile): {
  strengths: string[];
  gaps: string[];
} {
  const strengths: string[] = [];
  const gaps: string[] = [];
  const jobText = `${job.title} ${job.description}`.toLowerCase();

  // Check AI match
  if (jobText.includes('ai') || jobText.includes('ml') || jobText.includes('genai')) {
    strengths.push('AI product ownership');
  }

  // Check product experience
  if (jobText.includes('0-1') || jobText.includes('zero to one')) {
    strengths.push('0→1 experience');
  }

  // Check FinTech
  if (jobText.includes('fintech') || jobText.includes('payments')) {
    strengths.push('FinTech background');
  }

  // Check leadership
  if (jobText.includes('lead') || jobText.includes('team')) {
    strengths.push('Leadership experience');
  }

  // Check analytics
  if (jobText.includes('analytics') || jobText.includes('data')) {
    strengths.push('Analytics expertise');
  }

  // Check for gaps
  if (jobText.includes('b2b saas') && !strengths.includes('SaaS')) {
    gaps.push('B2B SaaS specific');
  }

  if (jobText.includes('consumer') || jobText.includes('b2c')) {
    gaps.push('Consumer product focus');
  }

  // Default strengths if none identified
  if (strengths.length === 0) {
    strengths.push('Product management');
    strengths.push('Cross-functional leadership');
  }

  return { strengths, gaps };
}

function generateExplanation(score: number, strengths: string[], gaps: string[]): string {
  if (score >= 85) {
    return `Excellent match. Strong alignment on ${strengths.slice(0, 3).join(', ')}. ${gaps.length > 0 ? `Minor gaps: ${gaps.join(', ')}.` : 'No significant gaps.'}`;
  } else if (score >= 75) {
    return `Strong match. Candidate has ${strengths.slice(0, 2).join(' and ')}. ${gaps.length > 0 ? `Gaps to address: ${gaps.join(', ')}.` : ''}`;
  } else if (score >= 65) {
    return `Potential match. Some alignment on ${strengths[0] || 'PM experience'}. ${gaps.length > 0 ? `Key gaps: ${gaps.join(', ')}.` : ''} Review recommended.`;
  } else {
    return `Weak match. Limited alignment with role requirements.`;
  }
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
