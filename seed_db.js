// seed_db.js - Seeds Shantipur Heritage SQLite Database & JSON API Fallback
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, 'data');
const API_DIR = path.join(__dirname, 'public', 'api');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(API_DIR)) fs.mkdirSync(API_DIR, { recursive: true });

const dbPath = path.join(DATA_DIR, 'shantipur_heritage.db');
const db = new DatabaseSync(dbPath);

console.log('🌱 Initializing SQLite Database at:', dbPath);

// Create Tables
db.exec(`
  DROP TABLE IF EXISTS shrines;
  DROP TABLE IF EXISTS temples;
  DROP TABLE IF EXISTS handloom_clusters;
  DROP TABLE IF EXISTS haats;
  DROP TABLE IF EXISTS artisans_and_sweets;
  DROP TABLE IF EXISTS parikrama_checkpoints;

  CREATE TABLE shrines (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    age_years INTEGER,
    ward_location TEXT,
    location_pin TEXT,
    history_en TEXT,
    history_bn TEXT,
    rituals_en TEXT,
    rituals_bn TEXT,
    image_url TEXT,
    audio_lore_url TEXT,
    latitude REAL,
    longitude REAL
  );

  CREATE TABLE temples (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    founded_year TEXT,
    tradition TEXT,
    significance_en TEXT,
    significance_bn TEXT,
    image_url TEXT
  );

  CREATE TABLE handloom_clusters (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    cluster_area TEXT,
    specialty_en TEXT,
    specialty_bn TEXT,
    yarn_count TEXT,
    contact_phone TEXT,
    image_url TEXT
  );

  CREATE TABLE haats (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    schedule_en TEXT,
    schedule_bn TEXT,
    location TEXT,
    description_en TEXT,
    description_bn TEXT
  );

  CREATE TABLE artisans_and_sweets (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    category TEXT,
    origin_era TEXT,
    description_en TEXT,
    description_bn TEXT,
    ingredients_or_material TEXT,
    image_url TEXT
  );

  CREATE TABLE parikrama_checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    step_order INTEGER,
    shrine_id TEXT,
    recommended_mode TEXT,
    estimated_mins INTEGER
  );
`);

