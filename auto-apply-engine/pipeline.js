#!/usr/bin/env node
/**
 * pipeline.js — parses career-ops/data/pipeline.md into structured job entries.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const PIPELINE_PATH = path.join(os.homedir(), 'career-ops', 'data', 'pipeline.md');

function detectAts(url) {
  if (/jobs\.ashbyhq\.com/.test(url)) return 'ashby';
  if (/greenhouse\.io/.test(url)) return 'greenhouse';
  if (/lever\.co/.test(url)) return 'lever';
  if (/icims\.com/.test(url)) return 'icims';
  if (/workable\.com/.test(url)) return 'workable';
  return 'unknown';
}

function parsePipeline() {
  const raw = fs.readFileSync(PIPELINE_PATH, 'utf-8');
  const lines = raw.split('\n').filter((l) => l.trim().startsWith('- [ ]'));
  return lines.map((line) => {
    // format: - [ ] URL | Company | Title | Location | posted: DATE
    const body = line.replace(/^-\s*\[\s*\]\s*/, '');
    const parts = body.split('|').map((p) => p.trim());
    const [url, company, title, location, posted] = parts;
    return {
      url,
      company: company || '',
      title: title || '',
      location: location || '',
      posted: (posted || '').replace('posted:', '').trim(),
      ats: detectAts(url || ''),
    };
  }).filter((j) => j.url);
}

module.exports = { parsePipeline, detectAts, PIPELINE_PATH, isLocationEligible };

/**
 * Location eligibility gate — Neeraj is India-based, requires either:
 * (a) Bangalore/India-specific location, or
 * (b) globally remote / remote without a country restriction.
 * Rejects "US only", "US & Canada", "EU only", etc. remote postings where
 * work authorization would be required and honestly answered as "No"
 * (guaranteed auto-reject anyway — filtering saves a wasted submission).
 */
const US_CA_ONLY = /\b(United States|USA|U\.S\.?)\s*(&|and)?\s*(Canada)?\b.*\bremote\b|\bremote\b.*\b(United States|USA)\s*(&|and)?\s*Canada?\b/i;
const COUNTRY_RESTRICTED = /\b(US only|USA only|United States only|Canada only|UK only|EU only|Europe only)\b/i;

function isLocationEligible(location) {
  const loc = (location || '').toLowerCase();
  
  // Explicit India/Bangalore — always yes
  if (/bangalore|bengaluru|india|hyderabad|mumbai|delhi|chennai|pune/.test(loc)) return true;
  
  // Global remote — yes
  if (/remote.*global|global.*remote|worldwide|anywhere/.test(loc)) return true;
  
  // US/Canada/Americas restricted — no
  if (/north america|americas|united states|usa|u\.s\.|canada|new york|san francisco|seattle|washington|boston|austin|chicago|denver|los angeles|portland|miami|atlanta|dc\b/.test(loc)) return false;
  
  // EU/UK restricted without Asia/India — no
  if (/emea|europe|berlin|london|uk\b|united kingdom/.test(loc) && !/asia|apac|india/.test(loc)) return false;
  
  // Hybrid anywhere (means onsite required) — no unless India
  if (/hybrid/.test(loc)) return false;
  
  // Plain "Remote" with no regional restriction — allow
  if (/remote/.test(loc)) return true;
  
  // Default: reject (safer than allowing non-remote non-India)
  return false;
}
