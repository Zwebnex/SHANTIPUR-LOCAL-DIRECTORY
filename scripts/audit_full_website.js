// audit_full_website.js
const puppeteer = require('puppeteer-core');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function auditSite() {
  console.log('=== STARTING COMPREHENSIVE PERFORMANCE & FUNCTIONALITY AUDIT ===');
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const failedRequests = [];
  const consoleErrors = [];

  page.on('requestfailed', req => {
    // Ignore aborted requests or external tracking
    if (!req.url().includes('google-analytics') && !req.url().includes('fonts.gstatic')) {
      failedRequests.push({ url: req.url(), failure: req.failure().errorText });
    }
  });

  page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('favicon')) {
      failedRequests.push({ url: res.url(), status: res.status() });
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // 1. Audit Homepage
  const t0 = Date.now();
  console.log('Testing Homepage http://127.0.0.1:5173/ ...');
  const homeRes = await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  const homeLoadTime = Date.now() - t0;
  console.log(`Homepage loaded in ${homeLoadTime}ms with status ${homeRes.status()}`);

  // Test interactive search
  await page.type('#search-input', 'Agame');
  await page.waitForTimeout ? page.waitForTimeout(300) : new Promise(r => setTimeout(r, 300));
  const liveDropVisible = await page.$eval('#search-live-dropdown', el => !el.classList.contains('hidden'));
  console.log('Search Dropdown opens automatically on type:', liveDropVisible);

  // Test clear button
  await page.click('#search-clear-btn');
  const clearVal = await page.$eval('#search-input', el => el.value);
  console.log('Search input cleared by clear button:', clearVal === '');

  // 2. Audit Raas Utsav Page
  const t1 = Date.now();
  console.log('Testing Raas Utsav Page http://127.0.0.1:5173/raas-utsav ...');
  const raasRes = await page.goto('http://127.0.0.1:5173/raas-utsav', { waitUntil: 'networkidle2' });
  const raasLoadTime = Date.now() - t1;
  console.log(`Raas Utsav loaded in ${raasLoadTime}ms with status ${raasRes.status()}`);

  console.log('Failed network requests:', failedRequests);
  console.log('Console errors:', consoleErrors);

  await browser.close();

  if (failedRequests.length > 0 || consoleErrors.length > 0) {
    console.error('Audit found issues to address!');
    process.exit(1);
  } else {
    console.log('=== AUDIT PASSED 100%: ZERO FAILED REQUESTS, ZERO CONSOLE ERRORS ===');
  }
}

auditSite().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
