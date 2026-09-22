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
  };
}

const PROFILE = readProfile();

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