// Seed Data
const shrines = [
  {
    id: "agameswari",
    name_en: "Maa Agameswari (Agameswari Tala)",
    name_bn: "মা আগমেশ্বরী (আগমেশ্বরী তলা)",
    age_years: 420,
    ward_location: "Agameswari Tala, Ward 12, Shantipur",
    location_pin: "https://maps.google.com/?q=Agameswari+Tala+Shantipur",
    history_en: "Founded by Tantric master Pandit Krishnananda Agambagish, author of the seminal 16th-century 'Brihat Tantrasara'. Consolidated through the historic alliance between Sri Advaita Acharya's descendant Mathuresh Goswami's daughter and Sarvabhauma Agambagish, creating a profound Shakta-Vaishnava truce in Bengal.",
    history_bn: "বৃহৎ তন্ত্রসার প্রণেতা তন্ত্রসাধক পণ্ডিত কৃষ্ণানন্দ আগমবাগীশ দ্বারা প্রতিষ্ঠিত। পরবর্তীতে শ্রী অদ্বৈত প্রভুর বংশধর মথুরেশ গোস্বামীর কন্যার সঙ্গে সার্বভৌম আগমবাগীশের ঐতিহাসিক বৈবাহিক সম্পর্কের মাধ্যমে শান্তিপুরে শাক্ত ও বৈষ্ণব ধর্মের মহামিলন ক্ষেত্র রচিত হয়।",
    rituals_en: "Idol sculpted across 8-10 days starting right after Krishna Paksha. The sacred worship begins with midnight Chakshu Daan (painting the divine eyes). In strict accordance with Tantric tradition, the sacred Ghat is immersed immediately as dawn breaks and the night's puja concludes.",
    rituals_bn: "কৃষ্ণপক্ষের পর ৮-১০ দিন ধরে সুবিশাল মৃন্ময়ী প্রতিমা নির্মিত হয়। মহানিশায় চক্ষু দানের সঙ্গে সঙ্গেই পুজো শুরু হয়। তন্ত্রোক্ত নিয়মে রাত্রি শেষে ভোর হতে না হতেই ঘট বিসর্জন সম্পন্ন হয়।",
    image_url: "uploads/Maa agameswari 1.png",
    audio_lore_url: "lore_agameswari",
    latitude: 23.2505,
    longitude: 88.4320
  },
  {
    id: "mahishkhagi",
    name_en: "Maa Mahishkhagi (Mahishkhagi Para)",
    name_bn: "মা মহিষখাগী (মহিষখাগী পাড়া)",
    age_years: 500,
    ward_location: "Mahishkhagi Para, Ward 8, Shantipur",
    location_pin: "https://maps.google.com/?q=Mahishkhagi+Para+Shantipur",
    history_en: "Originally founded in a humble thatched hut by the venerable Chatterjee family over five centuries ago. Later patronized with a majestic brick temple by Maharaja Krishnachandra Roy of Nadia.",
    history_bn: "পাঁচ শতাব্দীরও বেশি পূর্বে চ্যাটার্জি পরিবারের পর্ণকুটিরে এই পুজো শুরু হয়। পরবর্তীকালে নদিয়ার মহারাজা কৃষ্ণচন্দ্র রায় এখানে স্থায়ী ইটের মন্দির প্রতিষ্ঠা করে দেন।",
    rituals_en: "The only Kali in Bengal worshipped with sacred Vedic Hindu Marriage Rituals (বিবাহ রীতি). Includes pre-dawn Dadhimangal ceremony when placed on altar (Paate Otha) and Bashi Biye next day. Animal sacrifice permanently ceased after a priest missed the auspicious Sandhikshan. Devotees carry the immense idol solely on their bare shoulders for immersion.",
    rituals_bn: "সমগ্র বাংলায় এক অনন্য কালী, যাঁকে হিন্দু বৈদিক বিবাহ রীতিতে বরণ করা হয়। পাতে ওঠার সময় ভোরে দধিমঙ্গল ও পরদিন বাসি বিয়ের আচার পালিত হয়। সন্ধিক্ষণ অতিক্রান্ত হওয়ায় একবার পুরোহিত বলি বন্ধ করে দেন এবং এরপর থেকে চিরতরে বলিদানের সমাপ্তি ঘটে। ভক্তরা কাঁধে করে প্রতিমা বিসর্জনে নিয়ে যান।",
    image_url: "uploads/kali_idol_16x9_4k.png",
    audio_lore_url: "lore_mahishkhagi",
    latitude: 23.2520,
    longitude: 88.4280
  },
  {
    id: "bamakali",
    name_en: "Maa Bamakali (Bamakali Tala)",
    name_bn: "মা বামা কালী (বামাকালী তলা)",
    age_years: 500,
    ward_location: "Bamakali Tala, Sutragarh, Shantipur",
    location_pin: "https://maps.google.com/?q=Bamakali+Tala+Shantipur",
    history_en: "Revered 500-year-old Tantric deity depicted stepping forward with her left foot (Bama-pada), signifying fierce transcendent protection and dissolution of darkness.",
    history_bn: "৫০০ বছরের সুপ্রাচীন জাগ্রত কালী। মা এখানে বাম চরণ সম্মুখে প্রসারিত করে অবস্থান করেন—যা ভয়ংকরা ও ভক্তরক্ষাকারিণী রূপের প্রতীক।",
    rituals_en: "Legendary for the electrifying Dancing Immersion Procession. Hundreds of bearers shoulder the towering idol, swaying rhythmically in unison to frantic dhak beats and conch shells so the Goddess appears to dance through Shantipur's ancient lanes.",
    rituals_bn: "বিখ্যাত নৃত্যরত বিসর্জন শোভাযাত্রা। শত শত সেবায়েত কাঁধে প্রতিমা বহন করে ঢাকের উন্মাদ তালে এমনভাবে নৃত্য করেন যেন স্বয়ং দেবী রাজপথে নৃত্য করছেন।",
    image_url: "uploads/Ornate Fierce Goddess Shrine in Blue Alcove.png",
    audio_lore_url: "lore_bamakali",
    latitude: 23.2450,
    longitude: 88.4380
  },
  {
    id: "chaduni_mata",
    name_en: "Ghor Chaduni & Bahir Chaduni Mata",
    name_bn: "ঘর চাঁদুনী ও বাহির চাঁদুনী মাতা",
    age_years: 450,
    ward_location: "Chanduni Bari, Ward 14, Shantipur",
    location_pin: "https://maps.google.com/?q=Chanduni+Bari+Shantipur",
    history_en: "Established by Gopinath following a sacred Swapnadesh (divine dream) upon an authentic Panchamundi Asana (five-skull seat) where high Tantric sadhana was performed.",
    history_bn: "পবিত্র পঞ্চমুণ্ডীর আসনে সাধক গোপীনাথের স্বপ্নাদেশপ্রাপ্তির মাধ্যমে এই জোড়া চাঁদুনী পুজো প্রতিষ্ঠিত হয়।",
    rituals_en: "Twin sanctums where esoteric Shakta offerings of unboiled rice, sacred bilva leaves, and fragrant dhunuchi incense invoke deep meditative quietude.",
    rituals_bn: "গভীর তান্ত্রিক সাধনায় অতল শান্ত ও তেজস্বী অর্ঘ্য নিবেদন করা হয়।",
    image_url: "uploads/Fiery Nighttime Kali Puja Ritual.png",
    audio_lore_url: "lore_chaduni",
    latitude: 23.2480,
    longitude: 88.4340
  },
  {
    id: "poteswari",
    name_en: "Maa Poteswari (Barajiakur)",
    name_bn: "মা পটেশ্বরী (বারজিয়াকুর)",
    age_years: 480,
    ward_location: "Poteswari Street, Barajiakur, Shantipur",
    location_pin: "https://maps.google.com/?q=Poteswari+Street+Shantipur",
    history_en: "Preserves the ancient transition from sacred Pata (painted cloth scrolls) to clay icon worship. A cherished focal point during both Kali Puja and the Bhanga Rash festival.",
    history_bn: "প্রাচীন পটচিত্র পূজা থেকে মৃন্ময়ী মূর্তিপূজায় উত্তরণের এক অনন্য জীবন্ত দলিল। কালীপূজা ও শান্তিপুর রাস উভয় উৎসবেরই অন্যতম প্রধান মিলনমেলা।",
    rituals_en: "Traditional folk alpona floor art, painted scroll hymns, and devotional singing echoing across centuries.",
    rituals_bn: "ঐতিহ্যবাহী আলপনা, প্রাচীন পটগীতি ও ভক্তিগীতি দ্বারা দেবীর বন্দনা।",
    image_url: "uploads/blue_kali_16x9_4k (1).png",
    audio_lore_url: "lore_poteswari",
    latitude: 23.2540,
    longitude: 88.4250
  },
  {
    id: "siddheswari",
    name_en: "Siddheswari Kali Mandir",
    name_bn: "সিদ্ধেশ্বরী কালী মন্দির (সূত্রাগড়)",
    age_years: 380,
    ward_location: "K.C. Das Road, Sutragarh, Shantipur",
    location_pin: "https://maps.google.com/?q=Sutragarh+Siddheswari+Shantipur",
    history_en: "Consecrated by the master weavers and scholars of Sutragarh to anchor the spiritual vitality of Shantipur's eastern craft corridors.",
    history_bn: "সূত্রাগড়ের তাঁতি সমাজ ও পণ্ডিতবর্গের দ্বারা শান্তিপুরের কারুশিল্প ঐতিহ্যের রক্ষাকর্ত্রী রূপে প্রতিষ্ঠিত।",
    rituals_en: "Hand-pounded rice bhog, traditional brass bell chime offerings, and blessings for the weavers' looms.",
    rituals_bn: "হাতে কোটা চালের ভোগ ও তাঁতের মাকু ছুঁইয়ে দেবীর চরণে কল্যাণ প্রার্থনা।",
    image_url: "uploads/kali_idol_16x9_4k.png",
    audio_lore_url: "lore_siddheswari",
    latitude: 23.2430,
    longitude: 88.4410
  }
];

