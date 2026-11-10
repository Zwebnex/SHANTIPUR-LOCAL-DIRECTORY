// test_routes_system.js - Automated Verification of Shantipur Route Map & GIS Navigation
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testRoutesSystem() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const screenshotPath = path.join(__dirname, 'routes_verification_preview.png');

  console.log('🔍 Launching Headless Chrome to test Route Map System...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1280,1400']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1400 });

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`${msg.text()} [${JSON.stringify(msg.location())}]`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  page.on('requestfailed', req => {
    networkErrors.push(`${req.url()} (${req.failure()?.errorText})`);
  });

  console.log('🌐 1. Navigating to http://127.0.0.1:5173 ...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Check Routes Section Header
  const title = await page.$eval('#routes-section h2', el => el.innerText);
  console.log('📍 Page / Section Title:', title);
  if (!title.includes('Explore Shantipur')) {
    throw new Error('Title does not match "Explore Shantipur"');
  }

  // 2. Check Leaflet Map
  await page.waitForSelector('#routes-map .leaflet-pane', { timeout: 10000 });
  const markerCount = await page.$$eval('#routes-map .leaflet-marker-icon', els => els.length);
  console.log(`🗺️ Leaflet Map Active with ${markerCount} Heritage Markers`);
  if (markerCount < 10) {
    throw new Error(`Expected at least 10 markers, found ${markerCount}`);
  }

  // 3. Check Destination Cards
  const cardsCount = await page.$$eval('#destination-cards-grid .dest-card', els => els.length);
  console.log(`🗂️ Rendered Destination Cards: ${cardsCount}`);

  // 4. Check Bama Kali & Bejpara Ground Distinction
  const bejparaCard = await page.$('#card-bejpara-ground');
  const bamaKaliCard = await page.$('#card-bama-kali-temple');
  const barabazarCard = await page.$('#card-barabazar-more');
  console.log(`✨ Bejpara Ground Card Exists: ${!!bejparaCard}`);
  console.log(`✨ Bama Kali Sanctum Card Exists: ${!!bamaKaliCard}`);
  console.log(`✨ Barabazar More Card Exists: ${!!barabazarCard}`);

  // 5. Test Google Maps URL Construction (Device Current Location Default with Verified Coordinates)
  const gmapsUrl = await page.evaluate(() => {
    let capturedUrl = '';
    const originalOpen = window.open;
    window.open = function(url) {
      capturedUrl = url;
      return null;
    };
    // Call Show Route for Bejpara Ground with verified coordinates (23.232778, 88.438889)
    window.openGoogleMapsRoute(23.232778, 88.438889, null, '6CVQ+4H');
    window.open = originalOpen;
    return capturedUrl;
  });

  console.log('🚗 Universal Google Maps URL (Walking default):', gmapsUrl);
  if (!gmapsUrl.includes('destination=23.232778,88.438889') || !gmapsUrl.includes('travelmode=walking')) {
    throw new Error('Google Maps URL format incorrect for verified coordinates');
  }
  if (gmapsUrl.includes('origin=')) {
    throw new Error('Google Maps URL should omit origin so current GPS location is used');
  }

  // 6. Test Travel Mode Switcher
  await page.evaluate(() => window.setTravelMode('driving'));
  const drivingUrl = await page.evaluate(() => {
    let capturedUrl = '';
    const originalOpen = window.open;
    window.open = function(url) {
      capturedUrl = url;
      return null;
    };
    window.openGoogleMapsRoute(23.232778, 88.438889);
    window.open = originalOpen;
    return capturedUrl;
  });
  console.log('🚘 Travel Mode Switcher (Driving):', drivingUrl);
  if (!drivingUrl.includes('travelmode=driving')) {
    throw new Error('Travel mode driving failed');
  }

  // 7. Test Curated Multi-Stop Trail Launcher
  const multiStopUrl = await page.evaluate(() => {
    let capturedUrl = '';
    const originalOpen = window.open;
    window.open = function(url) {
      capturedUrl = url;
      return null;
    };
    window.openCuratedGoogleMapsRoute('shakti-heritage-trail');
    window.open = originalOpen;
    return capturedUrl;
  });
  console.log('🪔 Curated Multi-Stop Route URL:', multiStopUrl);
  if (!multiStopUrl.includes('origin=') || !multiStopUrl.includes('destination=') || !multiStopUrl.includes('waypoints=')) {
    throw new Error('Multi-stop route URL format incorrect');
  }

  // 8. Test Search Places Filter
  await page.type('#route-search-input', 'Bejpara');
  await new Promise(r => setTimeout(r, 400));
  const filteredCards = await page.$$eval('#destination-cards-grid .dest-card', els => els.length);
  console.log(`🔎 Filtered Places by "Bejpara": ${filteredCards} cards displayed`);

  // Clear search
  await page.evaluate(() => window.resetRouteFilters());
  await new Promise(r => setTimeout(r, 400));

  // 9. Test Destination Details Modal Opening
  await page.evaluate(() => window.openDestinationModal('boro-goswami-bari'));
  await new Promise(r => setTimeout(r, 500));
  const modalVisible = await page.$eval('#destination-detail-modal', el => !el.classList.contains('hidden'));
  const modalTitle = await page.$eval('#destination-modal-content h2', el => el.innerText);
  console.log(`📖 Destination Modal Opened: ${modalVisible} | Title: "${modalTitle}"`);

  // Close Modal
  await page.evaluate(() => window.closeDestinationModal());
  await new Promise(r => setTimeout(r, 400));

  // 10. Capture Full Page Screenshot
  console.log('📸 Capturing Screenshot to:', screenshotPath);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  await browser.close();

  console.log('\n================ ROUTE MAP SYSTEM VERIFICATION SUMMARY ================');
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length) console.log(consoleErrors);
  console.log(`Network Failures: ${networkErrors.length}`);
  if (networkErrors.length) console.log(networkErrors);
  console.log(`Screenshot Generated: ${fs.existsSync(screenshotPath)}`);
  console.log('========================================================================\n');
}

testRoutesSystem().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
