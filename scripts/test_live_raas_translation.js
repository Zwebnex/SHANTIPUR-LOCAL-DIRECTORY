const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\BIPRA DAS\\.gemini\\antigravity\\brain\\11ec1e44-ef2c-4920-af50-5d12fd41be24';

async function testLiveTranslation() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to live https://santipurheritage.vercel.app/raas-utsav ...');
  await page.goto('https://santipurheritage.vercel.app/raas-utsav', { waitUntil: 'networkidle2' });

  const enTitle = await page.$eval('[data-i18n="mainHeadline"]', el => el.textContent.trim());
  console.log('Live English Headline:', enTitle);

  // Click বাংলা button
  await page.click('#lang-btn-bn');

  const bnTitle = await page.$eval('[data-i18n="mainHeadline"]', el => el.textContent.trim());
  console.log('Live Translated Bengali Headline:', bnTitle);

  const previewPath = path.join(ARTIFACT_DIR, 'live_raas_bengali_translation.png');
  await page.screenshot({ path: previewPath });
  console.log('Saved live Bengali screenshot to:', previewPath);

  await browser.close();
  console.log('Live translation verified successfully.');
}

testLiveTranslation().catch(console.error);
