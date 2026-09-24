#!/usr/bin/env node
/**
 * answer-bank.js — reusable, evidence-based answers for common ATS free-text
 * questions. NEVER invents facts. Every claim here traces to career-ops/cv.md.
 * For company-specific "why us" questions, {{COMPANY}} is substituted.
 */

const { PROFILE } = require('./config');

const EKO_PROOF = `I built EKO, a ChatGPT-style enterprise analytics platform at Bangalore International Airport (BIAL) that lets non-technical stakeholders query 150M+ operational data points in natural language. It combines RAG, natural-language-to-SQL, and role-based access control, and has directly informed ₹500Cr+ in business decisions.`;

const BACKGROUND = `I'm a Senior AI Product Manager with 12+ years across digital banking (Axis Bank), e-commerce (Amazon), SaaS (Bidgely), and most recently enterprise AI at Bangalore International Airport (BIAL). I hold degrees from IIT Ropar (AI) and IIM Visakhapatnam (PM). I focus on shipping AI products end-to-end: from strategy to production.`;

/**
 * Returns a map of {questionKeyword: answer} for a given company name.
 * Keys are matched as case-insensitive substrings against the actual
 * question label on the page (see adapters/ashby.js customAnswers usage).
 */
function buildAnswerBank(companyName = 'your company') {
  const bank = {
    'excites you about': `I am drawn to building enterprise-grade AI products end-to-end. ${EKO_PROOF} I want to bring that hands-on product-building experience to ${companyName}.`,
    'why do you want to work': `${BACKGROUND} ${companyName}'s focus on applied AI is exactly the kind of high-leverage, production-facing work I want to keep doing.`,
    'most impressive thing': EKO_PROOF,
    'impressive thing you': EKO_PROOF,
    'built or automated with ai': EKO_PROOF,
    'tell us about yourself': BACKGROUND,
    'relevant experience': BACKGROUND,
    'describe your experience': BACKGROUND,
    'why anthropic': `I've built enterprise GenAI from scratch. ${EKO_PROOF} I understand what it takes to make AI safe, useful, and scalable in production. Anthropic's focus on AI safety and responsible deployment aligns with how I build: explainability layers, cost optimization, and human oversight.`,
    'notice period': 'Within 60 days (negotiable)',
    'earliest you would': 'Within 60 days (negotiable)',
    'earliest start': 'Within 60 days (negotiable)',
    'compensation': 'Currently ₹35L fixed; targeting ₹50L+ fixed for this role, open to discussion based on total comp structure.',
    'salary expectation': 'Currently ₹35L fixed; targeting ₹50L+ fixed for this role, open to discussion based on total comp structure.',
    // Supabase-specific and remote-work questions
    'async and/or remote': PROFILE.asyncExperience,
    'experience working in an async': PROFILE.asyncExperience,
    'remote environment': PROFILE.asyncExperience,
    'open source contributions': PROFILE.openSourceContributions,
    'open source': PROFILE.openSourceContributions,
    'where did you hear': 'Company website / LinkedIn',
    'how did you hear': 'Company website / LinkedIn',
    'hear about this vacancy': 'Company website',
    'hear about this job': 'Company website',
    // Location and experience questions
    'current location': 'Bangalore, India',
    'where are you located': 'Bangalore, India',
    'years of product management': '12+ years of product management experience across enterprise AI, SaaS, e-commerce, and digital banking.',
    'how many years': '12+ years',
    // AlphaSense-specific
    'content, broker research, or metadata': 'Yes. At BIAL, I built EKO, an enterprise analytics platform integrating 150M+ data points from third-party sources including flight data feeds (OAG, AODB), retail POS systems, and IoT networks. This required designing metadata schemas, managing data licensing, and building ETL pipelines. At Bidgely, I integrated utility meter data feeds and third-party benchmarking datasets. At Amazon, I managed product content pipelines and catalog metadata at scale. Experienced in content licensing negotiations, API integrations, and unified metadata layers.',
    'broker research': 'Yes. At BIAL, I built EKO integrating 150M+ data points from third-party sources (flight data, retail POS, IoT). Experienced in metadata schemas, data licensing, ETL pipelines, and content integration.',
    // Common employment/education questions
    'employed by.*before': 'No',
    'have you been employed': 'No',
    'worked.*before': 'No',
    'highest level of education': "Master's Degree",
    'education level': "Master's Degree",
    'website': 'https://github.com/neevibe',
    'portfolio': 'https://github.com/neevibe',
    'personal website': 'https://github.com/neevibe',
    // Availability and privacy
    'available for employment': 'Within 30 days (negotiable)',
    'when.*available': 'Within 30 days (negotiable)',
    'start date': 'Within 30 days (negotiable)',
    'candidate notice': 'I accept',
    'privacy notice': 'I accept',
    'personal data': 'I accept',
    'accept.*notice': 'I accept',
  };
  bank[`why ${companyName.toLowerCase()}`] = `${BACKGROUND} ${companyName}'s focus on applied AI is exactly the kind of high-leverage, production-facing work I want to keep doing.`;
  return bank;
}

/**
 * Whether a required free-text/radio question is safely answerable without
 * inventing facts. Returns false for domain-specific technical questions
 * outside an AI PM's real background (e.g. "sales methodology", "which
 * programming languages have you shipped production code in").
 * Used to decide: fill honestly, or leave for manual review / skip job.
 */
const UNANSWERABLE_PATTERNS = [
  /sales methodolog/i,
  /programming language.*most complex/i,
  /which languages.*shipped/i,
];

function isUnanswerable(questionLabel) {
  return UNANSWERABLE_PATTERNS.some((re) => re.test(questionLabel));
}

module.exports = { buildAnswerBank, isUnanswerable, EKO_PROOF, BACKGROUND };
