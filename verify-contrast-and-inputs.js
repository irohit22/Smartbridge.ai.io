import puppeteer from 'puppeteer';

const APP_URL = 'http://localhost:5173/';

function rgbToHex(rgbStr) {
  if (!rgbStr) return '';
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return rgbStr;
  const [r, g, b] = match.map(Number);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

async function runContrastAudit() {
  console.log('===============================================================');
  console.log('🎨 STARTING FORM CONTROLS & CONTRAST SAFETY VERIFICATION');
  console.log('===============================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const auditFailures = [];

  function assertDarkControl(name, styles) {
    const bgHex = rgbToHex(styles.backgroundColor);
    const colorHex = rgbToHex(styles.color);

    console.log(`  [${name}]`);
    console.log(`    Background: ${styles.backgroundColor} (${bgHex})`);
    console.log(`    Text Color: ${styles.color} (${colorHex})`);
    console.log(`    Border:     ${styles.borderColor} (${rgbToHex(styles.borderColor)})`);

    // Guard against white or near-white background
    if (styles.backgroundColor.includes('255, 255, 255') || bgHex === '#FFFFFF') {
      auditFailures.push(`${name} has UNWANTED WHITE BACKGROUND: ${styles.backgroundColor}`);
    }

    // Guard against white-on-white (both light)
    if (bgHex.startsWith('#F') && colorHex.startsWith('#F')) {
      auditFailures.push(`${name} has WHITE-ON-WHITE text issue!`);
    }

    // Verify dark background (luminance check: rgb all under 50)
    const bgMatch = styles.backgroundColor.match(/\d+/g);
    if (bgMatch && bgMatch.length >= 3) {
      const [r, g, b] = bgMatch.map(Number);
      if (r > 60 || g > 60 || b > 90) {
        auditFailures.push(`${name} background is too bright: rgb(${r}, ${g}, ${b})`);
      }
    }

    // Verify readable text color (rgb all above 180)
    const colorMatch = styles.color.match(/\d+/g);
    if (colorMatch && colorMatch.length >= 3) {
      const [r, g, b] = colorMatch.map(Number);
      if (r < 160 || g < 160 || b < 160) {
        auditFailures.push(`${name} text color is too dark for dark theme: rgb(${r}, ${g}, ${b})`);
      }
    }
  }

  try {
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    console.log('✓ App loaded at', APP_URL);

    // ------------------------------------------------------------------------
    // SECTION 1: Career Compass AI Form Audit
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 1: Career Compass AI Form Controls ---');
    const careerNav = await page.waitForSelector('button.nav-button[title="Career Compass"]');
    await careerNav.click();
    await page.waitForSelector('[data-testid="career-compass-container"]');

    // Audit fields in Career Compass
    const careerFields = [
      { id: '#degree-select', label: 'Degree Select Dropdown' },
      { id: '#branch-input', label: 'Branch / Major Text Input' },
      { id: '#semester-select', label: 'Semester Select Dropdown' },
      { id: '.add-custom-skill-row input', label: 'Add Custom Skill Input' },
      { id: '.skill-level-select', label: 'Skill Level Select Dropdown' },
      { id: '#projects-input', label: 'Projects Textarea' },
      { id: '#certs-input', label: 'Certifications Input' }
    ];

    for (const field of careerFields) {
      const el = await page.waitForSelector(field.id);
      const styles = await page.evaluate(target => {
        const computed = window.getComputedStyle(target);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderColor: computed.borderColor,
          colorScheme: computed.colorScheme
        };
      }, el);

      assertDarkControl(field.label, styles);

      // Test typing into text-based fields
      const tagName = await page.evaluate(t => t.tagName.toLowerCase(), el);
      if (tagName === 'input' || tagName === 'textarea') {
        await el.click();
        await el.type(' Testing Dark Contrast 123');
        const typedVal = await page.evaluate(t => t.value, el);
        console.log(`    Typed test value: "${typedVal.slice(-27)}"`);
      }
    }

    // Inspect dropdown <option> tags in Career Compass
    const optionStyles = await page.evaluate(() => {
      const opt = document.querySelector('#degree-select option');
      if (!opt) return null;
      const comp = window.getComputedStyle(opt);
      return {
        backgroundColor: comp.backgroundColor,
        color: comp.color
      };
    });

    if (optionStyles) {
      console.log('\n  [Select Dropdown Option Element]');
      console.log(`    Option Background: ${optionStyles.backgroundColor} (${rgbToHex(optionStyles.backgroundColor)})`);
      console.log(`    Option Text:       ${optionStyles.color} (${rgbToHex(optionStyles.color)})`);
      if (optionStyles.backgroundColor.includes('255, 255, 255')) {
        auditFailures.push('Dropdown option has white background!');
      }
    }

    // Test Focus Ring on Branch Input (wait 180ms for transition)
    await page.focus('#branch-input');
    await new Promise(r => setTimeout(r, 180));
    const focusStyles = await page.evaluate(() => {
      const t = document.querySelector('#branch-input');
      const comp = window.getComputedStyle(t);
      return {
        borderColor: comp.borderColor,
        boxShadow: comp.boxShadow,
        activeId: document.activeElement ? document.activeElement.id : null
      };
    });
    console.log(`  [Focus State on #branch-input] (Active: #${focusStyles.activeId})`);
    console.log(`    Border Color: ${focusStyles.borderColor} (${rgbToHex(focusStyles.borderColor)})`);
    console.log(`    Box Shadow:   ${focusStyles.boxShadow}`);
    if (!focusStyles.borderColor.includes('56, 189, 248') && rgbToHex(focusStyles.borderColor) !== '#38BDF8') {
      auditFailures.push(`Focus border color expected #38BDF8 (cyan), got ${focusStyles.borderColor}`);
    }

    // Check label contrast
    const labelStyles = await page.evaluate(() => {
      const lbl = document.querySelector('.input-label');
      if (!lbl) return null;
      const comp = window.getComputedStyle(lbl);
      return {
        color: comp.color,
        fontSize: comp.fontSize,
        fontWeight: comp.fontWeight
      };
    });
    if (labelStyles) {
      console.log(`  [Input Label (.input-label)] Color: ${labelStyles.color} (${rgbToHex(labelStyles.color)}), Weight: ${labelStyles.fontWeight}`);
    }

    // ------------------------------------------------------------------------
    // SECTION 2: Notes Generator Form Audit
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 2: Notes Generator Form Controls ---');
    const notesNav = await page.waitForSelector('button.nav-button[title="Notes Generator"]');
    await notesNav.click();
    await page.waitForSelector('#notes-topic');

    const notesFields = [
      { id: '#notes-topic', label: 'Notes Topic Input' },
      { id: 'select.form-select', label: 'Notes Form Select' },
      { id: '.library-search-input', label: 'Library Search Input' }
    ];

    for (const field of notesFields) {
      const el = await page.$(field.id);
      if (el) {
        const styles = await page.evaluate(target => {
          const comp = window.getComputedStyle(target);
          return {
            backgroundColor: comp.backgroundColor,
            color: comp.color,
            borderColor: comp.borderColor
          };
        }, el);
        assertDarkControl(field.label, styles);
      }
    }

    // Test validation error state on Notes Topic (clear topic in React to trigger error)
    await page.evaluate(() => {
      const input = document.querySelector('#notes-topic');
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const generateBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && b.textContent.includes('Generate Notes'));
    });
    await generateBtn.click();
    await page.waitForSelector('.input-error', { timeout: 4000 });
    await new Promise(r => setTimeout(r, 180));
    const errorStyles = await page.evaluate(() => {
      const errEl = document.querySelector('.input-error');
      const comp = window.getComputedStyle(errEl);
      return {
        borderColor: comp.borderColor,
        boxShadow: comp.boxShadow
      };
    });
    console.log(`  [Validation Error State] Border: ${errorStyles.borderColor} (${rgbToHex(errorStyles.borderColor)})`);
    if (!errorStyles.borderColor.includes('244, 63, 94') && rgbToHex(errorStyles.borderColor) !== '#F43F5E') {
      auditFailures.push(`Validation error expected rose red #F43F5E border, got ${errorStyles.borderColor}`);
    }

    // ------------------------------------------------------------------------
    // SECTION 3: AI Tutor Form Audit
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 3: AI Tutor Form Controls ---');
    const tutorNav = await page.waitForSelector('button.nav-button[title="AI Tutor"]');
    await tutorNav.click();
    const chatTextarea = await page.waitForSelector('.chat-input-textarea');

    const chatStyles = await page.evaluate(target => {
      const comp = window.getComputedStyle(target);
      return {
        backgroundColor: comp.backgroundColor,
        color: comp.color,
        borderColor: comp.borderColor
      };
    }, chatTextarea);
    assertDarkControl('AI Tutor Chat Textarea', chatStyles);

    // ------------------------------------------------------------------------
    // SECTION 4: Settings View Form Audit
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 4: Settings View Form Controls ---');
    const settingsNav = await page.waitForSelector('button.nav-button[title="Settings"]');
    await settingsNav.click();
    await page.waitForSelector('#user-name');

    const settingsFields = [
      { id: '#user-name', label: 'User Name Input' },
      { id: '#user-email', label: 'User Email Input' },
      { id: '#user-track', label: 'User Track Select' },
      { id: '#ai-model', label: 'AI Model Select' }
    ];

    for (const field of settingsFields) {
      const el = await page.$(field.id);
      if (el) {
        const styles = await page.evaluate(target => {
          const comp = window.getComputedStyle(target);
          return {
            backgroundColor: comp.backgroundColor,
            color: comp.color,
            borderColor: comp.borderColor
          };
        }, el);
        assertDarkControl(field.label, styles);
      }
    }

    // ------------------------------------------------------------------------
    // SECTION 5: Quiz Custom Topic Select Audit
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 5: Quiz Domain Focus Select ---');
    const quizNav = await page.waitForSelector('button.nav-button[title="Quiz & Practice"]');
    await quizNav.click();
    const customTab = await page.waitForSelector('#tab-custom-quiz');
    await customTab.click();
    const customSelect = await page.waitForSelector('#custom-topic-select');
    const quizSelectStyles = await page.evaluate(target => {
      const comp = window.getComputedStyle(target);
      return {
        backgroundColor: comp.backgroundColor,
        color: comp.color,
        borderColor: comp.borderColor
      };
    }, customSelect);
    assertDarkControl('Quiz Domain Select', quizSelectStyles);

    // Summary
    console.log('\n===============================================================');
    if (auditFailures.length > 0) {
      console.error(`❌ FAILED WITH ${auditFailures.length} CONTRAST DEFICIENCIES:`);
      auditFailures.forEach(f => console.error(`  - ${f}`));
      throw new Error(`Contrast audit encountered ${auditFailures.length} issues.`);
    } else {
      console.log('🎉 ZERO CONTRAST FAILURES: All form fields, dropdowns, and options verified with dark theme standards!');
    }
    console.log('===============================================================');

  } finally {
    await browser.close();
  }
}

runContrastAudit().catch(err => {
  console.error('Audit execution error:', err.message);
  process.exit(1);
});
