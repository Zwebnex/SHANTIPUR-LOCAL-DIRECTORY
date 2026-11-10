const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      console.log(`Already exists: ${destPath}`);
      return resolve(destPath);
    }
    const file = fs.createWriteStream(destPath);
    const options = {
      headers: {
        'User-Agent': 'SantipurHeritageResearch/1.0 (antigravity@shantipur.heritage)'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error(`Failed with status ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

function copyFileSafe(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} -> ${dest}`);
  } else {
    console.error(`Source missing: ${src}`);
  }
}

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function run() {
  console.log('--- Step 1: Copying local verified assets ---');

  // 1. Maa Kali
  copyFileSafe('Cultural images/আগমেশ্বরী মাতা.png', 'public/images/santipur/maa-kali/santipur-maa-agameswari-idol-01.png');
  copyFileSafe('Cultural images/BAMA Kaali.png', 'public/images/santipur/maa-kali/santipur-maa-bamakali-idol-01.png');
  copyFileSafe('Cultural images/Ornate Fierce Goddess Shrine in Blue Alcove.png', 'public/images/santipur/maa-kali/santipur-bamakali-shrine-sanctum-01.png');
  copyFileSafe('Cultural images/বামাকালী মাতা.png', 'public/images/santipur/festivals/santipur-bamakali-night-immersion-01.png');
  copyFileSafe('Cultural images/সিদ্ধেশ্বরী কালী.png', 'public/images/santipur/maa-kali/santipur-siddheswari-kali-idol-01.png');

  copyFileSafe('public/uploads/kali_idol_16x9_4k.png', 'public/images/santipur/maa-kali/santipur-maa-mahishkhagi-idol-01.png');
  copyFileSafe('public/uploads/Fiery Nighttime Kali Puja Ritual.png', 'public/images/santipur/maa-kali/santipur-chanduni-mata-dhunuchi-ritual-01.png');
  copyFileSafe('public/uploads/blue_kali_16x9_4k (1).png', 'public/images/santipur/maa-kali/santipur-maa-poteswari-idol-01.png');

  // 2. Vaishnava & Temples
  copyFileSafe('public/uploads/hero_radha_raman_jiu.jpg', 'public/images/santipur/vaishnava-heritage/santipur-sri-radha-raman-jiu-01.jpg');
  copyFileSafe('public/uploads/logo.png', 'public/images/santipur/city-photography/santipur-local-directory-emblem-01.png');

  console.log('--- Step 2: Downloading Wikimedia Commons Assets ---');
  const downloads = [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Agameshwari_Temple%2C_Shantipur_02.jpg',
      dest: 'public/images/santipur/temples/santipur-agameswari-temple-exterior-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Shyamchand_temple_at_Shantipur_in_Nadia_district_01.jpg',
      dest: 'public/images/santipur/temples/santipur-shyamchand-temple-atchala-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Terracotta_panels_on_southern_facade_of_Shyamchand_temple_at_Shantipur_in_Nadia_district_05.jpg',
      dest: 'public/images/santipur/temples/santipur-shyamchand-terracotta-relief-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Jaleswar_Temple_of_Shantipur_01.jpg',
      dest: 'public/images/santipur/temples/santipur-jaleswar-shiva-temple-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Jaleswar_Temple_of_Shantipur_05.jpg',
      dest: 'public/images/santipur/temples/santipur-jaleswar-temple-terracotta-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Kali_Mandir_-_Indian_National_Highway_34_and_Railwat_Track Crossing_-_Gobindapur_-_Santipur_-_Nadia_2013-03-23_7010.JPG',
      dest: 'public/images/santipur/temples/santipur-gobindapur-kali-mandir-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Santipur_Rash_Rairaja_%28%E0%A6%B6%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%A4%E0%A6%BF%E0%A6%AA%E0%A7%81%E0%A6%B0_%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A7%87%E0%A6%B0_%E0%A6%B0%E0%A6%BE%E0%A6%87%E0%A6%B0%E0%A6%BE%E0%A6%9C%E0%A6%BE%29.jpg',
      dest: 'public/images/santipur/rash-utsav/santipur-bhanga-rash-rairaja-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/The_Sun-Drenched_Loom_%2C_a_Century_of_Color_in_Shantipur.jpg',
      dest: 'public/images/santipur/handloom/santipur-traditional-tant-loom-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Lakshmi_Textile_Tant_Workshop_Interior_-_2_Natun_Phulia_-_Nadia_2016-11-12_1805.JPG',
      dest: 'public/images/santipur/handloom/santipur-tant-weaving-workshop-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Shantipur_railway_station_in_Shantipur_01.jpg',
      dest: 'public/images/santipur/historical-landmarks/santipur-railway-station-heritage-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Shantipur_railway_station_in_Shantipur_06.jpg',
      dest: 'public/images/santipur/city-photography/santipur-railway-platform-junction-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Panchpota_Jama_Masjid_-_Indian_National_Highway_34_-_Santipur_-_Nadia_2013-03-23_7015.JPG',
      dest: 'public/images/santipur/historical-landmarks/santipur-panchpota-historic-mosque-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Satyacharan_Smriti_Nimna_Buniyadi_Bidyalaya_-_NH-34_-_Santipur_-_Nadia_2014-11-28_9962.jpg',
      dest: 'public/images/santipur/businesses/education/santipur-satyacharan-buniyadi-bidyalaya-01.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Local_Road_-_Dignagar_Bazaar_Area_-_Indian_National_Highway_34_-_Santipur_-_Nadia_2013-03-23_7021.JPG',
      dest: 'public/images/santipur/markets/santipur-dignagar-bazaar-market-01.jpg'
    }
  ];

  for (const item of downloads) {
    try {
      console.log(`Downloading: ${item.dest}...`);
      await downloadFile(item.url, item.dest);
      console.log(`Saved: ${item.dest}`);
    } catch(err) {
      console.error(`Error downloading ${item.dest}:`, err.message);
    }
  }

  console.log('--- Step 3: Generating Neutral SVG Placeholders ---');
  const placeholders = [
    { file: 'placeholder-restaurant.svg', title: 'Local Cuisine & Sweetshop', category: 'Confectionery & Food' },
    { file: 'placeholder-saree.svg', title: 'Santipuri Tant Saree House', category: 'Handloom & Textiles' },
    { file: 'placeholder-hotel.svg', title: 'Heritage Guest Lodge', category: 'Hotels & Accommodation' },
    { file: 'placeholder-healthcare.svg', title: 'Community Clinic & Pharmacy', category: 'Healthcare' },
    { file: 'placeholder-education.svg', title: 'Academic Institution', category: 'Education & Coaching' },
    { file: 'placeholder-shopping.svg', title: 'Retail & Daily Provisions', category: 'Shopping' },
    { file: 'placeholder-electronics.svg', title: 'Electronics & Repairs', category: 'Electronics' },
    { file: 'placeholder-services.svg', title: 'Heritage Guild & Bell Metal Artisans', category: 'Services' },
    { file: 'placeholder-transport.svg', title: 'Local Transit & Auto Stand', category: 'Transport' }
  ];

  placeholders.forEach(p => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#F4F4F0"/>
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#E2E2DC" stroke-width="2" stroke-dasharray="8 8"/>
  <circle cx="400" cy="250" r="70" fill="#EAEAE4"/>
  <path d="M375 250 L425 250 M400 225 L400 275" stroke="#B79550" stroke-width="3" stroke-linecap="round"/>
  <text x="400" y="370" font-family="'Inter', sans-serif" font-size="22" font-weight="600" fill="#202020" text-anchor="middle">${p.title}</text>
  <text x="400" y="405" font-family="'Inter', sans-serif" font-size="14" font-weight="500" fill="#777777" text-anchor="middle">SANTIPUR VERIFIED DIRECTORY • ${p.category.toUpperCase()}</text>
  <text x="400" y="440" font-family="'Inter', sans-serif" font-size="12" fill="#999999" text-anchor="middle">Official Business Photography Verification Pending</text>
</svg>`;
    fs.writeFileSync(`public/images/santipur/placeholders/${p.file}`, svg);
  });
  console.log(`Generated ${placeholders.length} neutral SVG placeholders`);
}

run().catch(console.error);

