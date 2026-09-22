#!/usr/bin/env node
/**
 * run-batch.js — orchestrator. Walks eligible PM jobs, fills + submits via
 * the right adapter, logs every attempt. Real submissions happen only when
 * --submit is passed; otherwise it's a dry fill-and-screenshot run.
 *
 * Usage:
 *   node run-batch.js --source data/jobs-to-apply.json --limit 10 [--submit]
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { fillAshbyForm, submitAshbyForm } = require('./adapters/ashby');
const { fillGreenhouseForm, submitGreenhouseForm } = require('./adapters/greenhouse');
const { buildAnswerBank } = require('./answer-bank');
const { logApplication, alreadyApplied } = require('./log');

function toApplicationUrl(job) {
  if (job.ats === 'ashby' && !job.url.endsWith('/application')) {
    return job.url.replace(/\/?$/, '') + '/application';
  }
  return job.url;
}

async function processJob(browser, job, submitReal) {
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  const customAnswers = buildAnswerBank(job.company);
  let result = { filled: [], skipped: [], errors: [] };
  let status = 'attempted';
  let submitted = false;

  try {
    const applyUrl = toApplicationUrl(job);

    if (job.ats === 'ashby') {
      result = await fillAshbyForm(page, applyUrl, customAnswers);
    } else if (job.ats === 'greenhouse') {
      result = await fillGreenhouseForm(page, applyUrl, customAnswers);
    } else {
      status = 'unsupported_ats';
      await context.close();
      return { status, result, submitted };
    }

    const shotDir = path.join(os.homedir(), 'job-hunt-agent', 'auto-apply-engine', 'data', 'screenshots');
    fs.mkdirSync(shotDir, { recursive: true });
    const safeCompany = job.company.replace(/[^a-z0-9]/gi, '_');
    const shotPath = path.join(shotDir, `${safeCompany}_${Date.now()}_filled.png`);
    await page.screenshot({ path: shotPath, fullPage: true });

    if (result.errors.length > 0) {
      status = 'filled_with_errors';
    } else if (submitReal) {
      await page.waitForTimeout(2000);
      try {
        if (job.ats === 'ashby') submitted = await submitAshbyForm(page);
        else if (job.ats === 'greenhouse') submitted = await submitGreenhouseForm(page);
        await page.waitForTimeout(3000);
        const afterShot = path.join(shotDir, `${safeCompany}_${Date.now()}_after.png`);
        await page.screenshot({ path: afterShot, fullPage: true });
        status = submitted ? 'submitted' : 'submit_unconfirmed';
      } catch (e) {
        status = 'submit_failed';
        result.errors.push(`submit: ${e.message.slice(0, 80)}`);
      }
    } else {
      status = 'filled_dry_run';
    }
  } catch (e) {
    status = 'fatal_error';
    result.errors.push(e.message.slice(0, 100));
  } finally {
    await context.close();
  }

  return { status, result, submitted };
}

async function main() {
  const args = process.argv.slice(2);
  const get = (flag, def) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : def; };
  const sourcePath = get('--source', 'data/jobs-to-apply.json');
  const limit = parseInt(get('--limit', '5'), 10);
  const submitReal = args.includes('--submit');

  const jobs = JSON.parse(fs.readFileSync(path.resolve(__dirname, sourcePath), 'utf-8'));
  const todo = jobs.filter((j) => !alreadyApplied(j.url)).slice(0, limit);

  console.log(`🚀 Batch run: ${todo.length} jobs (submit=${submitReal})`);
  console.log('');

  const browser = await chromium.launch({ headless: false, slowMo: 60, args: ['--start-maximized'] });

  let submittedCount = 0;
  for (const [idx, job] of todo.entries()) {
    console.log(`[${idx + 1}/${todo.length}] ${job.company} — ${job.title} (${job.ats})`);
    const { status, result, submitted } = await processJob(browser, job, submitReal);
    console.log(`  → ${status} | filled=${result.filled.length} skipped=${result.skipped.length} errors=${result.errors.length}`);
    if (result.errors.length) console.log(`  errors: ${result.errors.join('; ').slice(0, 200)}`);

    logApplication({
      company: job.company,
      title: job.title,
      url: job.url,
      ats: job.ats,
      status,
      filled: result.filled.length,
      skipped: result.skipped.length,
      errors: result.errors.length,
      notes: result.errors.join('; ').slice(0, 200),
    });

    if (submitted) submittedCount++;
    await new Promise((r) => setTimeout(r, 1500));
  }

  await browser.close();
  console.log(`\n✅ Batch complete. Submitted: ${submittedCount}/${todo.length}`);
}

main().catch((e) => { console.error('❌ FATAL', e.message); process.exit(1); });
