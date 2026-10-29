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

  console.log('=== STARTING STAGE 3 SAVED NOTES LIBRARY TEST SUITE ===\n');

  // Load app
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  console.log('✓ Initial page loaded at http://localhost:5173/');

  // Clean initial state for isolated testing
  await page.evaluate(() => {
    localStorage.clear();
  });

  // Navigate to Notes Generator
  const notesNav = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
  await notesNav.click();
  await new Promise((r) => setTimeout(r, 200));

  // --------------------------------------------------------------------------
  // SETUP: Create 2 distinct notes for testing
  // --------------------------------------------------------------------------
  console.log('\n--- SETUP: Generating 2 Test Notes ---');
  // Note 1: Kubernetes Microservices
  const topicInput = await page.waitForSelector('#notes-topic');
  await topicInput.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await topicInput.type('Kubernetes Pods & Service Mesh');
  await page.select('#notes-engine', 'offline');
  const genBtn = await page.waitForSelector('.builder-footer-row .btn-primary');
  await genBtn.click();
  await new Promise((r) => setTimeout(r, 600));

  // Note 2: PostgreSQL Indexing
  await topicInput.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await topicInput.type('PostgreSQL B-Tree & GiST Indexing');
  await genBtn.click();
  await new Promise((r) => setTimeout(r, 600));

  let storedNotes = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]');
  });
  console.log(`✓ Setup complete: ${storedNotes.length} notes in library (Default + 2 created)`);

  // --------------------------------------------------------------------------
  // TEST 1: Search by title
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 1: Search by title ---');
  const searchInput = await page.waitForSelector('.library-search-input');
  await searchInput.type('Kubernetes');
  await new Promise((r) => setTimeout(r, 150));

  let visibleCards = await page.$$('.saved-note-card');
  let cardTitles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.note-card-title')).map((el) => el.textContent || '');
  });
  console.log(`Cards visible for "Kubernetes": ${cardTitles.length} -> [${cardTitles.join(', ')}]`);

  if (visibleCards.length !== 1 || !cardTitles[0].includes('Kubernetes')) {
    throw new Error(`Test 1 Failed: Expected 1 card matching Kubernetes, got ${cardTitles.length}`);
  }
  console.log('✓ TEST 1 PASSED: Search by title successfully filtered library');

  // --------------------------------------------------------------------------
  // TEST 2: Search by topic, including mixed letter case
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Search by topic, with mixed letter case ---');
  // Clear search first via clear button
  await page.evaluate(() => {
    const btn = document.querySelector('.library-search-clear-btn');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 150));

  // Focus search input, ensure clean, and type mixed case topic search "pOdS & sErViCe"
  await page.evaluate(() => {
    const input = document.querySelector('.library-search-input');
    if (input) input.value = '';
  });
  await searchInput.type('pOdS & sErViCe');
  await new Promise((r) => setTimeout(r, 200));

  cardTitles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.note-card-title')).map((el) => el.textContent || '');
  });
  if (cardTitles.length !== 1 || !cardTitles[0].includes('Kubernetes')) {
    throw new Error(`Test 2 Failed: Case-insensitive topic search failed! Found: [${cardTitles.join(', ')}]`);
  }
  console.log(`✓ TEST 2 PASSED: Mixed-case topic search matched "${cardTitles[0]}"`);

  // --------------------------------------------------------------------------
  // TEST 3: Search with no matching results & clear-search behavior
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Search with no matching results & clear-search behavior ---');
  await page.evaluate(() => {
    const btn = document.querySelector('.library-search-clear-btn');
    if (btn) btn.click();
    const input = document.querySelector('.library-search-input');
    if (input) input.value = '';
  });
  await searchInput.type('xyznonexistentquery999');
  await new Promise((r) => setTimeout(r, 150));

  const emptySearchHeading = await page.evaluate(() => {
    return document.querySelector('.library-empty-search-state h3')?.textContent || '';
  });
  if (!emptySearchHeading.includes('xyznonexistentquery999')) {
    throw new Error(`Test 3 Failed: Friendly empty search state missing! Got: "${emptySearchHeading}"`);
  }
  console.log(`✓ Empty search state rendered: "${emptySearchHeading}"`);

  // Click reset search button
  const resetSearchBtn = await page.waitForSelector('.library-empty-search-state button');
  await resetSearchBtn.click();
  await new Promise((r) => setTimeout(r, 150));

  visibleCards = await page.$$('.saved-note-card');
  if (visibleCards.length < 3) {
    throw new Error(`Test 3 Failed: Reset search did not restore all notes! Found: ${visibleCards.length}`);
  }
  console.log(`✓ TEST 3 PASSED: Reset search restored full library (${visibleCards.length} notes)`);

  // --------------------------------------------------------------------------
  // TEST 4: Selecting and opening the correct note
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Selecting and opening the correct note ---');
  // Click on the Kubernetes card
  const k8sCard = await page.evaluateHandle(() => {
    const cards = Array.from(document.querySelectorAll('.saved-note-card'));
    return cards.find((c) => c.textContent?.includes('Kubernetes'));
  });
  if (!k8sCard) throw new Error('Could not find Kubernetes card element');
  await k8sCard.click();
  await new Promise((r) => setTimeout(r, 200));

  const activeTitle = await page.evaluate(() => document.querySelector('.notes-sheet-title')?.textContent || '');
  const activeSectionsCount = await page.evaluate(() => document.querySelectorAll('.note-section-block').length);

  if (!activeTitle.includes('Kubernetes')) {
    throw new Error(`Test 4 Failed: Expected Kubernetes preview title, got: "${activeTitle}"`);
  }
  if (activeSectionsCount < 4) {
    throw new Error(`Test 4 Failed: Expected 4 sections rendered, got: ${activeSectionsCount}`);
  }
  console.log(`✓ TEST 4 PASSED: Selected note opened with full content (${activeSectionsCount} sections)`);

  // --------------------------------------------------------------------------
  // TEST 5: Switching between multiple notes without data mix-ups
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Switching between multiple notes without data mix-ups ---');
  // Click PostgreSQL card
  const pgCard = await page.evaluateHandle(() => {
    const cards = Array.from(document.querySelectorAll('.saved-note-card'));
    return cards.find((c) => c.textContent?.includes('PostgreSQL'));
  });
  if (!pgCard) throw new Error('Could not find PostgreSQL card element');
  await pgCard.click();
  await new Promise((r) => setTimeout(r, 200));

  let currentTitle = await page.evaluate(() => document.querySelector('.notes-sheet-title')?.textContent || '');
  if (!currentTitle.includes('PostgreSQL')) {
    throw new Error(`Test 5 Failed: Switching to PostgreSQL failed! Got: "${currentTitle}"`);
  }

  // Switch back to Kubernetes card
  await k8sCard.click();
  await new Promise((r) => setTimeout(r, 200));
  currentTitle = await page.evaluate(() => document.querySelector('.notes-sheet-title')?.textContent || '');
  if (!currentTitle.includes('Kubernetes')) {
    throw new Error(`Test 5 Failed: Switching back to Kubernetes failed! Got: "${currentTitle}"`);
  }

  // Verify stored notes count did NOT duplicate
  const notesAfterSwitches = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]');
  });
  if (notesAfterSwitches.length !== storedNotes.length) {
    throw new Error(`Test 5 Failed: Switching created duplicate notes! Count: ${notesAfterSwitches.length}`);
  }
  console.log('✓ TEST 5 PASSED: Smooth switching verified without data mix-ups or duplicate creation');

  // --------------------------------------------------------------------------
  // TEST 6: Correct creation-date display
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Correct creation-date display ---');
  const cardDate = await page.evaluate(() => {
    return document.querySelector('.saved-note-card .note-card-footer span')?.textContent || '';
  });
  const sheetCreatedTag = await page.evaluate(() => {
    return document.querySelector('.notes-sheet-header .sheet-tags-row span:nth-child(3)')?.textContent || '';
  });
  console.log(`Card date text: "${cardDate}" | Sheet header date text: "${sheetCreatedTag}"`);

  if (!cardDate.includes('🗓️') || cardDate.includes('Invalid Date')) {
    throw new Error(`Test 6 Failed: Card date display invalid: "${cardDate}"`);
  }
  if (!sheetCreatedTag.includes('Created:') || sheetCreatedTag.includes('Invalid Date')) {
    throw new Error(`Test 6 Failed: Header date display invalid: "${sheetCreatedTag}"`);
  }
  console.log('✓ TEST 6 PASSED: Creation date displayed in readable format without Invalid Date');

  // --------------------------------------------------------------------------
  // TEST 7: Legacy notes with missing or invalid timestamps
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 7: Legacy notes with missing or invalid timestamps ---');
  // Inject a legacy note with null / missing / invalid createdAt
  await page.evaluate(() => {
    const current = JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]');
    const legacyNote = {
      id: 'note-legacy-test',
      topic: 'Legacy Algorithms',
      title: 'Legacy Bubble Sort Implementation',
      styleLabel: 'Cheatsheet',
      language: 'English',
      detailLevel: 'concise',
      createdAt: 'Invalid Date', // Malformed date test
      sections: [{ heading: '1. Legacy Section', content: 'Testing safe recovery' }]
    };
    localStorage.setItem('smartbridge_notes_v1', JSON.stringify([legacyNote, ...current]));
  });

  // Reload page
  await page.reload({ waitUntil: 'networkidle0' });
  const notesNavLegacy = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
  await notesNavLegacy.click();
  await new Promise((r) => setTimeout(r, 200));

  // Check legacy card
  const legacyCard = await page.evaluateHandle(() => {
    const cards = Array.from(document.querySelectorAll('.saved-note-card'));
    return cards.find((c) => c.textContent?.includes('Legacy Bubble Sort'));
  });
  if (!legacyCard) throw new Error('Legacy note card not found');
  await legacyCard.click();
  await new Promise((r) => setTimeout(r, 200));

  const legacyDateText = await page.evaluate(() => {
    return document.querySelector('.saved-note-card.active-note .note-card-footer span')?.textContent || '';
  });
  console.log(`Legacy note footer date text: "${legacyDateText}"`);
  if (legacyDateText.includes('Invalid Date')) {
    throw new Error(`Test 7 Failed: Displayed "Invalid Date"! Got: "${legacyDateText}"`);
  }
  if (!legacyDateText.includes('Legacy Note')) {
    throw new Error(`Test 7 Failed: Expected "Legacy Note" fallback, got: "${legacyDateText}"`);
  }
  console.log('✓ TEST 7 PASSED: Legacy note with malformed timestamp handled gracefully (displayed "Legacy Note")');

  // --------------------------------------------------------------------------
  // TEST 8: Canceling deletion without changing data
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 8: Canceling deletion without changing data ---');
  const countBeforeCancel = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]').length;
  });

  // Click delete button on active note in preview sheet
  const deleteBtn = await page.waitForSelector('.sheet-actions button[title="Delete this note from storage"]');
  await deleteBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  // Verify modal opened
  const modalDesc = await page.waitForSelector('#delete-dialog-desc');
  const modalText = await page.evaluate((el) => el.textContent || '', modalDesc);
  if (!modalText.includes('Legacy Bubble Sort')) {
    throw new Error(`Test 8 Failed: Modal did not identify the note! Got: "${modalText}"`);
  }
  console.log('✓ Confirmation modal opened identifying note title');

  // Click Cancel
  const cancelBtn = await page.waitForSelector('.modal-dialog-footer button.btn-secondary');
  await cancelBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  // Verify modal is closed and note is still present
  const modalStillOpen = await page.evaluate(() => !!document.querySelector('.modal-dialog-box'));
  const countAfterCancel = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]').length;
  });

  if (modalStillOpen) {
    throw new Error('Test 8 Failed: Modal remained open after Cancel!');
  }
  if (countBeforeCancel !== countAfterCancel) {
    throw new Error('Test 8 Failed: Note was deleted despite clicking Cancel!');
  }
  console.log('✓ TEST 8 PASSED: Cancel dismissed modal and preserved all data');

  // --------------------------------------------------------------------------
  // TEST 9: Confirming deletion of only the selected note
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 9: Confirming deletion of only the selected note ---');
  await deleteBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  const confirmDeleteBtn = await page.waitForSelector('button.btn-confirm-delete-note');
  await confirmDeleteBtn.click();
  await new Promise((r) => setTimeout(r, 300));

  const storedAfterDelete = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]');
  });

  if (storedAfterDelete.length !== countBeforeCancel - 1) {
    throw new Error(`Test 9 Failed: Expected ${countBeforeCancel - 1} notes, found ${storedAfterDelete.length}`);
  }
  const isLegacyStillThere = storedAfterDelete.some((n) => n.id === 'note-legacy-test');
  if (isLegacyStillThere) {
    throw new Error('Test 9 Failed: Deleted note still present in storage!');
  }
  // Verify other notes remained intact
  const hasK8s = storedAfterDelete.some((n) => n.title.includes('Kubernetes'));
  const hasPg = storedAfterDelete.some((n) => n.title.includes('PostgreSQL'));
  if (!hasK8s || !hasPg) {
    throw new Error('Test 9 Failed: Deletion corrupted or removed other notes!');
  }
  console.log('✓ TEST 9 PASSED: Only target note deleted; all other notes remained intact');

  // --------------------------------------------------------------------------
  // TEST 10: Refreshing app and verifying notes remain persisted
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 10: Refreshing app and verifying notes remain persisted ---');
  await page.reload({ waitUntil: 'networkidle0' });
  const notesNavReload = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
  await notesNavReload.click();
  await new Promise((r) => setTimeout(r, 200));

  const reloadedCount = await page.evaluate(() => {
    return document.querySelectorAll('.saved-note-card').length;
  });
  if (reloadedCount !== storedAfterDelete.length) {
    throw new Error(`Test 10 Failed: Reloaded cards count ${reloadedCount} does not match storage ${storedAfterDelete.length}`);
  }
  console.log(`✓ TEST 10 PASSED: Library persists across page reload (${reloadedCount} cards verified)`);

  // --------------------------------------------------------------------------
  // TEST 11: Empty-library behavior
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 11: Empty-library behavior ---');
  await page.evaluate(() => {
    localStorage.setItem('smartbridge_notes_v1', JSON.stringify([]));
  });

  await page.reload({ waitUntil: 'networkidle0' });
  const notesNavEmpty = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
  await notesNavEmpty.click();
  await new Promise((r) => setTimeout(r, 200));

  const emptyLibraryHeading = await page.evaluate(() => {
    return document.querySelector('.library-empty-search-state h3')?.textContent || '';
  });
  if (!emptyLibraryHeading.includes('No study notes saved yet')) {
    throw new Error(`Test 11 Failed: Empty library heading unexpected: "${emptyLibraryHeading}"`);
  }
  console.log(`✓ TEST 11 PASSED: Empty library handled gracefully with friendly banner ("${emptyLibraryHeading}")`);

  // --------------------------------------------------------------------------
  // TEST 12: Storage errors and existing corruption warnings
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 12: Storage errors and corruption warning ---');
  await page.evaluate(() => {
    localStorage.setItem('smartbridge_notes_v1', 'NOT_VALID_JSON_CORRUPT{{{{');
  });

  await page.reload({ waitUntil: 'networkidle0' });
  const notesNavCorrupt = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
  await notesNavCorrupt.click();
  await new Promise((r) => setTimeout(r, 200));

  const corruptBannerText = await page.evaluate(() => {
    return document.querySelector('.storage-corrupt-warning')?.textContent || '';
  });
  if (!corruptBannerText.includes('Corrupted data encountered in "smartbridge_notes_v1"')) {
    throw new Error(`Test 12 Failed: Expected corruption warning banner, got: "${corruptBannerText}"`);
  }
  console.log(`✓ TEST 12 PASSED: Storage corruption warning surfaced properly ("${corruptBannerText.slice(0, 50)}...")`);

  // Verify console errors
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
    throw new Error(`Detected ${consoleErrors.length} browser console errors!`);
  }
  console.log('\n✓ Zero (0) browser console errors detected.');

  await browser.close();
  console.log('\n===============================================================');
  console.log('🎉 ALL 12 STAGE 3 SAVED NOTES LIBRARY TESTS PASSED (100%)!');
  console.log('===============================================================');
})().catch((err) => {
  console.error('\n❌ Stage 3 Test Suite Failed:', err);
  process.exit(1);
});
