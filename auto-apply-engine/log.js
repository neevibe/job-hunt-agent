#!/usr/bin/env node
/**
 * log.js — append-only CSV log of every application attempt.
 * Columns: timestamp, company, title, url, ats, status, filled_count, skipped_count, error_count, notes
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_PATH = path.join(os.homedir(), 'job-hunt-agent', 'auto-apply-engine', 'data', 'applications.csv');

function ensureHeader() {
  if (!fs.existsSync(LOG_PATH)) {
    fs.writeFileSync(LOG_PATH, 'timestamp,company,title,url,ats,status,filled,skipped,errors,notes\n');
  }
}

function csvEscape(s) {
  const str = String(s ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function logApplication({ company, title, url, ats, status, filled = 0, skipped = 0, errors = 0, notes = '' }) {
  ensureHeader();
  const row = [
    new Date().toISOString(), company, title, url, ats, status, filled, skipped, errors, notes,
  ].map(csvEscape).join(',');
  fs.appendFileSync(LOG_PATH, row + '\n');
}

function readLog() {
  ensureHeader();
  const raw = fs.readFileSync(LOG_PATH, 'utf-8').trim().split('\n');
  const [header, ...rows] = raw;
  return rows.map((r) => {
    // naive CSV parse (good enough, no embedded commas in our fields except notes)
    const cols = r.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
    const clean = cols.map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
    const [timestamp, company, title, url, ats, status, filled, skipped, errors, notes] = clean;
    return { timestamp, company, title, url, ats, status, filled: +filled, skipped: +skipped, errors: +errors, notes };
  });
}

function alreadyApplied(url) {
  return readLog().some((r) => r.url === url && r.status === 'submitted');
}

module.exports = { logApplication, readLog, alreadyApplied, LOG_PATH };
