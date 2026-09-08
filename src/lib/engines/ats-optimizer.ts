/**
 * Result of the ATS score calculation
 */
export interface ATSScoreResult {
  score: number;
  requiredCoverage: number;
  preferredCoverage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  riskyElements: string[];
  suggestions: string[];
}

/**
 * Enhanced ATS scoring that calculates keyword coverage, format quality, and overall ATS readability.
 * @param cvContent The extracted text content of the candidate's CV
 * @param jobDescription The text of the job description
 * @param requiredSkills Array of required skills/keywords
 * @param preferredSkills Array of preferred skills/keywords
 * @returns ATS Score Result with detailed breakdown
 */
export function calculateATSScore(
  cvContent: string,
  jobDescription: string,
  requiredSkills: string[],
  preferredSkills: string[]
): ATSScoreResult {
  console.log(`📊 [ATSOptimizer] Calculating ATS score...`);
  
  const contentLower = cvContent.toLowerCase();
  
  // 1. Calculate required keyword coverage
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];
  
  requiredSkills.forEach(skill => {
    if (contentLower.includes(skill.toLowerCase())) {
      matchedRequired.push(skill);
    } else {
      missingRequired.push(skill);
    }
  });
  
  const requiredCoverage = requiredSkills.length > 0 
    ? (matchedRequired.length / requiredSkills.length) * 100 
    : 100;

  // 2. Calculate preferred keyword coverage
  const matchedPreferred: string[] = [];
  const missingPreferred: string[] = [];
  
  preferredSkills.forEach(skill => {
    if (contentLower.includes(skill.toLowerCase())) {
      matchedPreferred.push(skill);
    } else {
      missingPreferred.push(skill);
    }
  });

  const preferredCoverage = preferredSkills.length > 0 
    ? (matchedPreferred.length / preferredSkills.length) * 100 
    : 100;

  // 3. Check for ATS-unfriendly elements
  const riskyElements: string[] = [];
  const suggestions: string[] = [];
  
  if (cvContent.includes('<table') || cvContent.includes('|\t')) {
    riskyElements.push('Tables');
    suggestions.push('Avoid using tables as some ATS systems cannot parse them correctly.');
  }
  
  if (cvContent.includes('<img') || cvContent.includes('image/')) {
    riskyElements.push('Images/Graphics');
    suggestions.push('Remove images or complex graphics; stick to standard text formatting.');
  }
  
  // 4. Calculate semantic similarity (simplified)
  // Overall score: 60% required coverage, 30% preferred coverage, 10% formatting penalty
  let score = (requiredCoverage * 0.6) + (preferredCoverage * 0.3);
  
  if (riskyElements.length > 0) {
    score -= (riskyElements.length * 5); // 5 point penalty per risky element
  }
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score),
    requiredCoverage: Math.round(requiredCoverage),
    preferredCoverage: Math.round(preferredCoverage),
    matchedKeywords: [...matchedRequired, ...matchedPreferred],
    missingKeywords: [...missingRequired, ...missingPreferred],
    riskyElements,
    suggestions
  };
}
