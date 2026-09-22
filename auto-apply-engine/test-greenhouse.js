#!/usr/bin/env node
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const { fillGreenhouseForm } = require('./adapters/greenhouse');
const { buildAnswerBank } = require('./answer-bank');

async function main() {
  const url = process.argv[2];
  const companyName = process.argv[3] || 'this company';
  if (!url) { console.error('Usage: node test-greenhouse.js <job_url> [company_name]'); process.exit(1); }

  console.log('🧪 Testing Greenhouse adapter (fill only, no submit)');
  console.log('📍', url);

  const browser = await chromium.launch({ headless: false, slowMo: 80, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  const customAnswers = buildAnswerBank(companyName);
  const result = await fillGreenhouseForm(page, url, customAnswers);

  console.log('\n✅ Filled:', result.filled.length, '-', result.filled.join(', '));
  console.log('⚠️  Skipped:', result.skipped.length, '-', result.skipped.join(', '));
  console.log('❌ Errors:', result.errors.length, '-', result.errors.join(', '));

  const shotPath = path.join(os.homedir(), 'job-hunt-agent', 'gh-test.png');
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('\n📸 Screenshot:', shotPath);

  console.log('👀 Browser open 45s...');
  await page.waitForTimeout(45000);
  await browser.close();
}
main().catch((e) => { console.error('❌', e.message); process.exit(1); });
