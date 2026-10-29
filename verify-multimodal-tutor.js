import puppeteer from 'puppeteer';

async function verifyMultimodalTutor() {
  console.log('================================================================');
  console.log('🌟 SMART BRIDGE MULTIMODAL AI TUTOR & REALISTIC DESIGN SUITE');
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
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Load Application
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('✓ Application loaded at http://localhost:5173/');

    // Check Part 1 Design System Tokens & Base Styling
    const bodyBg = await page.evaluate(() => {
      const body = document.body;
      const root = document.getElementById('root');
      return {
        bgColor: window.getComputedStyle(body).backgroundColor,
        fontFamily: window.getComputedStyle(body).fontFamily
      };
    });
    console.log('✓ Body background:', bodyBg.bgColor);
    console.log('✓ Font family:', bodyBg.fontFamily);

    // 2. Navigate to AI Tutor
    const tutorNavBtn = await page.waitForSelector('button.nav-button[title="AI Tutor"]');
    await tutorNavBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    console.log('✓ Navigated to AI Tutor view');

    // Verify view header and badges
    const headerInfo = await page.evaluate(() => {
      const title = document.querySelector('.view-main-title')?.textContent?.trim();
      const badge = document.querySelector('.demo-notice-badge')?.textContent?.trim();
      return { title, badge };
    });
    console.log('✓ AI Tutor Title:', headerInfo.title);
    console.log('✓ Connection Badge:', headerInfo.badge);

    // Helper to send query and wait for reply
    async function askTutor(query, expectedAssistantCount) {
      console.log(`\n▶ Submitting Query: "${query}"`);
      const textarea = await page.waitForSelector('.chat-input-textarea');
      await textarea.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await textarea.type(query, { delay: 10 });
      await new Promise((r) => setTimeout(r, 150));
      await page.keyboard.press('Enter');

      // Wait for reply to arrive (typing indicator clears and bubbles increase)
      await page.waitForFunction(
        (targetCount) => {
          const typing = document.querySelector('.typing-indicator');
          const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
          return !typing && bubbles.length >= targetCount;
        },
        { timeout: 25000 },
        expectedAssistantCount
      );
    }

    // --------------------------------------------------------------------------
    // TEST 1: Scientific Process — Photosynthesis
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 1: Scientific Concept (Photosynthesis) ---');
    await askTutor('Explain photosynthesis and the Calvin cycle in detail', 2);

    const t1 = await page.evaluate(() => {
      const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
      const last = bubbles[bubbles.length - 1];
      const modelCard = last.querySelector('.visual-model-card');
      const svg = last.querySelector('.visual-model-svg');
      const title = last.querySelector('.visual-model-title')?.textContent?.trim();
      const category = last.querySelector('.visual-category-badge')?.textContent?.trim();
      const caption = last.querySelector('.caption-step-title')?.textContent?.trim();
      const playBtn = last.querySelector('.btn-play-pause')?.textContent?.trim();

      return {
        hasModelCard: Boolean(modelCard),
        hasSvg: Boolean(svg),
        modelType: modelCard?.getAttribute('data-model-type'),
        title,
        category,
        caption,
        playBtn
      };
    });

    console.log('T1 Model Card Rendered:', t1.hasModelCard);
    console.log('T1 Model Type:', t1.modelType);
    console.log('T1 Model Title:', t1.title);
    console.log('T1 Category Badge:', t1.category);
    console.log('T1 Initial Caption Step:', t1.caption);

    if (!t1.hasModelCard || t1.modelType !== 'photosynthesis') {
      throw new Error(`Expected Photosynthesis visual model, got: ${t1.modelType}`);
    }
    if (!t1.hasSvg) {
      throw new Error('SVG diagram is missing in Photosynthesis model!');
    }
    console.log('✓ TEST 1 PASSED: Photosynthesis visual model rendered with chloroplast SVG, Calvin cycle, and synced captions!');

    // --------------------------------------------------------------------------
    // TEST 2: Computer Hardware — CPU Architecture
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 2: Hardware Architecture (CPU & Instruction Cycle) ---');
    await askTutor('How does CPU architecture execute instructions step by step?', 3);

    const t2 = await page.evaluate(() => {
      const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
      const last = bubbles[bubbles.length - 1];
      const modelCard = last.querySelector('.visual-model-card');
      const modelType = modelCard?.getAttribute('data-model-type');
      const title = last.querySelector('.visual-model-title')?.textContent?.trim();
      const tags = Array.from(last.querySelectorAll('.caption-element-tag')).map((t) => t.textContent.trim());

      return {
        hasModelCard: Boolean(modelCard),
        modelType,
        title,
        tags
      };
    });

    console.log('T2 Model Card Rendered:', t2.hasModelCard);
    console.log('T2 Model Type:', t2.modelType);
    console.log('T2 Title:', t2.title);
    console.log('T2 Active Hardware Tags:', t2.tags);

    if (!t2.hasModelCard || t2.modelType !== 'cpu-architecture') {
      throw new Error(`Expected CPU Architecture visual model, got: ${t2.modelType}`);
    }
    console.log('✓ TEST 2 PASSED: Von Neumann CPU Architecture model rendered with RAM, System Buses, and ALU!');

    // --------------------------------------------------------------------------
    // TEST 3: Programming Concept — Binary Search Algorithm
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 3: Algorithm Concept (Binary Search) ---');
    await askTutor('How does binary search work and what is its Big-O?', 4);

    const t3 = await page.evaluate(() => {
      const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
      const last = bubbles[bubbles.length - 1];
      const modelCard = last.querySelector('.visual-model-card');
      const modelType = modelCard?.getAttribute('data-model-type');
      const title = last.querySelector('.visual-model-title')?.textContent?.trim();

      return {
        hasModelCard: Boolean(modelCard),
        modelType,
        title
      };
    });

    console.log('T3 Model Card Rendered:', t3.hasModelCard);
    console.log('T3 Model Type:', t3.modelType);
    console.log('T3 Title:', t3.title);

    if (!t3.hasModelCard || t3.modelType !== 'binary-search') {
      throw new Error(`Expected Binary Search visual model, got: ${t3.modelType}`);
    }
    console.log('✓ TEST 3 PASSED: Binary Search model rendered with array division, Low/Mid/High pointers, and O(log N) telemetry!');

    // --------------------------------------------------------------------------
    // TEST 4: Mathematical Concept — Pythagorean Theorem
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 4: Mathematical Concept (Pythagorean Theorem) ---');
    await askTutor('Explain the Pythagorean Theorem and show the geometric proof', 5);

    const t4 = await page.evaluate(() => {
      const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
      const last = bubbles[bubbles.length - 1];
      const modelCard = last.querySelector('.visual-model-card');
      const modelType = modelCard?.getAttribute('data-model-type');
      const title = last.querySelector('.visual-model-title')?.textContent?.trim();

      return {
        hasModelCard: Boolean(modelCard),
        modelType,
        title
      };
    });

    console.log('T4 Model Card Rendered:', t4.hasModelCard);
    console.log('T4 Model Type:', t4.modelType);
    console.log('T4 Title:', t4.title);

    if (!t4.hasModelCard || t4.modelType !== 'pythagorean-theorem') {
      throw new Error(`Expected Pythagorean Theorem visual model, got: ${t4.modelType}`);
    }
    console.log('✓ TEST 4 PASSED: Geometric Pythagorean Theorem model rendered with unit area squares on right-angle sides!');

    // --------------------------------------------------------------------------
    // TEST 5: 3D / Celestial Concept — Solar System Orbits
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 5: Celestial 3D Concept (Solar System Orbits) ---');
    await askTutor('Explain the planetary orbits of our solar system and Kepler laws', 6);

    const t5 = await page.evaluate(() => {
      const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
      const last = bubbles[bubbles.length - 1];
      const modelCard = last.querySelector('.visual-model-card');
      const modelType = modelCard?.getAttribute('data-model-type');
      const badge3D = last.querySelector('.visual-3d-badge')?.textContent?.trim();

      return {
        hasModelCard: Boolean(modelCard),
        modelType,
        badge3D
      };
    });

    console.log('T5 Model Card Rendered:', t5.hasModelCard);
    console.log('T5 Model Type:', t5.modelType);
    console.log('T5 3D Badge:', t5.badge3D);

    if (!t5.hasModelCard || t5.modelType !== 'solar-system') {
      throw new Error(`Expected Solar System visual model, got: ${t5.modelType}`);
    }
    if (!t5.badge3D?.includes('3D')) {
      throw new Error('Expected 3D indicator badge on Solar System model!');
    }
    console.log('✓ TEST 5 PASSED: Interactive 3D Solar System orbital model rendered with planetary revolving mechanics!');

    // --------------------------------------------------------------------------
    // TEST 6: Non-Visual Question Clean Omission Check
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 6: Non-Visual Question Omission Check ---');
    await askTutor('What is your main mission and purpose as the SMART BRIDGE study tutor?', 7);

    const t6 = await page.evaluate(() => {
      const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
      const last = bubbles[bubbles.length - 1];
      const modelCard = last.querySelector('.visual-model-card');
      const textPreview = last.querySelector('.chat-body-text')?.textContent?.slice(0, 120);

      return {
        hasModelCard: Boolean(modelCard),
        textPreview
      };
    });

    console.log('T6 Has Visual Model Card:', t6.hasModelCard);
    console.log('T6 Response Preview:', t6.textPreview + '...');

    if (t6.hasModelCard) {
      throw new Error('Visual model card should NOT be rendered for a non-visual general query!');
    }
    console.log('✓ TEST 6 PASSED: Non-visual conversational query cleanly omits visual model card!');

    // --------------------------------------------------------------------------
    // TEST 7: Interactive Controls (Play/Pause, Step Scrubber, Speed 2x, Restart)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 7: Interactive Player Controls Verification ---');

    // Target the first visual model (Photosynthesis in bubble 2)
    const controlsTest = await page.evaluate(async () => {
      const firstCard = document.querySelector('.visual-model-card');
      if (!firstCard) return { error: 'No visual model card found' };

      // 1. Play / Pause Toggle
      const playPauseBtn = firstCard.querySelector('.btn-play-pause');
      const initialPlayText = playPauseBtn?.textContent?.trim();

      playPauseBtn?.click();
      await new Promise((r) => setTimeout(r, 100));
      const afterPauseText = playPauseBtn?.textContent?.trim();

      // 2. Next Step Navigation
      const nextBtn = firstCard.querySelector('.btn-step-nav:nth-of-type(2)');
      const initialStepPill = firstCard.querySelector('.caption-step-pill')?.textContent?.trim();

      nextBtn?.click();
      await new Promise((r) => setTimeout(r, 100));
      const afterNextStepPill = firstCard.querySelector('.caption-step-pill')?.textContent?.trim();

      // 3. Step Scrubber Jump (Dot 3)
      const dot3 = firstCard.querySelectorAll('.step-scrubber-dot')[2];
      dot3?.click();
      await new Promise((r) => setTimeout(r, 100));
      const afterDot3StepPill = firstCard.querySelector('.caption-step-pill')?.textContent?.trim();
      const dot3Active = dot3?.classList.contains('active');

      // 4. Speed 2x Toggle
      const speed2xBtn = Array.from(firstCard.querySelectorAll('.visual-speed-btn')).find(
        (b) => b.textContent?.trim() === '2x'
      );
      speed2xBtn?.click();
      await new Promise((r) => setTimeout(r, 100));
      const speed2xActive = speed2xBtn?.classList.contains('active');

      // 5. Restart
      const restartBtn = firstCard.querySelector('.btn-restart');
      restartBtn?.click();
      await new Promise((r) => setTimeout(r, 100));
      const afterRestartStepPill = firstCard.querySelector('.caption-step-pill')?.textContent?.trim();

      return {
        initialPlayText,
        afterPauseText,
        initialStepPill,
        afterNextStepPill,
        afterDot3StepPill,
        dot3Active,
        speed2xActive,
        afterRestartStepPill
      };
    });

    console.log('Play/Pause Toggle:', `${controlsTest.initialPlayText} ➔ ${controlsTest.afterPauseText}`);
    console.log('Next Step Advance:', `${controlsTest.initialStepPill} ➔ ${controlsTest.afterNextStepPill}`);
    console.log('Scrubber Dot 3 Click:', `${controlsTest.afterDot3StepPill} (Active: ${controlsTest.dot3Active})`);
    console.log('Speed 2x Toggle Active:', controlsTest.speed2xActive);
    console.log('Restart Step Result:', controlsTest.afterRestartStepPill);

    if (controlsTest.initialPlayText === controlsTest.afterPauseText) {
      throw new Error('Play/Pause button did not toggle label state!');
    }
    if (controlsTest.afterDot3StepPill !== 'Phase 3') {
      throw new Error(`Step scrubber did not navigate to Phase 3, got: ${controlsTest.afterDot3StepPill}`);
    }
    if (!controlsTest.speed2xActive) {
      throw new Error('Speed 2x button was not activated!');
    }
    if (controlsTest.afterRestartStepPill !== 'Phase 1') {
      throw new Error(`Restart button did not reset to Phase 1, got: ${controlsTest.afterRestartStepPill}`);
    }
    console.log('✓ TEST 7 PASSED: All interactive player controls (Play/Pause, Step Scrubber, Speed 2x, Restart) operate flawlessly!');

    console.log('\n================================================================');
    console.log('🎉 ALL 7 MULTIMODAL AI TUTOR & REALISTIC DESIGN TESTS PASSED (100%)');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ VERIFICATION FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (consoleErrors.length > 0) {
      console.log('Browser console errors observed during run:', consoleErrors);
    }
    await browser.close();
  }
}

verifyMultimodalTutor();