const temples = [
  {
    id: "boro_goswami_bari",
    name_en: "Boro Goswami Bari",
    name_bn: "বড় গোস্বামী বাড়ি",
    founded_year: "1484 CE (~540 Years)",
    tradition: "Gaudiya Vaishnavism / Advaita Lineage",
    significance_en: "The ancestral seat of Sri Advaita Acharya's lineage. Houses the revered Sri Sri Radha Raman Jiu deity. Site of the celebrated historic Shakta-Vaishnava truce and epicenter of the 400-year-old Shantipur Bhanga Rash chariot and procession.",
    significance_bn: "শ্রী অদ্বৈত আচার্য প্রভুর প্রধান আদি ভিটা। শ্রীশ্রী রাধারমণ জিউর নিত্য সেবা এবং শাক্ত-বৈষ্ণব মিলনের পীঠস্থান। বিখ্যাত শান্তিপুর রাসযাত্রার কেন্দ্রবিন্দু।",
    image_url: "uploads/Maa agameswari 1.png"
  },
  {
    id: "shyamchand_mandir",
    name_en: "Shyamchand Mandir (1726 CE)",
    name_bn: "শ্যামচাঁদ মন্দির (১৭২৬ খ্রিস্টাব্দ)",
    founded_year: "1726 CE (~300 Years)",
    tradition: "Terracotta Atchala Architecture",
    significance_en: "One of Bengal's grandest Atchala (eight-roofed) brick temples, erected in Shyamchandpara by wealthy textile merchant Ramgopal Khan Chowdhury. Undeniable architectural proof of how Shantipur's 18th-century handloom fortunes built its sacred skyline.",
    significance_bn: "১৭২৬ সালে বস্ত্রবণিক রামগোপাল খাঁ চৌধুরী নির্মিত বাংলার অন্যতম শ্রেষ্ঠ আটচালা মন্দির। প্রমাণ করে শান্তিপুরের তাঁতশিল্পের সমৃদ্ধি কীভাবে এই শহরের স্থাপত্য ইতিহাস গড়ে তুলেছিল।",
    image_url: "uploads/Ornate Fierce Goddess Shrine in Blue Alcove.png"
  },
  {
    id: "topkhana_mosque",
    name_en: "Topkhana Mosque (1703 CE)",
    name_bn: "তোপখানা মসজিদ (১৭০৩ খ্রিস্টাব্দ)",
    founded_year: "1703 CE (~320 Years)",
    tradition: "Mughal Indo-Islamic Brick Heritage",
    significance_en: "Commissioned by Faujdar Gazi Mohammad Yar Khan during Aurangzeb's reign. Features imposing brick domes and arched colonnades, exemplifying Shantipur's rich syncretic multicultural heritage trail.",
    significance_bn: "মুঘল আমলে ফৌজদার গাজী মহম্মদ ইয়ার খান নির্মিত ঐতিহাসিক মসজিদ। শান্তিপুরের বহুত্ববাদী ঐতিহাসিক মেলবন্ধনের উজ্জ্বল নিদর্শন।",
    image_url: "uploads/Fiery Nighttime Kali Puja Ritual.png"
  }
];

