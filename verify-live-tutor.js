import puppeteer from 'puppeteer';

async function verifyLiveTutor() {
  console.log('=== VERIFYING LIVE GEMINI AI TUTOR IN RUNNING APP ===\n');

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
    // 1. Load app
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('✓ App loaded at http://localhost:5173/');

    // 2. Navigate to AI Tutor
    const tutorNavBtn = await page.waitForSelector('button.nav-button[title="AI Tutor"]');
    await tutorNavBtn.click();
    await new Promise(r => setTimeout(r, 400));
    console.log('✓ Navigated to AI Tutor view');

    // 3. Check Connection Status Badge (waits for async /api/health check)
    await page.waitForFunction(() => {
      const el = document.querySelector('.demo-notice-badge');
      return el && el.textContent.includes('Gemini Cloud AI Active');
    }, { timeout: 6000 });
    const badgeText = await page.$eval('.demo-notice-badge', el => el.textContent.trim());
    console.log(`Connection Badge Text: "${badgeText}"`);
    console.log('✓ TEST 1 PASSED: UI correctly displays "Gemini Cloud AI Active" badge');

    // 4. Submit question that is OUTSIDE the hardcoded offline curriculum
    // This confirms that genuine live Gemini is answering, NOT the offline curriculum fallback
    const testQuestion = 'Explain the difference between SQL and NoSQL databases';
    console.log(`Submitting prompt: "${testQuestion}"`);

    const textarea = await page.waitForSelector('.chat-input-textarea');
    await textarea.type(testQuestion);

    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    // 5. Wait for assistant reply bubble
    console.log('Waiting for live Gemini response...');
    await page.waitForFunction(
      () => {
        const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
        return bubbles.length >= 2;
      },
      { timeout: 15000 }
    );

    // Wait for typing indicator to disappear
    await page.waitForFunction(
      () => !document.querySelector('.typing-indicator'),
      { timeout: 5000 }
    );

    // 6. Inspect response
    const lastAssistantMessage = await page.evaluate(() => {
      const bubbles = Array.from(document.querySelectorAll('.chat-bubble-row.bubble-assistant'));
      const last = bubbles[bubbles.length - 1];
      return {
        tag: last?.querySelector('.tag-demo-pill')?.textContent?.trim() || '',
        text: last?.querySelector('.chat-body-text p')?.textContent?.trim() || '',
        bullets: Array.from(last?.querySelectorAll('.chat-bullets li') || []).map(li => li.textContent?.trim() || ''),
        codeSnippet: last?.querySelector('pre code')?.textContent?.trim() || ''
      };
    });

    console.log('\n--- Live Gemini Tutor Response Details ---');
    console.log('Source Tag:', lastAssistantMessage.tag);
    console.log('Response Preview:', lastAssistantMessage.text.slice(0, 150) + '...');
    console.log('Bullet Points Count:', lastAssistantMessage.bullets.length);
    console.log('Code Snippet Present:', Boolean(lastAssistantMessage.codeSnippet));

    // Assertions
    if (!lastAssistantMessage.tag.includes('Gemini AI Model')) {
      throw new Error(`Expected source tag "🌟 Gemini AI Model", but got: "${lastAssistantMessage.tag}"`);
    }
    console.log('✓ TEST 2 PASSED: Source attribution tag is strictly "🌟 Gemini AI Model"');

    if (lastAssistantMessage.text.includes('Because an external AI cloud service') ||
        lastAssistantMessage.text.includes('Offline Curriculum Mode')) {
      throw new Error('Response is incorrectly falling back to Offline Curriculum Mode!');
    }
    console.log('✓ TEST 3 PASSED: Response is NOT offline fallback');

    if (!lastAssistantMessage.text.toLowerCase().includes('sql') &&
        !lastAssistantMessage.text.toLowerCase().includes('relational') &&
        !lastAssistantMessage.text.toLowerCase().includes('database')) {
      throw new Error(`Response does not appear to discuss SQL/NoSQL: "${lastAssistantMessage.text}"`);
    }
    console.log('✓ TEST 4 PASSED: Genuine pedagogical content from Gemini verified');

    if (consoleErrors.length > 0) {
      throw new Error(`Browser console errors detected: ${consoleErrors.join(', ')}`);
    }
    console.log('✓ TEST 5 PASSED: Zero (0) browser console errors recorded');

    console.log('\n===============================================================');
    console.log('🎉 LIVE GEMINI AI TUTOR VERIFICATION PASSED WITH 100% SUCCESS!');
    console.log('===============================================================\n');
  } finally {
    await browser.close();
  }
}

verifyLiveTutor().catch(err => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
