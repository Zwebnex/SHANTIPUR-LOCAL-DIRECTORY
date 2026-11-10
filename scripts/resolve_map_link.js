const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  console.log('Resolving user Google Maps link: https://maps.app.goo.gl/duNTyatQ7nMmSxYc6 ...');
  
  try {
    await page.goto('https://maps.app.goo.gl/duNTyatQ7nMmSxYc6', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise(r => setTimeout(r, 4000));
    const finalUrl = page.url();
    const title = await page.title();
    console.log('FINAL_URL:', finalUrl);
    console.log('PAGE_TITLE:', title);
  } catch (err) {
    console.error('Error navigating:', err.message);
  } finally {
    await browser.close();
  }
})();

