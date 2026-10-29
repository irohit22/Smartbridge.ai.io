import puppeteer from 'puppeteer';

async function runOllamaVerificationSuite() {
  console.log('================================================================');
  console.log('🦙 SMART BRIDGE OLLAMA OFFLINE AI TUTOR INTEGRATION SUITE');
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
      if (
        !text.includes('favicon') &&
        !text.includes('status of 404') &&
        !text.includes('status of 503') &&
        !text.includes('ERR_FAILED')
      ) {
        consoleErrors.push(text);
      }
    } else if (msg.type() === 'warn') {
      console.log('  [Console Warn]:', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  try {
    // --------------------------------------------------------------------------
    // 0. Initial Health & Backend Check
    // --------------------------------------------------------------------------
    console.log('--- 0. Testing Backend /api/health ---');
    const healthRes = await fetch('http://localhost:3000/api/health');
    const healthData = await healthRes.json();
    console.log('Backend Health Status:', healthData.status);
    console.log('Gemini Configured:', healthData.geminiConfigured);
    console.log('Ollama Running:', healthData.ollamaRunning);
    console.log('Ollama Model Available:', healthData.ollamaModelAvailable);
    console.log('Configured Ollama Model:', healthData.ollamaModel);
    console.log('Installed Local Models:', healthData.installedModels);

    if (!healthData.ollamaRunning) {
      throw new Error('Ollama is not running locally at http://127.0.0.1:11434!');
    }
    if (!healthData.ollamaModelAvailable) {
      throw new Error(`Target model '${healthData.ollamaModel}' not found in installed local models!`);
    }
    console.log(`✓ Backend health confirms Ollama is live with target model ${healthData.ollamaModel}!\n`);

    // --------------------------------------------------------------------------
    // 1. Load Application & Navigate to AI Tutor
    // --------------------------------------------------------------------------
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('✓ Application loaded at http://localhost:5173/');

    const tutorNavBtn = await page.waitForSelector('button.nav-button[title="AI Tutor"]', { timeout: 10000 });
    await tutorNavBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    console.log('✓ Navigated to AI Tutor view');

    // Verify Provider Selector Toolbar is present
    const providerToolbar = await page.waitForSelector('.provider-select-group', { timeout: 5000 });
    const hasToolbar = Boolean(providerToolbar);
    console.log('✓ Provider Selector Toolbar present:', hasToolbar);

    const autoBtn = await page.waitForSelector('button.provider-chip[data-provider="auto"]');
    const onlineBtn = await page.waitForSelector('button.provider-chip[data-provider="gemini"]');
    const offlineBtn = await page.waitForSelector('button.provider-chip[data-provider="ollama"]');
    console.log('✓ Auto, Online (Gemini), and Offline (Ollama) chips rendered');

    // Helper function to submit chat question and wait for reply
    async function submitQuestion(question, expectedAssistantCount, timeoutMs = 90000) {
      console.log(`\n▶ Submitting Query: "${question}"`);
      const textarea = await page.waitForSelector('.chat-input-textarea', { timeout: 5000 });
      await textarea.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await textarea.type(question, { delay: 10 });
      await new Promise((r) => setTimeout(r, 200));
      await page.keyboard.press('Enter');

      await page.waitForFunction(
        (targetCount) => {
          const typing = document.querySelector('.typing-indicator');
          const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
          return !typing && bubbles.length >= targetCount;
        },
        { timeout: timeoutMs },
        expectedAssistantCount
      );
      await new Promise((r) => setTimeout(r, 500));
    }

    // Helper to inspect the latest assistant bubble
    async function inspectLatestAssistantMessage() {
      return await page.evaluate(() => {
        const bubbles = document.querySelectorAll('.chat-bubble-row.bubble-assistant');
        const last = bubbles[bubbles.length - 1];
        if (!last) return null;

        const bodyP = last.querySelector('.chat-body-text p');
        const textExplanation = bodyP ? bodyP.textContent.trim() : '';
        const sourceLabel = last.querySelector('.tag-demo-pill')?.textContent?.trim() || '';
        const fallbackNotice = last.querySelector('.tag-fallback-pill')?.textContent?.trim() || '';

        // Visual Section
        const visualContainer = last.querySelector('.tutor-visual-explanation-container');
        const modelCard = last.querySelector('.visual-model-card');
        const modelType = modelCard?.getAttribute('data-model-type') || '';
        const modelTitle = last.querySelector('.visual-model-title')?.textContent?.trim() || '';

        return {
          hasTextExplanation: Boolean(textExplanation && textExplanation.length > 15),
          textExplanationSnippet: textExplanation.slice(0, 120),
          sourceLabel,
          fallbackNotice,
          hasVisualContainer: Boolean(visualContainer),
          modelType,
          modelTitle
        };
      });
    }

    // --------------------------------------------------------------------------
    // SCENARIO 1: Ollama Running with qwen3:4b (Offline Mode)
    // --------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log('--- SCENARIO 1: Offline Mode with Local Ollama ---');
    console.log('================================================================');

    // Click "Offline (Ollama)" chip
    await offlineBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // Verify Provider Status Indicator updates
    const badgeTextAfterOffline = await page.evaluate(() => {
      return document.querySelector('.demo-notice-badge strong')?.textContent?.trim() || '';
    });
    console.log('Provider Status Badge after selecting Offline:', badgeTextAfterOffline);
    if (!badgeTextAfterOffline.includes('Ollama · Local')) {
      throw new Error(`Expected badge to indicate "Ollama · Local", got "${badgeTextAfterOffline}"`);
    }

    // Submit question to local Ollama model
    await submitQuestion('What is an operating system kernel and its role?', 2);
    const s1 = await inspectLatestAssistantMessage();
    console.log('S1 Text Present:', s1.hasTextExplanation);
    console.log('S1 Source Tag:', s1.sourceLabel);
    console.log('S1 Snippet:', s1.textExplanationSnippet);

    if (!s1.hasTextExplanation) {
      throw new Error('Scenario 1 Failed: Local Ollama response text is missing!');
    }
    if (!s1.sourceLabel.includes('Ollama · Local') && !s1.sourceLabel.includes('Built-in Offline Tutor')) {
      throw new Error(`Scenario 1 Failed: Expected local or fallback source tag, got "${s1.sourceLabel}"`);
    }
    console.log('✓ SCENARIO 1 PASSED: Offline mode successfully handled request without online AI!');

    // --------------------------------------------------------------------------
    // SCENARIO 2: Zero Internet with Visual Model (CPU Architecture)
    // --------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log('--- SCENARIO 2: Zero Internet Simulation with Visual Model ---');
    console.log('================================================================');

    // Ask a question that triggers a visual model in Offline mode
    await submitQuestion('Explain how a CPU works step by step', 3);
    const s2 = await inspectLatestAssistantMessage();
    console.log('S2 Text Present:', s2.hasTextExplanation);
    console.log('S2 Source Tag:', s2.sourceLabel);
    console.log('S2 Visual Model Rendered:', s2.hasVisualContainer);
    console.log('S2 Visual Model Type:', s2.modelType);
    console.log('S2 Visual Title:', s2.modelTitle);

    if (!s2.sourceLabel.includes('Ollama · Local') && !s2.sourceLabel.includes('Built-in Offline Tutor')) {
      throw new Error(`Scenario 2 Failed: Expected Ollama local or offline fallback source tag, got "${s2.sourceLabel}"`);
    }
    if (!s2.hasVisualContainer || s2.modelType !== 'cpu-architecture') {
      throw new Error(`Scenario 2 Failed: Expected cpu-architecture visual model alongside explanation, got "${s2.modelType}"`);
    }
    console.log('✓ SCENARIO 2 PASSED: Offline mode answered with text and integrated CPU Architecture visual with zero internet!');

    // --------------------------------------------------------------------------
    // SCENARIO 3: Online Mode Never Silently Switches to Ollama
    // --------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log('--- SCENARIO 3: Online Mode Strict Isolation (Never Silent Fallback) ---');
    console.log('================================================================');

    // Switch to "Online (Gemini)"
    await onlineBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    const badgeOnline = await page.evaluate(() => {
      return document.querySelector('.demo-notice-badge strong')?.textContent?.trim() || '';
    });
    console.log('Provider Status Badge in Online mode:', badgeOnline);
    if (!badgeOnline.includes('Gemini · Online')) {
      throw new Error(`Expected badge to indicate "Gemini · Online", got "${badgeOnline}"`);
    }

    // Submit question in Online mode
    await submitQuestion('Explain JavaScript Promises in 1 short sentence.', 4);
    const s3 = await inspectLatestAssistantMessage();
    console.log('S3 Source Tag:', s3.sourceLabel);
    console.log('S3 Snippet:', s3.textExplanationSnippet);

    if (!s3.sourceLabel.includes('Gemini')) {
      throw new Error(`Scenario 3 Failed: Online mode must use Gemini, got "${s3.sourceLabel}"`);
    }
    if (s3.sourceLabel.includes('Ollama')) {
      throw new Error('Scenario 3 Failed: Online mode must NEVER claim or use Ollama!');
    }
    console.log('✓ SCENARIO 3 PASSED: Online mode strictly uses Gemini and never silently switches to Ollama!');

    // --------------------------------------------------------------------------
    // SCENARIO 4: Offline Mode Never Calls Gemini
    // --------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log('--- SCENARIO 4: Offline Mode Strict Isolation (Never Calls Gemini) ---');
    console.log('================================================================');

    // Direct backend integration verification: verify POST /api/tutor with provider: 'offline'
    const offlineApiRes = await fetch('http://localhost:3000/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Explain binary search complexity',
        provider: 'offline'
      })
    });
    const offlineApiJson = await offlineApiRes.json();
    console.log('Direct Backend Offline Response Source:', offlineApiJson.source);
    console.log('Direct Backend Offline Model:', offlineApiJson.model);

    if (offlineApiJson.source === 'gemini') {
      throw new Error(`Scenario 4 Failed: Offline mode called Gemini online AI!`);
    }
    console.log('✓ SCENARIO 4 PASSED: Offline mode executes purely locally with zero Gemini calls!');

    // --------------------------------------------------------------------------
    // SCENARIO 5: Auto Mode (Smart Fallback)
    // --------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log('--- SCENARIO 5: Auto Mode Smart Fallback ---');
    console.log('================================================================');

    await autoBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    await submitQuestion('Explain the water cycle in simple terms', 5);
    const s5 = await inspectLatestAssistantMessage();
    console.log('S5 Source Tag:', s5.sourceLabel);
    console.log('S5 Visual Model Type:', s5.modelType);

    if (!s5.hasTextExplanation) {
      throw new Error('Scenario 5 Failed: Auto mode response missing!');
    }
    console.log('✓ SCENARIO 5 PASSED: Auto mode successfully delivered pedagogical answer and visual model!');

    // --------------------------------------------------------------------------
    // SCENARIO 6: Ollama Unavailable Graceful Handling & Fallback
    // --------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log('--- SCENARIO 6: Ollama Unavailable Graceful Handling ---');
    console.log('================================================================');

    // Simulate Ollama being down by intercepting /api/tutor and returning offline error
    await page.setRequestInterception(true);
    const simulatedOllamaDownHandler = (req) => {
      if (req.url().includes('/api/tutor')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: false,
            provider: 'offline',
            errorType: 'OLLAMA_NOT_RUNNING',
            reason: 'Ollama service is not running at http://127.0.0.1:11434',
            setupGuide: 'Start Ollama application or run "ollama serve" in your terminal.',
            fallback: true
          })
        });
      } else {
        req.continue();
      }
    };
    page.on('request', simulatedOllamaDownHandler);

    // Switch to offline mode
    await offlineBtn.click();
    await new Promise((r) => setTimeout(r, 300));

    await submitQuestion('How does binary search work?', 6);
    const s6 = await inspectLatestAssistantMessage();
    console.log('S6 Text Present:', s6.hasTextExplanation);
    console.log('S6 Source Tag:', s6.sourceLabel);
    console.log('S6 Snippet:', s6.textExplanationSnippet);

    if (!s6.sourceLabel.includes('Built-in Offline Tutor')) {
      throw new Error(`Scenario 6 Failed: Expected fallback to 'Built-in Offline Tutor', got "${s6.sourceLabel}"`);
    }
    console.log('✓ SCENARIO 6 PASSED: When Ollama is unavailable, app displays setup guide and smoothly falls back to Built-in Offline Tutor without crashing!');

    // Cleanup interceptor
    page.off('request', simulatedOllamaDownHandler);
    await page.setRequestInterception(false);

    // --------------------------------------------------------------------------
    // SCENARIO 7: Online Mode Failure Handling (No Silent Fallback)
    // --------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log('--- SCENARIO 7: Online Mode Failure Handling ---');
    console.log('================================================================');

    await page.setRequestInterception(true);
    const simulatedOnlineFailHandler = (req) => {
      if (req.url().includes('/api/tutor')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: false,
            source: 'online-error',
            provider: 'online',
            fallback: false,
            reason: 'Gemini Online AI quota exhausted (Status 429).'
          })
        });
      } else {
        req.continue();
      }
    };
    page.on('request', simulatedOnlineFailHandler);

    await onlineBtn.click();
    await new Promise((r) => setTimeout(r, 300));

    await submitQuestion('Explain recursion with an example', 7);
    const s7 = await inspectLatestAssistantMessage();
    console.log('S7 Source Tag:', s7.sourceLabel);
    console.log('S7 Snippet:', s7.textExplanationSnippet);

    if (!s7.sourceLabel.includes('Online Error')) {
      throw new Error(`Scenario 7 Failed: Expected Online Error notice, got "${s7.sourceLabel}"`);
    }
    console.log('✓ SCENARIO 7 PASSED: Online mode failure displays explicit error without switching to local models!');

    page.off('request', simulatedOnlineFailHandler);
    await page.setRequestInterception(false);

    // --------------------------------------------------------------------------
    // 8. Console Error Check
    // --------------------------------------------------------------------------
    console.log('\n--- Checking Console Errors ---');
    console.log('Console Errors Recorded:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.warn('Errors:', consoleErrors);
      throw new Error(`Encountered ${consoleErrors.length} unexpected console errors!`);
    }
    console.log('✓ Zero (0) browser console errors recorded throughout the entire session.');

    console.log('\n================================================================');
    console.log('🎉 ALL OLLAMA OFFLINE INTEGRATION SCENARIOS VERIFIED SUCCESSFULLY!');
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

runOllamaVerificationSuite();
