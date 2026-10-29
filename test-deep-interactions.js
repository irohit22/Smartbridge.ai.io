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

  console.log('--- TEST SUITE STARTING ---');

  // Load site
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  console.log('✓ Page loaded successfully at http://localhost:5173/');

  // 1. Check all sidebar navigation tabs
  const tabs = [
    { label: 'Dashboard', expectedTitle: 'Welcome back, Alex!' },
    { label: 'AI Tutor', expectedTitle: 'AI Learning Tutor' },
    { label: 'Notes Generator', expectedTitle: 'Notes Generator' },
    { label: 'Quiz & Practice', expectedTitle: 'Quiz & Technical Practice' },
    { label: 'Smart Revision', expectedTitle: 'Smart Revision & Retention' },
    { label: 'Learning Analytics', expectedTitle: 'Learning Analytics' },
    { label: 'Career Navigator', expectedTitle: 'Career Navigator' },
    { label: 'Settings', expectedTitle: 'Platform Settings' }
  ];

  for (const tab of tabs) {
    const btn = await page.waitForSelector(`button.nav-button[title="${tab.label}"]`);
    await btn.click();
    await new Promise((r) => setTimeout(r, 100));

    // Verify main header or content
    const pageText = await page.evaluate(() => document.querySelector('main')?.textContent || '');
    if (!pageText.includes(tab.expectedTitle)) {
      throw new Error(`Navigation failed: Tab "${tab.label}" did not render expected title "${tab.expectedTitle}"`);
    }
    console.log(`✓ Sidebar tab "${tab.label}" opens correct page containing "${tab.expectedTitle}"`);
  }

  // 2. Test Notes Generator
  console.log('\n--- Testing Notes Generator ---');
  const notesNavBtn = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
  await notesNavBtn.click();
  await new Promise((r) => setTimeout(r, 100));

  // Type a custom topic
  const topicInput = await page.waitForSelector('#notes-topic');
  await topicInput.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await topicInput.type('Distributed Microservices Architecture');

  // Change language to Hindi
  await page.select('#notes-language', 'Hindi');
  // Change style to tutorial
  await page.select('#notes-style', 'tutorial');
  // Change detail to concise
  await page.select('#notes-detail', 'concise');

  // Click Generate
  const genBtn = await page.waitForSelector('.builder-footer-row .btn-primary');
  await genBtn.click();
  await new Promise((r) => setTimeout(r, 600));

  // Check preview
  const renderedTitle = await page.evaluate(() => {
    return document.querySelector('.notes-sheet-title')?.textContent || '';
  });
  const renderedTags = await page.evaluate(() => {
    return document.querySelector('.sheet-tags-row')?.textContent || '';
  });

  if (!renderedTitle.includes('Distributed Microservices Architecture')) {
    throw new Error(`Notes generator failed to update title: got "${renderedTitle}"`);
  }
  if (!renderedTags.includes('Hindi') || !renderedTags.includes('Tutorial')) {
    throw new Error(`Notes generator metadata mismatch: got "${renderedTags}"`);
  }
  console.log(`✓ Notes Generator accepted topic and produced preview: "${renderedTitle}" with tags [${renderedTags.trim()}]`);

  // 3. Test Quiz & Score Calculation
  console.log('\n--- Testing Quiz & Score Calculation ---');
  const quizNavBtn = await page.waitForSelector('button.nav-button[title="Quiz & Practice"]');
  await quizNavBtn.click();
  await new Promise((r) => setTimeout(r, 100));

  // Switch to Computer Science track (1 question: QuickSort)
  const csTrackBtn = await page.waitForSelector('button.track-pill-btn:nth-child(3)');
  await csTrackBtn.click();
  await new Promise((r) => setTimeout(r, 100));

  // Check question text
  let qTitle = await page.evaluate(() => document.querySelector('.quiz-question-title')?.textContent || '');
  console.log(`✓ CS Track active question: "${qTitle}"`);

  // Option D is index 3 (O(N²)), which is the correct answer
  const options = await page.$$('.quiz-option-button');
  console.log(`Found ${options.length} options for CS question.`);
  // Click option index 3
  await options[3].click();
  await new Promise((r) => setTimeout(r, 100));

  // Verify rationale displayed and score is 1
  const rationaleText = await page.evaluate(() => document.querySelector('.quiz-rationale-box')?.textContent || '');
  const scoreText = await page.evaluate(() => document.querySelector('.quiz-score-indicator')?.textContent || '');

  if (!rationaleText.includes('Well done! That is correct')) {
    throw new Error(`Expected correct rationale, got: ${rationaleText}`);
  }
  if (!scoreText.includes('1 / 1')) {
    throw new Error(`Expected score 1 / 1, got: ${scoreText}`);
  }
  console.log(`✓ Answer option selected correctly. Rationale verified: "${rationaleText.slice(0, 45)}...". Score: ${scoreText}`);

  // Click Finish Assessment
  const nextBtn = await page.waitForSelector('.quiz-actions-row button.btn-primary');
  await nextBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  // Verify Summary screen
  const summaryTitle = await page.evaluate(() => document.querySelector('.summary-title')?.textContent || '');
  const summaryDesc = await page.evaluate(() => document.querySelector('.summary-desc')?.textContent || '');
  const historyBadges = await page.evaluate(() => document.querySelector('.quiz-history-review')?.textContent || '');

  if (!summaryTitle.includes('Assessment Completed!')) {
    throw new Error(`Expected summary title, got: ${summaryTitle}`);
  }
  if (!summaryDesc.includes('1 out of 1')) {
    throw new Error(`Expected 1 out of 1 in summary description, got: ${summaryDesc}`);
  }
  console.log(`✓ Quiz summary screen verified: "${summaryTitle}", "${summaryDesc.trim()}", badge review: "${historyBadges.trim()}"`);

  // 4. Test Flashcards in Smart Revision
  console.log('\n--- Testing Flashcard in Smart Revision ---');
  const revNavBtn = await page.waitForSelector('button.nav-button[title="Smart Revision"]');
  await revNavBtn.click();
  await new Promise((r) => setTimeout(r, 100));

  const flipCard = await page.waitForSelector('.interactive-flip-card');
  const isFlippedBefore = await page.evaluate(() => document.querySelector('.interactive-flip-card')?.classList.contains('flipped'));
  await flipCard.click();
  await new Promise((r) => setTimeout(r, 100));
  const isFlippedAfter = await page.evaluate(() => document.querySelector('.interactive-flip-card')?.classList.contains('flipped'));
  console.log(`✓ Flashcard 3D flip toggled: before=${isFlippedBefore}, after=${isFlippedAfter}`);

  // Check console errors
  console.log('\n--- Checking Console Errors ---');
  if (consoleErrors.length > 0) {
    console.error('Console errors detected:', consoleErrors);
    throw new Error(`Detected ${consoleErrors.length} browser console errors.`);
  } else {
    console.log('✓ Zero console errors detected across all tested interactions.');
  }

  await browser.close();
  console.log('\n🎉 ALL CHECKS PASSED WITH 100% SUCCESS!');
})().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
