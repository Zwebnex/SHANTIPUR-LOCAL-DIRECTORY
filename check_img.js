const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 450 });
  const imgBase64 = fs.readFileSync('Cultural images/GHOR CHADUNI.png').toString('base64');
  await page.setContent('<html><body style="margin:0;background:#000;"><img src="data:image/png;base64,' + imgBase64 + '" style="width:100%;height:auto;"/></body></html>');
  await page.screenshot({ path: 'scratch_chaduni.jpg', quality: 70 });
  await browser.close();
  console.log('Successfully generated scratch_chaduni.jpg');
})();
