const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\BIPRA DAS\\.gemini\\antigravity\\brain\\11ec1e44-ef2c-4920-af50-5d12fd41be24';

async function testRaasTranslation() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:5173/raas-utsav', { waitUntil: 'networkidle2' });

  const enHeadline = await page.$eval('[data-i18n="mainHeadline"]', el => el.textContent.trim());
  console.log('Initial English Headline:', enHeadline);

  // Click Bengali button
  await page.click('#lang-btn-bn');

  const bnHeadline = await page.$eval('[data-i18n="mainHeadline"]', el => el.textContent.trim());
  console.log('Translated Bengali Headline:', bnHeadline);

  const bnSec1 = await page.$eval('[data-i18n="sec1Title"]', el => el.textContent.trim());
  console.log('Translated Bengali Sec1:', bnSec1);

  const bnNavHome = await page.$eval('[data-i18n="navHome"]', el => el.textContent.trim());
  console.log('Translated Bengali Nav Home:', bnNavHome);

  const bnBadge = await page.$eval('[data-i18n="guideBadge"]', el => el.textContent.trim());
  console.log('Translated Bengali Guide Badge:', bnBadge);

  const previewPath = path.join(ARTIFACT_DIR, 'raas_bengali_translation_preview.png');
  await page.screenshot({ path: previewPath });
  console.log('Saved Bengali screenshot to:', previewPath);

  // Click English button
  await page.click('#lang-btn-en');
  const enRevertedHeadline = await page.$eval('[data-i18n="mainHeadline"]', el => el.textContent.trim());
  console.log('Reverted English Headline:', enRevertedHeadline);

  await browser.close();
  console.log('Test completed successfully.');
}

testRaasTranslation().catch(console.error);

