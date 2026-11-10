const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\BIPRA DAS\\.gemini\\antigravity\\brain\\11ec1e44-ef2c-4920-af50-5d12fd41be24';

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('https://santipurheritage.vercel.app', { waitUntil: 'networkidle2' });

  const banner = await page.$('#supabase-config-warning-banner');
  console.log('Banner exists in DOM:', !!banner);

  const content = await page.content();
  console.log('Mentions bnlhqkcyqymsvtqblwkv in page content:', content.includes('bnlhqkcyqymsvtqblwkv'));
  console.log('Mentions supabase.co in page content:', content.includes('supabase.co'));

  const previewPath = path.join(ARTIFACT_DIR, 'live_no_db_banner_preview.png');
  await page.screenshot({ path: previewPath });
  console.log('Saved screenshot to:', previewPath);

  await browser.close();
}

verify().catch(console.error);
