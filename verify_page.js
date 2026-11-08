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

  // 5. Test Bilingual Toggle to Bengali
  await page.click('#lang-btn-bn');
  await new Promise(r => setTimeout(r, 600));
  const heroHeadlineBn = await page.$eval('h1', el => el.innerText);
  console.log('🇧🇩 Bilingual Switcher (Bengali Headline):', heroHeadlineBn);

  // Switch back to English
  await page.click('#lang-btn-en');
  await new Promise(r => setTimeout(r, 600));

  // 6. Test Category Filter Click
  await page.click('#categories-section button:first-child');
  await new Promise(r => setTimeout(r, 600));
  const filteredCount = await page.$$eval('#listings-container > div', els => els.length);
  console.log(`🔍 Filtered Listings Count: ${filteredCount}`);

  // Reset filter to All
  await page.click('[data-tab="all"]');
  await new Promise(r => setTimeout(r, 600));

  // 7. Verify Detail Modal Opening
  await page.click('#listings-container > div:first-child button');
  await new Promise(r => setTimeout(r, 600));
  const modalVisible = await page.$eval('#detail-modal', el => !el.classList.contains('hidden'));
  console.log('📖 Detail Modal Opened Successfully:', modalVisible);

  // Close Detail Modal
  await page.click('#detail-modal-content button');
  await new Promise(r => setTimeout(r, 400));

  // 8. Capture Full-Page Verification Screenshot
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

verify().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
