// convert_to_webp.js
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function convertToWebP(srcPath, destPath, width, height) {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage();
  const fileData = fs.readFileSync(srcPath);
  const ext = path.extname(srcPath).replace('.', '').toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = `data:${mime};base64,${fileData.toString('base64')}`;
  
  const w = width || 1600;
  const h = height || Math.round(w * 0.5625);
  await page.setViewport({ width: w, height: h });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:#000;"><img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;display:block;"></body></html>`);
  await page.screenshot({ path: destPath, type: 'webp', quality: 88 });
  await browser.close();
  console.log(`Converted ${srcPath} -> ${destPath} (${fs.statSync(destPath).size} bytes)`);
}

async function main() {
  const list = [
    ['public/images/santipur/rash-utsav/santipur-raas-mancha-illumination.jpg', 'public/images/santipur/rash-utsav/santipur-raas-mancha-illumination.webp', 1920, 1080],
    ['public/images/santipur/rash-utsav/santipur-radha-govinda-raas-vigraha.jpg', 'public/images/santipur/rash-utsav/santipur-radha-govinda-raas-vigraha.webp', 1600, 900],
    ['public/images/santipur/rash-utsav/santipur-bhanga-rash-rairaja-01.jpg', 'public/images/santipur/rash-utsav/santipur-bhanga-rash-rairaja-01.webp', 1600, 900],
    ['public/images/santipur/rash-utsav/santipur-bamakali-visarjan-dance-mashal.jpg', 'public/images/santipur/rash-utsav/santipur-bamakali-visarjan-dance-mashal.webp', 1280, 720],
    ['public/images/santipur/festivals/santipur-bamakali-night-immersion-01.png', 'public/images/santipur/rash-utsav/santipur-bamakali-night-immersion.webp', 1280, 720]
  ];
  for (const [src, dest, w, h] of list) {
    if (fs.existsSync(src)) {
      await convertToWebP(src, dest, w, h);
    }
  }
}
main().catch(console.error);
