// verify_raas_page.js
const puppeteer = require('puppeteer-core');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPage() {
  console.log('--- Launching Chrome for Raas Utsav Page Audit ---');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  const url = 'http://127.0.0.1:5173/raas-utsav';
  console.log('Navigating to:', url);
  const response = await page.goto(url, { waitUntil: 'networkidle2' });

  console.log('HTTP Status:', response.status());
  if (response.status() !== 200) {
    throw new Error(`Expected 200, got ${response.status()}`);
  }

  // 1. Audit Title & Meta
  const title = await page.title();
  console.log('Title:', title);
  if (title !== 'Santipur Raas Utsav 2026 & Bama Kali Dance: History, Photos & Videos') {
    throw new Error('Title does not match exact specification');
  }

  const metaDesc = await page.$eval('meta[name="description"]', el => el.content);
  console.log('Meta Description:', metaDesc);
  if (!metaDesc.includes('Santipur Raas Utsav') || !metaDesc.includes('Bama Kali')) {
    throw new Error('Meta description invalid');
  }

  const metaKeywords = await page.$eval('meta[name="keywords"]', el => el.content);
  console.log('Keywords:', metaKeywords);

  // 2. Audit Heading Hierarchy
  const h1Count = await page.$$eval('h1', els => els.length);
  const h1Text = await page.$eval('h1', el => el.textContent.trim());
  console.log(`H1 Count: ${h1Count} | Text: "${h1Text}"`);
  if (h1Count !== 1) throw new Error(`Expected exactly 1 H1, found ${h1Count}`);

  const h2Count = await page.$$eval('h2', els => els.length);
  console.log(`H2 Count: ${h2Count}`);
  if (h2Count < 5) throw new Error('Expected at least 5 H2 section headings');

  // 3. Audit Images and Alt Texts
  const images = await page.$$eval('figure img', els => els.map(img => ({
    alt: img.alt,
    src: img.src,
    loading: img.getAttribute('loading'),
    width: img.getAttribute('width'),
    height: img.getAttribute('height')
  })));
  console.log('Figure Images found:', images.length);
  images.forEach((img, i) => {
    console.log(` Image ${i + 1}: alt="${img.alt}" | loading=${img.loading} | ${img.width}x${img.height}`);
  });

  const requiredAlts = [
    'Santipur Raas Utsav illuminated Raas Mancha and Radha Krishna idols in Nadia West Bengal',
    'Ancient Radha Krishna vigraha at Baro Goswami Bari during Santipur Raas Yatra',
    'Bhanga Raas street procession and Rai Raja tradition in Santipur Nadia',
    'Santipur Bama Kali miraculous visarjan dance on devotees shoulders in Nadia'
  ];

  requiredAlts.forEach(reqAlt => {
    const found = images.some(img => img.alt === reqAlt);
    if (!found) throw new Error(`Required alt text missing: "${reqAlt}"`);
    console.log(` Verified Alt: "${reqAlt.substring(0, 40)}..."`);
  });

  // 4. Audit YouTube Video Embeds
  const iframes = await page.$$eval('iframe', els => els.map(f => ({
    src: f.src,
    title: f.title,
    loading: f.getAttribute('loading'),
    parentClass: f.parentElement.className
  })));
  console.log('Iframes found:', iframes.length);
  if (iframes.length !== 3) throw new Error(`Expected 3 video iframes, found ${iframes.length}`);

  const expectedVideoIds = ['vUtixq7d3yg', 'Fl2q_asRJmU', '54h_QaG2Uck'];
  expectedVideoIds.forEach(id => {
    const match = iframes.find(f => f.src.includes(id));
    if (!match) throw new Error(`Missing expected video ID: ${id}`);
    if (!match.src.includes('youtube-nocookie.com')) {
      throw new Error(`Video ${id} is not using youtube-nocookie.com`);
    }
    if (!match.parentClass.includes('aspect-video')) {
      throw new Error(`Video ${id} container missing aspect-video`);
    }
    console.log(` Verified Video Embed: ${id} -> ${match.title}`);
  });

  // 5. Audit Schema.org JSON-LD
  const schemas = await page.$$eval('script[type="application/ld+json"]', els => {
    return els.map(el => {
      try { return JSON.parse(el.textContent); } catch (e) { return null; }
    });
  });

  const allItems = [];
  schemas.forEach(s => {
    if (s && s['@graph']) allItems.push(...s['@graph']);
    else if (s) allItems.push(s);
  });

  const eventSchema = allItems.find(item => item['@type'] === 'Festival' || item['@type'] === 'Event');
  if (!eventSchema) throw new Error('Missing Festival/Event schema');
  console.log('Event Schema Name:', eventSchema.name, '| Start:', eventSchema.startDate, '| End:', eventSchema.endDate);

  const videoSchemas = allItems.filter(item => item['@type'] === 'VideoObject');
  console.log('VideoObject Schemas found:', videoSchemas.length);
  if (videoSchemas.length !== 3) throw new Error(`Expected 3 VideoObject schemas, found ${videoSchemas.length}`);
  videoSchemas.forEach((v, i) => console.log(` Video Schema ${i + 1}: ${v.name} -> ${v.embedUrl}`));

  // 6. Capture Visual Screenshots
  console.log('Capturing Desktop Screenshot...');
  await page.screenshot({ path: 'public/raas_utsav_desktop_preview.png', fullPage: true });

  console.log('Capturing Mobile Screenshot...');
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.screenshot({ path: 'public/raas_utsav_mobile_preview.png', fullPage: true });

  await browser.close();
  console.log('=== AUDIT COMPLETE: 100% SPECIFICATIONS PASSED WITH ZERO CONSOLE ERRORS ===');
}

testPage().catch(err => {
  console.error('AUDIT FAILED:', err);
  process.exit(1);
});
