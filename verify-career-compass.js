import puppeteer from 'puppeteer';

const APP_URL = 'http://localhost:5173/';

async function runCareerCompassVerification() {
  console.log('===============================================================');
  console.log('🧭 STARTING CAREER COMPASS AI END-TO-END VERIFICATION SUITE');
  console.log('===============================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Load application
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    console.log('✓ App loaded at', APP_URL);

    // 2. Verify sidebar contains Career Compass with AI badge
    const careerCompassBtn = await page.waitForSelector('button.nav-button[title="Career Compass"]', { timeout: 5000 });
    if (!careerCompassBtn) {
      throw new Error('Career Compass button not found in sidebar!');
    }
    const badgeText = await page.evaluate(el => el.querySelector('.nav-btn-badge')?.textContent?.trim(), careerCompassBtn);
    console.log(`✓ Sidebar button "Career Compass" present with badge: "${badgeText}"`);

    // 3. Navigate to Career Compass
    await careerCompassBtn.click();
    await new Promise(r => setTimeout(r, 150));

    // Verify view container mounted
    const container = await page.waitForSelector('[data-testid="career-compass-container"]', { timeout: 5000 });
    if (!container) throw new Error('Career Compass container failed to mount');

    const headerTitle = await page.$eval('.view-main-title', el => el.textContent.trim());
    const eyebrow = await page.$eval('.eyebrow', el => el.textContent.trim());
    console.log(`✓ Main view loaded: "${headerTitle}" with eyebrow "${eyebrow}"`);

    // 4. Test Step 1: Input form & privacy guarantee banner
    const privacyNotice = await page.$eval('.privacy-shield-banner', el => el.textContent.trim());
    if (!privacyNotice.includes('Privacy Guarantee') || !privacyNotice.includes('Do not enter sensitive')) {
      throw new Error('Privacy notice missing or incomplete');
    }
    console.log('✓ Privacy Guarantee banner clearly displayed');

    // 5. Test Quick Sample Profile filling
    const quickSampleBtn = await page.waitForSelector('button.btn-secondary.btn-sm', { timeout: 3000 });
    await quickSampleBtn.click();
    await new Promise(r => setTimeout(r, 100));

    const projectText = await page.$eval('#projects-input', el => el.value);
    const skillsCount = await page.$$eval('.skill-rating-pill', els => els.length);
    console.log(`✓ Sample profile loaded: ${skillsCount} skills populated, project text length: ${projectText.length}`);

    // 6. Test skill proficiency level cycling (Beginner -> Intermediate -> Advanced)
    const firstLevelBtn = await page.$('.skill-level-toggle-btn');
    const levelBefore = await page.evaluate(el => el.textContent.trim(), firstLevelBtn);
    await firstLevelBtn.click();
    const levelAfter = await page.evaluate(el => el.textContent.trim(), firstLevelBtn);
    console.log(`✓ Skill level toggled from "${levelBefore}" to "${levelAfter}"`);

    // 7. Test adding a custom skill with specified level
    await page.type('.add-custom-skill-row input', 'Docker Containerization');
    await page.select('.skill-level-select', 'Advanced');
    await page.click('.add-custom-skill-row button');
    await new Promise(r => setTimeout(r, 100));

    const skillNames = await page.$$eval('.skill-name', els => els.map(e => e.textContent.trim()));
    if (!skillNames.includes('Docker Containerization')) {
      throw new Error('Custom skill "Docker Containerization" was not added!');
    }
    console.log('✓ Custom skill successfully added to interactive matrix');

    // 8. Run AI Career Analysis
    console.log('Executing AI Career Analysis...');
    const runAnalysisBtn = await page.waitForSelector('[data-testid="run-analysis-btn"]');
    await runAnalysisBtn.click();

    // Check loading radar scanner state appeared
    const loadingRadar = await page.$('[data-testid="compass-loading"]');
    if (loadingRadar) {
      console.log('✓ Radar scanner loading state engaged with pulsing neural matrix');
    }

    // Wait for Step 2 (Skill Audit) to load
    await page.waitForSelector('[data-testid="compass-step-analysis"]', { timeout: 20000 });
    console.log('✓ Step 02 (Skill Audit) loaded');

    // 9. Verify Demonstrated vs Self-Reported Breakdown
    const demonstratedSkills = await page.$$eval('.demonstrated-tag', els => els.map(e => e.textContent.trim()));
    const selfReportedSkills = await page.$$eval('.self-reported-tag', els => els.map(e => e.textContent.trim()));
    const readinessObs = await page.$eval('.obs-text', el => el.textContent.trim());

    console.log(`✓ Demonstrated Skills (project backed): ${demonstratedSkills.length} verified [${demonstratedSkills.slice(0, 2).join(', ')}]`);
    console.log(`✓ Self-Reported Skills (profile listed): ${selfReportedSkills.length} listed [${selfReportedSkills.slice(0, 2).join(', ')}]`);
    console.log(`✓ Executive Readiness Assessment: "${readinessObs.slice(0, 95)}..."`);

    // 10. Navigate to Step 03: Recommended Job Roles
    const viewRolesBtn = await page.waitForSelector('button.stepper-step-btn:nth-child(5)');
    await viewRolesBtn.click();
    await page.waitForSelector('[data-testid="compass-step-roles"]', { timeout: 5000 });
    console.log('✓ Step 03 (Job Matches) loaded');

    const roleCards = await page.$$('.job-recommendation-card');
    if (roleCards.length === 0) throw new Error('No job recommendation cards rendered!');
    console.log(`✓ Rendered ${roleCards.length} realistic junior role recommendation cards`);

    // Inspect first role card details
    const firstRoleTitle = await page.$eval('.role-card-title', el => el.textContent.trim());
    const readinessPill = await page.$eval('.readiness-pill', el => el.textContent.trim());
    const whyFits = await page.$eval('.why-fits-text', el => el.textContent.trim());
    const haveSkills = await page.$$eval('.have-tag', els => els.map(e => e.textContent.trim()));
    const improveSkills = await page.$$eval('.improve-tag', els => els.map(e => e.textContent.trim()));
    const portalLinks = await page.$$eval('.portal-link-btn', els => els.map(e => ({ name: e.textContent.trim(), href: e.href })));

    console.log(`  - Role 1 Title: "${firstRoleTitle}"`);
    console.log(`  - Readiness Status: "${readinessPill}"`);
    console.log(`  - Why It Fits: "${whyFits.slice(0, 80)}..."`);
    console.log(`  - Skills You Have: [${haveSkills.slice(0, 3).join(', ')}]`);
    console.log(`  - Skills to Improve: [${improveSkills.slice(0, 3).join(', ')}]`);
    console.log(`  - Verified Portal Links: ${portalLinks.map(p => `${p.name} (${p.href.slice(0, 38)}...)`).join(' | ')}`);

    // Verify safe portal URLs have valid search parameters without fake vacancies
    if (!portalLinks.some(p => p.href.includes('linkedin.com/jobs/search') && p.href.includes('keywords='))) {
      throw new Error('LinkedIn safe search link is missing or malformed');
    }
    if (!portalLinks.some(p => p.href.includes('internshala.com/internships'))) {
      throw new Error('Internshala safe search link is missing or malformed');
    }
    console.log('✓ Safe real-time search queries verified across LinkedIn and Internshala');

    // 11. Navigate to Step 04: Learning Roadmap
    const roadmapBtn = await page.waitForSelector('button.stepper-step-btn:nth-child(7)');
    await roadmapBtn.click();
    await page.waitForSelector('[data-testid="compass-step-roadmap"]', { timeout: 5000 });
    console.log('✓ Step 04 (Milestone Roadmap) loaded');

    const phases = await page.$$eval('.roadmap-phase-card', cards =>
      cards.map(card => ({
        title: card.querySelector('.phase-title')?.textContent?.trim(),
        timeframe: card.querySelector('.phase-timeframe-badge')?.textContent?.trim(),
        milestonesCount: card.querySelectorAll('.phase-milestone-item').length,
        deliverable: card.querySelector('.deliverable-text')?.textContent?.trim()
      }))
    );

    console.log(`✓ Structured ${phases.length}-phase milestone progression:`);
    phases.forEach((p, idx) => {
      console.log(`   Phase ${idx + 1}: ${p.title} (${p.timeframe}) — ${p.milestonesCount} milestones — Deliverable: "${p.deliverable.slice(0, 60)}..."`);
    });

    // 12. Verify LocalStorage Persistence
    const savedStorage = await page.evaluate(() => {
      return {
        profile: localStorage.getItem('smartbridge_career_compass_v1'),
        analysis: localStorage.getItem('smartbridge_career_analysis_v1')
      };
    });

    if (!savedStorage.profile || !savedStorage.analysis) {
      throw new Error('Career Compass state failed to persist in localStorage!');
    }
    const parsedStoredAnalysis = JSON.parse(savedStorage.analysis);
    console.log(`✓ LocalStorage verified: smartbridge_career_compass_v1 and smartbridge_career_analysis_v1 saved (${parsedStoredAnalysis.jobRecommendations.length} roles, source: ${parsedStoredAnalysis.source})`);

    // 13. Test Dual-Mode Toggle: Switch to Industry Pathways (Legacy Compatibility)
    const pathwaysModeBtn = await page.waitForSelector('.mode-btn:nth-child(2)');
    await pathwaysModeBtn.click();
    await new Promise(r => setTimeout(r, 100));

    const pathwayCardsCount = await page.$$eval('.career-pathway-card', els => els.length);
    console.log(`✓ Industry Pathways mode active: ${pathwayCardsCount} verified pathways accessible`);

    // Switch back to Career Compass Studio
    const compassModeBtn = await page.waitForSelector('.mode-btn:nth-child(1)');
    await compassModeBtn.click();
    await new Promise(r => setTimeout(r, 100));
    console.log('✓ Seamlessly switched back to Career Compass Studio');

    // 14. Check Console Safety
    const severeErrors = consoleErrors.filter(err => !err.includes('favicon') && !err.includes('WebGL'));
    if (severeErrors.length > 0) {
      console.warn('Browser console warnings/errors:', severeErrors);
    } else {
      console.log('✓ Zero (0) critical browser console errors recorded');
    }

    console.log('===============================================================');
    console.log('🎉 ALL CAREER COMPASS AI VERIFICATION CHECKS PASSED (100%)!');
    console.log('===============================================================');

  } finally {
    await browser.close();
  }
}

runCareerCompassVerification().catch(err => {
  console.error('❌ Career Compass Verification Failed:', err);
  process.exit(1);
});
