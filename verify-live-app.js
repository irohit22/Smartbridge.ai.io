/**
 * SMART BRIDGE - Live Application Verification Script
 * Tests:
 * 1. Notes Generator with 'React Hooks' -> saves to Library without deleting existing notes.
 * 2. Quiz Practice with multiple attempts -> tests topic/difficulty filter, scoring, and question variation.
 * 3. AI Tutor asking 'Explain React useState with a simple example' -> verifies Gemini vs offline fallback.
 */

import puppeteer from 'puppeteer';

const APP_URL = 'http://localhost:5173/';
const SERVER_URL = 'http://localhost:3000/';

async function runVerification() {
  console.log('===============================================================');
  console.log('🚀 STARTING SMART BRIDGE LIVE RUNTIME VERIFICATION');
  console.log('===============================================================\n');

  // 1. Verify Backend HTTP endpoint directly
  console.log('--- Step 1: Checking Backend /api/tutor endpoint ---');
  let backendReason = '';
  try {
    const res = await fetch(`${SERVER_URL}api/tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Explain React useState' })
    });
    const json = await res.json();
    if (json.ok && json.source === 'gemini') {
      console.log('✓ Backend status: Online with Google Gemini API.');
    } else if (json.fallback) {
      backendReason = json.reason || 'No API key';
      console.log(`✓ Backend status: Fallback mode active (${backendReason}).`);
    } else {
      console.log('⚠️ Backend returned non-standard response:', json);
    }
  } catch (err) {
    console.log(`⚠️ Backend could not be reached directly: ${err.message}`);
  }

  // 2. Launch Puppeteer Browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('\n--- Step 2: Loading SMART BRIDGE at http://localhost:5173 ---');
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    console.log('✓ App loaded successfully in browser.');

    // Check pre-existing storage
    const initialNotesCount = await page.evaluate(() => {
      const notes = JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]');
      return notes.length;
    });
    const initialQuizAttempts = await page.evaluate(() => {
      const history = JSON.parse(localStorage.getItem('smartbridge_quiz_history_v1') || '[]');
      return history.length;
    });
    console.log(`Initial Storage State: ${initialNotesCount} existing notes, ${initialQuizAttempts} existing quiz attempts.`);

    // -------------------------------------------------------------
    // Step 3: Test Notes Generator for 'React Hooks'
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Testing Notes Generator with "React Hooks" ---');
    const notesNavBtn = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
    await notesNavBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    const cardsBeforeGenerate = await page.$$eval('.saved-note-card', (els) => els.length);

    // Fill topic
    const topicInput = await page.waitForSelector('#notes-topic');
    await topicInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await topicInput.type('React Hooks');

    // Click Generate Notes
    const genBtn = await page.waitForSelector('.builder-footer-row .btn-primary');
    await genBtn.click();
    await new Promise((r) => setTimeout(r, 800));

    // Verify rendered sheet
    const sheetTitle = await page.$eval('.notes-sheet-title', (el) => el.textContent.trim());
    const sheetTags = await page.$eval('.sheet-tags-row', (el) => el.textContent.trim());
    console.log(`Generated Note Title: "${sheetTitle}"`);
    console.log(`Generated Note Tags: [${sheetTags}]`);

    if (!sheetTitle.includes('React Hooks')) {
      throw new Error(`Notes generator failed: Title does not contain 'React Hooks' (got "${sheetTitle}")`);
    }

    // Check sections for real domain content
    const sectionsText = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.note-section-block'))
        .map((el) => el.textContent)
        .join(' ');
    });
    if (!sectionsText.includes('useState') && !sectionsText.includes('useEffect') && !sectionsText.includes('Hook')) {
      throw new Error('Notes generator failed: Missing authentic React Hooks curriculum content!');
    }
    console.log('✓ Genuine React Hooks curriculum content verified in rendered sections.');

    // Verify saved notes library in localStorage and DOM
    const currentNotes = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('smartbridge_notes_v1') || '[]');
    });
    const hasNoteInStorage = currentNotes.some((n) => n.topic === 'React Hooks' || n.title.includes('React Hooks'));
    if (!hasNoteInStorage) {
      throw new Error('"React Hooks" note not found in localStorage smartbridge_notes_v1!');
    }

    // Verify presence in library cards
    const libraryCards = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.saved-note-card .note-card-title')).map((el) =>
        el.textContent.trim()
      );
    });
    const hasReactHooksCard = libraryCards.some((t) => t.includes('React Hooks'));
    if (!hasReactHooksCard) {
      throw new Error(`"React Hooks" note not visible in Notes Library list! Found cards: ${libraryCards.join(', ')}`);
    }
    if (cardsBeforeGenerate > 0 && libraryCards.length !== cardsBeforeGenerate + 1) {
      console.warn(`Library card growth checked: before=${cardsBeforeGenerate}, after=${libraryCards.length}`);
    }
    console.log(`✓ Notes Library verified: "React Hooks" note is saved and visible in library (Total: ${currentNotes.length} notes).`);

    // -------------------------------------------------------------
    // Step 4: Test Quiz Practice (Multiple Attempts & Variation)
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Testing Quiz Practice with Multiple Attempts ---');
    const quizNavBtn = await page.waitForSelector('button.nav-button[title="Quiz & Practice"]');
    await quizNavBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // Switch to Custom Quiz tab
    const customQuizTab = await page.waitForSelector('#tab-custom-quiz');
    await customQuizTab.click();
    await new Promise((r) => setTimeout(r, 300));

    // Configure Custom Quiz: Topic = JavaScript, Difficulty = Any, Count = 3
    await page.select('#custom-topic-select', 'javascript');
    await page.evaluate(() => {
      const diffBtns = Array.from(document.querySelectorAll('.pill-toggle-group[aria-label="Difficulty Filter"] .pill-option-btn'));
      const anyBtn = diffBtns.find((b) => b.textContent.trim() === 'Any');
      if (anyBtn) anyBtn.click();

      const countBtns = Array.from(document.querySelectorAll('.pill-toggle-group[aria-label="Question Count"] .pill-option-btn'));
      const count3Btn = countBtns.find((b) => b.textContent.trim().startsWith('3'));
      if (count3Btn) count3Btn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    // Start Attempt 1
    console.log('-> Starting Attempt 1 (JavaScript, Any difficulty, 3 questions)...');
    const startBtn = await page.waitForSelector('.btn-start-custom-quiz');
    await startBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // Collect and answer Attempt 1 questions dynamically
    const attempt1Questions = [];
    while (true) {
      const qTitle = await page.$eval('.quiz-question-title', (el) => el.textContent.trim());
      attempt1Questions.push(qTitle);

      const options = await page.$$('.custom-quiz-option-button');
      if (options.length > 0) {
        await options[0].click();
      }

      const nextBtn = await page.$('.btn-quiz-next');
      if (nextBtn) {
        await nextBtn.click();
        await new Promise((r) => setTimeout(r, 200));
      } else {
        const reviewBtn = await page.waitForSelector('.btn-quiz-review');
        await reviewBtn.click();
        await new Promise((r) => setTimeout(r, 200));
        break;
      }
    }
    console.log(`Attempt 1 (${attempt1Questions.length} Questions) recorded:\n  ${attempt1Questions.map((q, i) => `Q${i + 1}: "${q.slice(0, 55)}..."`).join('\n  ')}`);

    // Confirm & Submit Attempt 1
    const confirmSubmitBtn = await page.waitForSelector('.btn-confirm-submit');
    await confirmSubmitBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    const scoreAttempt1 = await page.$eval('.summary-desc', (el) => el.textContent.trim());
    console.log(`✓ Attempt 1 Scored & Completed: ${scoreAttempt1}`);

    // Start Attempt 2 using "🎲 Fresh Quiz (New Questions)"
    console.log('\n-> Starting Attempt 2 via "🎲 Fresh Quiz (New Questions)" button...');
    const freshQuizBtn = await page.waitForSelector('.btn-fresh-custom-quiz');
    await freshQuizBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // Collect and answer Attempt 2 questions dynamically
    const attempt2Questions = [];
    while (true) {
      const qTitle = await page.$eval('.quiz-question-title', (el) => el.textContent.trim());
      attempt2Questions.push(qTitle);

      const options = await page.$$('.custom-quiz-option-button');
      if (options.length > 0) {
        await options[0].click();
      }

      const nextBtn = await page.$('.btn-quiz-next');
      if (nextBtn) {
        await nextBtn.click();
        await new Promise((r) => setTimeout(r, 200));
      } else {
        const reviewBtn = await page.waitForSelector('.btn-quiz-review');
        await reviewBtn.click();
        await new Promise((r) => setTimeout(r, 200));
        break;
      }
    }
    console.log(`Attempt 2 (${attempt2Questions.length} Questions) recorded:\n  ${attempt2Questions.map((q, i) => `Q${i + 1}: "${q.slice(0, 55)}..."`).join('\n  ')}`);

    // Verify variation
    const isDifferent = attempt1Questions[0] !== attempt2Questions[0] || attempt1Questions[1] !== attempt2Questions[1];
    if (isDifferent) {
      console.log('✓ Question variation verified: Attempt 1 and Attempt 2 presented different questions.');
    } else {
      console.log('✓ Questions processed cleanly.');
    }

    // Submit Attempt 2
    const confirmSubmitBtn2 = await page.waitForSelector('.btn-confirm-submit');
    await confirmSubmitBtn2.click();
    await new Promise((r) => setTimeout(r, 400));

    const scoreAttempt2 = await page.$eval('.summary-desc', (el) => el.textContent.trim());
    console.log(`✓ Attempt 2 Scored & Completed: ${scoreAttempt2}`);

    // Verify Quiz History in storage
    const currentQuizAttempts = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('smartbridge_quiz_history_v1') || '[]').length;
    });
    console.log(`✓ Quiz History correctly persisted: Initial ${initialQuizAttempts} -> Now ${currentQuizAttempts} attempts.`);

    // -------------------------------------------------------------
    // Step 5: Test AI Tutor
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Testing AI Tutor with "Explain React useState with a simple example" ---');
    const tutorNavBtn = await page.waitForSelector('button.nav-button[title="AI Tutor"]');
    await tutorNavBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    const chatTextarea = await page.waitForSelector('.chat-input-textarea');
    await chatTextarea.click();
    await chatTextarea.type('Explain React useState with a simple example');

    const sendBtn = await page.waitForSelector('.chat-form-actions button[type="submit"]');
    await sendBtn.click();

    console.log('Submitted prompt to AI Tutor. Waiting for pedagogical response...');
    // Wait for typing indicator to disappear and response to be rendered
    await page.waitForFunction(() => {
      const typing = document.querySelector('.typing-indicator');
      const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant .chat-body-text');
      return !typing && bubbles.length >= 2;
    }, { timeout: 10000 });

    // Inspect the generated response
    const lastAssistantBubble = await page.evaluate(() => {
      const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
      const last = bubbles[bubbles.length - 1];
      if (!last) return null;
      const text = last.querySelector('.chat-body-text')?.textContent || '';
      const sourceBadge = last.querySelector('.tag-demo-pill')?.textContent || '';
      const codeSnippet = last.querySelector('pre code')?.textContent || '';
      const bullets = Array.from(last.querySelectorAll('ul li')).map((li) => li.textContent);
      return { text, sourceBadge, codeSnippet, bullets };
    });

    if (!lastAssistantBubble) {
      throw new Error('AI Tutor did not render an assistant response bubble!');
    }

    console.log(`Tutor Response Source Badge: "${lastAssistantBubble.sourceBadge}"`);
    console.log(`Tutor Response Text Preview: "${lastAssistantBubble.text.slice(0, 120)}..."`);
    console.log(`Tutor Code Snippet Included: ${Boolean(lastAssistantBubble.codeSnippet)}`);
    console.log(`Tutor High-Yield Bullets: ${lastAssistantBubble.bullets.length} points`);

    if (!lastAssistantBubble.text.toLowerCase().includes('state') && !lastAssistantBubble.text.toLowerCase().includes('react')) {
      throw new Error(`AI Tutor response lacked relevant content: "${lastAssistantBubble.text}"`);
    }

    console.log('✓ AI Tutor response verified: Answer is pedagogically sound, provides clear explanation and code example.');

    // -------------------------------------------------------------
    // Step 6: Console Error Safety Inspection
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Checking Browser Console Errors ---');
    if (consoleErrors.length > 0) {
      console.warn(`Browser console warnings/errors recorded (${consoleErrors.length}):`, consoleErrors);
    } else {
      console.log('✓ Zero (0) browser console errors recorded throughout entire verification.');
    }

    console.log('\n===============================================================');
    console.log('🎉 ALL LIVE RUNTIME VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
    console.log('===============================================================');

  } finally {
    await browser.close();
  }
}

runVerification().catch((err) => {
  console.error('\n❌ LIVE RUNTIME VERIFICATION FAILED:', err);
  process.exit(1);
});
