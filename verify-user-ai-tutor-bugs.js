import puppeteer from 'puppeteer';

async function runTutorVerification() {
  console.log('================================================================');
  console.log('🌟 SMART BRIDGE AI TUTOR RESPONSE-TO-VISUALIZATION VERIFICATION');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore favicon, 404s, simulated test network drops (503 / ERR_FAILED)
      if (
        !text.includes('favicon') &&
        !text.includes('status of 404') &&
        !text.includes('ERR_FAILED') &&
        !text.includes('status of 503')
      ) {
        consoleErrors.push(text);
      }
    } else if (msg.type() === 'warn') {
      console.log('  [Browser Console Warn]:', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  try {
    // 1. Load application at http://localhost:5173
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('✓ Application successfully loaded at http://localhost:5173/');

    // 2. Navigate to AI Tutor
    const tutorNavBtn = await page.waitForSelector('button.nav-button[title="AI Tutor"]', { timeout: 10000 });
    await tutorNavBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    console.log('✓ Navigated to AI Tutor view');

    // Helper function to ask the tutor and wait for response
    async function submitQuestion(question, expectedAssistantCount) {
      console.log(`\n▶ Submitting Query: "${question}"`);
      const textarea = await page.waitForSelector('.chat-input-textarea', { timeout: 5000 });
      await textarea.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await textarea.type(question, { delay: 10 });
      await new Promise((r) => setTimeout(r, 200));
      await page.keyboard.press('Enter');

      // Wait for reply (typing indicator gone and assistant bubbles >= expectedAssistantCount)
      await page.waitForFunction(
        (targetCount) => {
          const typing = document.querySelector('.typing-indicator');
          const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
          return !typing && bubbles.length >= targetCount;
        },
        { timeout: 30000 },
        expectedAssistantCount
      );
      await new Promise((r) => setTimeout(r, 600));
    }

    // Helper to inspect the latest assistant message
    async function inspectLatestAssistantMessage() {
      return await page.evaluate(() => {
        const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
        const last = bubbles[bubbles.length - 1];
        if (!last) return null;

        const bodyP = last.querySelector('.chat-body-text p');
        const textExplanation = bodyP ? bodyP.textContent.trim() : '';
        const sourceLabel = last.querySelector('.tag-demo-pill')?.textContent?.trim() || '';

        // Visual Section
        const visualContainer = last.querySelector('.tutor-visual-explanation-container');
        const sectionBanner = last.querySelector('.visual-explanation-section-banner');
        const kicker = last.querySelector('.section-kicker')?.textContent?.trim() || '';
        const headline = last.querySelector('.section-headline')?.textContent?.trim() || '';
        const typePill = last.querySelector('.visual-type-pill')?.textContent?.trim() || '';
        const categoryPill = last.querySelector('.visual-category-pill')?.textContent?.trim() || '';
        const summary = last.querySelector('.visual-explanation-summary')?.textContent?.trim() || '';

        // Visual Model Viewer
        const modelCard = last.querySelector('.visual-model-card');
        const modelType = modelCard?.getAttribute('data-model-type') || '';
        const modelTitle = last.querySelector('.visual-model-title')?.textContent?.trim() || '';
        const stepCaption = last.querySelector('.caption-step-title')?.textContent?.trim() || '';
        const stepDesc = last.querySelector('.caption-step-description')?.textContent?.trim() || '';

        // Controls
        const playBtn = last.querySelector('.btn-play-pause');
        const playBtnText = playBtn?.textContent?.trim() || '';
        const nextBtn = last.querySelector('.btn-step-fwd');
        const prevBtn = last.querySelector('.btn-step-back');
        const restartBtn = last.querySelector('.btn-restart');
        const speedBtns = Array.from(last.querySelectorAll('.btn-speed')).map((b) => b.textContent.trim());

        return {
          hasTextExplanation: Boolean(textExplanation && textExplanation.length > 20),
          textExplanationSnippet: textExplanation.slice(0, 100),
          sourceLabel,
          hasVisualContainer: Boolean(visualContainer),
          hasSectionBanner: Boolean(sectionBanner),
          kicker,
          headline,
          typePill,
          categoryPill,
          summarySnippet: summary.slice(0, 80),
          hasModelCard: Boolean(modelCard),
          modelType,
          modelTitle,
          stepCaption,
          stepDescSnippet: stepDesc.slice(0, 80),
          hasPlayBtn: Boolean(playBtn),
          playBtnText,
          hasNextBtn: Boolean(nextBtn),
          hasPrevBtn: Boolean(prevBtn),
          hasRestartBtn: Boolean(restartBtn),
          speedBtns
        };
      });
    }

    // ========================================================================
    // 1. QUESTION 1: Explain how a CPU works.
    // ========================================================================
    console.log('\n--- TEST 1: Question: "Explain how a CPU works." ---');
    await submitQuestion('Explain how a CPU works.', 2);
    const q1Result = await inspectLatestAssistantMessage();
    console.log('Q1 Text Explanation Present:', q1Result.hasTextExplanation);
    console.log('Q1 Source Label:', q1Result.sourceLabel);
    console.log('Q1 Section Headline:', q1Result.headline);
    console.log('Q1 Type Badge:', q1Result.typePill);
    console.log('Q1 Visual Model Title:', q1Result.modelTitle);
    console.log('Q1 Model Type:', q1Result.modelType);
    console.log('Q1 Step Caption:', q1Result.stepCaption);

    if (!q1Result.hasTextExplanation) {
      throw new Error('Q1 failed: Text explanation missing!');
    }
    if (!q1Result.hasVisualContainer || !q1Result.hasModelCard) {
      throw new Error('Q1 failed: Visual container or model card missing for CPU query!');
    }
    if (q1Result.headline !== 'Visual Explanation') {
      throw new Error(`Q1 failed: Expected "Visual Explanation" headline, got "${q1Result.headline}"`);
    }
    if (q1Result.modelType !== 'cpu-architecture') {
      throw new Error(`Q1 failed: Expected cpu-architecture model, got "${q1Result.modelType}"`);
    }
    if (!q1Result.hasPlayBtn || !q1Result.hasNextBtn) {
      throw new Error('Q1 failed: Play/Pause or Step controls missing!');
    }

    // Test Playback Controls on CPU visual
    console.log('Testing interactive playback controls on CPU visual...');
    const stepBefore = q1Result.stepCaption;
    await page.click('.chat-bubble-row.bubble-assistant:last-child .btn-step-fwd');
    await new Promise((r) => setTimeout(r, 400));

    const stepAfter = await page.evaluate(() => {
      const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
      const last = bubbles[bubbles.length - 1];
      return last.querySelector('.caption-step-title')?.textContent?.trim() || '';
    });
    console.log(`Step changed from "${stepBefore}" -> "${stepAfter}"`);
    if (stepBefore === stepAfter) {
      throw new Error('Step forward control failed to advance the visual simulation step!');
    }
    console.log('✓ TEST 1 PASSED: CPU works question returned text lesson + animated CPU Architecture visual with controls!');

    // ========================================================================
    // 2. QUESTION 2: Explain photosynthesis.
    // ========================================================================
    console.log('\n--- TEST 2: Question: "Explain photosynthesis." ---');
    await submitQuestion('Explain photosynthesis.', 3);
    const q2Result = await inspectLatestAssistantMessage();
    console.log('Q2 Text Explanation Present:', q2Result.hasTextExplanation);
    console.log('Q2 Section Headline:', q2Result.headline);
    console.log('Q2 Type Badge:', q2Result.typePill);
    console.log('Q2 Visual Model Title:', q2Result.modelTitle);
    console.log('Q2 Model Type:', q2Result.modelType);

    if (!q2Result.hasTextExplanation) {
      throw new Error('Q2 failed: Text explanation missing!');
    }
    if (!q2Result.hasVisualContainer || q2Result.modelType !== 'photosynthesis') {
      throw new Error(`Q2 failed: Expected photosynthesis visual model, got "${q2Result.modelType}"`);
    }
    console.log('✓ TEST 2 PASSED: Photosynthesis question returned text lesson + Chloroplast / Calvin cycle visual model!');

    // ========================================================================
    // 3. QUESTION 3: Explain JavaScript Promises.
    // ========================================================================
    console.log('\n--- TEST 3: Question: "Explain JavaScript Promises." ---');
    await submitQuestion('Explain JavaScript Promises.', 4);
    const q3Result = await inspectLatestAssistantMessage();
    console.log('Q3 Text Explanation Present:', q3Result.hasTextExplanation);
    console.log('Q3 Section Headline:', q3Result.headline);
    console.log('Q3 Type Badge:', q3Result.typePill);
    console.log('Q3 Visual Model Title:', q3Result.modelTitle);
    console.log('Q3 Model Type:', q3Result.modelType);

    if (!q3Result.hasTextExplanation) {
      throw new Error('Q3 failed: Text explanation missing!');
    }
    if (!q3Result.hasVisualContainer || q3Result.modelType !== 'js-promise-flow') {
      throw new Error(`Q3 failed: Expected js-promise-flow visual model, got "${q3Result.modelType}"`);
    }
    console.log('✓ TEST 3 PASSED: JavaScript Promises question returned text lesson + Promise Lifecycle / Microtask visual!');

    // ========================================================================
    // 4. QUESTION 4: Explain neural networks in simple words.
    // ========================================================================
    console.log('\n--- TEST 4: Question: "Explain neural networks in simple words." ---');
    await submitQuestion('Explain neural networks in simple words.', 5);
    const q4Result = await inspectLatestAssistantMessage();
    console.log('Q4 Text Explanation Present:', q4Result.hasTextExplanation);
    console.log('Q4 Section Headline:', q4Result.headline);
    console.log('Q4 Type Badge:', q4Result.typePill);
    console.log('Q4 Visual Model Title:', q4Result.modelTitle);
    console.log('Q4 Model Type:', q4Result.modelType);

    if (!q4Result.hasTextExplanation) {
      throw new Error('Q4 failed: Text explanation missing!');
    }
    if (!q4Result.hasVisualContainer || q4Result.modelType !== 'neural-network') {
      throw new Error(`Q4 failed: Expected neural-network visual model, got "${q4Result.modelType}"`);
    }
    console.log('✓ TEST 4 PASSED: Neural networks question returned friendly text lesson + Multilayer Synaptic visual simulation!');

    // ========================================================================
    // 5. QUESTION 5: Offline Mode Supported Topic
    // ========================================================================
    console.log('\n--- TEST 5: Supported Topic in Offline Mode ---');
    // Enable request interception to simulate network disconnection for /api/tutor
    await page.setRequestInterception(true);
    const offlineInterceptor = (req) => {
      if (req.url().includes('/api/tutor')) {
        req.respond({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, fallback: true, reason: 'Network offline simulation' })
        });
      } else {
        req.continue();
      }
    };
    page.on('request', offlineInterceptor);

    await submitQuestion('Explain the water cycle', 6);
    const q5Result = await inspectLatestAssistantMessage();
    console.log('Q5 Text Explanation Present:', q5Result.hasTextExplanation);
    console.log('Q5 Source Label:', q5Result.sourceLabel);
    console.log('Q5 Section Headline:', q5Result.headline);
    console.log('Q5 Type Badge:', q5Result.typePill);
    console.log('Q5 Visual Model Title:', q5Result.modelTitle);
    console.log('Q5 Model Type:', q5Result.modelType);

    if (!q5Result.hasTextExplanation) {
      throw new Error('Q5 failed: Offline text explanation missing!');
    }
    if (!q5Result.sourceLabel.toLowerCase().includes('offline')) {
      throw new Error(`Q5 failed: Expected offline source label, got "${q5Result.sourceLabel}"`);
    }
    if (!q5Result.hasVisualContainer || q5Result.modelType !== 'water-cycle') {
      throw new Error(`Q5 failed: Expected water-cycle visual model in offline mode, got "${q5Result.modelType}"`);
    }
    console.log('✓ TEST 5 PASSED: Offline mode seamlessly provided local curriculum lesson + Evaporation/Condensation visual model!');

    // Cleanup interception
    page.off('request', offlineInterceptor);
    await page.setRequestInterception(false);

    // ========================================================================
    // 6. Console Error Check
    // ========================================================================
    console.log('\n--- Checking Console Errors ---');
    console.log('Total Console Errors Recorded:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.warn('Errors logged:', consoleErrors);
      throw new Error(`Browser console logged ${consoleErrors.length} errors!`);
    }
    console.log('✓ Zero console errors recorded.');

    console.log('\n================================================================');
    console.log('🎉 ALL 5 USER VERIFICATION SCENARIOS PASSED WITH FLYING COLORS!');
    console.log('================================================================\n');

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
    if (consoleErrors.length > 0) {
      console.error('Console errors during run:', consoleErrors);
    }
    await browser.close();
    process.exit(1);
  }
}

runTutorVerification();
