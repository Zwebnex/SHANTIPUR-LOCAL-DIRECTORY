// verify_page.js - Automated Verification of Redesigned Shantipur Platform via Puppeteer
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function verify() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const screenshotPath = path.join(__dirname, 'verification_preview.png');

  console.log('🔍 Launching Headless Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1280,1800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1800 });

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`${msg.text()} [${JSON.stringify(msg.location())}]`);
    }
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      console.log('HTTP 4xx/5xx:', res.status(), res.url());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  page.on('requestfailed', req => {
    networkErrors.push(`${req.url()} (${req.failure()?.errorText})`);
  });

  console.log('🌐 Navigating to http://127.0.0.1:5173 ...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2', timeout: 30000 });

  // 1. Verify Page Title
  const title = await page.title();
  console.log('📄 Page Title:', title);

  // 2. Verify Hero Headline
  const heroHeadline = await page.$eval('h1', el => el.innerText);
  console.log('🏛️ Hero Headline:', heroHeadline);

  // 3. Verify Category Cards Count
  const categoryCardsCount = await page.$$eval('#categories-section button', els => els.length);
  console.log(`📂 Rendered Category Cards: ${categoryCardsCount}`);

  // 4. Verify Listings Count
  const listingsCount = await page.$$eval('#listings-container > div', els => els.length);
  console.log(`🪔 Rendered Heritage Listings: ${listingsCount}`);

  // 5. Verify Heritage Image Discovery Gallery Grid
  const galleryItemsCount = await page.$$eval('#gallery-grid > div', els => els.length);
  console.log(`🖼️ Rendered Heritage Gallery Assets: ${galleryItemsCount}`);

  // 6. Test Gallery Filter Tab (Maa Kali)
  await page.click('[data-gal-tab="maa-kali"]');
  await new Promise(r => setTimeout(r, 500));
  const kaliGalleryCount = await page.$$eval('#gallery-grid > div', els => els.length);
  console.log(`🔱 Filtered Maa Kali Gallery Assets: ${kaliGalleryCount}`);

  // 7. Test Lightbox Opening
  await page.click('#gallery-grid > div:first-child');
  await new Promise(r => setTimeout(r, 500));
  const lightboxVisible = await page.$eval('#lightbox-modal', el => !el.classList.contains('hidden'));
  const lightboxTitle = await page.$eval('#lightbox-title', el => el.innerText);
  console.log(`🔎 Lightbox Opened: ${lightboxVisible} | Title: "${lightboxTitle}"`);

  // Close Lightbox
  await page.click('#lightbox-modal button');
  await new Promise(r => setTimeout(r, 400));

  // Reset Gallery to All
  await page.click('[data-gal-tab="all"]');
  await new Promise(r => setTimeout(r, 500));

  // 8. Test Bilingual Toggle to Bengali
  await page.click('#lang-btn-bn');
  await new Promise(r => setTimeout(r, 600));
  const heroHeadlineBn = await page.$eval('h1', el => el.innerText);
  console.log('🇧🇩 Bilingual Switcher (Bengali Headline):', heroHeadlineBn);

  // Switch back to English
  await page.click('#lang-btn-en');
  await new Promise(r => setTimeout(r, 600));

  // 9. Test Listings Filter Tab Click
  await page.click('#categories-section button:first-child');
  await new Promise(r => setTimeout(r, 600));
  const filteredCount = await page.$$eval('#listings-container > div', els => els.length);
  console.log(`🔍 Filtered Listings Count: ${filteredCount}`);

  // Reset filter to All
  await page.evaluate(() => window.setFilterTab('all'));
  await new Promise(r => setTimeout(r, 600));

  // 10. Verify Detail Modal Opening & Provenance Elements
  await page.click('#listings-container > div:first-child button');
  await new Promise(r => setTimeout(r, 600));
  const modalVisible = await page.$eval('#detail-modal', el => !el.classList.contains('hidden'));
  console.log('📖 Detail Modal Opened Successfully:', modalVisible);

  // Close Detail Modal
  await page.evaluate(() => window.closeDetailModal());
  await new Promise(r => setTimeout(r, 400));

  // 10b. Verify Removal of "Custom Shantipur Parikrama & Greetings Pass"
  const storySectionCount = await page.$$eval('#story-name-input, #story-wish-select, #story-canvas', els => els.length);
  console.log(`🚫 Custom Greetings Pass Removed: ${storySectionCount === 0 ? 'PASSED (0 elements found)' : 'FAILED'}`);

  // 10c. Test Business Portal (Login & Free Registration System)
  console.log('🏢 Testing Business Authentication & Verification System...');
  await page.evaluate(() => window.openBusinessAuth('register'));
  await new Promise(r => setTimeout(r, 500));
  const authModalVisible = await page.$eval('#business-auth-modal', el => !el.classList.contains('hidden'));
  console.log(`   Business Modal Opened: ${authModalVisible}`);

  // Test Free Business Registration Submission
  const registrationResult = await page.evaluate(() => {
    document.getElementById('reg-biz-name').value = 'Test Shantipur Traditional Tant Weavers';
    document.getElementById('reg-owner-name').value = 'Subhendu Basak';
    document.getElementById('reg-category').value = 'Shantipuri Tant & Handlooms';
    document.getElementById('reg-phone').value = '9832098320';
    document.getElementById('reg-email').value = 'test_weaver@shantipur.org';
    document.getElementById('reg-password').value = 'TantWeaver2026!';
    document.getElementById('reg-address').value = 'Sutragarh Master Weavers Lane, Ward 15, PIN: 741404';
    document.getElementById('reg-trade-license').value = 'STPM/TL/2026/0492';
    document.getElementById('reg-terms').checked = true;

    // Trigger form submit
    const form = document.getElementById('business-registration-form');
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    const session = JSON.parse(localStorage.getItem('santipur_current_business_session') || '{}');
    return {
      id: session.id,
      name: session.businessName,
      status: session.verificationStatus
    };
  });
  console.log(`   Business Registered (Free): ${registrationResult.name} | Status: ${registrationResult.status} | ID: ${registrationResult.id}`);

  // Close Business Modal
  await page.evaluate(() => window.closeBusinessAuth());
  await new Promise(r => setTimeout(r, 400));

  // 10d. Verify Professional 5-Column Footer
  const footerColumnsCount = await page.$$eval('footer .grid > div', els => els.length);
  console.log(`🏛️ Professional Footer Columns: ${footerColumnsCount} (Expected: 5)`);

  // 10e. Verify ZWEBNEX Agency Attribution & Logos
  const zwebnexCheck = await page.evaluate(() => {
    const logoImg = document.querySelector('img[src*="zwebnex-official-logo.png"]');
    const footerText = document.querySelector('footer').innerText;
    return {
      hasLogo: !!logoImg,
      hasZwebnexText: footerText.includes('ZWEBNEX'),
      hasFoundersText: footerText.includes('Shankha Subhra Sadhukhan') && footerText.includes('Bipra Das'),
      hasDesignerText: footerText.includes('Website Designed by')
    };
  });
  console.log(`🚀 ZWEBNEX Agency Attribution: Logo=${zwebnexCheck.hasLogo}, Founders=${zwebnexCheck.hasFoundersText}, Designer=${zwebnexCheck.hasDesignerText}`);

  // 11. Comprehensive Audit of All Idols, Temples & Places
  const idolTempleAudit = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#listings-container > div'));
    const details = cards.map(c => {
      const title = c.querySelector('h3')?.innerText?.trim() || '';
      const category = c.querySelector('.text-\\[11px\\]')?.innerText?.trim() || '';
      const location = c.querySelector('.truncate')?.innerText?.trim() || '';
      const img = c.querySelector('img')?.getAttribute('src') || '';
      const isLazy = c.querySelector('img')?.getAttribute('loading') === 'lazy';
      const isAsync = c.querySelector('img')?.getAttribute('decoding') === 'async';
      const isOm = img.includes('om-placeholder.svg');
      return { title, category, location, img, isLazy, isAsync, isOm };
    });

    const parikramaCheckpoints = Array.from(document.querySelectorAll('#selected-shrine-list label')).map(l => {
      return {
        name: l.querySelector('span.font-semibold')?.innerText?.trim() || '',
        location: l.querySelector('span.text-\\[11px\\]')?.innerText?.trim() || '',
        badge: l.querySelector('span.font-mono')?.innerText?.trim() || ''
      };
    });

    return {
      listingsCount: details.length,
      listings: details,
      parikramaCount: parikramaCheckpoints.length,
      parikramaCheckpoints
    };
  });

  console.log(`\n================ IDOL & TEMPLE NOMENCLATURE & IMAGE AUDIT ================`);
  console.log(`Audited ${idolTempleAudit.listingsCount} Listings:`);
  idolTempleAudit.listings.forEach((item, idx) => {
    console.log(`[${idx + 1}] ${item.title}`);
    console.log(`    Location: ${item.location}`);
    console.log(`    Category: ${item.category}`);
    console.log(`    Image:    ${item.img}`);
    console.log(`    Status:   ${item.isOm ? '🕉️ Sacred Om Placeholder' : '✅ Verified Authentic Image'}`);
  });

  console.log(`\n🕉️ Parikrama Circuit Checkpoints (${idolTempleAudit.parikramaCount} destinations):`);
  idolTempleAudit.parikramaCheckpoints.forEach((p, idx) => {
    console.log(`   ${idx + 1}. ${p.name} (${p.location}) [${p.badge}]`);
  });

  // 12. Performance & Lazy Loading Audit
  const perfAudit = await page.evaluate(() => {
    const allImages = Array.from(document.querySelectorAll('img'));
    const lazyImages = allImages.filter(img => img.getAttribute('loading') === 'lazy');
    const asyncImages = allImages.filter(img => img.getAttribute('decoding') === 'async');
    return {
      total: allImages.length,
      lazy: lazyImages.length,
      async: asyncImages.length
    };
  });

  console.log(`\n⚡ Performance & Lazy Loading:`);
  console.log(`   Total Images: ${perfAudit.total}`);
  console.log(`   loading="lazy": ${perfAudit.lazy}`);
  console.log(`   decoding="async": ${perfAudit.async}`);

  // 13. Test Dynamic Error Fallback to Sacred Om Sign
  const fallbackTestPassed = await page.evaluate(() => {
    const dummy = { src: '/sample-broken-path.png', onerror: () => {} };
    window.handleImageError(dummy);
    return dummy.src.includes('om-placeholder.svg');
  });
  console.log(`\n🛡️ Dynamic Om Fallback on Absent/Broken Image: ${fallbackTestPassed ? 'PASSED (ॐ Symbol applied)' : 'FAILED'}`);

  // 14. Capture Full-Page Verification Screenshot
  console.log('📸 Capturing Full-Page Screenshot to:', screenshotPath);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await browser.close();

  console.log('\n================ REDESIGN VERIFICATION REPORT ================');
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length) console.log(consoleErrors);
  console.log(`Network Failures: ${networkErrors.length}`);
  if (networkErrors.length) console.log(networkErrors);
  console.log(`Screenshot Generated: ${fs.existsSync(screenshotPath)} (${fs.statSync(screenshotPath).size} bytes)`);
  console.log('===============================================================\n');
}

verify().catch(console.error);
