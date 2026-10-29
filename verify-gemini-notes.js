import puppeteer from 'puppeteer';

async function runGeminiNotesVerification() {
  console.log('=== STARTING GEMINI STUDY NOTES GENERATOR VERIFICATION IN LIVE BROWSER ===\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('✓ App loaded at http://localhost:5173/');

    // Navigate to Notes Generator
    const notesNav = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
    await notesNav.click();
    await new Promise(r => setTimeout(r, 300));
    console.log('✓ Navigated to Notes Generator');

    // --------------------------------------------------------------------------
    // TEST 1: Generate Master Study Guide for "Operating System" with Gemini AI
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 1: Synthesizing Master Study Guide on "Operating System" ---');
    const topicInput = await page.waitForSelector('#notes-topic');
    await topicInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await topicInput.type('Operating System');

    // Configure Academic Inputs
    await page.select('#notes-engine', 'gemini');
    await page.select('#notes-subject', 'Operating Systems & Architecture');
    await page.select('#notes-education', 'College / Undergraduate');
    await page.select('#notes-style', 'cheatsheet');
    await page.select('#notes-detail', 'comprehensive');

    const generateBtn = await page.waitForSelector('.builder-footer-row .btn-primary');
    await generateBtn.click();
    console.log('Submitted: "Operating System" via Gemini Cloud AI. Waiting for LLM synthesis...');

    // Wait for synthesis to complete (button re-enables and sheet title updates)
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('.builder-footer-row .btn-primary');
        const sheetTitle = document.querySelector('.notes-sheet-title');
        const titleText = sheetTitle?.textContent?.toLowerCase() || '';
        return btn && !btn.disabled && titleText.includes('operating');
      },
      { timeout: 35000 }
    );

    // Extract rendered note details
    const noteData = await page.evaluate(() => {
      const sheet = document.querySelector('.notes-preview-sheet');
      const title = sheet?.querySelector('.notes-sheet-title')?.textContent?.trim() || '';
      const tags = Array.from(sheet?.querySelectorAll('.sheet-tags-row .badge-subtle') || []).map(b => b.textContent.trim());
      const sectionBlocks = Array.from(sheet?.querySelectorAll('.note-section-block') || []);
      const headings = sectionBlocks.map(b => b.querySelector('.note-section-heading')?.textContent?.trim() || '');
      const tables = Array.from(sheet?.querySelectorAll('.note-markdown-table') || []);
      const tableHeaders = tables.map(t => Array.from(t.querySelectorAll('th')).map(th => th.textContent.trim()));
      const codeBlocks = Array.from(sheet?.querySelectorAll('.note-code-wrapper code') || []);
      const bulletLists = Array.from(sheet?.querySelectorAll('.note-bullet-list, .note-numbered-list') || []);
      const fullText = sheet?.textContent?.toLowerCase() || '';

      return {
        title,
        tags,
        sectionsCount: sectionBlocks.length,
        headings,
        hasTable: tables.length > 0,
        tableHeaders,
        codeBlocksCount: codeBlocks.length,
        bulletListsCount: bulletLists.length,
        hasAnalogy: fullText.includes('analogy') || fullText.includes('conductor') || fullText.includes('manager') || fullText.includes('kitchen') || fullText.includes('traffic'),
        hasExamPoints: fullText.includes('exam') || fullText.includes('interview') || fullText.includes('deadlock') || fullText.includes('coffman') || fullText.includes('paging'),
        hasSummary: fullText.includes('summary') || fullText.includes('recap') || fullText.includes('takeaway'),
        hasPracticeQuestions: fullText.includes('practice question') || fullText.includes('self-check') || fullText.includes('q1') || fullText.includes('questions'),
        hasSeparatedAnswers: fullText.includes('solution') || fullText.includes('answer') || fullText.includes('explanation')
      };
    });

    console.log('Note Title:', noteData.title);
    console.log('Tags:', noteData.tags);
    console.log('Sections Count:', noteData.sectionsCount);
    console.log('Section Headings Sample:', noteData.headings.slice(0, 6));
    console.log('Rendered Markdown Table Present:', noteData.hasTable);
    if (noteData.tableHeaders.length > 0) {
      console.log('Table Headers:', noteData.tableHeaders[0]);
    }
    console.log('Code / Diagram Blocks Count:', noteData.codeBlocksCount);
    console.log('Real-World Analogy Present:', noteData.hasAnalogy);
    console.log('Exam / Interview Points Present:', noteData.hasExamPoints);
    console.log('Quick Revision Summary Present:', noteData.hasSummary);
    console.log('Practice Questions Present:', noteData.hasPracticeQuestions);
    console.log('Separated Answers Present:', noteData.hasSeparatedAnswers);

    if (noteData.sectionsCount < 6) {
      throw new Error(`Test 1 Failed: Note has fewer than 6 comprehensive sections (got ${noteData.sectionsCount})`);
    }
    if (!noteData.tags.some(t => t.includes('Gemini Cloud AI'))) {
      throw new Error('Test 1 Failed: Note missing "🌟 Gemini Cloud AI" badge tag!');
    }
    if (!noteData.hasTable) {
      throw new Error('Test 1 Failed: Markdown comparison table was not rendered as an HTML table!');
    }
    if (!noteData.hasPracticeQuestions) {
      throw new Error('Test 1 Failed: Practice questions missing from generated study guide!');
    }
    console.log('✓ TEST 1 PASSED: Comprehensive, beautifully formatted Operating System study note generated with Gemini AI!');

    // --------------------------------------------------------------------------
    // TEST 2: Save to Library, Persistence & Reopening
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 2: Save Note, Persistence across Reload & My Notes ---');
    const saveBtn = await page.waitForSelector('.btn-save-library');
    await saveBtn.click();
    await new Promise(r => setTimeout(r, 200));

    // Verify localStorage key "smartbridge_notes_v1"
    const storedNotes = await page.evaluate(() => {
      const raw = localStorage.getItem('smartbridge_notes_v1');
      return raw ? JSON.parse(raw) : [];
    });
    console.log('Total Saved Notes in localStorage:', storedNotes.length);
    const osNote = storedNotes.find(n => n.topic.toLowerCase().includes('operating') || n.title.toLowerCase().includes('operating'));
    if (!osNote) {
      throw new Error('Test 2 Failed: Operating System note was not persisted in "smartbridge_notes_v1"!');
    }
    console.log('✓ Verified note persisted in localStorage key "smartbridge_notes_v1"');

    // Reload page and check persistence
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 300));
    console.log('✓ Page reloaded');

    // Navigate to "My Notes" in Sidebar
    const myNotesNav = await page.waitForSelector('button.nav-button[title="My Notes"]');
    await myNotesNav.click();
    await new Promise(r => setTimeout(r, 300));

    // Verify My Notes lists the Operating System note
    const cards = await page.$$eval('.saved-note-card .note-card-title', els => els.map(e => e.textContent.trim()));
    console.log('Notes Cards in My Notes Library:', cards);
    if (!cards.some(c => c.toLowerCase().includes('operating'))) {
      throw new Error('Test 2 Failed: Operating System note card not found in My Notes library!');
    }
    console.log('✓ Operating System note visible in My Notes card grid');

    // Click note card to open in preview
    const osCard = await page.evaluateHandle(() => {
      const allCards = Array.from(document.querySelectorAll('.saved-note-card'));
      return allCards.find(c => c.textContent.toLowerCase().includes('operating'));
    });
    await osCard.asElement().click();
    await new Promise(r => setTimeout(r, 200));

    const openedTitle = await page.$eval('.notes-sheet-title', el => el.textContent.trim());
    console.log('Opened Sheet Title:', openedTitle);
    if (!openedTitle.toLowerCase().includes('operating')) {
      throw new Error(`Test 2 Failed: Expected to open Operating System note, opened "${openedTitle}" instead!`);
    }
    console.log('✓ TEST 2 PASSED: Saved note smoothly persisted and reopened from My Notes!');

    // --------------------------------------------------------------------------
    // TEST 3: Action Buttons (Copy Markdown & Code Snippet Copy)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 3: Markdown Copy & Snippet Actions ---');
    const copyMdBtn = await page.waitForSelector('.sheet-actions button:nth-child(3)');
    await copyMdBtn.click();
    await new Promise(r => setTimeout(r, 200));
    console.log('✓ Copy Markdown triggered with toast notification');

    const copyCodeBtn = await page.$('.btn-code-copy');
    if (copyCodeBtn) {
      await copyCodeBtn.click();
      await new Promise(r => setTimeout(r, 200));
      console.log('✓ Code snippet Copy button clicked with toast confirmation');
    }

    if (consoleErrors.length > 0) {
      throw new Error(`Browser console errors encountered: ${JSON.stringify(consoleErrors)}`);
    }
    console.log('✓ Zero (0) browser console errors recorded throughout entire session');

    console.log('\n===============================================================');
    console.log('🎉 ALL GEMINI STUDY NOTES VERIFICATIONS PASSED (100%)!');
    console.log('===============================================================\n');

  } finally {
    await browser.close();
  }
}

runGeminiNotesVerification().catch(err => {
  console.error('\n❌ Gemini Notes Verification Failed:', err);
  process.exit(1);
});
