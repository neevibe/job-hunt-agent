#!/usr/bin/env node
/**
 * fill-and-wait.js — Human-in-the-loop auto-apply.
 * Fills the ENTIRE form automatically (name, resume, LinkedIn, dropdowns,
 * free-text answers, EEOC, etc.) then opens the browser on screen and
 * WAITS for the human to solve the CAPTCHA and click Submit themselves.
 * Once it detects the ATS confirmation page, it logs the result locally
 * AND pushes it to the job-hunt-agent portal so the dashboard reflects it.
 *
 * Usage:
 *   node fill-and-wait.js --url <applyUrl> --ats <ashby|greenhouse> --company <name> --title <jobTitle> [--timeout 900]
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { fillAshbyForm, submitAshbyForm } = require('./adapters/ashby');
const { fillGreenhouseForm } = require('./adapters/greenhouse');
const { buildAnswerBank } = require('./answer-bank');

const PORTAL_API = process.env.PORTAL_API_URL || 'https://job-hunt-agent-mauve.vercel.app/api/jobs/apply';
const LOG_FILE = path.join(__dirname, 'data', 'applied-log.json');

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
      args[key] = val;
      if (val !== true) i++;
    }
  }
  return args;
}

function appendLog(entry) {
  let log = [];
  if (fs.existsSync(LOG_FILE)) {
    try { log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')); } catch (e) { log = []; }
  }
  log.push(entry);
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

async function notifyPortal({ company, title, url, status }) {
  try {
    const res = await fetch(PORTAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobTitle: title,
        company,
        applicationUrl: url,
        location: 'Bangalore/Remote',
        status,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function waitForConfirmation(page, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const state = await page.evaluate(() => {
      const text = document.body.textContent || '';
      const url = window.location.href;
      return {
        confirmed: /thank you|application (received|submitted)|we('| ha)ve received|successfully submitted/i.test(text),
        url,
      };
    }).catch(() => ({ confirmed: false, url: page.url() }));
    if (state.confirmed || /confirmation/i.test(state.url)) return true;
    // Also treat "page closed / navigated away from apply form" heuristically
    await page.waitForTimeout(3000);
  }
  return false;
}

(async () => {
  const args = parseArgs();
  const { url, ats, company, title } = args;
  const timeoutMs = (parseInt(args.timeout, 10) || 900) * 1000; // default 15 min

  if (!url || !ats || !company || !title) {
    console.error('Usage: node fill-and-wait.js --url <applyUrl> --ats <ashby|greenhouse> --company <name> --title <jobTitle> [--timeout seconds]');
    process.exit(1);
  }

  console.log(`\n🚀 ${company} — ${title}`);
  console.log(`   ATS: ${ats}`);
  console.log(`   URL: ${url}\n`);

  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const answers = buildAnswerBank(company);
  let result;

  console.log('📝 Filling form automatically...');
  try {
    if (ats === 'ashby') {
      result = await fillAshbyForm(page, url, answers);
    } else if (ats === 'greenhouse') {
      result = await fillGreenhouseForm(page, url, answers);
    } else {
      throw new Error(`Unsupported ATS: ${ats}`);
    }
  } catch (e) {
    console.error('❌ Fill failed:', e.message);
    appendLog({ company, title, url, status: 'fill_error', error: e.message, ts: new Date().toISOString() });
    await browser.close();
    process.exit(1);
  }

  console.log(`✅ Filled ${result.filled.length} fields (${result.skipped.length} skipped, ${result.errors.length} errors)`);
  if (result.errors.length) console.log('   ⚠️  Errors:', result.errors.join(' | '));
  if (result.skipped.length) console.log('   ⏭️  Skipped (review these):', result.skipped.slice(0, 6).join(' | '));

  // Scroll to bottom so the Submit button + CAPTCHA are visible
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  console.log('\n👉 YOUR TURN: solve the CAPTCHA (if any) and click Submit in the browser window.');
  console.log(`   Waiting up to ${timeoutMs / 60000} minutes for confirmation...\n`);

  const confirmed = await waitForConfirmation(page, timeoutMs);

  const entry = {
    company, title, url, ats,
    ts: new Date().toISOString(),
    filled: result.filled.length,
    status: confirmed ? 'submitted' : 'timeout_unconfirmed',
  };
  appendLog(entry);

  if (confirmed) {
    console.log('✅ Confirmation detected — application submitted!');
    const portalResult = await notifyPortal({ company, title, url, status: 'submitted' });
    console.log(portalResult.ok ? '✅ Portal updated' : `⚠️  Portal update failed: ${portalResult.error || JSON.stringify(portalResult.data)}`);
  } else {
    console.log('⏱️  Timed out waiting for confirmation. If you submitted it, this will still be in the log as unconfirmed — check manually.');
  }

  await page.waitForTimeout(2000);
  await browser.close();
  process.exit(confirmed ? 0 : 2);
})().catch((e) => { console.error(e); process.exit(1); });
