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

  console.log('=== STARTING FRESH QUIZ GENERATION VERIFICATION SUITE ===\n');

  // Load app
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  console.log('✓ Initial page loaded at http://localhost:5173/');

  // Clean test setup
  await page.evaluate(() => {
    localStorage.clear();
  });

  // Navigate to Quiz & Practice
  const quizNav = await page.waitForSelector('button.nav-button[title="Quiz & Practice"]');
  await quizNav.click();
  await new Promise((r) => setTimeout(r, 200));

  // Switch to Custom Quiz mode tab
  const customTabBtn = await page.waitForSelector('#tab-custom-quiz');
  await customTabBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  // --------------------------------------------------------------------------
  // TEST 1: 3 Consecutive Quiz Generations for Same Topic - No Repeats
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 1: 3 Consecutive Quiz Generations on Same Topic (Zero Unwanted Repetition) ---');

  // Choose Topic "react" with count 5
  await page.select('#custom-topic-select', 'react');
  await new Promise((r) => setTimeout(r, 100));

  // ATTEMPT 1: Generate Quiz 1 (5 questions)
  const startBtn = await page.waitForSelector('#btn-start-custom-quiz');
  await startBtn.click();
  await new Promise((r) => setTimeout(r, 300));

  const attempt1Questions = [];
  for (let i = 0; i < 5; i++) {
    const qText = await page.$eval('.quiz-question-title', (el) => el.textContent.trim());
    attempt1Questions.push(qText);

    // Click an option to answer
    const opts = await page.$$('.custom-quiz-option-button');
    if (opts.length >= 1) await opts[0].click();

    if (i < 4) {
      await page.click('.btn-quiz-next');
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  // Verify internal uniqueness within Attempt 1
  const uniqueAttempt1 = new Set(attempt1Questions);
  if (uniqueAttempt1.size !== 5) {
    throw new Error(`Test 1 Failed: Attempt 1 contains duplicate questions! Unique: ${uniqueAttempt1.size}/5`);
  }
  console.log('✓ Attempt 1 generated 5 unique questions:');
  attempt1Questions.forEach((q, idx) => console.log(`   Q${idx + 1}: "${q.slice(0, 55)}..."`));

  // Submit Attempt 1 to reach results
  await page.click('.btn-quiz-review');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('#btn-confirm-submit');
  await new Promise((r) => setTimeout(r, 300));

  // ATTEMPT 2: Click "Fresh Quiz (New Questions)"
  const freshBtn1 = await page.waitForSelector('.btn-fresh-custom-quiz');
  await freshBtn1.click();
  await new Promise((r) => setTimeout(r, 300));

  const attempt2Questions = [];
  for (let i = 0; i < 5; i++) {
    const qText = await page.$eval('.quiz-question-title', (el) => el.textContent.trim());
    attempt2Questions.push(qText);

    const opts = await page.$$('.custom-quiz-option-button');
    if (opts.length >= 1) await opts[0].click();

    if (i < 4) {
      await page.click('.btn-quiz-next');
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  const uniqueAttempt2 = new Set(attempt2Questions);
  if (uniqueAttempt2.size !== 5) {
    throw new Error(`Test 1 Failed: Attempt 2 contains duplicate questions! Unique: ${uniqueAttempt2.size}/5`);
  }
  console.log('✓ Attempt 2 generated 5 unique questions:');
  attempt2Questions.forEach((q, idx) => console.log(`   Q${idx + 1}: "${q.slice(0, 55)}..."`));

  // Verify Attempt 1 and Attempt 2 have zero overlap
  const overlap1and2 = attempt1Questions.filter((q) => attempt2Questions.includes(q));
  if (overlap1and2.length > 0) {
    throw new Error(`Test 1 Failed: Attempt 1 and Attempt 2 overlap by ${overlap1and2.length} questions! Overlap: ${overlap1and2[0]}`);
  }
  console.log('✓ Attempt 2 shares ZERO overlap with Attempt 1 (100% fresh questions across attempts)');

  // Submit Attempt 2
  await page.click('.btn-quiz-review');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('#btn-confirm-submit');
  await new Promise((r) => setTimeout(r, 300));

  // ATTEMPT 3: Click "Fresh Quiz (New Questions)" again
  const freshBtn2 = await page.waitForSelector('.btn-fresh-custom-quiz');
  await freshBtn2.click();
  await new Promise((r) => setTimeout(r, 300));

  const attempt3Questions = [];
  for (let i = 0; i < 5; i++) {
    const qText = await page.$eval('.quiz-question-title', (el) => el.textContent.trim());
    attempt3Questions.push(qText);

    const opts = await page.$$('.custom-quiz-option-button');
    if (opts.length >= 1) await opts[0].click();

    if (i < 4) {
      await page.click('.btn-quiz-next');
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  const uniqueAttempt3 = new Set(attempt3Questions);
  if (uniqueAttempt3.size !== 5) {
    throw new Error(`Test 1 Failed: Attempt 3 contains duplicate questions! Unique: ${uniqueAttempt3.size}/5`);
  }
  console.log('✓ Attempt 3 generated 5 unique questions:');
  attempt3Questions.forEach((q, idx) => console.log(`   Q${idx + 1}: "${q.slice(0, 55)}..."`));

  // Verify Attempt 3 has zero overlap with Attempt 1 or Attempt 2
  const overlapWithPrev = attempt3Questions.filter(
    (q) => attempt1Questions.includes(q) || attempt2Questions.includes(q)
  );
  if (overlapWithPrev.length > 0) {
    throw new Error(`Test 1 Failed: Attempt 3 overlapped with previous attempts! Overlap: ${overlapWithPrev[0]}`);
  }
  console.log('✓ Attempt 3 shares ZERO overlap with Attempt 1 or 2 (15 totally distinct questions across 3 consecutive quizzes)!');

  // Submit Attempt 3
  await page.click('.btn-quiz-review');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('#btn-confirm-submit');
  await new Promise((r) => setTimeout(r, 300));

  // --------------------------------------------------------------------------
  // TEST 2: Page Refresh & Persistence of Seen Question Tracker
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Page Refresh & Persistence of Seen Tracker ---');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 200));

  const quizNavAfterReload = await page.waitForSelector('button.nav-button[title="Quiz & Practice"]');
  await quizNavAfterReload.click();
  await new Promise((r) => setTimeout(r, 200));

  const customTabAfterReload = await page.waitForSelector('#tab-custom-quiz');
  await customTabAfterReload.click();
  await new Promise((r) => setTimeout(r, 200));

  // Check persistent storage in browser
  const seenTrackerCount = await page.evaluate(() => {
    const raw = localStorage.getItem('smartbridge_seen_quiz_questions_v2');
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  });

  if (seenTrackerCount < 15) {
    throw new Error(`Test 2 Failed: Expected at least 15 seen questions tracked in localStorage, got ${seenTrackerCount}`);
  }
  console.log(`✓ TEST 2 PASSED: Persistent seen questions tracker accurately retained ${seenTrackerCount} questions across page reload.`);

  // --------------------------------------------------------------------------
  // TEST 3: Retake This Quiz vs Fresh Quiz State Distinction
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Retake This Quiz Preserves Questions for Active Recall ---');
  // Start a fresh quiz
  await page.click('#btn-start-custom-quiz');
  await new Promise((r) => setTimeout(r, 300));

  const q1TextBeforeRetake = await page.$eval('.quiz-question-title', (el) => el.textContent.trim());

  // Answer Q1 through Q5 and submit
  for (let i = 0; i < 5; i++) {
    const opts = await page.$$('.custom-quiz-option-button');
    if (opts.length >= 1) await opts[0].click();
    if (i < 4) {
      await page.click('.btn-quiz-next');
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  await page.click('.btn-quiz-review');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('#btn-confirm-submit');
  await new Promise((r) => setTimeout(r, 300));

  // Click "Retake This Quiz" (active recall)
  const retakeBtn = await page.waitForSelector('.btn-retake-custom');
  await retakeBtn.click();
  await new Promise((r) => setTimeout(r, 300));

  const q1TextAfterRetake = await page.$eval('.quiz-question-title', (el) => el.textContent.trim());
  if (q1TextBeforeRetake !== q1TextAfterRetake) {
    throw new Error(`Test 3 Failed: Retake should preserve the exact same question set for mistake practice!`);
  }
  console.log('✓ TEST 3 PASSED: "Retake This Quiz" correctly preserves the same question set for targeted revision.');

  // Return to setup
  for (let i = 0; i < 5; i++) {
    const opts = await page.$$('.custom-quiz-option-button');
    if (opts.length >= 1) await opts[0].click();
    if (i < 4) {
      await page.click('.btn-quiz-next');
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  await page.click('.btn-quiz-review');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('#btn-confirm-submit');
  await new Promise((r) => setTimeout(r, 300));

  await page.click('.btn-new-custom-setup');
  await new Promise((r) => setTimeout(r, 200));

  // --------------------------------------------------------------------------
  // TEST 4: Transparent Question Pool Exhaustion & Tracker Reset
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Transparent Question Pool Exhaustion & Reset Action ---');

  // Select SQL Hard (which has a capped local pool of 5 questions in total)
  await page.select('#custom-topic-select', 'sql');
  const hardBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('.pill-toggle-group[aria-label="Difficulty Filter"] .pill-option-btn'));
    return btns.find((b) => b.textContent.trim() === 'Hard');
  });
  await hardBtn.click();
  await new Promise((r) => setTimeout(r, 100));

  // Mark all SQL questions as seen in storage to simulate pool exhaustion
  await page.evaluate(() => {
    const dummySeen = [
      { id: 'sql-5', normalizedText: 'which isolation level prevents phantom reads', topic: 'SQL & Database Systems', seenCount: 1, lastSeenAt: new Date().toISOString() },
      { id: 'sql-6', normalizedText: 'explain b tree leaf node structure', topic: 'SQL & Database Systems', seenCount: 1, lastSeenAt: new Date().toISOString() },
      { id: 'sql-exp-11', normalizedText: 'in the ansi sql transaction isolation hierarchy', topic: 'SQL & Database Systems', seenCount: 1, lastSeenAt: new Date().toISOString() },
      { id: 'sql-exp-12', normalizedText: 'given a composite index on department id', topic: 'SQL & Database Systems', seenCount: 1, lastSeenAt: new Date().toISOString() },
      { id: 'sql-exp-13', normalizedText: 'when analyzing a query with explain analyze', topic: 'SQL & Database Systems', seenCount: 1, lastSeenAt: new Date().toISOString() },
      { id: 'sql-exp-14', normalizedText: 'what is the purpose of appending for update', topic: 'SQL & Database Systems', seenCount: 1, lastSeenAt: new Date().toISOString() },
      { id: 'sql-exp-15', normalizedText: 'what is the primary condition required for a relational database schema to satisfy third normal form', topic: 'SQL & Database Systems', seenCount: 1, lastSeenAt: new Date().toISOString() }
    ];
    localStorage.setItem('smartbridge_seen_quiz_questions_v2', JSON.stringify(dummySeen));
    localStorage.setItem('smartbridge_recent_quiz_q_ids_v1', JSON.stringify(dummySeen.map(d => d.id)));
  });

  // Start Custom Quiz on exhausted topic
  await page.click('#btn-start-custom-quiz');
  await new Promise((r) => setTimeout(r, 300));

  // Verify the exhaustion banner is present in UI
  const exhaustionNotice = await page.waitForSelector('.quiz-exhaustion-notice');
  const noticeText = await page.evaluate((el) => el.textContent, exhaustionNotice);
  console.log(`✓ Exhaustion banner detected: "${noticeText.replace(/\s+/g, ' ').trim()}"`);

  if (!noticeText.includes('Exhausted') && !noticeText.includes('explored')) {
    throw new Error('Test 4 Failed: Exhaustion banner did not explain that pool is exhausted!');
  }

  // Click "Reset Tracker"
  const resetBtn = await page.waitForSelector('.quiz-exhaustion-notice .btn-outline');
  await resetBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  const isResetCleared = await page.evaluate(() => {
    const raw = localStorage.getItem('smartbridge_seen_quiz_questions_v2');
    if (!raw) return true;
    const list = JSON.parse(raw);
    return !list.some((e) => e.topic === 'SQL & Database Systems');
  });

  if (!isResetCleared) {
    throw new Error('Test 4 Failed: Reset tracker button did not clear SQL seen records!');
  }
  console.log('✓ TEST 4 PASSED: Question pool exhaustion is transparently reported, and the user can reset tracking cleanly.');

  // --------------------------------------------------------------------------
  // TEST 5: Backend /api/quiz Integration & Validation
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Backend /api/quiz Dynamic Generation ---');
  const apiQuizRes = await fetch('http://localhost:3000/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'CSS & Responsive Design',
      difficulty: 'Medium',
      count: 2,
      excludeQuestions: ['How does setting box-sizing: border-box affect']
    })
  });

  const apiQuizData = await apiQuizRes.json();
  if (!apiQuizData.ok || !Array.isArray(apiQuizData.questions) || apiQuizData.questions.length < 1) {
    throw new Error(`Test 5 Failed: Backend /api/quiz did not return valid questions: ${JSON.stringify(apiQuizData)}`);
  }

  const qSample = apiQuizData.questions[0];
  if (!qSample.question || qSample.options.length !== 4 || qSample.correctAnswerIndex === undefined || !qSample.explanation) {
    throw new Error(`Test 5 Failed: AI generated question does not adhere to required 4-option schema!`);
  }
  console.log(`✓ TEST 5 PASSED: Backend /api/quiz generated ${apiQuizData.questions.length} validated fresh questions (Source: ${apiQuizData.source}).`);
  console.log(`   Sample AI Question: "${qSample.question.slice(0, 60)}..."`);

  // --------------------------------------------------------------------------
  // TEST 6: Console Error Cleanliness
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Browser Console Error Audit ---');
  if (consoleErrors.length > 0) {
    throw new Error(`Test 6 Failed: Browser console errors detected:\n${consoleErrors.join('\n')}`);
  }
  console.log('✓ TEST 6 PASSED: Zero (0) browser console errors recorded throughout the entire test suite.');

  console.log('\n===============================================================');
  console.log('🎉 ALL FRESH QUIZ GENERATION TESTS PASSED (100%)!');
  console.log('===============================================================\n');

  await browser.close();
  process.exit(0);
})().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
  process.exit(1);
});