const handloom_clusters = [
  {
    id: "sutragarh_cluster",
    name_en: "Sutragarh Master Weavers Hub",
    name_bn: "সূত্রাগড় তাঁত শিল্প এলাকা",
    cluster_area: "Sutragarh & K.C. Das Road",
    specialty_en: "GI-Tagged Pure Shantipuri Tant Sarees with 100x100 ultrafine combed cotton, Jacquard borders, and signature Guti Bhanj pleat.",
    specialty_bn: "১০০x১০০ সুক্ষ্ম সুতোর খাঁটি শান্তিপুরী তাঁত, জটিল জাকোয়ার্ড নকশা এবং ঐতিহ্যবাহী গুটি ভাঁজ।",
    yarn_count: "80s to 120s High Count Cotton & Zari",
    contact_phone: "+91 98320 12345",
    image_url: "uploads/kali_idol_16x9_4k.png"
  },
  {
    id: "dalal_para_cluster",
    name_en: "Dalal Para & Baigachi Handlooms",
    name_bn: "দালাল পাড়া ও বৈগাছি তাঁতি পল্লী",
    cluster_area: "Dalal Para, Baigachi Para",
    specialty_en: "Traditional Shantipuri Jalchuri Dhotis, Nilambari fine muslins, and organic vegetable-dyed sarees.",
    specialty_bn: "শান্তিপুরী জলচুরি ধুতি, নীলাম্বরী জামদানি এবং ভেষজ রঙে বোনা শাড়ি।",
    yarn_count: "100s Fine Pure Cotton",
    contact_phone: "+91 98321 67890",
    image_url: "uploads/blue_kali_16x9_4k (1).png"
  },
  {
    id: "ghoralia_cluster",
    name_en: "Ghoralia Wholesale Weavers Guild",
    name_bn: "ঘোড়ালিয়া পাইকারি তাঁত সমবায়",
    cluster_area: "Ghoralia & Mozammel Haque Road",
    specialty_en: "Boutique bulk manufacturing, festive bridal handloom borders, and direct export collections.",
    specialty_bn: "পাইকারি সরাসরি বুটিক সরবরাহ ও রফতানিযোগ্য উৎসবের তাঁতের শাড়ি।",
    yarn_count: "80s-100s Cotton Silk Blend",
    contact_phone: "+91 98322 11223",
    image_url: "uploads/Maa agameswari 1.png"
  }
];

