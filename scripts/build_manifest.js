const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

const catalogEntries = [
  // 1. Maa Kali & Shakti Heritage (Strictly Unique Dedicated Assets)
  {
    id: "santipur-kali-001",
    title: "Maa Agameswari Idol (420 Years)",
    category: "religious-heritage",
    subcategory: "maa-kali",
    location: "Agameswari Tala, Ward 12, Santipur, Nadia",
    originalFilename: "Cultural images/আগমেশ্বরী মাতা.png",
    productionPath: "/images/santipur/maa-kali/santipur-maa-agameswari-idol-01.png",
    sourcePage: "Agameswari Tala Trust & Local Devotees Archive",
    originalImageUrl: "Cultural images/আগমেশ্বরী মাতা.png",
    photographerOrOwner: "Agameswari Tala Puja Committee & Local Devotees",
    license: "Local Heritage Archive / Owner Authorized",
    permissionStatus: "owner-authorized",
    verified: true,
    recommendedPlacement: [
      "homepage-heritage-card",
      "shrine-directory-agameswari",
      "heritage-gallery-maa-kali"
    ],
    verificationNotes: "Authentic 420-year-old Agameswari idol consecrated by Tantracharya Krishnananda Agambagish, author of Brihat Tantrasara. Clay idol created on Amavasya night and immersed at Ghat next sunrise."
  },
  {
    id: "santipur-kali-002",
    title: "Maa Mahishkhagi Historic Procession",
    category: "religious-heritage",
    subcategory: "maa-kali",
    location: "Mahishkhagi Para, Ward 08, Santipur, Nadia",
    originalFilename: "Mahiskhagi Kali, Santipur, West Bengal, IMG 2642.jpg",
    productionPath: "/images/santipur/maa-kali/santipur-maa-mahishkhagi-procession-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Mahiskhagi_Kali,_Santipur,_West_Bengal,_IMG_2642.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Mahiskhagi_Kali%2C_Santipur%2C_West_Bengal%2C_IMG_2642.jpg",
    photographerOrOwner: "Sammya Brata",
    license: "Creative Commons CC BY-SA 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "shrine-directory-mahishkhagi",
      "heritage-gallery-maa-kali"
    ],
    verificationNotes: "Authentic historic procession of Mahiskhagi Kali through the ancient lanes of Santipur, Nadia, West Bengal. Unique in Bengal for being conducted with Vedic marriage rituals (Dadhimangal and Bashi Biye)."
  },
  {
    id: "santipur-kali-003",
    title: "Maa Bamakali Deity (Left Foot Forward)",
    category: "religious-heritage",
    subcategory: "maa-kali",
    location: "Bamakali Tala, Sutragarh, Santipur, Nadia",
    originalFilename: "Cultural images/BAMA Kaali.png",
    productionPath: "/images/santipur/maa-kali/santipur-maa-bamakali-idol-01.png",
    sourcePage: "Bamakali Trust Committee & Devotees Archive",
    originalImageUrl: "Cultural images/BAMA Kaali.png",
    photographerOrOwner: "Bamakali Trust Committee",
    license: "Local Heritage Archive / Community Use",
    permissionStatus: "owner-authorized",
    verified: true,
    recommendedPlacement: [
      "shrine-directory-bamakali",
      "heritage-gallery-maa-kali"
    ],
    verificationNotes: "Authentic portrait of the fierce Goddess stepping forward with her left foot (Bama-pada), cropped to remove padded side bars."
  },
  {
    id: "santipur-kali-004",
    title: "Maa Bamakali Sanctum Shrine",
    category: "religious-heritage",
    subcategory: "maa-kali",
    location: "Bamakali Tala, Sutragarh, Santipur, Nadia",
    originalFilename: "Cultural images/Ornate Fierce Goddess Shrine in Blue Alcove.png",
    productionPath: "/images/santipur/maa-kali/santipur-bamakali-shrine-sanctum-01.png",
    sourcePage: "Santipur Temple Preservation Forum",
    originalImageUrl: "Cultural images/Ornate Fierce Goddess Shrine in Blue Alcove.png",
    photographerOrOwner: "Santipur Temple Preservation Forum",
    license: "Heritage Archive / Directory Use",
    permissionStatus: "owner-authorized",
    verified: true,
    recommendedPlacement: [
      "shrine-directory-bamakali-detail",
      "heritage-gallery-sanctums"
    ],
    verificationNotes: "Inner sanctum with characteristic arched niche, brass hanging bells, and ceremonial silver ornaments."
  },
  {
    id: "santipur-kali-005",
    title: "Sutragarh Siddheswari Kali Mandir Idol",
    category: "religious-heritage",
    subcategory: "maa-kali",
    location: "K.C. Das Road, Sutragarh, Santipur, Nadia",
    originalFilename: "Cultural images/সিদ্ধেশ্বরী কালী.png",
    productionPath: "/images/santipur/maa-kali/santipur-siddheswari-kali-idol-01.png",
    sourcePage: "Sutragarh Weavers Guild & Temple Committee",
    originalImageUrl: "Cultural images/সিদ্ধেশ্বরী কালী.png",
    photographerOrOwner: "Sutragarh Weavers Guild & Temple Committee",
    license: "Community Cultural Archive",
    permissionStatus: "owner-authorized",
    verified: true,
    recommendedPlacement: [
      "shrine-directory-siddheswari",
      "heritage-gallery-maa-kali"
    ],
    verificationNotes: "Revered patron goddess of the Sutragarh handloom weaver community, cropped to remove padded side bars."
  },
  {
    id: "santipur-kali-006",
    title: "Maa Poteswari Deity (Barajiakur)",
    category: "religious-heritage",
    subcategory: "maa-kali",
    location: "Poteswari Street, Barajiakur, Santipur, Nadia",
    originalFilename: "placeholder-poteswari-mata.svg",
    productionPath: "/images/santipur/placeholders/placeholder-poteswari-mata.svg",
    sourcePage: "Internal Directory Design System",
    originalImageUrl: "/images/santipur/placeholders/placeholder-poteswari-mata.svg",
    photographerOrOwner: "Santipur Local Directory Design Team",
    license: "Platform Proprietary SVG Asset",
    permissionStatus: "pending_verification",
    verified: false,
    recommendedPlacement: [
      "shrine-directory-poteswari",
      "heritage-gallery-placeholders"
    ],
    verificationNotes: "Dedicated neutral placeholder for 480-year-old Pata scroll deity awaiting community-authenticated photographic submission."
  },
  {
    id: "santipur-kali-007",
    title: "Ghor & Bahir Chaduni Mata (Chanduni Bari)",
    category: "religious-heritage",
    subcategory: "maa-kali",
    location: "Chanduni Bari, Ward 14, Santipur, Nadia",
    originalFilename: "placeholder-chanduni-mata.svg",
    productionPath: "/images/santipur/placeholders/placeholder-chanduni-mata.svg",
    sourcePage: "Internal Directory Design System",
    originalImageUrl: "/images/santipur/placeholders/placeholder-chanduni-mata.svg",
    photographerOrOwner: "Santipur Local Directory Design Team",
    license: "Platform Proprietary SVG Asset",
    permissionStatus: "pending_verification",
    verified: false,
    recommendedPlacement: [
      "shrine-directory-chanduni",
      "heritage-gallery-placeholders"
    ],
    verificationNotes: "Dedicated neutral placeholder for ~500-year-old Panchamundi Asana twin sanctum awaiting Sevayat trust photographic submission."
  },
  {
    id: "santipur-kali-008",
    title: "Gobindapur NH-34 Kali Mandir",
    category: "religious-heritage",
    subcategory: "maa-kali",
    location: "Gobindapur Railway Crossing, NH-34, Santipur, Nadia",
    originalFilename: "Kali Mandir - Indian National Highway 34 and Railwat Track Crossing - Gobindapur - Santipur - Nadia 2013-03-23 7010.JPG",
    productionPath: "/images/santipur/temples/santipur-gobindapur-kali-mandir-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Kali_Mandir_-_Indian_National_Highway_34_and_Railwat_Track_Crossing_-_Gobindapur_-_Santipur_-_Nadia_2013-03-23_7010.JPG",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Kali_Mandir_-_Indian_National_Highway_34_and_Railwat_Track_Crossing_-_Gobindapur_-_Santipur_-_Nadia_2013-03-23_7010.JPG",
    photographerOrOwner: "Biswarup Ganguly",
    license: "Creative Commons CC BY 3.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "temples-directory-peripheral",
      "heritage-gallery-temples"
    ],
    verificationNotes: "Historic roadside temple located near the NH-34 railway track crossing in the Gobindapur rural ward area of Santipur."
  },

  // 2. Historic Temples & Architecture
  {
    id: "santipur-temple-001",
    title: "Agameswari Temple Exterior",
    category: "temples",
    subcategory: "shakti-temple",
    location: "Agameswari Tala, Ward 12, Santipur, Nadia",
    originalFilename: "Agameshwari Temple, Shantipur 02.jpg",
    productionPath: "/images/santipur/temples/santipur-agameswari-temple-exterior-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Agameshwari_Temple,_Shantipur_02.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Agameshwari_Temple%2C_Shantipur_02.jpg",
    photographerOrOwner: "Pinakpani",
    license: "Creative Commons CC BY-SA 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "temples-directory-agameswari",
      "heritage-gallery-temples"
    ],
    verificationNotes: "Monumental historic brick gateway and courtyard of the celebrated Agameswari Temple complex in central Santipur."
  },
  {
    id: "santipur-temple-002",
    title: "Shyamchand Mandir Atchala Architecture (1726 CE)",
    category: "temples",
    subcategory: "vaishnava-temple",
    location: "Netaji Subhash Road, Ward 08, Santipur, Nadia",
    originalFilename: "Shyamchand temple at Shantipur in Nadia district 01.jpg",
    productionPath: "/images/santipur/temples/santipur-shyamchand-temple-atchala-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Shyamchand_temple_at_Shantipur_in_Nadia_district_01.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Shyamchand_temple_at_Shantipur_in_Nadia_district_01.jpg",
    photographerOrOwner: "Amitabha Gupta",
    license: "Creative Commons CC BY 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "homepage-featured-architecture",
      "temples-directory-shyamchand",
      "heritage-gallery-temples"
    ],
    verificationNotes: "Erected in 1726 CE by local merchant Ramgopal Khan Chowdhury. Largest traditional Atchala temple in Nadia district (ASI S-WB-96)."
  },
  {
    id: "santipur-temple-003",
    title: "Shyamchand Mandir Terracotta Relief Panel",
    category: "temples",
    subcategory: "terracotta-art",
    location: "Netaji Subhash Road, Ward 08, Santipur, Nadia",
    originalFilename: "Terracotta panels on southern facade of Shyamchand temple at Shantipur in Nadia district 05.jpg",
    productionPath: "/images/santipur/temples/santipur-shyamchand-terracotta-relief-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Terracotta_panels_on_southern_facade_of_Shyamchand_temple_at_Shantipur_in_Nadia_district_05.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Terracotta_panels_on_southern_facade_of_Shyamchand_temple_at_Shantipur_in_Nadia_district_05.jpg",
    photographerOrOwner: "Amitabha Gupta",
    license: "Creative Commons CC BY 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "temples-directory-shyamchand-detail",
      "heritage-gallery-terracotta"
    ],
    verificationNotes: "Exquisite 18th-century terracotta friezes portraying scenes from Ramayana, Krishnalila, and merchant fleets."
  },
  {
    id: "santipur-temple-004",
    title: "Jaleswar Shiva Temple Charchala Tower",
    category: "temples",
    subcategory: "shaiva-temple",
    location: "Jaleswar Tala, Ward 05, Santipur, Nadia",
    originalFilename: "Jaleswar Temple of Shantipur 01.jpg",
    productionPath: "/images/santipur/temples/santipur-jaleswar-shiva-temple-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Jaleswar_Temple_of_Shantipur_01.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Jaleswar_Temple_of_Shantipur_01.jpg",
    photographerOrOwner: "Pinakpani",
    license: "Creative Commons CC BY-SA 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "temples-directory-jaleswar",
      "heritage-gallery-temples"
    ],
    verificationNotes: "Historic Charchala terracotta Shiva temple (ASI N-WB-54-d) constructed under Maharaja Raghuram Roy of Nadia."
  },
  {
    id: "santipur-temple-005",
    title: "Jaleswar Temple Terracotta Detail",
    category: "temples",
    subcategory: "terracotta-art",
    location: "Jaleswar Tala, Ward 05, Santipur, Nadia",
    originalFilename: "Jaleswar Temple of Shantipur 05.jpg",
    productionPath: "/images/santipur/temples/santipur-jaleswar-temple-terracotta-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Jaleswar_Temple_of_Shantipur_05.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/44/Jaleswar_Temple_of_Shantipur_05.jpg",
    photographerOrOwner: "Pinakpani",
    license: "Creative Commons CC BY-SA 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "temples-directory-jaleswar-detail",
      "heritage-gallery-terracotta"
    ],
    verificationNotes: "Terracotta lotus plaques and decorative corner brackets displaying Bengal sultanate-to-nawabi syncretic craftsmanship."
  },

  // 3. Vaishnava Heritage, Rash Utsav & Festivals
  {
    id: "santipur-vaishnava-001",
    title: "Sri Sri Radha Raman Jiu Sanctum",
    category: "vaishnava-heritage",
    subcategory: "sacred-deity",
    location: "Boro Goswami Bari, Ward 09, Santipur, Nadia",
    originalFilename: "hero_radha_raman_jiu.jpg",
    productionPath: "/images/santipur/vaishnava-heritage/santipur-sri-radha-raman-jiu-01.jpg",
    sourcePage: "Santipur Advaita Lineage Archives / User Provided Sacred Photograph",
    originalImageUrl: "uploads/hero_radha_raman_jiu.jpg",
    photographerOrOwner: "Goswami Family Sevayat Trust",
    license: "Official Custodian Archive / Authorized",
    permissionStatus: "owner-authorized",
    verified: true,
    recommendedPlacement: [
      "homepage-hero-background",
      "vaishnava-directory-boro-goswami",
      "heritage-gallery-vaishnava"
    ],
    verificationNotes: "Sacred ancestral deity preserved since Sri Advaita Acharya's lineage at Boro Goswami Bari (est. 1484 CE)."
  },
  {
    id: "santipur-rash-001",
    title: "Santipur Bhanga Rash Rairaja Procession",
    category: "rash-utsav",
    subcategory: "festival-procession",
    location: "Main Heritage Street, Ward 09, Santipur, Nadia",
    originalFilename: "Santipur Rash Rairaja (শান্তিপুর রাসের রাইরাজা).jpg",
    productionPath: "/images/santipur/rash-utsav/santipur-bhanga-rash-rairaja-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Santipur_Rash_Rairaja_(%E0%A6%B6%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%A4%E0%A6%BF%E0%A6%AA%E0%A7%81%E0%A6%B0_%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A7%87%E0%A6%B0_%E0%A6%B0%E0%A6%BE%E0%A6%87%E0%A6%B0%E0%A6%BE%E0%A6%9C%E0%A6%BE).jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/Santipur_Rash_Rairaja_%28%E0%A6%B6%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%A4%E0%A6%BF%E0%A6%AA%E0%A7%81%E0%A6%B0_%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A7%87%E0%A6%B0_%E0%A6%B0%E0%A6%BE%E0%A6%87%E0%A6%B0%E0%A6%BE%E0%A6%9C%E0%A6%BE%29.jpg",
    photographerOrOwner: "Apurv013",
    license: "Creative Commons CC BY-SA 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "festivals-rash-utsav-feature",
      "heritage-gallery-rash-utsav"
    ],
    verificationNotes: "Historic Rairaja (Shree Radha in royal attire) carried during the Bhanga Rash procession on the 4th day of Rash Utsav."
  },
  {
    id: "santipur-festival-001",
    title: "Maa Bamakali Nighttime Dancing Immersion",
    category: "festivals",
    subcategory: "kali-puja-procession",
    location: "Babla Ghat & Main Parikrama Marg, Santipur, Nadia",
    originalFilename: "Cultural images/বামাকালী মাতা.png",
    productionPath: "/images/santipur/festivals/santipur-bamakali-night-immersion-01.png",
    sourcePage: "Bamakali Youth Sevak Sangha Archive",
    originalImageUrl: "Cultural images/বামাকালী মাতা.png",
    photographerOrOwner: "Bamakali Youth Sevak Sangha",
    license: "Local Heritage Archive / Authorized",
    permissionStatus: "owner-authorized",
    verified: true,
    recommendedPlacement: [
      "festivals-kali-puja-feature",
      "heritage-gallery-festivals"
    ],
    verificationNotes: "Devotees balancing the massive clay idol of Maa Bamakali upon bare shoulders while dancing rhythmically across midnight streets."
  },
  {
    id: "santipur-festival-002",
    title: "Diwali Kali Puja Worship in Santipur",
    category: "festivals",
    subcategory: "kali-puja",
    location: "Santipur, Nadia, West Bengal",
    originalFilename: "Maa Kali radiating her aggressive and beautiful aura.jpg",
    productionPath: "/images/santipur/festivals/santipur-diwali-kali-worship-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Maa_Kali_radiating_her_aggressive_and_beautiful_aura.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Maa_Kali_radiating_her_aggressive_and_beautiful_aura.jpg",
    photographerOrOwner: "Shalini kundu",
    license: "Creative Commons CC BY-SA 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "festivals-kali-puja-gallery",
      "heritage-gallery-festivals"
    ],
    verificationNotes: "Traditional Diwali night Kali Puja celebration documenting Santipur's vibrant community Shakta devotion."
  },
  {
    id: "santipur-festival-003",
    title: "Sacred Deities & Devotion of Santipur",
    category: "festivals",
    subcategory: "spiritual-heritage",
    location: "Santipur, Nadia, West Bengal",
    originalFilename: "Ultimate feminine power.jpg",
    productionPath: "/images/santipur/festivals/santipur-kali-devotion-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Ultimate_feminine_power.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Ultimate_feminine_power.jpg",
    photographerOrOwner: "Shalini kundu",
    license: "Creative Commons CC BY-SA 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "festivals-spiritual-heritage",
      "heritage-gallery-festivals"
    ],
    verificationNotes: "Spiritual portrait from Wiki Loves Folklore documenting Santipur's living worship culture."
  },

  // 4. Shantipuri Handloom & Textile Heritage
  {
    id: "santipur-handloom-001",
    title: "Sun-Drenched Tant Loom & Cotton Warps",
    category: "handloom",
    subcategory: "weaving-tradition",
    location: "Sutragarh Weaver Colony, Ward 17, Santipur, Nadia",
    originalFilename: "The Sun-Drenched Loom , a Century of Color in Shantipur.jpg",
    productionPath: "/images/santipur/handloom/santipur-traditional-tant-loom-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:The_Sun-Drenched_Loom_,_a_Century_of_Color_in_Shantipur.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/The_Sun-Drenched_Loom_%2C_a_Century_of_Color_in_Shantipur.jpg",
    photographerOrOwner: "Arghadeep chinya",
    license: "Creative Commons CC BY-SA 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "homepage-handloom-spotlight",
      "handloom-directory-master-craft",
      "heritage-gallery-handloom"
    ],
    verificationNotes: "Authentic pit loom with vibrant hand-dyed cotton yarn spools illustrating the 1409 CE GI-tagged Santipuri Tant."
  },
  {
    id: "santipur-handloom-002",
    title: "Traditional Tant Weaving Workshop Interior",
    category: "handloom",
    subcategory: "artisan-workshop",
    location: "Tant Silpi Palli, Phulia-Santipur Handloom Belt, Nadia",
    originalFilename: "Lakshmi Textile Tant Workshop Interior - 2 Natun Phulia - Nadia 2016-11-12 1805.JPG",
    productionPath: "/images/santipur/handloom/santipur-tant-weaving-workshop-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Lakshmi_Textile_Tant_Workshop_Interior_-_2_Natun_Phulia_-_Nadia_2016-11-12_1805.JPG",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Lakshmi_Textile_Tant_Workshop_Interior_-_2_Natun_Phulia_-_Nadia_2016-11-12_1805.JPG",
    photographerOrOwner: "Biswarup Ganguly",
    license: "Creative Commons CC BY 3.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "handloom-directory-workshop",
      "heritage-gallery-handloom"
    ],
    verificationNotes: "Master weaver operating flying shuttle loom weaving 100x100 count fine combed cotton saree borders."
  },

  // 5. Historic Landmarks & City Infrastructure
  {
    id: "santipur-landmark-001",
    title: "Santipur Junction Railway Station Heritage Building",
    category: "historical-landmarks",
    subcategory: "heritage-transport",
    location: "Station Road, Ward 01, Santipur, Nadia",
    originalFilename: "Shantipur railway station in Shantipur 01.jpg",
    productionPath: "/images/santipur/historical-landmarks/santipur-railway-station-heritage-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Shantipur_railway_station_in_Shantipur_01.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/28/Shantipur_railway_station_in_Shantipur_01.jpg",
    photographerOrOwner: "Pinakpani",
    license: "Creative Commons CC BY-SA 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "transport-directory-railway",
      "heritage-gallery-landmarks"
    ],
    verificationNotes: "Heritage railway terminus station connecting Santipur with Sealdah Kolkata, serving as the trade artery for millions of tant sarees."
  },
  {
    id: "santipur-landmark-002",
    title: "Panchpota Historic Mosque Landmark",
    category: "historical-landmarks",
    subcategory: "historic-mosque",
    location: "NH-34, Panchpota, Santipur, Nadia",
    originalFilename: "Panchpota Jama Masjid - Indian National Highway 34 - Santipur - Nadia 2013-03-23 7015.JPG",
    productionPath: "/images/santipur/historical-landmarks/santipur-panchpota-historic-mosque-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Panchpota_Jama_Masjid_-_Indian_National_Highway_34_-_Santipur_-_Nadia_2013-03-23_7015.JPG",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Panchpota_Jama_Masjid_-_Indian_National_Highway_34_-_Santipur_-_Nadia_2013-03-23_7015.JPG",
    photographerOrOwner: "Biswarup Ganguly",
    license: "Creative Commons CC BY 3.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "landmarks-directory-religious",
      "heritage-gallery-landmarks"
    ],
    verificationNotes: "Prominent regional mosque on NH-34 corridor showcasing Santipur's multi-cultural civic tapestry alongside 1703 CE Topkhana Mosque."
  },
  {
    id: "santipur-city-001",
    title: "Santipur Railway Platform & Passenger Hub",
    category: "city-photography",
    subcategory: "cityscape",
    location: "Station Road, Ward 01, Santipur, Nadia",
    originalFilename: "Shantipur railway station in Shantipur 06.jpg",
    productionPath: "/images/santipur/city-photography/santipur-railway-platform-junction-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Shantipur_railway_station_in_Shantipur_06.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Shantipur_railway_station_in_Shantipur_06.jpg",
    photographerOrOwner: "Pinakpani",
    license: "Creative Commons CC BY-SA 4.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "city-directory-transit",
      "heritage-gallery-city"
    ],
    verificationNotes: "Passenger platforms and overhead footbridge capturing daily commuters and textile traders."
  },

  // 6. Local Markets & Education
  {
    id: "santipur-market-001",
    title: "Dignagar Historic Commercial Market",
    category: "markets",
    subcategory: "local-bazaar",
    location: "Dignagar Bazaar, Santipur, Nadia",
    originalFilename: "Local Road - Dignagar Bazaar Area - Indian National Highway 34 - Santipur - Nadia 2013-03-23 7021.JPG",
    productionPath: "/images/santipur/markets/santipur-dignagar-bazaar-market-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Local_Road_-_Dignagar_Bazaar_Area_-_Indian_National_Highway_34_-_Santipur_-_Nadia_2013-03-23_7021.JPG",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Local_Road_-_Dignagar_Bazaar_Area_-_Indian_National_Highway_34_-_Santipur_-_Nadia_2013-03-23_7021.JPG",
    photographerOrOwner: "Biswarup Ganguly",
    license: "Creative Commons CC BY 3.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "markets-directory-bazaar",
      "heritage-gallery-markets"
    ],
    verificationNotes: "Vibrant local marketplace along NH-34 corridor supplying agro-produce, brassware, and daily provisions."
  },
  {
    id: "santipur-edu-001",
    title: "Satyacharan Smriti Nimna Buniyadi Bidyalaya",
    category: "businesses",
    subcategory: "education",
    location: "NH-34, Santipur, Nadia",
    originalFilename: "Satyacharan Smriti Nimna Buniyadi Bidyalaya - NH-34 - Santipur - Nadia 2014-11-28 9962.jpg",
    productionPath: "/images/santipur/businesses/education/santipur-satyacharan-buniyadi-bidyalaya-01.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Satyacharan_Smriti_Nimna_Buniyadi_Bidyalaya_-_NH-34_-_Santipur_-_Nadia_2014-11-28_9962.jpg",
    originalImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/37/Satyacharan_Smriti_Nimna_Buniyadi_Bidyalaya_-_NH-34_-_Santipur_-_Nadia_2014-11-28_9962.jpg",
    photographerOrOwner: "Biswarup Ganguly",
    license: "Creative Commons CC BY 3.0",
    permissionStatus: "public-license-cc",
    verified: true,
    recommendedPlacement: [
      "education-directory-schools",
      "heritage-gallery-education"
    ],
    verificationNotes: "Historic elementary institution serving generations of Santipur children."
  },

  // 7. Dedicated Placeholders for Unverified Listings & Business Categories
  {
    id: "santipur-ph-001",
    title: "Verified Sweetshop & Confectionery Placeholder",
    category: "businesses",
    subcategory: "restaurants",
    location: "Santipur Commercial Center, Nadia",
    originalFilename: "placeholder-restaurant.svg",
    productionPath: "/images/santipur/placeholders/placeholder-restaurant.svg",
    sourcePage: "Internal Directory Design System",
    originalImageUrl: "/images/santipur/placeholders/placeholder-restaurant.svg",
    photographerOrOwner: "Santipur Local Directory Design Team",
    license: "Platform Proprietary SVG Asset",
    permissionStatus: "owner-authorized",
    verified: false,
    recommendedPlacement: [
      "business-restaurant-card-fallback",
      "business-sweets-card-fallback"
    ],
    verificationNotes: "Minimal geometric SVG placeholder adhering to neutral Listygo aesthetic, awaiting business-owner verification."
  },
  {
    id: "santipur-ph-002",
    title: "Verified Saree & Handloom Store Placeholder",
    category: "businesses",
    subcategory: "saree-shops",
    location: "Sutragarh Handloom Hub, Santipur, Nadia",
    originalFilename: "placeholder-saree.svg",
    productionPath: "/images/santipur/placeholders/placeholder-saree.svg",
    sourcePage: "Internal Directory Design System",
    originalImageUrl: "/images/santipur/placeholders/placeholder-saree.svg",
    photographerOrOwner: "Santipur Local Directory Design Team",
    license: "Platform Proprietary SVG Asset",
    permissionStatus: "owner-authorized",
    verified: false,
    recommendedPlacement: [
      "business-saree-card-fallback"
    ],
    verificationNotes: "Neutral placeholder for retail saree boutiques and wholesale weaving establishments."
  },
  {
    id: "santipur-ph-003",
    title: "Verified Hotel & Guest Lodge Placeholder",
    category: "businesses",
    subcategory: "hotels",
    location: "Station Road & Municipal Area, Santipur, Nadia",
    originalFilename: "placeholder-hotel.svg",
    productionPath: "/images/santipur/placeholders/placeholder-hotel.svg",
    sourcePage: "Internal Directory Design System",
    originalImageUrl: "/images/santipur/placeholders/placeholder-hotel.svg",
    photographerOrOwner: "Santipur Local Directory Design Team",
    license: "Platform Proprietary SVG Asset",
    permissionStatus: "owner-authorized",
    verified: false,
    recommendedPlacement: [
      "business-hotel-card-fallback"
    ],
    verificationNotes: "Neutral placeholder for pilgrim guest lodges and municipal hotels."
  },
  {
    id: "santipur-ph-004",
    title: "Verified Clinic & Healthcare Placeholder",
    category: "businesses",
    subcategory: "healthcare",
    location: "Hospital Road, Santipur, Nadia",
    originalFilename: "placeholder-healthcare.svg",
    productionPath: "/images/santipur/placeholders/placeholder-healthcare.svg",
    sourcePage: "Internal Directory Design System",
    originalImageUrl: "/images/santipur/placeholders/placeholder-healthcare.svg",
    photographerOrOwner: "Santipur Local Directory Design Team",
    license: "Platform Proprietary SVG Asset",
    permissionStatus: "owner-authorized",
    verified: false,
    recommendedPlacement: [
      "business-healthcare-card-fallback"
    ],
    verificationNotes: "Neutral placeholder for diagnostic clinics, registered physicians, and 24-hr pharmacies."
  },
  {
    id: "santipur-ph-005",
    title: "Verified Clay Idol Sculptor Guild Placeholder",
    category: "businesses",
    subcategory: "services",
    location: "Sutragarh, Ward 18, Santipur, Nadia",
    originalFilename: "placeholder-clay-artisan.svg",
    productionPath: "/images/santipur/placeholders/placeholder-clay-artisan.svg",
    sourcePage: "Internal Directory Design System",
    originalImageUrl: "/images/santipur/placeholders/placeholder-clay-artisan.svg",
    photographerOrOwner: "Santipur Local Directory Design Team",
    license: "Platform Proprietary SVG Asset",
    permissionStatus: "owner-authorized",
    verified: false,
    recommendedPlacement: [
      "business-services-card-fallback"
    ],
    verificationNotes: "Dedicated neutral placeholder for Sutragarh clay idol sculptors and terracotta artists."
  },
  {
    id: "santipur-ph-006",
    title: "Verified Bell Metal & Brass Guild Placeholder",
    category: "businesses",
    subcategory: "services",
    location: "Kansharipara & Artisan Wards, Santipur, Nadia",
    originalFilename: "placeholder-bell-metal.svg",
    productionPath: "/images/santipur/placeholders/placeholder-bell-metal.svg",
    sourcePage: "Internal Directory Design System",
    originalImageUrl: "/images/santipur/placeholders/placeholder-bell-metal.svg",
    photographerOrOwner: "Santipur Local Directory Design Team",
    license: "Platform Proprietary SVG Asset",
    permissionStatus: "owner-authorized",
    verified: false,
    recommendedPlacement: [
      "business-services-card-fallback"
    ],
    verificationNotes: "Dedicated neutral placeholder for bell metal coppersmiths and brass puja ghanta artisans."
  },
  {
    id: "santipur-ph-007",
    title: "Verified Transit & Auto Guild Placeholder",
    category: "businesses",
    subcategory: "transport",
    location: "Santipur Bus Stand & Station Road, Nadia",
    originalFilename: "placeholder-transport.svg",
    productionPath: "/images/santipur/placeholders/placeholder-transport.svg",
    sourcePage: "Internal Directory Design System",
    originalImageUrl: "/images/santipur/placeholders/placeholder-transport.svg",
    photographerOrOwner: "Santipur Local Directory Design Team",
    license: "Platform Proprietary SVG Asset",
    permissionStatus: "owner-authorized",
    verified: false,
    recommendedPlacement: [
      "business-transport-card-fallback"
    ],
    verificationNotes: "Neutral placeholder for e-rickshaw stands, express bus operators, and local transport unions."
  }
];

