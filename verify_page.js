// verify_page.js - Automated Verification & Screenshot via Puppeteer
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

  // Test DOM Elements
  const title = await page.title();
  console.log('📄 Page Title:', title);

  const physicsBtnText = await page.$eval('#physics-toggle-pill', el => el.innerText);
  console.log('⚛️  Physics Toggle Button:', physicsBtnText);

  const shrineCardsCount = await page.$$eval('#shrines-container .tilt-3d-card', els => els.length);
  console.log(`🪔 Rendered Shrine Cards: ${shrineCardsCount}`);

  const templeCardsCount = await page.$$eval('#temples-container .tilt-3d-card', els => els.length);
  console.log(`🏛️ Rendered Temples: ${templeCardsCount}`);

  const handloomCount = await page.$$eval('#handloom-container .tilt-3d-card', els => els.length);
  console.log(`🧵 Rendered Handloom Clusters: ${handloomCount}`);

  // Test Bilingual Toggle to Bengali
  await page.click('#lang-btn-bn');
  await new Promise(r => setTimeout(r, 600));
  const heroHeadlineBn = await page.$eval('h1', el => el.innerText);
  console.log('🇧🇩 Bilingual Switcher (Bengali Headline):', heroHeadlineBn);

  // Switch back to English
  await page.click('#lang-btn-en');
  await new Promise(r => setTimeout(r, 600));

  // Test Physics Mode Toggle
  await page.click('#physics-toggle-pill');
  await new Promise(r => setTimeout(r, 600));
  const isBento = await page.$eval('#floating-cards-container', el => el.classList.contains('bento-grid-mode'));
  console.log('📐 Bento Grid Toggle Active:', isBento);

  // Switch physics back to ON
  await page.click('#physics-toggle-pill');
  await new Promise(r => setTimeout(r, 600));

  // Take Full-Page Screenshot
  console.log('📸 Capturing Full-Page Screenshot to:', screenshotPath);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await browser.close();

  console.log('\n================ VERIFICATION REPORT ================');
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length) console.log(consoleErrors);
  console.log(`Network Failures: ${networkErrors.length}`);
  if (networkErrors.length) console.log(networkErrors);
  console.log(`Screenshot Generated: ${fs.existsSync(screenshotPath)} (${fs.statSync(screenshotPath).size} bytes)`);
  console.log('====================================================\n');
}

verify().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
