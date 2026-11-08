const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function main() {
  // Let's copy Cultural images/GHOR CHADUNI.png to public/images/test_chaduni.png
  if (!fs.existsSync('public/images/test_chaduni.png')) {
    fs.copyFileSync('Cultural images/GHOR CHADUNI.png', 'public/images/test_chaduni.png');
  }
  
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 700 });
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>body { margin:0; display:flex; background:#111; color:#fff; font-family:sans-serif; text-align:center; }</style></head>
    <body>
      <div style="flex:1; padding:10px;">
        <h3>GHOR CHADUNI.png</h3>
        <img src="http://127.0.0.1:5173/images/test_chaduni.png" style="max-width:100%; height:500px; object-fit:contain;" />
      </div>
      <div style="flex:1; padding:10px;">
        <h3>সিদ্ধেশ্বরী কালী.png (Cropped)</h3>
        <img src="http://127.0.0.1:5173/images/santipur/maa-kali/santipur-siddheswari-kali-idol-01.png" style="max-width:100%; height:500px; object-fit:contain;" />
      </div>
      <div style="flex:1; padding:10px;">
        <h3>বামাকালী মাতা.png</h3>
        <img src="http://127.0.0.1:5173/images/santipur/maa-kali/santipur-maa-bamakali-idol-01.png" style="max-width:100%; height:500px; object-fit:contain;" />
      </div>
    </body>
    </html>
  `;
  await page.setContent(html);
  // Wait for images to load
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'scratch_compare.png' });
  await browser.close();
  console.log('Saved scratch_compare.png');
}

main().catch(console.error);
