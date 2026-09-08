/**
 * INTELLIGENT FORM FILLER
 * 
 * Maps candidate DNA and tailored responses to web form fields
 * based on standard labels, placeholders, aria attributes, and field names.
 */

import { type CandidateProfile } from '@/lib/candidate-dna';

export interface FormFieldMapping {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  noticePeriod: string;
  desiredSalary: string;
  workAuthorization: string;
  currentCompany: string;
  currentTitle: string;
  yearsOfExperience: string;
}

/**
 * Standard candidate mappings for job application forms
 */
export function getStandardFormFields(profile: CandidateProfile): FormFieldMapping {
  const currentExp = profile.experiences[0];
  const yearsExp = '10'; // 10+ years

  return {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    portfolioUrl: profile.portfolioUrl,
    noticePeriod: profile.noticePeriod,
    desiredSalary: `${profile.compensationMin / 100000} - ${profile.compensationMax / 100000} LPA`,
    workAuthorization: 'Authorized to work in India, requires no sponsorship',
    currentCompany: currentExp?.company || 'BIAL',
    currentTitle: currentExp?.jobTitle || 'Senior Manager — Corporate Strategy & AI Products',
    yearsOfExperience: yearsExp,
  };
}

/**
 * Predicts the candidate value to fill for a given form input field
 */
export function matchFieldValue(
  fieldIdentifier: string,
  fieldLabel: string,
  mapping: FormFieldMapping,
  customAnswers: Record<string, string> = {}
): string | null {
  const combined = `${fieldIdentifier} ${fieldLabel}`.toLowerCase();

  // Check custom answers first
  for (const [q, a] of Object.entries(customAnswers)) {
    if (combined.includes(q.toLowerCase())) {
      return a;
    }
  }

  // Common patterns
  if (combined.includes('full name') || combined.includes('legal name') || combined === 'name') {
    return mapping.name;
  }
  if (combined.includes('first name') || combined === 'fname') {
    return mapping.name.split(' ')[0];
  }
  if (combined.includes('last name') || combined === 'lname') {
    return mapping.name.split(' ').slice(1).join(' ');
  }
  if (combined.includes('email')) {
    return mapping.email;
  }
  if (combined.includes('phone') || combined.includes('mobile') || combined.includes('contact')) {
    return mapping.phone;
  }
  if (combined.includes('linkedin')) {
    return mapping.linkedinUrl;
  }
  if (combined.includes('github')) {
    return mapping.githubUrl;
  }
  if (combined.includes('website') || combined.includes('portfolio') || combined.includes('url')) {
    return mapping.portfolioUrl;
  }
  if (combined.includes('location') || combined.includes('city')) {
    return mapping.location;
  }
  if (combined.includes('notice') || combined.includes('availability')) {
    return mapping.noticePeriod;
  }
  if (combined.includes('salary') || combined.includes('compensation') || combined.includes('ctc')) {
    return mapping.desiredSalary;
  }
  if (combined.includes('experience') || combined.includes('years')) {
    return mapping.yearsOfExperience;
  }
  if (combined.includes('company') || combined.includes('employer')) {
    return mapping.currentCompany;
  }
  if (combined.includes('title') || combined.includes('designation') || combined.includes('role')) {
    return mapping.currentTitle;
  }
  if (combined.includes('sponsor') || combined.includes('authorized') || combined.includes('visa')) {
    return mapping.workAuthorization;
  }

  return null;
}
