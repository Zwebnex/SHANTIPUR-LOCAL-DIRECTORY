// listingImageRegistry.js - Centralized Single Source of Truth for Heritage Image Mapping & Provenance
// Strictly compliant with Shantipur Heritage Platform Schema Specification (Phases 4, 6, 7 & 8)
(function() {
  const DEFAULT_OM_PLACEHOLDER = '/images/santipur/om-placeholder.svg';

  const rawMappings = {
    // =========================================================================
    // 1. SACRED MAA KALI SHRINES & PUJAS
    // =========================================================================
    "agameswari": {
      id: "agameswari",
      name: "Maa Agameswari (Agameswari Tala)",
      bengaliName: "মা আগমেশ্বরী (আগমেশ্বরী তলা)",
      category: "religious-heritage",
      location: "Agameswari Tala, Ward 12, Shantipur, Nadia, West Bengal (PIN: 741404)",
      deity: "Maa Dakshina Kali (Tantric Dakshina Murti consecrated on Amavasya, eyes opened at midnight Chakshu Daan)",
      image: {
        path: "/images/santipur/maa-kali/santipur-maa-agameswari-idol-01.png",
        type: "deity-idol",
        verified: true,
        source: "Agameswari Tala Puja Committee & Local Custodians Archive",
        license: "Local Heritage Archive / Authorized Public Display",
        permissionStatus: "authorized",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: false,
        type: "golden-om"
      },
      gallery: [
        {
          path: "/images/santipur/temples/santipur-agameswari-temple-exterior-01.jpg",
          type: "temple-exterior",
          title: "Agameswari Temple Gateway & Courtyard",
          source: "https://commons.wikimedia.org/wiki/File:Agameshwari_Temple,_Shantipur_02.jpg",
          license: "CC BY-SA 4.0",
          photographer: "Pinakpani",
          verified: true
        }
      ],
      notes: "Authentic 420-year-old Agameswari idol consecrated by Tantracharya Krishnananda Agambagish. Consecrated with 36 vegetarian bhog preparations without animal sacrifice."
    },

    "mahishkhagi": {
      id: "mahishkhagi",
      name: "Maa Mahishkhagi (Mahishkhagi Para)",
      bengaliName: "মা মহিষখাগী (মহিষখাগী পাড়া)",
      category: "religious-heritage",
      location: "Mahishkhagi Para, Ward 08, Shantipur, Nadia, West Bengal (PIN: 741404)",
      deity: "Maa Mahishkhagi Kali (Towering idol worshipped with Vedic Hindu marriage rituals)",
      image: {
        path: "/images/santipur/maa-kali/santipur-maa-mahishkhagi-procession-01.jpg",
        type: "religious-ceremony",
        verified: true,
        source: "https://commons.wikimedia.org/wiki/File:Mahiskhagi_Kali,_Santipur,_West_Bengal,_IMG_2642.jpg",
        license: "CC BY-SA 4.0",
        permissionStatus: "authorized",
        photographer: "Sammya Brata",
        aspectRatio: "3:4"
      },
      placeholder: {
        enabled: false,
        type: "golden-om"
      },
      gallery: [],
      notes: "Authentic historic procession of Mahiskhagi Kali through Santipur. Only Kali in Bengal worshipped with Dadhimangal and Bashi Biye marriage rituals."
    },

    "bamakali": {
      id: "bamakali",
      name: "Maa Bamakali (Bamakali Tala)",
      bengaliName: "মা বামা কালী (বামাকালী তলা)",
      category: "religious-heritage",
      location: "Bamakali Tala, Sutragarh, Shantipur, Nadia, West Bengal (PIN: 741404)",
      deity: "Maa Bamakali (Stepping forward with left foot / Bama-pada)",
      image: {
        path: "/images/santipur/maa-kali/santipur-maa-bamakali-idol-01.png",
        type: "deity-idol",
        verified: true,
        source: "Cultural images/বামাকালী মাতা.png (Bamakali Trust Committee & Local Devotees Archive)",
        license: "Community Cultural Archive / Authorized",
        permissionStatus: "authorized",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: false,
        type: "golden-om"
      },
      gallery: [
        {
          path: "/images/santipur/maa-kali/santipur-bamakali-shrine-sanctum-01.png",
          type: "temple-interior",
          title: "Bamakali Tala Inner Sanctum Shrine",
          source: "Santipur Temple Preservation Forum",
          license: "Community Cultural Archive",
          verified: true
        },
        {
          path: "/images/santipur/festivals/santipur-bamakali-night-immersion-01.png",
          type: "festival",
          title: "Bamakali Midnight Dancing Immersion",
          source: "Bamakali Youth Sevak Sangha Archive",
          license: "Community Cultural Archive",
          verified: true
        }
      ],
      notes: "Authentic 500-year-old Tantric deity depicted with left foot forward. World-famous for midnight rhythmic dancing immersion on bearers' bare shoulders."
    },

    "chaduni_mata": {
      id: "chaduni_mata",
      name: "Ghor Chaduni & Bahir Chaduni Mata (Chanduni Bari)",
      bengaliName: "ঘর চাঁদুনী ও বাহির চাঁদুনী মাতা (চাঁদুনী বাড়ি)",
      category: "religious-heritage",
      location: "Chanduni Bari, Ward 14 (between Motiganj More & Barabazar), Shantipur, Nadia (PIN: 741404)",
      deity: "Dakshina Kali (Twin sanctum deities consecrated on Panchamundi Asana)",
      image: {
        path: "/images/santipur/maa-kali/santipur-ghor-chanduni-mata-01.png",
        type: "deity-idol",
        verified: true,
        source: "Chanduni Bari Trust & Devotees Archive / Authentic Photograph",
        license: "Local Heritage Archive / Authorized",
        permissionStatus: "owner-authorized",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: false,
        type: "none"
      },
      gallery: [],
      notes: "Founded ~550 years ago by scholar Kashinath Sarvabhauma following divine Swapnadesh. Renowned for Murshidabad shehnai/nahabat recitals and sacred unboiled rice bhog."
    },

    "poteswari": {
      id: "poteswari",
      name: "Maa Poteswari (Barajiakur)",
      bengaliName: "মা পটেশ্বরী (বারজিয়াকুর)",
      category: "religious-heritage",
      location: "Poteswari Street, Barajiakur, Shantipur, Nadia, West Bengal (PIN: 741404)",
      deity: "Maa Poteswari Kali (Painted cloth scroll / Pata-chitra tradition)",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "600-year-old tradition where Kapalika sadhus preserved the deity on painted cloth scrolls (Pat) during 18th-century Bargi raids. Golden Om displayed awaiting authenticated community photo."
    },

    "siddheswari": {
      id: "siddheswari",
      name: "Siddheswari Kali Mandir (Sutragarh)",
      bengaliName: "সিদ্ধেশ্বরী কালী মন্দির (সূত্রাগড়)",
      category: "religious-heritage",
      location: "K.C. Das Road, Sutragarh, Shantipur, Nadia, West Bengal (PIN: 741404)",
      deity: "Maa Siddheswari Kali (Guardian patroness of Sutragarh weavers with Navakalebar every 12 years)",
      image: {
        path: "/images/santipur/maa-kali/santipur-siddheswari-kali-idol-01.png",
        type: "deity-idol",
        verified: true,
        source: "Sutragarh Weavers Guild & Siddheswari Mandir Committee",
        license: "Community Cultural Archive / Authorized",
        permissionStatus: "authorized",
        aspectRatio: "3:4"
      },
      placeholder: {
        enabled: false,
        type: "golden-om"
      },
      gallery: [],
      notes: "Consecrated ~500 years ago, anchoring the spiritual heritage of Sutragarh weavers. Cropped to pure high-resolution portrait."
    },

    // =========================================================================
    // 2. HISTORIC TEMPLES & ARCHITECTURE
    // =========================================================================
    "boro_goswami_bari": {
      id: "boro_goswami_bari",
      name: "Sri Sri Radha Raman Jiu (Boro Goswami Bari)",
      bengaliName: "শ্রী শ্রী রাধারমণ জিউ (বড় গোস্বামী বাড়ি)",
      category: "historic-temple",
      location: "Boro Goswami Bari, Ward 09, Shantipur, Nadia, West Bengal (PIN: 741404)",
      deity: "Sri Sri Radha Raman Jiu (Dolgovinda Vigraha consecrated by Mathuresh Goswami in 1588 CE)",
      image: {
        path: "/images/santipur/vaishnava-heritage/santipur-sri-radha-raman-jiu-01.jpg",
        type: "deity-idol",
        verified: true,
        source: "Advaita Lineage Archives / User Provided Sacred Photograph",
        license: "Official Custodian Archive / Authorized",
        permissionStatus: "authorized",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: false,
        type: "golden-om"
      },
      gallery: [
        {
          path: "/images/santipur/rash-utsav/santipur-bhanga-rash-rairaja-01.jpg",
          type: "festival",
          title: "Santipur Bhanga Rash Rairaja Royal Procession",
          source: "https://commons.wikimedia.org/wiki/File:Santipur_Rash_Rairaja_(%E0%A6%B6%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%A4%E0%A6%BF%E0%A6%AA%E0%A7%81%E0%A6%B0_%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A7%87%E0%A6%B0_%E0%A6%B0%E0%A6%BE%E0%A6%87%E0%A6%B0%E0%A6%BE%E0%A6%9C%E0%A6%BE).jpg",
          license: "CC BY-SA 4.0",
          photographer: "Apurv013",
          verified: true
        }
      ],
      notes: "Ancestral seat of Sri Advaita Acharya's lineage housing Sri Sri Radha Raman Jiu (founded 1484 CE, ~540 years). Epicenter of the 350-year-old Shantipur Rash Utsav."
    },

    "shyamchand_mandir": {
      id: "shyamchand_mandir",
      name: "Shyamchand Mandir (1726 CE)",
      bengaliName: "শ্রী শ্যামচাঁদ জিউ মন্দির (১৭২৬ খ্রি.)",
      category: "historic-temple",
      location: "Netaji Subhash Road, Shyamchandpara, Ward 08, Shantipur, Nadia (PIN: 741404)",
      deity: "Sri Shyamchand Jiu",
      image: {
        path: "/images/santipur/temples/santipur-shyamchand-temple-atchala-01.jpg",
        type: "temple-exterior",
        verified: true,
        source: "https://commons.wikimedia.org/wiki/File:Shyamchand_temple_at_Shantipur_in_Nadia_district_01.jpg",
        license: "CC BY 4.0",
        permissionStatus: "authorized",
        photographer: "Amitabha Gupta",
        aspectRatio: "4:3"
      },
      placeholder: {
        enabled: false,
        type: "golden-om"
      },
      gallery: [
        {
          path: "/images/santipur/temples/santipur-shyamchand-terracotta-relief-01.jpg",
          type: "supporting-image",
          title: "Terracotta Relief Panels on Southern Facade",
          source: "https://commons.wikimedia.org/wiki/File:Terracotta_panels_on_southern_facade_of_Shyamchand_temple_at_Shantipur_in_Nadia_district_05.jpg",
          license: "CC BY 4.0",
          photographer: "Amitabha Gupta",
          verified: true
        }
      ],
      notes: "Erected in 1726 CE by textile merchant Ramgopal Khan Chowdhury. Largest traditional Atchala temple in Nadia (ASI S-WB-96)."
    },

    "jaleswar_shiva": {
      id: "jaleswar_shiva",
      name: "Jaleswar Shiva Temple (ASI Protected)",
      bengaliName: "শ্রী জলেশ্বর মহাদেব মন্দির (এএসআই চারচালা)",
      category: "historic-temple",
      location: "Jaleswar Tala, Ward 05, Shantipur, Nadia, West Bengal (PIN: 741404)",
      deity: "Swayambhu Jaleswar Shiva Lingam",
      image: {
        path: "/images/santipur/temples/santipur-jaleswar-shiva-temple-01.jpg",
        type: "temple-exterior",
        verified: true,
        source: "https://commons.wikimedia.org/wiki/File:Jaleswar_Temple_of_Shantipur_01.jpg",
        license: "CC BY-SA 4.0",
        permissionStatus: "authorized",
        photographer: "Pinakpani",
        aspectRatio: "3:4"
      },
      placeholder: {
        enabled: false,
        type: "golden-om"
      },
      gallery: [
        {
          path: "/images/santipur/temples/santipur-jaleswar-temple-terracotta-01.jpg",
          type: "supporting-image",
          title: "Jaleswar Temple Terracotta Relief Detail",
          source: "https://commons.wikimedia.org/wiki/File:Jaleswar_Temple_of_Shantipur_05.jpg",
          license: "CC BY-SA 4.0",
          photographer: "Pinakpani",
          verified: true
        }
      ],
      notes: "Early 18th-century Charchala terracotta temple (ASI N-WB-54-d) erected under Maharaja Raghuram Roy of Nadia."
    },

    "topkhana_mosque": {
      id: "topkhana_mosque",
      name: "Topkhana Mosque & Panchpota Landmark (1703 CE)",
      bengaliName: "তোপখানা মসজিদ ও পঞ্চপোতা ঐতিহাসিক সৌধ",
      category: "historical-landmark",
      location: "NH-34 Corridor, Panchpota / Topkhana, Shantipur, Nadia (PIN: 741404)",
      deity: "Indo-Islamic Historic Landmark",
      image: {
        path: "/images/santipur/historical-landmarks/santipur-panchpota-historic-mosque-01.jpg",
        type: "historical-archive",
        verified: true,
        source: "https://commons.wikimedia.org/wiki/File:Panchpota_Jama_Masjid_-_Indian_National_Highway_34_-_Santipur_-_Nadia_2013-03-23_7015.JPG",
        license: "CC BY 3.0",
        permissionStatus: "authorized",
        photographer: "Biswarup Ganguly",
        aspectRatio: "3:2"
      },
      placeholder: {
        enabled: false,
        type: "golden-om"
      },
      gallery: [],
      notes: "Historic brick domes and colonnade built in 1703 CE during Aurangzeb's reign by Faujdar Gazi Mohammad Yar Khan."
    },

    // =========================================================================
    // 3. HANDLOOM CLUSTERS & HAATS
    // =========================================================================
    "sutragarh_cluster": {
      id: "sutragarh_cluster",
      name: "Sutragarh Master Weavers Hub",
      bengaliName: "সূত্রাগড় প্রধান তাঁতি পল্লী ও বয়ন কেন্দ্র",
      category: "handloom-heritage",
      location: "Sutragarh & K.C. Das Road, Shantipur, Nadia (PIN: 741404)",
      deity: "Santipuri Tant GI Tradition (1409 CE)",
      image: {
        path: "/images/santipur/handloom/santipur-traditional-tant-loom-01.jpg",
        type: "supporting-image",
        verified: true,
        source: "https://commons.wikimedia.org/wiki/File:The_Sun-Drenched_Loom_,_a_Century_of_Color_in_Shantipur.jpg",
        license: "CC BY-SA 4.0",
        permissionStatus: "authorized",
        photographer: "Arghadeep chinya",
        aspectRatio: "4:3"
      },
      placeholder: {
        enabled: false,
        type: "golden-om"
      },
      gallery: [],
      notes: "Sun-drenched pit loom with hand-dyed cotton yarn spools illustrating 1409 CE GI-tagged Santipuri Tant."
    },

    "dalal_para_cluster": {
      id: "dalal_para_cluster",
      name: "Dalal Para & Baigachi Handlooms",
      bengaliName: "দালাল পাড়া ও বৈগাছি তাঁতি পল্লী",
      category: "handloom-heritage",
      location: "Dalal Para, Baigachi Para, Shantipur, Nadia (PIN: 741404)",
      deity: "Traditional Jalchuri Dhoti & Muslin Weaving",
      image: {
        path: "/images/santipur/handloom/santipur-tant-weaving-workshop-01.jpg",
        type: "supporting-image",
        verified: true,
        source: "https://commons.wikimedia.org/wiki/File:Lakshmi_Textile_Tant_Workshop_Interior_-_2_Natun_Phulia_-_Nadia_2016-11-12_1805.JPG",
        license: "CC BY 3.0",
        permissionStatus: "authorized",
        photographer: "Biswarup Ganguly",
        aspectRatio: "3:2"
      },
      placeholder: {
        enabled: false,
        type: "golden-om"
      },
      gallery: [],
      notes: "Master weaver operating flying shuttle loom weaving 100x100 count fine combed cotton."
    },

    "ghoralia_cluster": {
      id: "ghoralia_cluster",
      name: "Ghoralia Wholesale Weavers Guild",
      bengaliName: "ঘোড়ালিয়া পাইকারি তাঁত সমবায়",
      category: "handloom-heritage",
      location: "Ghoralia & Mozammel Haque Road, Shantipur, Nadia (PIN: 741404)",
      deity: "Wholesale Handloom Guild",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "Wholesale boutique and export weavers guild. Golden Om displayed awaiting authenticated workshop photograph."
    },

    // =========================================================================
    // 4. ARTISANS & CULINARY HERITAGE
    // =========================================================================
    "nikhuti": {
      id: "nikhuti",
      name: "200-Year-Old Authentic Shantipur Nikhuti",
      bengaliName: "শান্তিপুরের ঐতিহ্যবাহী ২০০ বছরের নিখুঁতি",
      category: "culinary-heritage",
      location: "Santipur Bazaar & Station Road, Shantipur (PIN: 741404)",
      deity: "Heritage Sweet of Bengal",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "Slender oblong golden chhena sweets kneaded with cardamom and cracked black pepper, deep-fried in ghee and soaked in warm syrup."
    },

    "sutragarh_mritsilpi": {
      id: "sutragarh_mritsilpi",
      name: "Sutragarh Clay Idol & Terracotta Sculptors",
      bengaliName: "সূত্রাগড় মৃৎশিল্পী সমিতি (কালীপ্রতিমা ও ভাস্কর্য)",
      category: "sculpture-heritage",
      location: "Sutragarh Pal Para, Ward 18, Shantipur (PIN: 741404)",
      deity: "Master Clay Sculptors Guild",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "Centuries of master clay artisans who sculpt Shantipur's towering Kali idols and Bhanga Rash clay tableaus from sacred Ganga silt."
    },

    "kansha_pitul_guild": {
      id: "kansha_pitul_guild",
      name: "Kansha-Pitul (Antique Bell Metal & Brass Guild)",
      bengaliName: "কাঁসা ও পিতল কারুশিল্প গিল্ড (পূজার সামগ্রী ও ধুনুচি)",
      category: "craft-heritage",
      location: "Kansharipara & Thanthani, Shantipur, Nadia (PIN: 741404)",
      deity: "Bell Metal & Brass Craft Heritage",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "Traditional metalsmiths crafting sonorous puja ghanta bells, heavy brass dhunuchis, and ceremonial bhog platters."
    },

    // =========================================================================
    // 5. EDUCATIONAL INSTITUTIONS (COLLEGES & SCHOOLS)
    // =========================================================================
    "santipur_college": {
      id: "santipur_college",
      name: "Santipur College (Est. 1948)",
      bengaliName: "শান্তিপুর কলেজ (স্থাপিত ১৯৪৮)",
      category: "educational-institutes",
      location: "N.S. Road, Santipur, Nadia, West Bengal - 741404",
      deity: "Higher Education & Research Institution",
      image: {
        path: "/images/santipur/institutions/santipur-college-campus-01.jpg",
        type: "temple-exterior",
        verified: true,
        source: "Santipur College Official Portal (santipurcollege.ac.in)",
        license: "Official Institution Media / Public Information",
        permissionStatus: "owner-authorized",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: false,
        type: "none"
      },
      gallery: [],
      notes: "Established July 22, 1948 by Pandit Lakshmi Kanta Moitra (Member of Constituent Assembly). Affiliated to University of Kalyani, UGC 2(f) & 12(B), NAAC Accredited."
    },

    "santipur_municipal_high_school": {
      id: "santipur_municipal_high_school",
      name: "Santipur Municipal High School (Est. 1854)",
      bengaliName: "শান্তিপুর মিউনিসিপ্যাল হাই স্কুল (স্থাপিত ১৮৫৪)",
      category: "educational-institutes",
      location: "Shyamchandpara, Ward No. 8, Santipur, Nadia - 741404",
      deity: "Heritage Higher Secondary School",
      image: {
        path: "/images/santipur/institutions/santipur-municipal-high-school-01.jpg",
        type: "temple-exterior",
        verified: true,
        source: "Santipur Municipal High School Portal (smhshs.myschoolserver.com)",
        license: "Official School Media / Educational Directory",
        permissionStatus: "owner-authorized",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: false,
        type: "none"
      },
      gallery: [],
      notes: "Founded in 1854, one of the oldest schools in Nadia and Bengal. WBBSE & WBCHSE recognized, educating generations of scholars across 170 continuous years."
    },

    "radharani_nari_siksha_mandir": {
      id: "radharani_nari_siksha_mandir",
      name: "Radharani Nari Siksha Mandir (Est. 1934)",
      bengaliName: "রাধারানী নারী শিক্ষা মন্দির (স্থাপিত ১৯৩৪)",
      category: "educational-institutes",
      location: "25 K.B. Pramanick Street, Madangopal Para, Ward 12, Santipur - 741404",
      deity: "Pioneering Girls' Higher Secondary School",
      image: {
        path: "/images/santipur/institutions/santipur-radharani-nari-siksha-mandir-01.jpg",
        type: "temple-exterior",
        verified: true,
        source: "Radharani Nari Siksha Mandir Official Portal (radharaninarisikshamandir.in)",
        license: "Official Institution Media / Authorized",
        permissionStatus: "owner-authorized",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: false,
        type: "none"
      },
      gallery: [],
      notes: "Established in 1934 as Shantipur Girls' High School, celebrating nine decades of dedicated female education and empowerment in Nadia district."
    },

    "sutragarh_mn_high_school": {
      id: "sutragarh_mn_high_school",
      name: "Sutragarh M.N. High School (Est. 1872)",
      bengaliName: "সূত্রগড় এম.এন. উচ্চ বিদ্যালয় (স্থাপিত ১৮৭২)",
      category: "educational-institutes",
      location: "K.C. Das Road, Sutragarh, Ward 19, Santipur - 741404",
      deity: "Historic Higher Secondary School",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "Established Nov 13, 1872 in the heart of Sutragarh's weaving community; elevated to High School in 1900 with generous land patronage."
    },

    "santipur_oriental_academy": {
      id: "santipur_oriental_academy",
      name: "Santipur Oriental Academy (Est. 1895)",
      bengaliName: "শান্তিপুর ওরিয়েন্টাল একাডেমি (স্থাপিত ১৮৯৫)",
      category: "educational-institutes",
      location: "Nirmalendu Lahiri Street, Ward 14, Santipur - 741404",
      deity: "Heritage Secondary School",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "Founded in 1895 during the Bengal Renaissance, blending oriental literature and modern science education for 130 years."
    },

    "santipur_hindu_high_school": {
      id: "santipur_hindu_high_school",
      name: "Santipur Hindu High School (Est. 1917)",
      bengaliName: "শান্তিপুর হিন্দু হাই স্কুল (স্থাপিত ১৯১৭)",
      category: "educational-institutes",
      location: "69 Kashyap Para Road, Madangopal Para, Ward 6, Santipur - 741404",
      deity: "Heritage Higher Secondary School",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "Established 1917 (heritage traces to 1855), renowned for classical Sanskrit studies, cultural heritage, and disciplined academics."
    },

    "saratkumari_girls_high_school": {
      id: "saratkumari_girls_high_school",
      name: "Saratkumari Girls' High School (Est. 1917)",
      bengaliName: "শরৎকুমারী বালিকা বিদ্যালয় (স্থাপিত ১৯১৭)",
      category: "educational-institutes",
      location: "Lenin Sarani, Laxmitala, Ward 8, Santipur - 741404",
      deity: "Historic Girls' High School",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "Established in 1917, over a century of dedicated women's literacy and empowerment near the historic Laxmitala commercial core."
    },

    // =========================================================================
    // 6. OFFICIAL & CIVIC INSTITUTIONS
    // =========================================================================
    "shantipur_municipality": {
      id: "shantipur_municipality",
      name: "Shantipur Municipality (Est. 1853)",
      bengaliName: "শান্তিপুর পুরসভা (স্থাপিত ১৮৫৩)",
      category: "civic-administration",
      location: "20, Netaji Subhash Road, P.O. Santipur, Nadia - 741404",
      deity: "Civic Administration & Municipal Government",
      image: {
        path: "/images/santipur/institutions/santipur-municipality-building-01.jpg",
        type: "temple-exterior",
        verified: true,
        source: "Shantipur Municipality Official Portal (santipurmunicipality.org)",
        license: "Public Domain / Official Municipal Portal",
        permissionStatus: "owner-authorized",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: false,
        type: "none"
      },
      gallery: [],
      notes: "Founded in 1853, the 2nd oldest municipality in West Bengal (First Chairman: Iswar Chandra Ghoshal). Managing 24 wards across 25.88 sq. km."
    },

    "shantipur_railway_station": {
      id: "shantipur_railway_station",
      name: "Shantipur Junction Railway Station (STB)",
      bengaliName: "শান্তিপুর জংশন রেলওয়ে স্টেশন (STB)",
      category: "civic-administration",
      location: "Station Road, Santipur, Nadia, West Bengal - 741404",
      deity: "Eastern Railway (Sealdah Division)",
      image: {
        path: "/images/santipur/institutions/santipur-railway-station-01.jpg",
        type: "temple-exterior",
        verified: true,
        source: "Wikimedia Commons (Pinakpani, 2022)",
        license: "CC BY-SA 4.0",
        permissionStatus: "owner-authorized",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: false,
        type: "none"
      },
      gallery: [],
      notes: "Established 1905, broad gauge electrified in 1963–64. Major EMU terminal connecting Shantipur directly with Sealdah and Krishnanagar City."
    },

    "santipur_state_general_hospital": {
      id: "santipur_state_general_hospital",
      name: "Santipur State General Hospital (131 Beds)",
      bengaliName: "শান্তিপুর স্টেট জেনারেল হাসপাতাল (১৩১ শয্যা)",
      category: "civic-administration",
      location: "Hospital Road / Adwaita Sarak, Santipur, Nadia - 741404",
      deity: "Public Healthcare & Emergency Care",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "131-bed apex state government hospital offering round-the-clock emergency, trauma, maternity, OPD, and pathology services."
    },

    "santipur_police_station": {
      id: "santipur_police_station",
      name: "Santipur Police Station (Ranaghat District)",
      bengaliName: "শান্তিপুর থানা (রানাঘাট পুলিশ জেলা)",
      category: "civic-administration",
      location: "Shyamchandpara (Near Shyamchand Mandir), Santipur, Nadia - 741404",
      deity: "Civil Safety & Law Enforcement",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "Sub-divisional police station under Ranaghat Police District, protecting 111.94 sq. km across municipal and CD block areas."
    },

    "santipur_public_library": {
      id: "santipur_public_library",
      name: "Santipur Public Library (Sadharan Pathagar, Est. 1912)",
      bengaliName: "শান্তিপুর সাধারণ পাঠাগার (স্থাপিত ১৯১২)",
      category: "civic-administration",
      location: "Madangopal Para, Santipur, Nadia - 741404",
      deity: "Cultural & Literary Research Archive",
      image: {
        path: DEFAULT_OM_PLACEHOLDER,
        type: "supporting-image",
        verified: false,
        source: "Sacred Golden Om Heritage Archival Placeholder",
        license: "Santipur Heritage Directory System",
        permissionStatus: "pending_verification",
        aspectRatio: "16:9"
      },
      placeholder: {
        enabled: true,
        type: "golden-om"
      },
      gallery: [],
      notes: "Founded in 1912, housing rare Sanskrit manuscripts, Vaishnava texts, and historic Bengal periodicals over 112 years."
    }
  };

  // Enhance entries with direct convenience properties for seamless backwards compatibility
  for (const key in rawMappings) {
    const entry = rawMappings[key];
    const img = entry.image;
    entry.coverImage = (img && img.verified && !entry.placeholder.enabled) ? img.path : DEFAULT_OM_PLACEHOLDER;
    entry.imageVerified = !!(img && img.verified && !entry.placeholder.enabled);
    entry.source = img ? img.source : 'Santipur Local Heritage Archive';
    entry.license = img ? (img.license || 'Heritage Fair Use') : 'Heritage Fair Use';
    entry.aspectRatio = img ? (img.aspectRatio || '16:9') : '16:9';
    entry.permissionStatus = img ? (img.permissionStatus || 'pending_verification') : 'pending_verification';
  }

  window.SANTIPUR_LISTING_IMAGE_REGISTRY = {
    version: "5.1.0",
    lastAudit: "2026-11-08T15:25:00Z",
    defaultPlaceholderPath: DEFAULT_OM_PLACEHOLDER,
    mappings: rawMappings,

    getCover(listingId, defaultFallback = DEFAULT_OM_PLACEHOLDER) {
      const entry = this.mappings[listingId];
      if (entry && entry.image && entry.image.verified && entry.image.path && !entry.placeholder.enabled) {
        return entry.image.path;
      }
      return defaultFallback;
    },

    getEntry(listingId) {
      return this.mappings[listingId] || null;
    },

    isVerified(listingId) {
      const entry = this.mappings[listingId];
      return !!(entry && entry.image && entry.image.verified && !entry.placeholder.enabled);
    },

    // Phase 6 Reusable HeritageImagePlaceholder Component
    HeritageImagePlaceholder({ width = '100%', height = '100%', caption = 'Photograph Unavailable' } = {}) {
      return `
        <div class="heritage-image-placeholder" style="width:${width}; height:${height}; background:linear-gradient(135deg, #FCFAF7 0%, #F8F4EC 50%, #F2ECE0 100%); border:1px solid rgba(183, 149, 80, 0.4); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:16px; box-sizing:border-box;">
          <div style="font-family:'Noto Serif Bengali', Georgia, serif; font-size:48px; font-weight:bold; color:#B79550; text-shadow:0 2px 4px rgba(183,149,80,0.2); line-height:1; margin-bottom:8px;">ॐ</div>
          <div style="font-family:'Inter', sans-serif; font-size:12px; font-weight:700; color:#2E2822; letter-spacing:1px; margin-bottom:4px;">পবিত্র শান্তিপুর ঐতিহ্য</div>
          <div style="font-family:'Inter', sans-serif; font-size:10px; font-weight:600; color:#9C7832; letter-spacing:0.8px;">${caption.toUpperCase()}</div>
        </div>
      `;
    }
  };
})();