const haats = [
  {
    id: "bango_ghosh_haat",
    name_en: "Bango & Ghosh Tant Kaporer Haat",
    name_bn: "বঙ্গ ও ঘোষ তাঁত কাপড়ের হাট",
    schedule_en: "Every Thursday & Sunday: Pre-dawn 3:00 AM to 11:00 AM (Plus Wed & Sat Evening Sessions 4:00 PM - 8:30 PM)",
    schedule_bn: "প্রতি বৃহস্পতিবার ও রবিবার: ভোর ৩:০০টা থেকে সকাল ১১:০০টা (অতিরিক্ত বুধবার ও শনিবার বিকেল ৪:০০ থেকে রাত ৮:৩০)",
    location: "Sutragarh Haat Compound, Shantipur 741404",
    description_en: "Asia's premier weekly handloom exchange where over 10,000 master weavers assemble by lantern light to trade authentic GI-tagged sarees directly with pan-India merchants.",
    description_bn: "এশিয়ার অন্যতম বৃহত্তম তাঁতের সাপ্তাহিক বাজার, যেখানে ভোররাতে আলো জ্বেলে হাজার হাজার তাঁতি সরাসরি দেশ-বিদেশের পাইকারদের হাতে শাড়ি তুলে দেন।"
  },
  {
    id: "santipur_municipal_haat",
    name_en: "Santipur Municipal Cloth Mart",
    name_bn: "শান্তিপুর পৌর বস্ত্র হাট",
    schedule_en: "Daily Morning & Mid-day Sessions (Peak Mondays & Fridays)",
    schedule_bn: "প্রতিদিন সকাল ও দুপুর (সোম ও শুক্র বিশেষ অধিবেশন)",
    location: "Near Shantipur Railway Station & Bus Stand",
    description_en: "Convenient transit market for retail tourists and small boutique owners seeking authentic certified weaves.",
    description_bn: "পর্যটক ও সাধারণ ক্রেতাদের জন্য সুলভে শান্তিপুরী শাড়ি ক্রয়ের সহজ কেন্দ্র।"
  }
];

