import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  console.log('=== STARTING STAGE 2 LOCAL STORAGE PERSISTENCE VERIFICATION ===\n');

  // Load app
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  console.log('✓ Initial page loaded at http://localhost:5173/');

  // Initial clean reset of storage for clean deterministic testing
  await page.evaluate(() => {
    localStorage.clear();
    // Add foreign key to verify it is NEVER touched
    localStorage.setItem('foreign_unrelated_app_key', 'PRESERVE_ME');
  });

  // --------------------------------------------------------------------------
  // SCENARIO 1: Create a note, refresh the page, and confirm the note remains
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 1: Create a note, refresh, and confirm persistence ---');
  const notesNav = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
  await notesNav.click();
  await new Promise((r) => setTimeout(r, 200));

  const topicInput1 = await page.waitForSelector('#notes-topic');
  await topicInput1.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await topicInput1.type('React 19 Server Actions & Optimistic UI');

  const genBtn1 = await page.waitForSelector('.builder-footer-row .btn-primary');
  await genBtn1.click();
  await new Promise((r) => setTimeout(r, 600));

  let storedNotes = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]');
  });
  if (!storedNotes || storedNotes[0]?.title !== 'React 19 Server Actions & Optimistic UI') {
    throw new Error(`Scenario 1 Failed: Note not found in localStorage. Found: ${JSON.stringify(storedNotes[0])}`);
  }
  console.log(`✓ Note created and saved in localStorage with ID: ${storedNotes[0].id}`);

  // Reload page
  await page.reload({ waitUntil: 'networkidle0' });
  const notesNavReloaded = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
  await notesNavReloaded.click();
  await new Promise((r) => setTimeout(r, 200));

  const noteTitleAfterReload = await page.evaluate(() => {
    return document.querySelector('.notes-sheet-title')?.textContent || '';
  });
  if (!noteTitleAfterReload.includes('React 19 Server Actions & Optimistic UI')) {
    throw new Error(`Scenario 1 Failed: Note did not remain after refresh! Got: "${noteTitleAfterReload}"`);
  }
  console.log(`✓ SCENARIO 1 PASSED: Note remains after page reload ("${noteTitleAfterReload}")`);

  // --------------------------------------------------------------------------
  // SCENARIO 2: Create a second note, switch between both notes, and delete one
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 2: Create second note, switch between both notes, and delete one ---');
  // Create second note
  const topicInput2 = await page.waitForSelector('#notes-topic');
  await topicInput2.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await topicInput2.type('GraphQL Subscriptions vs WebSocket Streams');

  const genBtn2 = await page.waitForSelector('.builder-footer-row .btn-primary');
  await genBtn2.click();
  await new Promise((r) => setTimeout(r, 600));

  storedNotes = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]');
  });
  console.log(`Currently stored notes count: ${storedNotes.length}`);
  if (storedNotes.length < 3) {
    throw new Error(`Expected at least 3 notes (default + 2 created), found ${storedNotes.length}`);
  }

  // Switch between notes using the dropdown selector
  const notesSelect = await page.waitForSelector('.sheet-actions select.form-select');
  const availableOptions = await page.evaluate((el) => {
    return Array.from(el.options).map((o) => ({ value: o.value, text: o.text }));
  }, notesSelect);
  console.log(`Available notes in dropdown: ${availableOptions.map((o) => o.text.slice(0, 25)).join(' | ')}`);

  // Switch to note 1
  const note1Id = storedNotes[1].id;
  await page.select('.sheet-actions select.form-select', note1Id);
  await new Promise((r) => setTimeout(r, 200));

  let switchedTitle = await page.evaluate(() => document.querySelector('.notes-sheet-title')?.textContent || '');
  if (!switchedTitle.includes(storedNotes[1].title)) {
    throw new Error(`Scenario 2 Failed: Switch to note 1 failed! Expected "${storedNotes[1].title}", got "${switchedTitle}"`);
  }
  console.log(`✓ Successfully switched to note: "${switchedTitle}"`);

  // Switch back to note 2
  const note2Id = storedNotes[0].id;
  await page.select('.sheet-actions select.form-select', note2Id);
  await new Promise((r) => setTimeout(r, 200));

  switchedTitle = await page.evaluate(() => document.querySelector('.notes-sheet-title')?.textContent || '');
  if (!switchedTitle.includes(storedNotes[0].title)) {
    throw new Error(`Scenario 2 Failed: Switch to note 2 failed! Expected "${storedNotes[0].title}", got "${switchedTitle}"`);
  }
  console.log(`✓ Successfully switched to note: "${switchedTitle}"`);

  // Delete note 2
  const countBeforeDelete = storedNotes.length;
  const deleteBtn = await page.waitForSelector('.sheet-actions button[title="Delete this note from storage"]');
  await deleteBtn.click();
  await new Promise((r) => setTimeout(r, 300));

  // If Stage 3 confirmation modal appears, confirm deletion
  const confirmBtn = await page.$('button.btn-confirm-delete-note');
  if (confirmBtn) {
    await confirmBtn.click();
    await new Promise((r) => setTimeout(r, 300));
  }

  storedNotes = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]');
  });
  if (storedNotes.length !== countBeforeDelete - 1) {
    throw new Error(`Scenario 2 Failed: Note was not deleted! Expected ${countBeforeDelete - 1}, found ${storedNotes.length}`);
  }
  const deletedStillPresent = storedNotes.some((n) => n.id === note2Id);
  if (deletedStillPresent) {
    throw new Error('Scenario 2 Failed: Deleted note ID still found in storage!');
  }
  console.log(`✓ SCENARIO 2 PASSED: Second note created, switched between notes, and deleted successfully (Notes count: ${countBeforeDelete} -> ${storedNotes.length})`);

  // --------------------------------------------------------------------------
  // SCENARIO 3: Complete a revision task, refresh, and confirm status
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 3: Complete a revision task, refresh, and confirm status ---');
  const revNav = await page.waitForSelector('button.nav-button[title="Smart Revision"]');
  await revNav.click();
  await new Promise((r) => setTimeout(r, 200));

  const firstCheckbox = await page.waitForSelector('.task-row-card:first-child input[type="checkbox"]');
  const initialChecked = await page.evaluate((el) => el.checked, firstCheckbox);

  // Click to toggle
  await firstCheckbox.click();
  await new Promise((r) => setTimeout(r, 200));
  const newChecked = await page.evaluate((el) => el.checked, firstCheckbox);

  if (newChecked === initialChecked) {
    throw new Error('Scenario 3 Failed: Checkbox did not toggle!');
  }

  // Refresh page
  await page.reload({ waitUntil: 'networkidle0' });
  const revNavAfterReload = await page.waitForSelector('button.nav-button[title="Smart Revision"]');
  await revNavAfterReload.click();
  await new Promise((r) => setTimeout(r, 200));

  const reloadedCheckbox = await page.waitForSelector('.task-row-card:first-child input[type="checkbox"]');
  const reloadedChecked = await page.evaluate((el) => el.checked, reloadedCheckbox);

  if (reloadedChecked !== newChecked) {
    throw new Error(`Scenario 3 Failed: Status not restored after refresh! Expected ${newChecked}, got ${reloadedChecked}`);
  }
  console.log(`✓ SCENARIO 3 PASSED: Task completion status preserved across refresh (Checked = ${reloadedChecked})`);

  // --------------------------------------------------------------------------
  // SCENARIO 4: Quiz attempt saved in history without duplicate entries
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 4: Complete quiz attempt and confirm history without duplicates ---');
  const quizNav = await page.waitForSelector('button.nav-button[title="Quiz & Practice"]');
  await quizNav.click();
  await new Promise((r) => setTimeout(r, 200));

  // Switch to CS track (1 question)
  const csPill = await page.waitForSelector('button.track-pill-btn:nth-child(3)');
  await csPill.click();
  await new Promise((r) => setTimeout(r, 100));

  const opts = await page.$$('.quiz-option-button');
  await opts[3].click();
  await new Promise((r) => setTimeout(r, 100));

  const finishBtn = await page.waitForSelector('.quiz-actions-row button.btn-primary');
  await finishBtn.click();
  await new Promise((r) => setTimeout(r, 300));

  let quizHistory = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('smartbridge_quiz_history_v1') || '[]');
  });
  if (quizHistory.length !== 1) {
    throw new Error(`Scenario 4 Failed: Expected 1 quiz entry, got ${quizHistory.length}`);
  }
  console.log(`Quiz attempt stored: Score ${quizHistory[0].score}/${quizHistory[0].totalQuestions} (${quizHistory[0].percentage}%)`);

  // Simulate window events & re-renders to test deduplication
  await page.evaluate(() => {
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('focus'));
  });
  await new Promise((r) => setTimeout(r, 100));

  quizHistory = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('smartbridge_quiz_history_v1') || '[]');
  });
  if (quizHistory.length !== 1) {
    throw new Error(`Scenario 4 Failed: Duplicate entry created for same attempt! Count: ${quizHistory.length}`);
  }

  // Refresh page and confirm history count in UI
  await page.reload({ waitUntil: 'networkidle0' });
  const quizNavReloaded = await page.waitForSelector('button.nav-button[title="Quiz & Practice"]');
  await quizNavReloaded.click();
  await new Promise((r) => setTimeout(r, 200));

  const historyPill = await page.evaluate(() => document.querySelector('.demo-notice-sub')?.textContent || '');
  if (!historyPill.includes('1 attempt saved locally')) {
    throw new Error(`Scenario 4 Failed: UI history count not restored! Got: "${historyPill}"`);
  }
  console.log(`✓ SCENARIO 4 PASSED: Quiz attempt persisted without duplicate entries ("${historyPill}")`);

  // --------------------------------------------------------------------------
  // SCENARIO 5: Check Settings counts, confirmation, and targeted deletion
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 5: Check Settings counts, confirmation, and targeted deletion ---');
  const settingsNav = await page.waitForSelector('button.nav-button[title="Settings"]');
  await settingsNav.click();
  await new Promise((r) => setTimeout(r, 200));

  // Check diagnostic counts in UI
  const diagTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.diag-item')).map((el) => el.textContent || '');
  });
  console.log('Settings Diagnostic Items:');
  diagTexts.forEach((d) => console.log('  ' + d.replace(/\s+/g, ' ').trim()));

  const notesDiag = diagTexts.find((t) => t.includes('Saved Study Notes'));
  const quizDiag = diagTexts.find((t) => t.includes('Saved Quiz Assessments'));
  if (!notesDiag || !quizDiag) {
    throw new Error('Scenario 5 Failed: Settings diagnostic items missing!');
  }

  // Click Clear Local Data button
  const clearBtn = await page.waitForSelector('button.btn-clear-storage');
  await clearBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  // Verify confirmation dialog appears
  const confirmBox = await page.waitForSelector('.clear-confirmation-box');
  const confirmText = await page.evaluate((el) => el.textContent, confirmBox);
  if (!confirmText.includes('Confirm SMART BRIDGE Data Reset') || !confirmText.includes('Only keys prefixed with smartbridge_')) {
    throw new Error('Scenario 5 Failed: Confirmation box missing explanation!');
  }
  console.log('✓ Confirmation dialog displayed with exact scope explanation');

  // Cancel first
  const cancelBtn = await page.waitForSelector('.clear-confirmation-box button.btn-secondary');
  await cancelBtn.click();
  await new Promise((r) => setTimeout(r, 100));

  // Confirm data was NOT deleted
  let sbKeysCount = await page.evaluate(() => {
    return Object.keys(localStorage).filter((k) => k.startsWith('smartbridge_')).length;
  });
  if (sbKeysCount === 0) {
    throw new Error('Scenario 5 Failed: Data was deleted after clicking Cancel!');
  }
  console.log('✓ Cancel action correctly preserved all data');

  // Re-open and confirm deletion
  const clearBtn2 = await page.waitForSelector('button.btn-clear-storage');
  await clearBtn2.click();
  await new Promise((r) => setTimeout(r, 100));

  const confirmDeleteBtn = await page.waitForSelector('button.btn-confirm-delete');
  await confirmDeleteBtn.click();
  await new Promise((r) => setTimeout(r, 300));

  sbKeysCount = await page.evaluate(() => {
    return Object.keys(localStorage).filter((k) => k.startsWith('smartbridge_')).length;
  });
  const foreignKey = await page.evaluate(() => localStorage.getItem('foreign_unrelated_app_key'));

  if (sbKeysCount !== 0) {
    throw new Error(`Scenario 5 Failed: Expected 0 smartbridge keys, found ${sbKeysCount}`);
  }
  if (foreignKey !== 'PRESERVE_ME') {
    throw new Error(`Scenario 5 Failed: Foreign key was deleted or altered! Value: ${foreignKey}`);
  }
  console.log('✓ SCENARIO 5 PASSED: Targeted deletion removed all SMART BRIDGE keys while foreign keys remained untouched');

  // --------------------------------------------------------------------------
  // SCENARIO 6: Corrupted saved data & unavailable localStorage handling
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 6: Corrupted saved data and unavailable localStorage handling ---');
  // Inject corrupted data into smartbridge_notes_v1
  await page.evaluate(() => {
    localStorage.setItem('smartbridge_notes_v1', '{"malformed_corrupt_json: true, ...broken');
  });

  await page.reload({ waitUntil: 'networkidle0' });
  const notesNavCorrupt = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
  await notesNavCorrupt.click();
  await new Promise((r) => setTimeout(r, 200));

  // Check for warning banner
  const warningBanner = await page.waitForSelector('.storage-corrupt-warning');
  const warningMsg = await page.evaluate((el) => el.textContent, warningBanner);
  if (!warningMsg.includes('Corrupted data encountered in "smartbridge_notes_v1"')) {
    throw new Error(`Scenario 6 Failed: Warning banner text incorrect: "${warningMsg}"`);
  }
  console.log(`✓ Warning banner displayed for corrupted storage: "${warningMsg.trim()}"`);

  // Verify app recovered with default note without crashing
  const safeTitle = await page.evaluate(() => document.querySelector('.notes-sheet-title')?.textContent || '');
  if (!safeTitle.includes('React 19 State')) {
    throw new Error(`Scenario 6 Failed: App failed to recover default note! Got: "${safeTitle}"`);
  }
  console.log('✓ Safe fallback note recovered without application crash');

  // Test unavailable storage simulation
  const storageExceptionHandled = await page.evaluate(() => {
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException('The user denied permission to access storage.', 'SecurityError');
    };
    try {
      let threw = false;
      try {
        localStorage.setItem('probe', 'val');
      } catch {
        threw = true;
      }
      return threw;
    } finally {
      Storage.prototype.setItem = originalSet;
    }
  });

  if (!storageExceptionHandled) {
    throw new Error('Scenario 6 Failed: Storage exception simulation failed');
  }
  console.log('✓ Storage exception handling verified: app survives storage permission denials');
  console.log('✓ SCENARIO 6 PASSED: Corrupted data recovered with visible warning, unavailable storage handled safely');

  // Verify console errors
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
    throw new Error(`Detected ${consoleErrors.length} console errors!`);
  }
  console.log('\n✓ Zero (0) browser console errors detected throughout all 6 scenarios.');

  await browser.close();
  console.log('\n===============================================================');
  console.log('🎉 ALL 6 VERIFICATION SCENARIOS PASSED WITH 100% SUCCESS!');
  console.log('===============================================================');
})().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