function enrichManifest() {
  const hashSeen = {};
  const duplicates = [];

  const enriched = catalogEntries.map(entry => {
    const localRel = entry.productionPath.startsWith('/') ? entry.productionPath.substring(1) : entry.productionPath;
    const absPath = path.join(__dirname, 'public', localRel);
    let size = 0;
    let hash = '';
    let exists = false;

    if (fs.existsSync(absPath)) {
      exists = true;
      const stats = fs.statSync(absPath);
      size = stats.size;
      hash = getFileHash(absPath);

      if (hashSeen[hash]) {
        duplicates.push({ original: hashSeen[hash], duplicate: entry.id, hash });
      } else {
        hashSeen[hash] = entry.id;
      }
    } else {
      console.warn(`Warning: file not found at ${absPath}`);
    }

    return {
      ...entry,
      fileExists: exists,
      fileSizeBytes: size,
      sha256Hash: hash,
      duplicateStatus: duplicates.some(d => d.duplicate === entry.id) ? "duplicate" : "unique"
    };
  });

  const manifestData = {
    metadata: {
      project: "Santipur Local Directory — Strictly Verified Unique Asset Library",
      totalAssetsCataloged: enriched.length,
      verifiedAssetsCount: enriched.filter(e => e.verified).length,
      placeholderAssetsCount: enriched.filter(e => !e.verified).length,
      generatedTimestamp: new Date().toISOString(),
      duplicateRecordsDetected: duplicates.length,
      duplicateIntegrityStatus: duplicates.length === 0 ? "PASSED_ZERO_DUPLICATES" : "FLAGGED",
      schemaCompliance: "Strict Phase 5 & Audit System"
    },
    images: enriched
  };

  const outputPath = path.join(__dirname, 'public/images/santipur/image-manifest.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifestData, null, 2), 'utf8');
  console.log(`Successfully wrote image manifest to ${outputPath}`);
  console.log(`Cataloged ${enriched.length} items. Duplicates detected: ${duplicates.length}`);
}

enrichManifest();
