#!/usr/bin/env node
/**
 * test-ashby.js — fills ONE Ashby job form (no submit) and screenshots for verification.
 * Usage: node test-ashby.js "<apply_url>"
 */
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const { fillAshbyForm } = require('./adapters/ashby');

async function main() {
  const url = process.argv[2];
  if (!url) { console.error('Usage: node test-ashby.js <apply_url>'); process.exit(1); }

  console.log('🧪 Testing Ashby adapter (fill only, no submit)');
  console.log('📍', url);

  const browser = await chromium.launch({ headless: false, slowMo: 80, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  const customAnswers = {
    'excites you about': 'I am drawn to building enterprise-grade AI products end-to-end. At BIAL I built EKO, a GenAI analytics platform handling 150M+ data points, and I want to bring that hands-on product-building experience here.',
    'impressive thing': 'I built EKO, a ChatGPT-style enterprise analytics platform at Bangalore International Airport that lets non-technical stakeholders query 150M+ operational data points in natural language, with RAG and role-based access control.',
  };

  const result = await fillAshbyForm(page, url, customAnswers);

  console.log('\n✅ Filled:', result.filled.length, '-', result.filled.join(', '));
  console.log('⚠️  Skipped:', result.skipped.length, '-', result.skipped.join(', '));
  console.log('❌ Errors:', result.errors.length, '-', result.errors.join(', '));

  const shotPath = path.join(os.homedir(), 'job-hunt-agent', 'ashby-test.png');
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('\n📸 Screenshot:', shotPath);

  console.log('\n👀 Browser open for 60s for manual inspection...');
  await page.waitForTimeout(60000);
  await browser.close();
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
