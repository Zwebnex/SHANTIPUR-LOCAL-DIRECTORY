const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\BIPRA DAS\\.gemini\\antigravity\\brain\\11ec1e44-ef2c-4920-af50-5d12fd41be24';

async function verifyLive() {
  console.log('Launching Chrome to verify https://santipurheritage.vercel.app ...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  const failedRequests = [];
  page.on('requestfailed', req => {
    failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });

  console.log('Navigating to https://santipurheritage.vercel.app ...');
  const response = await page.goto('https://santipurheritage.vercel.app', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  console.log('Response Status:', response.status());
  console.log('Page Title:', await page.title());

  // Capture screenshot of live home page
  const homeScreenshot = path.join(ARTIFACT_DIR, 'vercel_live_home_preview.png');
  await page.screenshot({ path: homeScreenshot, fullPage: false });
  console.log('Saved home preview to:', homeScreenshot);

  // Navigate to /raas-utsav
  console.log('Navigating to https://santipurheritage.vercel.app/raas-utsav ...');
  const raasRes = await page.goto('https://santipurheritage.vercel.app/raas-utsav', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  console.log('Raas Utsav Status:', raasRes.status());
  const raasScreenshot = path.join(ARTIFACT_DIR, 'vercel_live_raas_preview.png');
  await page.screenshot({ path: raasScreenshot, fullPage: false });
  console.log('Saved Raas Utsav preview to:', raasScreenshot);

  // Check errors
  console.log('\n--- VERIFICATION AUDIT RESULTS ---');
  console.log('Failed Network Requests:', failedRequests.length);
  if (failedRequests.length > 0) {
    console.log(failedRequests.slice(0, 5));
  }
  console.log('Console Errors:', errors.length);
  if (errors.length > 0) {
    console.log(errors.slice(0, 5));
  }

  await browser.close();
  console.log('Audit completed successfully.');
}

verifyLive().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});

