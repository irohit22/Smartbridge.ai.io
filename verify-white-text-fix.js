import puppeteer from 'puppeteer';

const APP_URL = 'http://localhost:5173/';

function rgbToHex(rgbStr) {
  if (!rgbStr) return '';
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return rgbStr;
  const [r, g, b] = match.map(Number);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function parseRgb(rgbStr) {
  if (!rgbStr) return { r: 0, g: 0, b: 0, a: 1 };
  const match = rgbStr.match(/[\d.]+/g);
  if (!match || match.length < 3) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseFloat(match[0]),
    g: parseFloat(match[1]),
    b: parseFloat(match[2]),
    a: match.length >= 4 ? parseFloat(match[3]) : 1
  };
}

async function verifyWhiteTextFixes() {
  console.log('===============================================================');
  console.log('🔍 VERIFYING FIXES FOR WHITE BACKGROUND & INVISIBLE TEXT ISSUES');
  console.log('===============================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const failures = [];

  function checkElementContrast(name, bg, color, allowTransparent = false) {
    const bgParsed = parseRgb(bg);
    const colParsed = parseRgb(color);
    const bgHex = rgbToHex(bg);
    const colHex = rgbToHex(color);

    console.log(`  [${name}]`);
    console.log(`    Background: ${bg} (${bgHex})`);
    console.log(`    Text Color: ${color} (${colHex})`);

    // Check if background is solid white or near white
    if ((bgHex === '#FFFFFF' || (bgParsed.r > 230 && bgParsed.g > 230 && bgParsed.b > 230 && bgParsed.a > 0.8))) {
      failures.push(`${name} has UNWANTED LIGHT/WHITE BACKGROUND: ${bg}`);
    }

    // Check if text is too dark or invisible
    if (colParsed.r < 130 && colParsed.g < 130 && colParsed.b < 130) {
      failures.push(`${name} text color is too dark for dark theme: ${color}`);
    }

    // White on white check
    if (bgHex.startsWith('#F') && colHex.startsWith('#F') && bgParsed.a > 0.5) {
      failures.push(`${name} has WHITE-ON-WHITE issue!`);
    }
  }

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Quiz page - .demo-notice-badge (The exact element from the screenshot)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 1: Quiz View .demo-notice-badge ---');
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });

    // Navigate to Quiz View
    const quizNav = await page.waitForSelector('button.nav-button[title="Quiz & Practice"]');
    await quizNav.click();
    await page.waitForSelector('.demo-notice-badge');

    const badgeStyles = await page.evaluate(() => {
      const el = document.querySelector('.demo-notice-badge');
      const strong = el.querySelector('strong');
      const sub = el.querySelector('.demo-notice-sub');
      const computedEl = window.getComputedStyle(el);
      const computedStrong = window.getComputedStyle(strong);
      const computedSub = window.getComputedStyle(sub);
      return {
        bg: computedEl.backgroundColor,
        strongColor: computedStrong.color,
        subColor: computedSub.color
      };
    });

    checkElementContrast('Quiz .demo-notice-badge strong', badgeStyles.bg, badgeStyles.strongColor);
    checkElementContrast('Quiz .demo-notice-badge sub', badgeStyles.bg, badgeStyles.subColor);

    // ------------------------------------------------------------------------
    // TEST 2: Quiz View - Mode tabs & Custom Quiz setup controls
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 2: Quiz Mode Tabs and Setup Options ---');
    const tabStyles = await page.evaluate(() => {
      const activeTab = document.querySelector('.btn-mode-tab.active');
      if (!activeTab) return null;
      const computed = window.getComputedStyle(activeTab);
      return {
        bg: computed.backgroundColor,
        color: computed.color
      };
    });

    if (tabStyles) {
      checkElementContrast('Quiz .btn-mode-tab.active', tabStyles.bg, tabStyles.color);
    }

    // Check .pill-option-btn if present
    const pillBtnStyles = await page.evaluate(() => {
      const pill = document.querySelector('.pill-option-btn');
      if (!pill) return null;
      const computed = window.getComputedStyle(pill);
      return {
        bg: computed.backgroundColor,
        color: computed.color
      };
    });

    if (pillBtnStyles) {
      checkElementContrast('Quiz .pill-option-btn', pillBtnStyles.bg, pillBtnStyles.color);
    }

    // ------------------------------------------------------------------------
    // TEST 3: Hover state on .btn-secondary
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 3: .btn-secondary:hover background & text color ---');
    const btnSecondaryStyles = await page.evaluate(() => {
      // Create a test button in document to read computed hover style or read rule from stylesheet
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.innerText = 'Test Secondary';
      document.body.appendChild(btn);
      const computed = window.getComputedStyle(btn);
      const res = {
        bg: computed.backgroundColor,
        color: computed.color
      };
      btn.remove();
      return res;
    });

    console.log(`  [.btn-secondary normal]`);
    console.log(`    Background: ${btnSecondaryStyles.bg} (${rgbToHex(btnSecondaryStyles.bg)})`);
    console.log(`    Color:      ${btnSecondaryStyles.color} (${rgbToHex(btnSecondaryStyles.color)})`);

    // Verify hover rule in document stylesheets
    const hoverRule = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('.btn-secondary:hover')) {
              return {
                selector: rule.selectorText,
                bg: rule.style.backgroundColor || rule.style.background,
                color: rule.style.color
              };
            }
          }
        } catch (e) {
          // Cross-origin stylesheet
        }
      }
      return null;
    });

    console.log('  [.btn-secondary:hover CSS Rule]:', hoverRule);
    if (hoverRule && (hoverRule.bg.includes('#e2e8f0') || hoverRule.bg.includes('white') || hoverRule.bg.includes('#fff'))) {
      failures.push(`.btn-secondary:hover still has unwanted light background: ${hoverRule.bg}`);
    }

    // ------------------------------------------------------------------------
    // TEST 4: Notes Generator - .demo-notice-badge & active note card
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 4: Notes View .demo-notice-badge & Cards ---');
    const notesNav = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
    await notesNav.click();
    await page.waitForSelector('.demo-notice-badge');

    const notesBadgeStyles = await page.evaluate(() => {
      const el = document.querySelector('.demo-notice-badge');
      const strong = el.querySelector('strong');
      const computedEl = window.getComputedStyle(el);
      const computedStrong = window.getComputedStyle(strong);
      return {
        bg: computedEl.backgroundColor,
        color: computedStrong.color
      };
    });

    checkElementContrast('Notes .demo-notice-badge', notesBadgeStyles.bg, notesBadgeStyles.color);

    // ------------------------------------------------------------------------
    // TEST 5: AI Tutor View - .demo-notice-badge
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 5: AI Tutor View .demo-notice-badge ---');
    const tutorNav = await page.waitForSelector('button.nav-button[title="AI Tutor"]');
    await tutorNav.click();
    await page.waitForSelector('.demo-notice-badge');

    const tutorBadgeStyles = await page.evaluate(() => {
      const el = document.querySelector('.demo-notice-badge');
      const strong = el.querySelector('strong');
      const computedEl = window.getComputedStyle(el);
      const computedStrong = window.getComputedStyle(strong);
      return {
        bg: computedEl.backgroundColor,
        color: computedStrong.color
      };
    });

    checkElementContrast('AI Tutor .demo-notice-badge', tutorBadgeStyles.bg, tutorBadgeStyles.color);

    // ------------------------------------------------------------------------
    // Final Verdict
    // ------------------------------------------------------------------------
    console.log('\n===============================================================');
    if (failures.length === 0) {
      console.log('🎉 ALL CONTRAST & WHITE BACKGROUND TESTS PASSED WITH 100% SUCCESS!');
    } else {
      console.log(`❌ ENCOUNTERED ${failures.length} CONTRAST ISSUES:`);
      failures.forEach((f, idx) => console.log(`  ${idx + 1}. ${f}`));
    }
    console.log('===============================================================');

  } catch (err) {
    console.error('Test execution error:', err);
    failures.push(err.message);
  } finally {
    await browser.close();
    if (failures.length > 0) {
      process.exit(1);
    }
  }
}

verifyWhiteTextFixes();
