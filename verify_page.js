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

  // 11. Verify Image Registry & Zero Duplicate Listing Images
  const listingImageReport = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#listings-container > div'));
    const images = cards.map(c => {
      const title = c.querySelector('h3')?.innerText?.trim() || '';
      const img = c.querySelector('img')?.getAttribute('src') || '';
      const badge = c.querySelector('.bottom-2\\.5')?.innerText?.trim() || '';
      return { title, img, badge };
    });

    const imgMap = {};
    const duplicates = [];
    images.forEach(item => {
      if (!imgMap[item.img]) {
        imgMap[item.img] = [item.title];
      } else {
        imgMap[item.img].push(item.title);
        duplicates.push({ img: item.img, titles: imgMap[item.img] });
      }
    });

    return {
      total: images.length,
      uniqueImagesCount: Object.keys(imgMap).length,
      duplicates,
      images
    };
  });

  console.log(`\n🖼️ Listing Images Audit:`);
  console.log(`   Total Listings: ${listingImageReport.total}`);
  console.log(`   Unique Cover Images: ${listingImageReport.uniqueImagesCount}`);
  console.log(`   Duplicate Collisions: ${listingImageReport.duplicates.length}`);
  if (listingImageReport.duplicates.length > 0) {
    console.error('❌ DUPLICATES FOUND:', listingImageReport.duplicates);
  } else {
    console.log('✅ ZERO DUPLICATES FOUND ACROSS ALL 16 LISTING CARDS!');
  }

  // 12. Capture Full-Page Verification Screenshot
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
