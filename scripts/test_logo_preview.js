const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\BIPRA DAS\\.gemini\\antigravity\\brain\\11ec1e44-ef2c-4920-af50-5d12fd41be24';

async function testLogo() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:5173/raas-utsav', { waitUntil: 'networkidle2' });

  const img = await page.$('header a img');
  const src = await page.evaluate(el => el ? el.src : null, img);
  console.log('Header logo src:', src);

  const bounds = await img.boundingBox();
  console.log('Logo bounds:', bounds);

  const previewPath = path.join(ARTIFACT_DIR, 'raas_header_logo_preview.png');
  await page.screenshot({ path: previewPath });
  console.log('Saved preview to:', previewPath);

  await browser.close();
}

testLogo().catch(console.error);

