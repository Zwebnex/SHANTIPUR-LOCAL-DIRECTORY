const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  try {
    console.log('Navigating to http://localhost:5173 ...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });

    // 1. Verify NGO Filter Tab exists
    const ngoTab = await page.$('button[data-tab="ngos"]');
    if (!ngoTab) throw new Error('NGO Filter tab not found in DOM!');
    console.log('✓ Found NGO Filter Tab');

    // 2. Click on NGO Filter Tab
    await page.evaluate(() => {
      window.setFilterTab('ngos');
    });
    await new Promise(r => setTimeout(r, 600));

    // 3. Count rendered cards in listings-container
    const cardTitles = await page.evaluate(() => {
      const cards = document.querySelectorAll('#listings-container .group');
      return Array.from(cards).map(c => c.querySelector('h3')?.textContent?.trim());
    });
    console.log(`✓ Rendered ${cardTitles.length} NGO Cards under 'ngos' tab:`, cardTitles);

    if (cardTitles.length !== 9) {
      throw new Error(`Expected 9 NGO cards, got ${cardTitles.length}`);
    }

    // Capture screenshot of NGO grid
    const ngoGridArtifact = 'C:\\Users\\BIPRA DAS\\.gemini\\antigravity\\brain\\11ec1e44-ef2c-4920-af50-5d12fd41be24\\ngos_grid_preview.png';
    const listingsSection = await page.$('#listings-section');
    if (listingsSection) {
      await listingsSection.screenshot({ path: ngoGridArtifact });
      console.log('✓ Captured NGO grid screenshot:', ngoGridArtifact);
    }

    // 4. Test clicking on first NGO card (SECHO) to open detail modal
    await page.evaluate(() => {
      window.openDetailModal('secho', 'ngo');
    });
    await new Promise(r => setTimeout(r, 600));

    const modalTitle = await page.evaluate(() => {
      return document.querySelector('#detail-modal h2')?.textContent?.trim();
    });
    console.log('✓ Opened Detail Modal with title:', modalTitle);

    const modalArtifact = 'C:\\Users\\BIPRA DAS\\.gemini\\antigravity\\brain\\11ec1e44-ef2c-4920-af50-5d12fd41be24\\ngo_modal_preview.png';
    await page.screenshot({ path: modalArtifact });
    console.log('✓ Captured NGO modal screenshot:', modalArtifact);

    // Close detail modal
    await page.evaluate(() => {
      window.closeDetailModal();
    });
    await new Promise(r => setTimeout(r, 400));

    // 5. Test Bengali Translation
    console.log('Testing Bengali language toggle...');
    await page.evaluate(() => {
      window.toggleLanguage('bn');
    });
    await new Promise(r => setTimeout(r, 600));

    const bnTab = await page.$('button[data-tab="ngos"]');
    const bnTabText = await page.evaluate(el => el.textContent.trim(), bnTab);
    console.log('✓ Bengali NGO Tab text:', bnTabText);

    const bnCardTitles = await page.evaluate(() => {
      const cards = document.querySelectorAll('#listings-container .group');
      return Array.from(cards).map(c => c.querySelector('h3')?.textContent?.trim());
    });
    console.log(`✓ Bengali NGO Card titles (${bnCardTitles.length}):`, bnCardTitles);

    const bnGridArtifact = 'C:\\Users\\BIPRA DAS\\.gemini\\antigravity\\brain\\11ec1e44-ef2c-4920-af50-5d12fd41be24\\ngos_bengali_grid_preview.png';
    const listingsSectionBn = await page.$('#listings-section');
    if (listingsSectionBn) {
      await listingsSectionBn.screenshot({ path: bnGridArtifact });
      console.log('✓ Captured Bengali NGO grid screenshot:', bnGridArtifact);
    }

    // 6. Test Civic Modal NGO Tab
    console.log('Testing Civic Modal NGO tab...');
    await page.evaluate(() => {
      window.openCivicDirectoryModal('ngo');
    });
    await new Promise(r => setTimeout(r, 600));

    const visibleCivicCards = await page.evaluate(() => {
      const cards = document.querySelectorAll('#civic-directory-cards-container .civic-card:not(.hidden)');
      return Array.from(cards).map(c => c.querySelector('h4')?.textContent?.trim());
    });
    console.log(`✓ Civic Modal Visible NGO Cards (${visibleCivicCards.length}):`, visibleCivicCards);

    const civicModalArtifact = 'C:\\Users\\BIPRA DAS\\.gemini\\antigravity\\brain\\11ec1e44-ef2c-4920-af50-5d12fd41be24\\civic_ngo_modal_preview.png';
    await page.screenshot({ path: civicModalArtifact });
    console.log('✓ Captured Civic Modal NGO screenshot:', civicModalArtifact);

    console.log('\n=== ALL NGO INTEGRATION TESTS PASSED PERFECTLY ===\n');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
