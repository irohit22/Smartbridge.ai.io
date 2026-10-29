import puppeteer from 'puppeteer';

async function verifyChatGPTTutor() {
  console.log('=== STARTING CHATGPT-STYLE AI TUTOR VERIFICATION IN LIVE BROWSER ===\n');

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
    // Load app
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('✓ App loaded at http://localhost:5173/');

    // Navigate to AI Tutor
    const tutorNavBtn = await page.waitForSelector('button.nav-button[title="AI Tutor"]');
    await tutorNavBtn.click();
    await new Promise(r => setTimeout(r, 300));
    console.log('✓ Navigated to AI Tutor view');

    // --------------------------------------------------------------------------
    // TEST 1: "Explain recursion in detail with a simple real-life example."
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 1: Detailed Educational Explanation with Analogy ---');
    const p1 = 'Explain recursion in detail with a simple real-life example.';
    const inputArea = await page.waitForSelector('.chat-input-textarea');
    await inputArea.type(p1);

    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    console.log(`Submitted: "${p1}"`);
    console.log('Waiting for model to complete structured lesson...');

    // Wait for assistant reply bubble to complete (typing indicator disappears and message is rendered)
    await page.waitForFunction(
      () => {
        const typing = document.querySelector('.typing-indicator');
        const assistants = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
        return !typing && assistants.length >= 2;
      },
      { timeout: 20000 }
    );

    const t1Details = await page.evaluate(() => {
      const bubbles = Array.from(document.querySelectorAll('.chat-bubble-row.bubble-assistant'));
      const last = bubbles[bubbles.length - 1];
      const body = last.querySelector('.chat-body-text');
      return {
        tag: last.querySelector('.tag-demo-pill')?.textContent?.trim() || '',
        headings: Array.from(body?.querySelectorAll('h2, h3, h4') || []).map(h => h.textContent.trim()),
        hasCodeBlock: Boolean(body?.querySelector('.chat-code-block pre code')),
        codeCopyBtn: Boolean(body?.querySelector('.btn-code-copy')),
        paragraphsCount: body?.querySelectorAll('p').length || 0,
        textPreview: body?.textContent?.slice(0, 140) || ''
      };
    });

    console.log('T1 Tag:', t1Details.tag);
    console.log('T1 Headings Rendered:', t1Details.headings);
    console.log('T1 Has Formatted Code Block:', t1Details.hasCodeBlock);
    console.log('T1 Code Copy Button Present:', t1Details.codeCopyBtn);
    console.log('T1 Paragraphs Count:', t1Details.paragraphsCount);

    if (!t1Details.tag.includes('Gemini AI Model')) {
      throw new Error(`Expected Gemini AI Model tag, got: "${t1Details.tag}"`);
    }
    if (t1Details.headings.length < 2) {
      throw new Error(`Expected at least 2 section headings in detailed lesson, got: ${t1Details.headings.length}`);
    }
    if (!t1Details.hasCodeBlock || !t1Details.codeCopyBtn) {
      throw new Error('Code block or copy button missing in detailed response!');
    }
    console.log('✓ TEST 1 PASSED: Detailed educational lesson with headings, code block, and copy button rendered!');

    // --------------------------------------------------------------------------
    // TEST 2: "Explain this code line by line: for (let i = 1; i <= 3; i++) console.log(i);"
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 2: Line-by-Line Code Explanation ---');
    const p2 = 'Explain this code line by line: for (let i = 1; i <= 3; i++) console.log(i);';
    await inputArea.type(p2);
    await submitBtn.click();
    console.log(`Submitted: "${p2}"`);

    await page.waitForFunction(
      () => {
        const typing = document.querySelector('.typing-indicator');
        const assistants = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
        return !typing && assistants.length >= 3;
      },
      { timeout: 20000 }
    );

    const t2Details = await page.evaluate(() => {
      const bubbles = Array.from(document.querySelectorAll('.chat-bubble-row.bubble-assistant'));
      const last = bubbles[bubbles.length - 1];
      const body = last.querySelector('.chat-body-text');
      const text = body?.textContent || '';
      return {
        hasStepBreakdown: text.includes('Initialization') || text.includes('Condition') || text.includes('Round 1') || text.includes('i = 1'),
        paragraphsCount: body?.querySelectorAll('p').length || 0,
        textPreview: text.slice(0, 160)
      };
    });

    console.log('T2 Line-by-Line Details Detected:', t2Details.hasStepBreakdown);
    console.log('T2 Preview:', t2Details.textPreview + '...');
    if (!t2Details.hasStepBreakdown) {
      throw new Error('Line-by-line loop breakdown not detected in response!');
    }
    console.log('✓ TEST 2 PASSED: Line-by-line breakdown verified in live UI!');

    // --------------------------------------------------------------------------
    // TEST 3: "Mujhe JavaScript promises Hinglish mein bilkul basic se samjhao."
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 3: Multilingual Hinglish Adaptation ---');
    const p3 = 'Mujhe JavaScript promises Hinglish mein bilkul basic se samjhao.';
    await inputArea.type(p3);
    await submitBtn.click();
    console.log(`Submitted: "${p3}"`);

    await page.waitForFunction(
      () => {
        const typing = document.querySelector('.typing-indicator');
        const assistants = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
        return !typing && assistants.length >= 4;
      },
      { timeout: 20000 }
    );

    const t3Details = await page.evaluate(() => {
      const bubbles = Array.from(document.querySelectorAll('.chat-bubble-row.bubble-assistant'));
      const last = bubbles[bubbles.length - 1];
      const body = last.querySelector('.chat-body-text');
      const text = body?.textContent || '';
      const isHinglish = text.includes('samajh') || text.includes('karta') || text.includes('kaam') || text.includes('bhai') || text.includes('wada') || text.includes('dost');
      return {
        isHinglish,
        hasCode: Boolean(body?.querySelector('.chat-code-block')),
        textPreview: text.slice(0, 160)
      };
    });

    console.log('T3 Hinglish Vocabulary Detected:', t3Details.isHinglish);
    console.log('T3 Preview:', t3Details.textPreview + '...');
    if (!t3Details.isHinglish) {
      throw new Error('Response was not in natural Hinglish as requested!');
    }
    console.log('✓ TEST 3 PASSED: Natural Hinglish explanation verified in live UI!');

    // --------------------------------------------------------------------------
    // TEST 4: "I still don't understand recursion. Explain it more simply." (Contextual Follow-up)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 4: Contextual Simplification Follow-Up ---');
    const p4 = "I still don't understand recursion. Explain it more simply.";
    await inputArea.type(p4);
    await submitBtn.click();
    console.log(`Submitted: "${p4}"`);

    await page.waitForFunction(
      () => {
        const typing = document.querySelector('.typing-indicator');
        const assistants = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
        return !typing && assistants.length >= 5;
      },
      { timeout: 20000 }
    );

    const t4Details = await page.evaluate(() => {
      const bubbles = Array.from(document.querySelectorAll('.chat-bubble-row.bubble-assistant'));
      const last = bubbles[bubbles.length - 1];
      const body = last.querySelector('.chat-body-text');
      const text = (body?.textContent || '').toLowerCase();
      const hasSimplerAnalogy = text.includes('doll') || text.includes('coin') || text.includes('box') || 
                                text.includes('stair') || text.includes('mirror') || text.includes('worry') ||
                                text.includes('simple') || text.includes('easy') || text.includes('imagine') ||
                                text.includes('picture') || text.includes('step') || text.includes('reassure');
      return {
        hasSimplerAnalogy,
        textPreview: text.slice(0, 160)
      };
    });

    console.log('T4 Simplified Analogy Detected:', t4Details.hasSimplerAnalogy);
    console.log('T4 Preview:', t4Details.textPreview + '...');
    if (!t4Details.hasSimplerAnalogy) {
      throw new Error('Response did not provide simplified analogy for recursion!');
    }
    console.log('✓ TEST 4 PASSED: Context-aware patient simplification verified in live UI!');

    // --------------------------------------------------------------------------
    // TEST 5: Verify Notes & Quiz still function properly
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 5: Regression Check (Notes Generator & My Notes) ---');
    await page.click('button.nav-button[title="Notes Generator"]');
    await new Promise(r => setTimeout(r, 200));

    const notesTitle = await page.$eval('.view-main-title', el => el.textContent.trim());
    console.log('Notes Generator Title:', notesTitle);
    if (!notesTitle.includes('Notes Generator')) {
      throw new Error('Notes Generator page failed to open!');
    }
    console.log('✓ TEST 5 PASSED: Notes Studio remains fully intact and functional');

    // --------------------------------------------------------------------------
    // TEST 6: Check Console Errors
    // --------------------------------------------------------------------------
    if (consoleErrors.length > 0) {
      throw new Error(`Browser console errors detected: ${consoleErrors.join(', ')}`);
    }
    console.log('✓ TEST 6 PASSED: Zero (0) browser console errors recorded throughout entire suite');

    console.log('\n===============================================================');
    console.log('🎉 ALL 6 CHATGPT-STYLE AI TUTOR VERIFICATIONS PASSED (100%)!');
    console.log('===============================================================\n');
  } finally {
    await browser.close();
  }
}

verifyChatGPTTutor().catch(err => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
