#!/usr/bin/env node
/**
 * greenhouse.js — Greenhouse ATS adapter (job-boards.greenhouse.io)
 * Hardened from today's live debugging session:
 *  - Phone country via intl-tel-input's own JS API (avoids the flaky
 *    dropdown-click/visibility-check failures that plagued raw Playwright clicks)
 *  - Dropdown questions are react-select components (.select-shell), NOT
 *    native <select> or ID-addressable containers — must click by DOM index
 *  - Standard field IDs: #first_name #last_name #email #phone
 */
const { PROFILE, RESUME_PDF, STANDARD_ANSWERS } = require('../config');

async function fillGreenhouseForm(page, applyUrl, customAnswers = {}) {
  const filled = [];
  const skipped = [];
  const errors = [];

  await page.goto(applyUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click Apply button to reveal the form (Greenhouse job pages show JD first)
  try {
    const applyBtn = await page.$('button:has-text("Apply")');
    if (applyBtn) {
      await applyBtn.click();
      await page.waitForTimeout(2500);
    }
  } catch (e) { /* form may already be visible */ }

  const deselect = async () => {
    try { await page.click('h1, h2', { timeout: 1000 }); } catch (e) {}
    await page.waitForTimeout(100);
  };

  // ---- Basic fields ----
  try { await page.fill('#first_name', PROFILE.firstName); filled.push('first_name'); }
  catch (e) { errors.push(`first_name: ${e.message.slice(0, 50)}`); }

  try { await page.fill('#last_name', PROFILE.lastName); filled.push('last_name'); }
  catch (e) { errors.push(`last_name: ${e.message.slice(0, 50)}`); }

  try { await page.fill('#email', PROFILE.email); filled.push('email'); await deselect(); }
  catch (e) { errors.push(`email: ${e.message.slice(0, 50)}`); }

  // ---- Phone country (intl-tel-input API — the reliable path found today) ----
  try {
    const apiWorked = await page.evaluate(() => {
      const phoneInput = document.querySelector('#phone');
      if (phoneInput && phoneInput.iti) { phoneInput.iti.setCountry('in'); return true; }
      if (window.intlTelInputGlobals) {
        const inst = window.intlTelInputGlobals.getInstance(phoneInput);
        if (inst) { inst.setCountry('in'); return true; }
      }
      return false;
    });
    if (apiWorked) filled.push('phone_country(+91)');
    else skipped.push('phone_country (no iti API found)');
  } catch (e) { errors.push(`phone_country: ${e.message.slice(0, 50)}`); }

  try { await page.fill('#phone', PROFILE.phone); filled.push('phone'); await deselect(); }
  catch (e) { errors.push(`phone: ${e.message.slice(0, 50)}`); }

  // ---- Location (City) react-select autocomplete ----
  try {
    const locInput = await page.$('#candidate-location');
    if (locInput) {
      await locInput.click();
      await page.waitForTimeout(300);
      await locInput.type('Bangalore', { delay: 50 });
      await page.waitForTimeout(1000); // wait for autocomplete options
      // Select first matching option
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      filled.push('location_city(Bangalore)');
      await deselect();
    }
  } catch (e) { skipped.push(`location_city: ${e.message.slice(0, 40)}`); }

  // ---- Resume ----
  try {
    // Greenhouse has a hidden file input with id="resume" and a separate "Attach" button
    // Either directly set the file input or trigger the file chooser
    const resumeInput = await page.$('#resume');
    if (resumeInput) {
      // Direct file input approach
      await resumeInput.setInputFiles(RESUME_PDF);
      filled.push('resume');
      await page.waitForTimeout(3000); // Wait for upload to process
    } else {
      // Fallback: click Attach button and handle file chooser
      const attachBtn = await page.$('button:has-text("Attach")');
      if (attachBtn) {
        const [fileChooser] = await Promise.all([
          page.waitForEvent('filechooser', { timeout: 10000 }),
          attachBtn.click(),
        ]);
        await fileChooser.setFiles(RESUME_PDF);
        filled.push('resume');
        await page.waitForTimeout(3000);
      } else {
        skipped.push('resume (no file input)');
      }
    }
  } catch (e) { errors.push(`resume: ${e.message.slice(0, 50)}`); }

  // ---- LinkedIn (find text input by label) ----
  try {
    const linkedinId = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'));
      const l = labels.find((el) => /linkedin/i.test(el.textContent || ''));
      if (!l) return null;
      const forId = l.getAttribute('for');
      if (forId) return forId;
      const input = l.closest('div')?.querySelector('input');
      return input?.id || null;
    });
    if (linkedinId) {
      await page.evaluate(({ id, val }) => {
        const el = document.getElementById(id);
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, { id: linkedinId, val: PROFILE.linkedin });
      filled.push('linkedin');
      await deselect();
    } else skipped.push('linkedin (field not found)');
  } catch (e) { errors.push(`linkedin: ${e.message.slice(0, 50)}`); }

  // ---- React-select dropdowns (.select-shell, index 0 = phone country widget) ----
  // Discover each dropdown's question label + options via DOM walk, then decide answer.
  const dropdowns = await page.evaluate(() => {
    const shells = Array.from(document.querySelectorAll('.select-shell'));
    return shells.map((s, i) => {
      let label = '';
      let node = s;
      for (let depth = 0; depth < 6 && node; depth++) {
        const l = node.querySelector?.('label');
        if (l && l.textContent.trim()) { label = l.textContent.trim(); break; }
        node = node.parentElement;
      }
      return { index: i, label: label.slice(0, 150) };
    });
  });

  for (const dd of dropdowns) {
    if (dd.index === 0) continue; // index 0 is the phone-country widget, handled above
    let answer = null;
    if (/in-?person|office.*time|25%/i.test(dd.label)) answer = STANDARD_ANSWERS.inPerson;
    else if (/relocat/i.test(dd.label)) answer = STANDARD_ANSWERS.relocation;
    else if (/future.*(visa|sponsorship)|will you.*require/i.test(dd.label)) answer = STANDARD_ANSWERS.futureVisa;
    else if (/visa sponsorship|require sponsorship/i.test(dd.label)) answer = STANDARD_ANSWERS.visaSponsorship;
    else if (/ai polic/i.test(dd.label)) answer = STANDARD_ANSWERS.aiPolicy;
    else if (/privacy polic/i.test(dd.label)) answer = STANDARD_ANSWERS.privacyPolicy;
    else if (/gender|race|hispanic|latino|ethnicity|veteran|disability status/i.test(dd.label)) answer = STANDARD_ANSWERS.eeoc;
    else if (/how did you hear/i.test(dd.label)) answer = 'Company website';
    else if (/interviewed.*before|previously.*applied|applied.*before/i.test(dd.label)) answer = 'No';
    // Location and authorization questions
    else if (/location.*city|city.*location|located in.*city/i.test(dd.label)) answer = 'Bangalore';
    else if (/authorized.*work.*lawfully|lawfully.*authorized|work authorization/i.test(dd.label)) answer = 'No'; // India-based, not US authorized
    else if (/legally.*authorized.*work.*in the country|authorized.*work.*country/i.test(dd.label)) answer = 'Yes'; // For India-based jobs, authorized in India
    else if (/currently located in.*bay area|bay area|san francisco/i.test(dd.label)) answer = 'No';
    else if (/registered as an employer|employer.*registered/i.test(dd.label)) answer = 'Other';
    else if (/willing.*relocate|relocate.*willing/i.test(dd.label)) answer = 'No'; // India-based, not US relocating
    else if (/willing.*work.*san francisco|willing.*work in the bay area/i.test(dd.label)) answer = 'No';
    else if (/confirm.*read|confirm.*privacy|confirm.*information|i confirm/i.test(dd.label)) answer = 'Yes'; // Privacy/confirmation checkboxes
    else if (/best team wins|culture|values/i.test(dd.label)) answer = 'Collaboration, ownership, and shipping high-quality work together';
    else {
      const matchKey = Object.keys(customAnswers).find((k) => dd.label.toLowerCase().includes(k.toLowerCase()));
      if (matchKey) answer = customAnswers[matchKey];
    }

    if (!answer) { skipped.push(`dropdown[${dd.label.slice(0, 40)}] no answer mapped`); continue; }

    try {
      const shells = await page.$$('.select-shell');
      if (!shells[dd.index]) { errors.push(`dropdown[${dd.label.slice(0, 30)}] index missing`); continue; }
      await shells[dd.index].click();
      await page.waitForTimeout(350);
      await page.keyboard.type(answer, { delay: 40 });
      await page.waitForTimeout(300);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(250);
      filled.push(`dropdown[${dd.label.slice(0, 30)}]=${answer}`);
      await deselect();
    } catch (e) { errors.push(`dropdown[${dd.label.slice(0, 20)}]: ${e.message.slice(0, 30)}`); }
  }

  // ---- Free-text inputs/textareas (earliest start, why-company, etc.) ----
  const textFields = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('input[id^="question_"][type="text"], textarea[id^="question_"]'));
    return nodes.map((n) => {
      const wrapper = n.closest('.field') || n.parentElement?.parentElement;
      const label = wrapper?.querySelector('label')?.textContent?.trim() || '';
      return { id: n.id, tag: n.tagName, label: label.slice(0, 150) };
    });
  });

  for (const tf of textFields) {
    if (/linkedin/i.test(tf.label)) continue; // already handled
    let value = null;
    if (/earliest.*start|when.*start working/i.test(tf.label)) value = STANDARD_ANSWERS.earliestStart;
    else if (/most recent employer|current employer|employer/i.test(tf.label)) value = PROFILE.currentEmployer;
    else if (/most recent.*job title|current.*job title|job title/i.test(tf.label)) value = PROFILE.currentJobTitle;
    else if (/preferred.*start|start date/i.test(tf.label)) value = STANDARD_ANSWERS.earliestStart;
    else if (/salary.*expectation|expected.*salary|compensation/i.test(tf.label)) value = '₹50L+ fixed (negotiable based on total comp)';
    else {
      const matchKey = Object.keys(customAnswers).find((k) => tf.label.toLowerCase().includes(k.toLowerCase()));
      if (matchKey) value = customAnswers[matchKey];
    }
    if (!value) { skipped.push(`text[${tf.label.slice(0, 40)}] no answer mapped`); continue; }
    try {
      // Clear and type properly to trigger React state updates
      const inputEl = await page.$(`#${tf.id}`);
      if (inputEl) {
        await inputEl.click();
        await inputEl.fill(''); // Clear first
        await inputEl.fill(value);
        await page.waitForTimeout(100);
        // Blur to trigger validation
        await page.evaluate((id) => document.getElementById(id)?.blur(), tf.id);
      }
      filled.push(`text[${tf.label.slice(0, 30)}]`);
      await page.waitForTimeout(200); // Small delay for validation
      await deselect();
    } catch (e) { errors.push(`text[${tf.label.slice(0, 20)}]: ${e.message.slice(0, 30)}`); }
  }

  return { filled, skipped, errors };
}

async function submitGreenhouseForm(page) {
  // Scroll to bottom to ensure submit button is visible and all fields validated
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  
  // Check for validation errors before clicking
  const errorsBeforeSubmit = await page.evaluate(() => {
    const errorEls = document.querySelectorAll('[class*="error"], .field-error, [aria-invalid="true"]');
    return Array.from(errorEls).map(e => e.textContent?.trim()).filter(Boolean);
  });
  if (errorsBeforeSubmit.length > 0) {
    console.log('⚠️ Validation errors before submit:', errorsBeforeSubmit.slice(0, 5));
  }
  
  const btn = await page.$('button:has-text("Submit Application"), button[type="submit"]');
  if (!btn) throw new Error('submit button not found');
  
  // Force click in case button is obscured
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await btn.click({ force: true });
  
  // Wait longer for network + page change
  await page.waitForTimeout(6000);
  
  const confirmed = await page.evaluate(() => {
    const text = document.body.textContent || '';
    return /thank you|application (received|submitted)|we('| ha)ve received|successfully submitted/i.test(text);
  });
  return confirmed;
}

module.exports = { fillGreenhouseForm, submitGreenhouseForm };
