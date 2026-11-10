const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testTranslation() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });

  const titleBefore = await page.$eval('[data-i18n="siteTitle"]', el => el.textContent);
  console.log('Title before:', titleBefore);

  await page.click('#lang-btn-bn');

  const titleAfter = await page.$eval('[data-i18n="siteTitle"]', el => el.textContent);
  console.log('Title after:', titleAfter);

  const headlineAfter = await page.$eval('[data-i18n="heroHeadline"]', el => el.textContent);
  console.log('Headline after:', headlineAfter);

  const navHome = await page.$eval('[data-i18n="navHome"]', el => el.textContent);
  console.log('Nav Home after:', navHome);

  const searchBtn = await page.$eval('[data-i18n="searchBtn"]', el => el.textContent);
  console.log('Search Btn after:', searchBtn);

  // Check if cards have translated titles/details
  const firstCard = await page.$eval('.listing-card, #listings-container', el => el ? el.innerText.slice(0, 150) : 'none');
  console.log('Listings sample:', firstCard);

  await browser.close();
}

testTranslation().catch(console.error);
