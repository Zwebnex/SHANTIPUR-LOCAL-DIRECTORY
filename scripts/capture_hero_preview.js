const puppeteer = require('puppeteer-core');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testHero() {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  
  const heroElement = await page.$('#hero-section');
  await heroElement.screenshot({ path: 'public/hero_contrast_fix_preview.png' });
  
  // Also check text color of H1 in hero
  const h1Color = await page.$eval('#hero-section h1', el => window.getComputedStyle(el).color);
  console.log('Hero H1 Computed Color:', h1Color);

  await browser.close();
  console.log('Captured public/hero_contrast_fix_preview.png');
}
testHero().catch(console.error);
