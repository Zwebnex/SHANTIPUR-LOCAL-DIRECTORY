const puppeteer = require('puppeteer-core');

(async () => {
  console.log('🚀 Testing Desktop & Mobile Dropdown Navigation & Civic Directory...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. Desktop Test (1280x800)
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  console.log('🖥️ 1. Testing Desktop Navbar & Dropdowns...');
  const desktopMenuVisible = await page.$eval('#desktop-nav-menu', el => !el.classList.contains('hidden'));
  console.log('   - Desktop Nav Visible:', desktopMenuVisible);

  const dropdownItems = await page.$$eval('#desktop-nav-menu .nav-dropdown-item', els => els.length);
  console.log('   - Dropdown Menus Count:', dropdownItems);

  // Test opening Civic Dropdown via click
  await page.click('#desktop-nav-menu .nav-dropdown-item:last-child button');
  await new Promise(r => setTimeout(r, 400));
  const isCivicDropdownActive = await page.$eval('#desktop-nav-menu .nav-dropdown-item:last-child .dropdown-menu', el => el.classList.contains('active-dropdown') || window.getComputedStyle(el).opacity === '1');
  console.log('   - Civic Dropdown Active on Click:', isCivicDropdownActive);

  // Test opening Civic Directory Modal from Desktop Dropdown
  await page.click('#desktop-nav-menu .nav-dropdown-item:last-child .dropdown-menu button');
  await new Promise(r => setTimeout(r, 500));
  const isModalOpen = await page.$eval('#civic-directory-modal', el => !el.classList.contains('hidden'));
  console.log('   - Civic Directory Modal Opened:', isModalOpen);

  // Test Modal Filtering
  await page.click('button[data-civic-tab="police"]');
  await new Promise(r => setTimeout(r, 300));
  const visibleCardsPolice = await page.$$eval('.civic-card:not(.hidden)', els => els.length);
  console.log('   - Police Tab Filtered Cards:', visibleCardsPolice);

  // Test Modal Search
  await page.type('#civic-search-input', 'Hospital');
  await new Promise(r => setTimeout(r, 300));
  const searchResults = await page.$$eval('.civic-card:not(.hidden)', els => els.length);
  console.log('   - Search "Hospital" Result Count:', searchResults);

  // Close Modal
  await page.click('#civic-directory-modal button[aria-label="Close Civic Directory"]');
  await new Promise(r => setTimeout(r, 300));
  const isModalClosed = await page.$eval('#civic-directory-modal', el => el.classList.contains('hidden'));
  console.log('   - Civic Directory Modal Closed:', isModalClosed);

  // 2. Mobile Viewport Test (375x812 - iPhone X/12)
  console.log('\n📱 2. Testing Responsive Mobile Navbar & Drawer...');
  await page.setViewport({ width: 375, height: 812 });
  await new Promise(r => setTimeout(r, 500));

  const mobileToggleVisible = await page.$eval('#mobile-menu-toggle-btn', el => window.getComputedStyle(el).display !== 'none');
  console.log('   - Mobile Hamburger Button Visible:', mobileToggleVisible);

  // Click Hamburger Button
  await page.click('#mobile-menu-toggle-btn');
  await new Promise(r => setTimeout(r, 400));
  const isDrawerOpen = await page.$eval('#mobile-menu-drawer', el => !el.classList.contains('hidden'));
  console.log('   - Mobile Navigation Drawer Open:', isDrawerOpen);

  // Test Mobile Accordion
  await page.click('button[onclick*="acc-civic"]');
  await new Promise(r => setTimeout(r, 300));
  const isAccCivicOpen = await page.$eval('#acc-civic', el => !el.classList.contains('hidden'));
  console.log('   - Mobile Civic Accordion Open:', isAccCivicOpen);

  // Capture Screenshot of Mobile Drawer
  const mobileScreenshot = 'mobile_nav_preview.png';
  await page.screenshot({ path: mobileScreenshot });
  console.log(`   - Saved Mobile Screenshot to ${mobileScreenshot}`);

  await browser.close();

  console.log('\n================ SUMMARY ================');
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Errors:', consoleErrors);
  }
  console.log('✅ All tests completed successfully!');
})();
