import puppeteer from 'puppeteer';

async function verifyStage1() {
  console.log('🚀 Verifying SMART BRIDGE Stage 1 (Vite + React + TypeScript)...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('  [BROWSER CONSOLE ERROR]', msg.text());
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    console.log('  [PAGE ERROR]', err.message);
    errors.push(err.message);
  });

  // 1. Load app
  console.log('1. Loading http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  // 2. Check Dashboard
  console.log('2. Checking Dashboard View...');
  const heading = await page.$eval('.hero-heading', (el) => el.textContent);
  console.log(`   Found Dashboard heading: "${heading}"`);
  const statCardsCount = await page.$$eval('.stat-card', (cards) => cards.length);
  console.log(`   Found ${statCardsCount} Stat Metric Cards.`);
  if (statCardsCount !== 4) throw new Error('Expected 4 stat cards');

  // 3. Test Sidebar Navigation to AI Tutor
  console.log('3. Navigating to AI Tutor...');
  await page.click('button[title="AI Tutor"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.waitForSelector('.chat-interface-panel');
  await page.type('.chat-input-textarea', 'Explain React useEffect dependency array pitfalls');
  await page.click('.chat-form-actions button[type="submit"]');
  await new Promise((r) => setTimeout(r, 800));
  const bubbles = await page.$$eval('.chat-bubble-row', (rows) => rows.length);
  console.log(`   Chat thread active with ${bubbles} messages.`);
  if (bubbles < 2) throw new Error('AI Tutor did not respond');

  // 4. Test Notes Generator
  console.log('4. Navigating to Notes Generator...');
  await page.click('button[title="Notes Generator"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.waitForSelector('#notes-topic');
  await page.click('.btn-preset-pill');
  await page.click('.builder-footer-row .btn-primary');
  await new Promise((r) => setTimeout(r, 700));
  const noteTitle = await page.$eval('.notes-sheet-title', (el) => el.textContent);
  console.log(`   Generated note title: "${noteTitle}"`);

  // 5. Test Quiz & Practice
  console.log('5. Navigating to Quiz & Practice...');
  await page.click('button[title="Quiz & Practice"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.waitForSelector('.quiz-question-title');
  const qTitle = await page.$eval('.quiz-question-title', (el) => el.textContent);
  console.log(`   Quiz Question 1: "${qTitle.slice(0, 45)}..."`);

  // Click Option C (correct index 2)
  const options = await page.$$('.quiz-option-button');
  if (options.length > 2) {
    await options[2].click();
    await new Promise((r) => setTimeout(r, 400));
    const rationale = await page.$eval('.quiz-rationale-box', (el) => el.textContent);
    console.log(`   Feedback displayed: "${rationale.slice(0, 45)}..."`);
  }

  // 6. Test Smart Revision
  console.log('6. Navigating to Smart Revision...');
  await page.click('button[title="Smart Revision"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.waitForSelector('.interactive-flip-card');

  // Toggle flashcard flip
  await page.click('.interactive-flip-card');
  await new Promise((r) => setTimeout(r, 300));
  const isFlipped = await page.$eval('.interactive-flip-card', (el) => el.classList.contains('flipped'));
  console.log(`   Flashcard successfully flipped: ${isFlipped}`);

  // Toggle a task checkbox
  const firstCheckbox = await page.$('.task-checkbox');
  if (firstCheckbox) {
    await firstCheckbox.click();
    console.log('   Toggled task completion checkbox.');
  }

  // 7. Test Learning Analytics
  console.log('7. Navigating to Learning Analytics...');
  await page.click('button[title="Learning Analytics"]');
  await new Promise((r) => setTimeout(r, 400));
  const masteryRows = await page.$$eval('.mastery-item-row', (rows) => rows.length);
  console.log(`   Found ${masteryRows} skill mastery bars.`);

  // 8. Test Career Navigator
  console.log('8. Navigating to Career Navigator...');
  await page.click('button[title="Career Navigator"]');
  await new Promise((r) => setTimeout(r, 400));
  const pathways = await page.$$eval('.career-pathway-card', (cards) => cards.length);
  console.log(`   Found ${pathways} career pathways.`);

  // 9. Test Settings
  console.log('9. Navigating to Settings...');
  await page.click('button[title="Settings"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.click('.settings-form button[type="submit"]');
  await new Promise((r) => setTimeout(r, 300));

  // 10. Test Mobile Viewport & Sidebar Collapse
  console.log('10. Testing Mobile Viewport (375x667)...');
  await page.setViewport({ width: 375, height: 667 });
  await new Promise((r) => setTimeout(r, 300));
  await page.click('.mobile-menu-trigger');
  await new Promise((r) => setTimeout(r, 400));
  const mobileOpen = await page.$eval('.app-sidebar', (el) => el.classList.contains('mobile-open'));
  console.log(`   Mobile sidebar drawer open: ${mobileOpen}`);

  await browser.close();

  if (errors.length > 0) {
    throw new Error(`Encountered ${errors.length} browser errors during verification.`);
  }

  console.log('🎉 Stage 1 verification completed with 100% success! Zero errors.');
}

verifyStage1().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
