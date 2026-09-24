#!/usr/bin/env node
/**
 * config.js — shared profile + constants for the auto-apply engine.
 * Reads career-ops/config/profile.yml as single source of truth.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const CAREER_OPS = path.join(os.homedir(), 'career-ops');
const PROFILE_PATH = path.join(CAREER_OPS, 'config', 'profile.yml');

function readProfile() {
  const raw = fs.readFileSync(PROFILE_PATH, 'utf-8');
  const pick = (key) => {
    const m = raw.match(new RegExp(`^\\s*${key}:\\s*["']?([^"'\\n]+?)["']?\\s*$`, 'm'));
    return m ? m[1].trim() : '';
  };
  const fullName = pick('full_name');
  const [firstName, ...rest] = fullName.split(' ');
  return {
    firstName: firstName || 'Neeraj',
    lastName: rest.join(' ') || 'Prakash',
    fullName,
    email: pick('email'),
    phone: pick('phone').replace(/^\+91-?/, ''), // raw digits, country code handled by ATS widget
    phoneCountryCode: '91',
    phoneCountryName: 'India',
    location: pick('location'),
    linkedin: pick('linkedin'),
    portfolioUrl: pick('portfolio_url'),
    github: 'https://github.com/neevibe',
    twitter: 'https://x.com/neerajprakash27',
    passportCountry: 'India',
    countryOfResidence: 'India',
    asyncExperience: '10+ years working in async/remote environments across global teams at Amazon, Bidgely, and BIAL. Key practices: detailed written documentation, async Slack/email with clear context, timezone-aware scheduling, recorded Loom videos for walkthroughs, and GitLab/Notion for transparent project tracking. Successfully coordinated US/India timezones through overlap windows and detailed async handoffs.',
    openSourceContributions: 'Maintain public repositories on GitHub including job-hunt-agent (AI-powered job application automation) and innovation-scout (multi-source intelligence platform). Active contributor to AI/ML tooling and technical blog posts.',
  };
}

const PROFILE = readProfile();

// Add employment history to PROFILE
PROFILE.currentEmployer = 'Bangalore International Airport Limited (BIAL)';
PROFILE.currentJobTitle = 'Senior AI Product Manager';

const RESUME_PDF = path.join(os.homedir(), 'Downloads', 'Neeraj_Prakash.pdf');

// Standard answers for common yes/no ATS questions
const STANDARD_ANSWERS = {
  relocation: 'Yes',
  inPerson: 'Yes',
  visaSponsorship: 'No',
  futureVisa: 'No',
  aiPolicy: 'Yes',
  privacyPolicy: 'Yes',
  earliestStart: 'Within 60 days (negotiable)',
  eeoc: 'Decline to self-identify', // always decline EEOC/demographic questions
};

module.exports = { CAREER_OPS, PROFILE, RESUME_PDF, STANDARD_ANSWERS };
