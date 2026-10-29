import puppeteer from 'puppeteer';

console.log('=== STARTING SMART BRIDGE PERSONALIZED SKILL VERIFICATION SUITE ===\n');

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

  // =========================================================================
  // TEST 1: First-Time Welcome Screen Verification
  // =========================================================================
  console.log('--- TEST 1: First-Time Welcome Screen ---');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));

  // Check Modal Presence & Content
  const modalVisible = await page.waitForSelector('.skill-welcome-modal-card', { timeout: 5000 });
  if (!modalVisible) {
    throw new Error('Test 1 Failed: Skill Welcome Modal did not appear on first visit!');
  }

  const heading = await page.$eval('.welcome-main-heading', (el) => el.textContent.trim());
  const question = await page.$eval('.welcome-question', (el) => el.textContent.trim());
  const subtitle = await page.$eval('.welcome-subtitle', (el) => el.textContent.trim());

  console.log('Modal Heading:', heading);
  console.log('Modal Question:', question);
  console.log('Modal Subtitle:', subtitle);

  if (!heading.includes('Welcome to SMART BRIDGE')) {
    throw new Error(`Test 1 Failed: Heading mismatch. Expected "Welcome to SMART BRIDGE", got "${heading}"`);
  }
  if (!question.includes('Which skill have you learned so far?')) {
    throw new Error(`Test 1 Failed: Question mismatch. Got "${question}"`);
  }
  if (!subtitle.includes('Tell us what you know, and we’ll help you learn, practice, and grow — one step at a time.')) {
    throw new Error(`Test 1 Failed: Subtitle mismatch. Got "${subtitle}"`);
  }

  // Check all preset pills
  const presetNames = await page.$$eval('.welcome-skill-pill .skill-pill-name', (els) =>
    els.map((e) => e.textContent.trim())
  );
  console.log('Rendered skill pills:', presetNames);

  const expectedPresets = [
    'Python',
    'Java',
    'C / C++',
    'JavaScript',
    'HTML & CSS',
    'SQL',
    'Data Science',
    'Machine Learning',
    'Web Development',
    'Other skill'
  ];

  for (const preset of expectedPresets) {
    if (!presetNames.includes(preset)) {
      throw new Error(`Test 1 Failed: Missing preset pill "${preset}" in welcome modal`);
    }
  }

  // Check custom text input
  const customInput = await page.$('#custom-skill-input');
  if (!customInput) {
    throw new Error('Test 1 Failed: Custom skill text input "#custom-skill-input" not found');
  }

  // Check Start Button
  const startBtn = await page.$eval('.btn-welcome-primary', (el) => el.textContent.trim());
  if (!startBtn.includes('Start My Learning Journey')) {
    throw new Error(`Test 1 Failed: Start button text mismatch. Got "${startBtn}"`);
  }
  console.log('✓ TEST 1 PASSED: Welcome screen displays exact heading, question, subtitle, all 10 presets, custom input, and start button.');

  // =========================================================================
  // TEST 2: Select "Python" & Verify Storage Persistence Across Reload
  // =========================================================================
  console.log('\n--- TEST 2: Select Python & Persistence Across Reload ---');
  // Click on Python pill
  const pythonPill = await page.evaluateHandle(() => {
    const pills = Array.from(document.querySelectorAll('.welcome-skill-pill'));
    return pills.find((p) => p.textContent.includes('Python'));
  });
  await pythonPill.click();
  await new Promise((r) => setTimeout(r, 200));

  // Verify Analogy preview updates
  const previewAnalogy = await page.$eval('.preview-analogy', (el) => el.textContent.trim());
  const previewHinglish = await page.$eval('.preview-hinglish', (el) => el.textContent.trim());
  console.log('Python Analogy Preview:', previewAnalogy);
  console.log('Python Hinglish Preview:', previewHinglish);

  if (!previewAnalogy.includes('pushups') && !previewAnalogy.includes('mixer grinder')) {
    throw new Error(`Test 2 Failed: Analogy preview does not contain pushups/mixer grinder. Got "${previewAnalogy}"`);
  }

  // Click Start My Learning Journey
  const submitBtn = await page.waitForSelector('.btn-welcome-primary');
  await submitBtn.click();
  await new Promise((r) => setTimeout(r, 500));

  // Verify localStorage has smartbridge_user_skill_v1
  const storedProfile = await page.evaluate(() => {
    const raw = localStorage.getItem('smartbridge_user_skill_v1');
    return raw ? JSON.parse(raw) : null;
  });
  console.log('Stored User Skill Profile:', storedProfile);
  if (!storedProfile || storedProfile.primarySkill !== 'Python' || !storedProfile.isFirstTimeCompleted) {
    throw new Error(`Test 2 Failed: localStorage was not saved properly: ${JSON.stringify(storedProfile)}`);
  }

  // Reload page and confirm modal is bypassed
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 300));
  const modalAfterReload = await page.$('.skill-welcome-modal-card');
  if (modalAfterReload) {
    throw new Error('Test 2 Failed: Welcome modal was not bypassed on return visit!');
  }
  console.log('✓ TEST 2 PASSED: "Python" successfully selected, stored under smartbridge_user_skill_v1, and welcome modal bypassed on return visit.');

  // =========================================================================
  // TEST 3: TopNavbar and Dashboard Personalization
  // =========================================================================
  console.log('\n--- TEST 3: TopNavbar and Dashboard Personalization ---');
  // Navbar focus pill
  const navFocusText = await page.$eval('.btn-skill-focus', (el) => el.textContent.trim());
  console.log('TopNavbar Focus Pill:', navFocusText);
  if (!navFocusText.includes('Python') || !navFocusText.includes('Change')) {
    throw new Error(`Test 3 Failed: TopNavbar focus pill mismatch. Got "${navFocusText}"`);
  }

  // Dashboard Personalized Learning Hub Card
  const hubTitle = await page.$eval('.skill-hub-title', (el) => el.textContent.trim());
  const hubAnalogy = await page.$eval('.skill-hub-analogy-text', (el) => el.textContent.trim());
  const hubHinglish = await page.$eval('.skill-hub-hinglish-text', (el) => el.textContent.trim());
  console.log('Dashboard Hub Title:', hubTitle);
  console.log('Dashboard Hub Analogy:', hubAnalogy);
  console.log('Dashboard Hub Hinglish:', hubHinglish);

  if (!hubTitle.includes('Python')) {
    throw new Error(`Test 3 Failed: Dashboard Hub title missing Python. Got "${hubTitle}"`);
  }
  if (!hubAnalogy.includes('pushups') && !hubAnalogy.includes('mixer')) {
    throw new Error(`Test 3 Failed: Dashboard Hub analogy missing pushups/mixer. Got "${hubAnalogy}"`);
  }
  if (!hubHinglish.includes('dabba') && !hubHinglish.includes('pushup') && !hubHinglish.includes('mixer')) {
    throw new Error(`Test 3 Failed: Dashboard Hub Hinglish missing key analogy words. Got "${hubHinglish}"`);
  }
  console.log('✓ TEST 3 PASSED: TopNavbar displays "Focus: Python · Change" and Dashboard renders Personalized Hub with analogies & Hinglish.');

  // =========================================================================
  // TEST 4: AI Tutor Personalization
  // =========================================================================
  console.log('\n--- TEST 4: AI Tutor Personalization ---');
  const tutorNav = await page.waitForSelector('button.nav-button[title="AI Tutor"]');
  await tutorNav.click();
  await new Promise((r) => setTimeout(r, 300));

  // Welcome message mentions Python
  const tutorWelcomeText = await page.$eval('.chat-body-text', (el) => el.textContent.trim());
  console.log('Tutor Welcome text:', tutorWelcomeText);
  if (!tutorWelcomeText.includes('Python')) {
    throw new Error(`Test 4 Failed: Tutor initial message does not introduce Python. Got "${tutorWelcomeText}"`);
  }

  // Prompt chips tailored to Python
  const promptChips = await page.$$eval('.prompt-chip-btn', (els) => els.map((e) => e.textContent.trim()));
  console.log('Tutor Quick Prompt Chips:', promptChips);
  const hasPythonChip = promptChips.some((c) => c.toLowerCase().includes('python'));
  if (!hasPythonChip) {
    throw new Error(`Test 4 Failed: Tutor prompt chips do not contain Python. Got: ${JSON.stringify(promptChips)}`);
  }
  console.log('✓ TEST 4 PASSED: AI Tutor welcomed user to Python and suggested Python-tailored analogy prompt chips.');

  // =========================================================================
  // TEST 5: Notes Generator Personalization
  // =========================================================================
  console.log('\n--- TEST 5: Notes Generator Personalization ---');
  const notesNav = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
  await notesNav.click();
  await new Promise((r) => setTimeout(r, 300));

  const noteTopicVal = await page.$eval('#notes-topic', (el) => el.value);
  const noteSubjectVal = await page.$eval('#notes-subject', (el) => el.value);
  console.log('Notes default topic:', noteTopicVal);
  console.log('Notes default subject:', noteSubjectVal);

  if (!noteTopicVal.toLowerCase().includes('python')) {
    throw new Error(`Test 5 Failed: Default note topic does not feature Python. Got "${noteTopicVal}"`);
  }

  // Quick chips for Python exist
  const noteChips = await page.$$eval('.btn-topic-quick-chip', (els) => els.map((e) => e.textContent.trim()));
  console.log('Notes quick chips:', noteChips);
  if (!noteChips.some((c) => c.toLowerCase().includes('python'))) {
    throw new Error(`Test 5 Failed: Notes quick topic chips missing Python topics. Got: ${JSON.stringify(noteChips)}`);
  }
  console.log('✓ TEST 5 PASSED: Notes Generator defaulted to Python and provided Python quick topic generation chips.');

  // =========================================================================
  // TEST 6: Quiz & Practice Personalization
  // =========================================================================
  console.log('\n--- TEST 6: Quiz Personalization ---');
  const quizNav = await page.waitForSelector('button.nav-button[title="Quiz & Practice"]');
  await quizNav.click();
  await new Promise((r) => setTimeout(r, 300));

  // Custom Quiz setup
  const customTab = await page.waitForSelector('#tab-custom-quiz');
  await customTab.click();
  await new Promise((r) => setTimeout(r, 200));

  const selectedQuizTopic = await page.$eval('#custom-topic-select', (el) => el.value);
  console.log('Quiz setup default topic:', selectedQuizTopic);
  if (selectedQuizTopic !== 'python') {
    throw new Error(`Test 6 Failed: Custom quiz topic did not default to python. Got "${selectedQuizTopic}"`);
  }

  // Generate 3 questions in Python
  const startQuizBtn = await page.waitForSelector('.btn-start-custom-quiz');
  await startQuizBtn.click();
  await new Promise((r) => setTimeout(r, 400));

  const firstQuestionText = await page.$eval('.quiz-question-title', (el) => el.textContent.trim());
  console.log('Python Quiz Q1:', firstQuestionText);
  if (!firstQuestionText.toLowerCase().includes('python') && !firstQuestionText.toLowerCase().includes('variable') && !firstQuestionText.toLowerCase().includes('pushup')) {
    throw new Error(`Test 6 Failed: Generated question is not a Python question! Got "${firstQuestionText}"`);
  }
  console.log('✓ TEST 6 PASSED: Quiz defaulted to Python and generated Python practice questions.');

  // =========================================================================
  // TEST 7: Revision View Personalization
  // =========================================================================
  console.log('\n--- TEST 7: Revision View Personalization ---');
  const revNav = await page.waitForSelector('button.nav-button[title="Smart Revision"]');
  await revNav.click();
  await new Promise((r) => setTimeout(r, 300));

  const flashcardTopic = await page.$eval('.flashcard-topic-tag', (el) => el.textContent.trim());
  const flashcardQuestion = await page.$eval('.face-question-prompt', (el) => el.textContent.trim());
  console.log('Flashcard topic:', flashcardTopic);
  console.log('Flashcard question:', flashcardQuestion);

  if (!flashcardTopic.includes('Python') && !flashcardQuestion.includes('Python')) {
    throw new Error(`Test 7 Failed: Flashcard does not feature Python. Topic: "${flashcardTopic}", Question: "${flashcardQuestion}"`);
  }
  console.log('✓ TEST 7 PASSED: Smart Revision prioritized Python active recall flashcards.');

  // =========================================================================
  // TEST 8: Career Compass Personalization
  // =========================================================================
  console.log('\n--- TEST 8: Career Compass Personalization ---');
  const careerNav = await page.waitForSelector('button.nav-button[title="Career Compass"]');
  await careerNav.click();
  await new Promise((r) => setTimeout(r, 300));

  const careerSkillTags = await page.$$eval('.skill-rating-pill .skill-name', (els) => els.map((e) => e.textContent.trim()));
  console.log('Career skills loaded:', careerSkillTags);
  if (!careerSkillTags.includes('Python')) {
    throw new Error(`Test 8 Failed: Career profile missing Python in skills list. Got: ${JSON.stringify(careerSkillTags)}`);
  }
  console.log('✓ TEST 8 PASSED: Career Compass pre-populated student profile with Python.');

  // =========================================================================
  // TEST 9: "Change My Skill" to Java & Verify Instant Update Everywhere
  // =========================================================================
  console.log('\n--- TEST 9: Change Skill to Java & Dynamic Update ---');
  // Click "Change" in TopNavbar
  const changeBtn = await page.waitForSelector('.btn-skill-focus');
  await changeBtn.click();
  await new Promise((r) => setTimeout(r, 300));

  // Modal appears in change mode
  const modalCard = await page.waitForSelector('.skill-welcome-modal-card');
  if (!modalCard) {
    throw new Error('Test 9 Failed: Skill modal did not open on clicking Change My Skill');
  }

  // Click Java pill
  const javaPill = await page.evaluateHandle(() => {
    const pills = Array.from(document.querySelectorAll('.welcome-skill-pill'));
    return pills.find((p) => p.textContent.includes('Java') && !p.textContent.includes('JavaScript'));
  });
  await javaPill.click();
  await new Promise((r) => setTimeout(r, 200));

  // Click Submit
  const updateBtn = await page.waitForSelector('.btn-welcome-primary');
  await updateBtn.click();
  await new Promise((r) => setTimeout(r, 400));

  // Verify Navbar updated to Java
  const updatedNavText = await page.$eval('.btn-skill-focus', (el) => el.textContent.trim());
  console.log('Updated TopNavbar text:', updatedNavText);
  if (!updatedNavText.includes('Java') || updatedNavText.includes('JavaScript')) {
    throw new Error(`Test 9 Failed: TopNavbar did not update to Java. Got "${updatedNavText}"`);
  }

  // Verify Dashboard updated to Java
  const dashNav = await page.waitForSelector('button.nav-button[title="Dashboard"]');
  await dashNav.click();
  await new Promise((r) => setTimeout(r, 300));

  const updatedHubTitle = await page.$eval('.skill-hub-title', (el) => el.textContent.trim());
  const updatedHubAnalogy = await page.$eval('.skill-hub-analogy-text', (el) => el.textContent.trim());
  console.log('Updated Dashboard Hub Title:', updatedHubTitle);
  console.log('Updated Dashboard Hub Analogy:', updatedHubAnalogy);

  if (!updatedHubTitle.includes('Java') || !updatedHubAnalogy.includes('blueprint')) {
    throw new Error(`Test 9 Failed: Dashboard Hub did not update to Java blueprint analogy. Got "${updatedHubTitle}", "${updatedHubAnalogy}"`);
  }
  console.log('✓ TEST 9 PASSED: Changed skill to Java; Navbar and Dashboard instantly updated with blueprint analogies.');

  // =========================================================================
  // TEST 10: Custom Skill (e.g. "Rust") Handled Safely & Gracefully
  // =========================================================================
  console.log('\n--- TEST 10: Custom Skill Entry ("Rust") ---');
  const changeBtn2 = await page.waitForSelector('.btn-skill-change');
  await changeBtn2.click();
  await new Promise((r) => setTimeout(r, 300));

  const otherPill = await page.evaluateHandle(() => {
    const pills = Array.from(document.querySelectorAll('.welcome-skill-pill'));
    return pills.find((p) => p.textContent.includes('Other skill'));
  });
  await otherPill.click();
  await new Promise((r) => setTimeout(r, 100));

  const customField = await page.waitForSelector('#custom-skill-input');
  await customField.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await customField.type('Rust');
  await new Promise((r) => setTimeout(r, 200));

  const startCustomBtn = await page.waitForSelector('.btn-welcome-primary');
  await startCustomBtn.click();
  await new Promise((r) => setTimeout(r, 400));

  const customNavText = await page.$eval('.btn-skill-focus', (el) => el.textContent.trim());
  console.log('Custom Skill TopNavbar text:', customNavText);
  if (!customNavText.includes('Rust')) {
    throw new Error(`Test 10 Failed: TopNavbar did not reflect custom skill "Rust". Got "${customNavText}"`);
  }
  console.log('✓ TEST 10 PASSED: Custom skill "Rust" entered, validated, and updated smoothly.');

  // =========================================================================
  // TEST 11: Settings View "Change My Skill" Option
  // =========================================================================
  console.log('\n--- TEST 11: Settings View Skill Section ---');
  const settingsNav = await page.waitForSelector('button.nav-button[title="Settings"]');
  await settingsNav.click();
  await new Promise((r) => setTimeout(r, 300));

  const cardTitles = await page.$$eval('.card-title', (els) => els.map((e) => e.textContent.trim()));
  console.log('Settings card titles:', cardTitles);
  if (!cardTitles.some((t) => t.includes('My Skill & Learning Focus'))) {
    throw new Error(`Test 11 Failed: Settings card missing skill focus. Got: ${JSON.stringify(cardTitles)}`);
  }
  console.log('✓ TEST 11 PASSED: Settings contains visible skill profile section with "Change My Skill".');

  // =========================================================================
  // TEST 12: Zero Console Errors
  // =========================================================================
  console.log('\n--- TEST 12: Console Errors Check ---');
  if (consoleErrors.length > 0) {
    console.error('Console errors logged:', consoleErrors);
    throw new Error(`Detected ${consoleErrors.length} console errors during test run`);
  }
  console.log('✓ TEST 12 PASSED: 0 console errors detected throughout all interactions.');

  await browser.close();
  console.log('\n===============================================================');
  console.log('🎉 ALL 12 PERSONALIZED SKILL-BASED LEARNING TESTS PASSED (100%)!');
  console.log('===============================================================');
})().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
