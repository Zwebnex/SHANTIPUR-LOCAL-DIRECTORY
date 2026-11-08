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
      consoleErrors.push(msg.text());
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
  await page.click('[data-tab="all"]');
  await new Promise(r => setTimeout(r, 600));

  // 10. Verify Detail Modal Opening & Provenance Elements
  await page.click('#listings-container > div:first-child button');
  await new Promise(r => setTimeout(r, 600));
  const modalVisible = await page.$eval('#detail-modal', el => !el.classList.contains('hidden'));
  console.log('📖 Detail Modal Opened Successfully:', modalVisible);

  // Close Detail Modal
  await page.click('#detail-modal-content button');
  await new Promise(r => setTimeout(r, 400));

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
    const testImg = document.createElement('img');
    testImg.src = '/non-existent-image-404.jpg';
    window.handleImageError(testImg);
    return testImg.src.includes('om-placeholder.svg');
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
