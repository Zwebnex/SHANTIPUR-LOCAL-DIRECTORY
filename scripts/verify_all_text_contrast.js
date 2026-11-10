const puppeteer = require('puppeteer-core');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Testing http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });

  const heroStyles = await page.evaluate(() => {
    const h1 = document.querySelector('#hero-section h1');
    const p = document.querySelector('#hero-section p');
    const badge = document.querySelector('#hero-section [data-i18n="heroBadge"]');
    const tag = document.querySelector('#hero-section button');
    
    return {
      h1Color: h1 ? window.getComputedStyle(h1).color : null,
      h1Text: h1 ? h1.innerText : null,
      pColor: p ? window.getComputedStyle(p).color : null,
      badgeColor: badge ? window.getComputedStyle(badge).color : null,
      tagColor: tag ? window.getComputedStyle(tag).color : null
    };
  });

  console.log('Hero Styles Check:', JSON.stringify(heroStyles, null, 2));

  // Check section headings across the page
  const sectionHeadings = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
    return headings.map(h => {
      const style = window.getComputedStyle(h);
      return {
        tag: h.tagName,
        text: h.innerText.substring(0, 30),
        color: style.color,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight
      };
    });
  });

  console.log(`Audited ${sectionHeadings.length} headings across the page.`);
  
  // Test /routes URL
  console.log('Testing http://127.0.0.1:5173/routes ...');
  await page.goto('http://127.0.0.1:5173/routes', { waitUntil: 'networkidle2' });
  const routesHero = await page.evaluate(() => {
    const h1 = document.querySelector('#hero-section h1');
    return h1 ? window.getComputedStyle(h1).color : 'not found';
  });
  console.log('Routes URL hero h1 color:', routesHero);

  // Test /raas-utsav URL
  console.log('Testing http://127.0.0.1:5173/raas-utsav ...');
  await page.goto('http://127.0.0.1:5173/raas-utsav', { waitUntil: 'networkidle2' });
  const raasH1 = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 ? { text: h1.innerText, color: window.getComputedStyle(h1).color } : null;
  });
  console.log('Raas Utsav h1:', JSON.stringify(raasH1));

  await browser.close();
  console.log('Contrast & Text Audit Complete!');
})();
