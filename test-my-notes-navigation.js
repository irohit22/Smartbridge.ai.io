import puppeteer from 'puppeteer';

async function testMyNotes() {
  console.log('=== STARTING MY NOTES NAVIGATION & FUNCTIONALITY TEST ===\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('✓ App loaded successfully at http://localhost:5173/');

    // 1. Verify that 'My Notes' button exists in sidebar
    const myNotesNav = await page.waitForSelector('button.nav-button[title="My Notes"]');
    if (!myNotesNav) throw new Error('Could not find "My Notes" in sidebar');
    console.log('✓ TEST 1 PASSED: "My Notes" navigation item is visible and accessible in sidebar');

    // 2. Click "My Notes" and verify page title
    await myNotesNav.click();
    await new Promise(r => setTimeout(r, 200));

    const pageTitle = await page.$eval('.view-main-title', el => el.textContent.trim());
    console.log(`Page title in My Notes: "${pageTitle}"`);
    if (!pageTitle.includes('My Saved Notes Library')) {
      throw new Error(`Expected title to include "My Saved Notes Library", got "${pageTitle}"`);
    }
    console.log('✓ TEST 2 PASSED: Clicking "My Notes" opens "My Saved Notes Library"');

    // 3. Verify Saved Notes Library panel is rendered immediately
    const libraryPanel = await page.$('.notes-library-panel');
    if (!libraryPanel) throw new Error('Notes library panel not visible in My Notes view');
    console.log('✓ TEST 3 PASSED: Notes Library panel rendered at top of My Notes view');

    // 4. Navigate to Notes Generator and create a new custom note
    const notesGenNav = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
    await notesGenNav.click();
    await new Promise(r => setTimeout(r, 200));

    const topicInput = await page.waitForSelector('#notes-topic');
    await topicInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await topicInput.type('React Query & Server State Management');
    await page.select('#notes-engine', 'offline');

    const genBtn = await page.waitForSelector('.builder-footer-row .btn-primary');
    await genBtn.click();
    await new Promise(r => setTimeout(r, 600));
    console.log('✓ Generated new note for "React Query & Server State Management"');

    // 5. Navigate back to "My Notes" via Sidebar and verify the note appears
    await page.click('button.nav-button[title="My Notes"]');
    await new Promise(r => setTimeout(r, 250));

    const noteCards = await page.$$eval('.saved-note-card .note-card-title', els => els.map(e => e.textContent.trim()));
    console.log('Cards in My Notes:', noteCards);
    const hasNewNote = noteCards.some(t => t.includes('React Query'));
    if (!hasNewNote) {
      throw new Error('Newly generated note did not appear in My Notes library!');
    }
    console.log('✓ TEST 4 PASSED: Generated note immediately appears in My Notes library');

    // 6. Click on the note card to open it in preview sheet
    const targetCard = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll('.saved-note-card'));
      return cards.find(c => c.textContent.includes('React Query'));
    });
    if (!targetCard) throw new Error('Could not find React Query note card');
    await targetCard.asElement().click();
    await new Promise(r => setTimeout(r, 200));

    const sheetTitle = await page.$eval('.notes-sheet-title', el => el.textContent.trim());
    console.log(`Active note sheet title: "${sheetTitle}"`);
    if (!sheetTitle.includes('React Query')) {
      throw new Error(`Expected sheet title to contain "React Query", got "${sheetTitle}"`);
    }
    console.log('✓ TEST 5 PASSED: Clicking note card opens full note preview sheet');

    // 7. Verify explicit "Save Note" button works and updates storage
    const saveBtn = await page.waitForSelector('.btn-save-library');
    await saveBtn.click();
    await new Promise(r => setTimeout(r, 200));

    const storedData = await page.evaluate(() => {
      return localStorage.getItem('smartbridge_notes_v1');
    });
    if (!storedData || !storedData.includes('React Query')) {
      throw new Error('smartbridge_notes_v1 does not contain React Query note');
    }
    console.log('✓ TEST 6 PASSED: Saved note verified directly in localStorage key "smartbridge_notes_v1"');

    // 8. Test deletion confirmation modal
    const deleteBtn = await page.waitForSelector('.sheet-actions button.btn-ghost');
    await deleteBtn.click();
    await new Promise(r => setTimeout(r, 200));

    const modalDialog = await page.$('.modal-dialog-box');
    if (!modalDialog) throw new Error('Confirmation modal dialog did not open');
    console.log('✓ Deletion confirmation modal opened safely');

    // Cancel deletion
    const cancelBtn = await page.waitForSelector('.modal-dialog-footer .btn-secondary');
    await cancelBtn.click();
    await new Promise(r => setTimeout(r, 200));
    console.log('✓ TEST 7 PASSED: Deletion canceled; note preserved in My Notes');

    // 9. Reload page and verify persistence
    await page.reload({ waitUntil: 'networkidle0' });
    await page.click('button.nav-button[title="My Notes"]');
    await new Promise(r => setTimeout(r, 200));

    const cardsAfterReload = await page.$$eval('.saved-note-card .note-card-title', els => els.map(e => e.textContent.trim()));
    if (!cardsAfterReload.some(t => t.includes('React Query'))) {
      throw new Error('Note did not persist across page reload in My Notes!');
    }
    console.log('✓ TEST 8 PASSED: Notes persist across browser page reload in My Notes');

    // 10. Check console errors
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors recorded: ${consoleErrors.join(', ')}`);
    }
    console.log('✓ TEST 9 PASSED: Zero (0) browser console errors recorded');

    console.log('\n===============================================================');
    console.log('🎉 ALL MY NOTES NAVIGATION & FUNCTIONALITY CHECKS PASSED (100%)!');
    console.log('===============================================================\n');
  } finally {
    await browser.close();
  }
}

testMyNotes().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