const artisans_and_sweets = [
  {
    id: "nikhuti",
    title_en: "200-Year-Old Authentic Shantipur Nikhuti",
    title_bn: "শান্তিপুরের ঐতিহ্যবাহী ২০০ বছরের নিখুঁতি",
    category: "Culinary Heritage / Sweets",
    origin_era: "Early 19th Century (~200 Years)",
    description_en: "Invented in Shantipur: slender, oblong deep-golden sweets prepared from freshly curdled cow's milk chhena kneaded with ground green cardamom and a subtle fiery dash of cracked black pepper, deep-fried in pure ghee and soaked in warm cardamom syrup.",
    description_bn: "শান্তিপুরের অনন্য আবিষ্কার: খাঁটি ছানা, সুগন্ধি এলাচ এবং মৃদু গোলমরিচের গুঁড়োর অপূর্ব মেলবন্ধনে ঘিয়ে ভাজা রসালো সোনালী নিখুঁতি।",
    ingredients_or_material: "Chhena, Ghee, Green Cardamom, Black Pepper, Light Sugar Syrup",
    image_url: "uploads/style_reference.jpg"
  },
  {
    id: "sutragarh_mritsilpi",
    title_en: "Sutragarh Clay Idol & Terracotta Sculptors",
    title_bn: "সূত্রাগড় মৃৎশিল্পী সমিতি (প্রতিমা ও পুতুল)",
    category: "Sculpture & Sacred Art",
    origin_era: "15th Century (Advaita Era)",
    description_en: "Generations of master clay artisans who sculpt Shantipur's soaring Kali idols and Bhanga Rash clay tableaus using sacred Ganga silt and straw frames.",
    description_bn: "গঙ্গার পলিমাটি ও খড়ের কাঠামোয় বংশপরম্পরায় নির্মিত সুবিশাল কালী প্রতিমা ও রাস উৎসবের মৃৎভাস্কর্য।",
    ingredients_or_material: "Ganga Silt, Straw, Jute Fiber, Natural Mineral Pigments",
    image_url: "uploads/kali_idol_16x9_4k.png"
  },
  {
    id: "kansha_pitul_guild",
    title_en: "Kansha-Pitul (Antique Bell Metal & Brass Guild)",
    title_bn: "কাঁসা ও পিতল কারুশিল্প গিল্ড",
    category: "Bell Metal Metalcraft",
    origin_era: "17th Century",
    description_en: "Traditional metal smiths crafting sonorous puja ghanta (bells), heavy brass dhunuchis for aarti, and ceremonial bhog platters.",
    description_bn: "ঐতিহ্যবাহী কাঁসা-পিতলের নিখুঁত পূজার ঘণ্টা, বৃহদাকার ধুনুচি ও ভোগ পাত্র তৈরির কারিগর সমাজ।",
    ingredients_or_material: "Bell Metal (Bronze 78/22), Brass, Copper",
    image_url: "uploads/Fiery Nighttime Kali Puja Ritual.png"
  }
];

// Insert into SQLite
const insertShrine = db.prepare(`
  INSERT INTO shrines (id, name_en, name_bn, age_years, ward_location, location_pin, history_en, history_bn, rituals_en, rituals_bn, image_url, audio_lore_url, latitude, longitude)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const s of shrines) {
  insertShrine.run(s.id, s.name_en, s.name_bn, s.age_years, s.ward_location, s.location_pin, s.history_en, s.history_bn, s.rituals_en, s.rituals_bn, s.image_url, s.audio_lore_url, s.latitude, s.longitude);
}

const insertTemple = db.prepare(`
  INSERT INTO temples (id, name_en, name_bn, founded_year, tradition, significance_en, significance_bn, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const t of temples) {
  insertTemple.run(t.id, t.name_en, t.name_bn, t.founded_year, t.tradition, t.significance_en, t.significance_bn, t.image_url);
}

const insertCluster = db.prepare(`
  INSERT INTO handloom_clusters (id, name_en, name_bn, cluster_area, specialty_en, specialty_bn, yarn_count, contact_phone, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const c of handloom_clusters) {
  insertCluster.run(c.id, c.name_en, c.name_bn, c.cluster_area, c.specialty_en, c.specialty_bn, c.yarn_count, c.contact_phone, c.image_url);
}

const insertHaat = db.prepare(`
  INSERT INTO haats (id, name_en, name_bn, schedule_en, schedule_bn, location, description_en, description_bn)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const h of haats) {
  insertHaat.run(h.id, h.name_en, h.name_bn, h.schedule_en, h.schedule_bn, h.location, h.description_en, h.description_bn);
}

const insertArtisan = db.prepare(`
  INSERT INTO artisans_and_sweets (id, title_en, title_bn, category, origin_era, description_en, description_bn, ingredients_or_material, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const a of artisans_and_sweets) {
  insertArtisan.run(a.id, a.title_en, a.title_bn, a.category, a.origin_era, a.description_en, a.description_bn, a.ingredients_or_material, a.image_url);
}

console.log('✅ SQLite Database successfully seeded with authentic Shantipur data!');

// Write Static JSON Fallback API
const fullPayload = {
  meta: {
    city: "Shantipur (Santipur)",
    district: "Nadia",
    state: "West Bengal",
    pincode: "741404",
    generated_at: new Date().toISOString(),
    status: "ok"
  },
  shrines,
  temples,
  handloom_clusters,
  haats,
  artisans_and_sweets
};

const jsonApiPath = path.join(API_DIR, 'heritage.json');
fs.writeFileSync(jsonApiPath, JSON.stringify(fullPayload, null, 2), 'utf-8');
console.log('✅ Static JSON Fallback API written to:', jsonApiPath);
