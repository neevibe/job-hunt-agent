#!/usr/bin/env node
/**
 * ashby.js — Ashby ATS adapter (jobs.ashbyhq.com)
 * Handles: name/email/phone/resume, checkbox questions, radio questions,
 * free-text questions (answers supplied by caller), EEOC (always declines).
 */
const { PROFILE, RESUME_PDF, STANDARD_ANSWERS } = require('../config');

/**
 * @param {import('playwright').Page} page
 * @param {string} applyUrl - the /application URL
 * @param {Object} customAnswers - map of question-text-substring -> answer string (for free-text)
 * @returns {Promise<{filled: string[], skipped: string[], errors: string[]}>}
 */
async function fillAshbyForm(page, applyUrl, customAnswers = {}) {
  const filled = [];
  const skipped = [];
  const errors = [];

  await page.goto(applyUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // ---- Name / Email ----
  try {
    await page.fill('#_systemfield_name', PROFILE.fullName);
    filled.push('name');
  } catch (e) { errors.push(`name: ${e.message.slice(0, 60)}`); }

  try {
    await page.fill('#_systemfield_email', PROFILE.email);
    filled.push('email');
  } catch (e) { errors.push(`email: ${e.message.slice(0, 60)}`); }

  // ---- Phone (tel input, Ashby's own intl widget) ----
  try {
    const telInput = await page.$('input[type="tel"]');
    if (telInput) {
      await telInput.fill(PROFILE.phone);
      filled.push('phone');
    } else {
      skipped.push('phone (no tel input found)');
    }
  } catch (e) { errors.push(`phone: ${e.message.slice(0, 60)}`); }

  // ---- Resume ----
  try {
    const fileInputs = await page.$$('input[type="file"]');
    if (fileInputs.length > 0) {
      await fileInputs[0].setInputFiles(RESUME_PDF);
      filled.push('resume');
      await page.waitForTimeout(1500);
    } else {
      skipped.push('resume (no file input)');
    }
  } catch (e) { errors.push(`resume: ${e.message.slice(0, 60)}`); }

  // ---- LinkedIn (text input with label containing "LinkedIn") ----
  try {
    const linkedinField = await findFieldByLabel(page, /linkedin/i);
    if (linkedinField) {
      await linkedinField.fill(PROFILE.linkedin);
      filled.push('linkedin');
    }
  } catch (e) { errors.push(`linkedin: ${e.message.slice(0, 60)}`); }

  // ---- Checkboxes (visa sponsorship, relocation, timezone-based, etc.) ----
  const checkboxQuestions = await page.$$eval('input[type="checkbox"]', (boxes) =>
    boxes.map((b, i) => {
      let label = '';
      const wrapper = b.closest('div[class*="_fieldEntry"]') || b.closest('fieldset') || b.parentElement?.parentElement;
      const labelEl = wrapper?.querySelector('label, legend, [class*="_label"]');
      label = labelEl?.textContent?.trim() || '';
      return { index: i, label: label.slice(0, 150) };
    })
  );

  for (const cq of checkboxQuestions) {
    let shouldCheck = null;
    if (/visa sponsorship|require.*sponsorship|h1b/i.test(cq.label)) {
      shouldCheck = STANDARD_ANSWERS.visaSponsorship === 'Yes';
    } else if (/relocat/i.test(cq.label)) {
      shouldCheck = STANDARD_ANSWERS.relocation === 'Yes';
    } else if (/eastern|pacific|time zone|based within/i.test(cq.label)) {
      shouldCheck = false; // Neeraj is based in India, not US Eastern/Pacific — honest answer is No
    } else if (/legally authorized to work/i.test(cq.label)) {
      shouldCheck = false; // Neeraj is not authorized to work in the country this question refers to (India-based)
    } else {
      continue; // unknown checkbox, leave alone
    }
    try {
      const ok = await page.evaluate(({ idx, want }) => {
        const boxes = document.querySelectorAll('input[type="checkbox"]');
        const box = boxes[idx];
        if (!box) return false;
        if (box.checked !== want) box.click();
        return true;
      }, { idx: cq.index, want: shouldCheck });
      if (ok) filled.push(`checkbox[${cq.label.slice(0, 30)}]`);
      else errors.push(`checkbox[${cq.label.slice(0, 30)}] not found`);
    } catch (e) { errors.push(`checkbox: ${e.message.slice(0, 40)}`); }
  }

  // ---- Radio groups (skill/experience questions - need custom answers) ----
  // These require per-JD judgment; caller passes customAnswers keyed by label substring.
  const radioGroups = await getRadioGroups(page);
  for (const group of radioGroups) {
    const matchKey = Object.keys(customAnswers).find(k =>
      group.questionLabel.toLowerCase().includes(k.toLowerCase())
    );
    if (matchKey) {
      const optionIdx = group.options.findIndex(o =>
        o.toLowerCase().includes(customAnswers[matchKey].toLowerCase())
      );
      if (optionIdx >= 0) {
        try {
          await clickById(page, group.optionIds[optionIdx]);
          filled.push(`radio[${group.questionLabel.slice(0, 30)}]`);
        } catch (e) {
          errors.push(`radio: ${e.message.slice(0, 40)}`);
        }
      } else {
        skipped.push(`radio[${group.questionLabel.slice(0, 40)}] no matching option`);
      }
    } else if (/gender|race|veteran|disability|ethnicity/i.test(group.questionLabel)) {
      // EEOC - always decline
      const declineIdx = group.options.findIndex(o => /decline|prefer not/i.test(o));
      if (declineIdx >= 0) {
        try {
          await clickById(page, group.optionIds[declineIdx]);
          filled.push(`eeoc[${group.questionLabel.slice(0, 20)}]`);
        } catch (e) { /* ignore EEOC failures, always optional */ }
      }
    } else {
      skipped.push(`radio[${group.questionLabel.slice(0, 50)}] no answer provided`);
    }
  }

  // ---- Free-text textareas (need custom answers) ----
  const textareas = await page.$$eval('textarea', (areas) =>
    areas.map((a, i) => {
      const wrapper = a.closest('div[class*="_fieldEntry"]') || a.parentElement?.parentElement;
      const labelEl = wrapper?.querySelector('label, [class*="_label"]');
      return { index: i, id: a.id, label: labelEl?.textContent?.trim().slice(0, 150) || '' };
    })
  );

  for (const ta of textareas) {
    const matchKey = Object.keys(customAnswers).find(k =>
      ta.label.toLowerCase().includes(k.toLowerCase())
    );
    if (matchKey) {
      try {
        const ok = await page.evaluate(({ idx, text }) => {
          const areas = document.querySelectorAll('textarea');
          const el = areas[idx];
          if (!el) return false;
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          setter.call(el, text);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }, { idx: ta.index, text: customAnswers[matchKey] });
        if (ok) filled.push(`textarea[${ta.label.slice(0, 30)}]`);
        else errors.push(`textarea[${ta.label.slice(0, 30)}] not found`);
      } catch (e) { errors.push(`textarea: ${e.message.slice(0, 40)}`); }
    } else {
      skipped.push(`textarea[${ta.label.slice(0, 50)}] no answer provided`);
    }
  }

  return { filled, skipped, errors };
}

async function clickById(page, id) {
  const ok = await page.evaluate((elId) => {
    const el = document.getElementById(elId);
    if (!el) return false;
    el.click();
    return true;
  }, id);
  if (!ok) throw new Error(`element #${id} not found`);
}

async function findFieldByLabel(page, regex) {
  const handle = await page.evaluateHandle((source) => {
    const re = new RegExp(source.slice(1, source.lastIndexOf('/')), source.slice(source.lastIndexOf('/') + 1));
    const labels = Array.from(document.querySelectorAll('label'));
    for (const label of labels) {
      if (re.test(label.textContent || '')) {
        const forId = label.getAttribute('for');
        if (forId) return document.getElementById(forId);
        const wrapper = label.closest('div');
        return wrapper?.querySelector('input, textarea');
      }
    }
    return null;
  }, regex.toString());
  const el = handle.asElement();
  return el;
}

async function getRadioGroups(page) {
  return page.evaluate(() => {
    const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
    const groups = {};
    radios.forEach((r) => {
      const name = r.name;
      if (!groups[name]) groups[name] = { name, options: [], optionIds: [], questionLabel: '' };
      const label = document.querySelector(`label[for="${r.id}"]`);
      groups[name].options.push(label?.textContent?.trim() || '');
      groups[name].optionIds.push(r.id);
    });
    // Try to find the question label (usually a fieldset legend or preceding label)
    Object.values(groups).forEach((g) => {
      const firstRadio = document.getElementById(g.optionIds[0]);
      const fieldset = firstRadio?.closest('fieldset') || firstRadio?.closest('div[class*="_fieldEntry"]');
      const legend = fieldset?.querySelector('legend, [class*="_label"]');
      g.questionLabel = legend?.textContent?.trim() || g.name;
      // first option in each Ashby radio group is often the question itself if legend missing
      if (!legend && g.options.length > 0) {
        g.questionLabel = g.options[0];
        g.options = g.options.slice(1);
        g.optionIds = g.optionIds.slice(1);
      }
    });
    return Object.values(groups);
  });
}

module.exports = { fillAshbyForm, submitAshbyForm };

async function submitAshbyForm(page) {
  // Ashby submit button text is typically "Submit Application"
  const btn = await page.$('button[type="submit"], button:has-text("Submit Application")');
  if (!btn) throw new Error('submit button not found');
  await btn.click();
  await page.waitForTimeout(4000);
  // Success is usually a URL change or a confirmation heading
  const confirmed = await page.evaluate(() => {
    const text = document.body.textContent || '';
    return /thank you|application (received|submitted)|we('| ha)ve received/i.test(text);
  });
  return confirmed;
}
