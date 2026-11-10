const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));

  // Open the Civic dropdown
  await page.click('#desktop-nav-menu .nav-dropdown-item:last-child button');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'desktop_nav_preview.png' });
  await browser.close();
  console.log('Desktop screenshot captured successfully');
})();

