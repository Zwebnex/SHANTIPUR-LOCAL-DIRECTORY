// listingImageRegistry.js - Single Source of Truth for Listing Cover Images & Provenance
window.SANTIPUR_LISTING_IMAGE_REGISTRY = {
  version: "4.0.0",
  lastAudit: "2026-11-08T12:26:00Z",

  // Master listing image mapping ensuring zero duplicates and strictly unique cover assignments
  mappings: {
    // 1. Sacred Maa Kali Shrines
    "agameswari": {
      id: "agameswari",
      name: "Maa Agameswari (Agameswari Tala)",
      coverImage: "/images/santipur/maa-kali/santipur-maa-agameswari-idol-01.png",
      imageVerified: true,
      permissionStatus: "authorized",
      source: "Agameswari Tala Trust & Local Devotees Archive",
      aspectRatio: "16:9",
      gallery: [
        "/images/santipur/temples/santipur-agameswari-temple-exterior-01.jpg"
      ],
      notes: "Authentic 420-year-old Agameswari idol consecrated by Tantracharya Krishnananda Agambagish."
    },
    "mahishkhagi": {
      id: "mahishkhagi",
      name: "Maa Mahishkhagi (Mahishkhagi Para)",
      coverImage: "/images/santipur/maa-kali/santipur-maa-mahishkhagi-procession-01.jpg",
      imageVerified: true,
      permissionStatus: "authorized",
      source: "https://commons.wikimedia.org/wiki/File:Mahiskhagi_Kali,_Santipur,_West_Bengal,_IMG_2642.jpg",
      license: "CC BY-SA 4.0",
      photographer: "Sammya Brata",
      aspectRatio: "3:4",
      gallery: [],
      notes: "Authentic historic procession of Mahiskhagi Kali in Santipur, Nadia, West Bengal. Unique Vedic marriage worship rites."
    },
    "bamakali": {
      id: "bamakali",
      name: "Maa Bamakali (Bamakali Tala)",
      coverImage: "/images/santipur/maa-kali/santipur-maa-bamakali-idol-01.png",
      imageVerified: true,
      permissionStatus: "authorized",
      source: "Cultural images/BAMA Kaali.png",
      aspectRatio: "3:4",
      gallery: [
        "/images/santipur/maa-kali/santipur-bamakali-shrine-sanctum-01.png",
        "/images/santipur/festivals/santipur-bamakali-night-immersion-01.png"
      ],
      notes: "Authentic ~500-year-old Bamakali deity stepping forward with left foot (Bama-pada), cropped to remove padded side bars."
    },
    "chaduni_mata": {
      id: "chaduni_mata",
      name: "Ghor Chaduni & Bahir Chaduni Mata",
      coverImage: "/images/santipur/om-placeholder.svg",
      imageVerified: false,
      permissionStatus: "pending_verification",
      source: "Sacred Om Heritage Archival Placeholder",
      aspectRatio: "4:3",
      gallery: [],
      notes: "Twin sanctums on Panchamundi Asana (~500 years). Sacred Om sign displayed awaiting official Sevayat trust photographic documentation."
    },
    "poteswari": {
      id: "poteswari",
      name: "Maa Poteswari (Barajiakur)",
      coverImage: "/images/santipur/om-placeholder.svg",
      imageVerified: false,
      permissionStatus: "pending_verification",
      source: "Sacred Om Heritage Archival Placeholder",
      aspectRatio: "4:3",
      gallery: [],
      notes: "Ancient sacred Pata cloth scroll tradition. Sacred Om sign displayed awaiting community archive submission."
    },
    "siddheswari": {
      id: "siddheswari",
      name: "Siddheswari Kali Mandir",
      coverImage: "/images/santipur/maa-kali/santipur-siddheswari-kali-idol-01.png",
      imageVerified: true,
      permissionStatus: "authorized",
      source: "Cultural images/সিদ্ধেশ্বরী কালী.png",
      aspectRatio: "3:4",
      gallery: [],
      notes: "Authentic Sutragarh Siddheswari Kali deity, patron of the master weavers, cropped to pure sharp portrait."
    },

    // 2. Historic Temples & Architecture
    "boro_goswami_bari": {
      id: "boro_goswami_bari",
      name: "Boro Goswami Bari",
      coverImage: "/images/santipur/vaishnava-heritage/santipur-sri-radha-raman-jiu-01.jpg",
      imageVerified: true,
      permissionStatus: "authorized",
      source: "Advaita Lineage Archives / User Provided Sacred Photograph",
      aspectRatio: "16:9",
      gallery: [
        "/images/santipur/rash-utsav/santipur-bhanga-rash-rairaja-01.jpg"
      ],
      notes: "Ancestral seat of Sri Advaita Acharya's lineage housing Sri Sri Radha Raman Jiu (est. 1484 CE)."
    },
    "shyamchand_mandir": {
      id: "shyamchand_mandir",
      name: "Shyamchand Mandir (1726 CE)",
      coverImage: "/images/santipur/temples/santipur-shyamchand-temple-atchala-01.jpg",
      imageVerified: true,
      permissionStatus: "authorized",
      source: "https://commons.wikimedia.org/wiki/File:Shyamchand_temple_at_Shantipur_in_Nadia_district_01.jpg",
      license: "CC BY 4.0",
      photographer: "Amitabha Gupta",
      aspectRatio: "4:3",
      gallery: [
        "/images/santipur/temples/santipur-shyamchand-terracotta-relief-01.jpg"
      ],
      notes: "Grandest Atchala terracotta brick temple in Nadia (ASI S-WB-96) erected by handloom merchant Ramgopal Khan Chowdhury."
    },
    "jaleswar_shiva": {
      id: "jaleswar_shiva",
      name: "Jaleswar Shiva Temple",
      coverImage: "/images/santipur/temples/santipur-jaleswar-shiva-temple-01.jpg",
      imageVerified: true,
      permissionStatus: "authorized",
      source: "https://commons.wikimedia.org/wiki/File:Jaleswar_Temple_of_Shantipur_01.jpg",
      license: "CC BY-SA 4.0",
      photographer: "Pinakpani",
      aspectRatio: "3:4",
      gallery: [
        "/images/santipur/temples/santipur-jaleswar-temple-terracotta-01.jpg"
      ],
      notes: "Charchala terracotta Shiva temple (ASI N-WB-54-d) from reign of Maharaja Raghuram Roy of Nadia."
    },
    "topkhana_mosque": {
      id: "topkhana_mosque",
      name: "Topkhana Mosque & Panchpota Landmark (1703 CE)",
      coverImage: "/images/santipur/historical-landmarks/santipur-panchpota-historic-mosque-01.jpg",
      imageVerified: true,
      permissionStatus: "authorized",
      source: "https://commons.wikimedia.org/wiki/File:Panchpota_Jama_Masjid_-_Indian_National_Highway_34_-_Santipur_-_Nadia_2013-03-23_7015.JPG",
      license: "CC BY 3.0",
      photographer: "Biswarup Ganguly",
      aspectRatio: "3:2",
      gallery: [],
      notes: "Historic brick domes and arched colonnade on NH-34 corridor."
    },

    // 3. Handloom Clusters
    "sutragarh_cluster": {
      id: "sutragarh_cluster",
      name: "Sutragarh Master Weavers Hub",
      coverImage: "/images/santipur/handloom/santipur-traditional-tant-loom-01.jpg",
      imageVerified: true,
      permissionStatus: "authorized",
      source: "https://commons.wikimedia.org/wiki/File:The_Sun-Drenched_Loom_,_a_Century_of_Color_in_Shantipur.jpg",
      license: "CC BY-SA 4.0",
      photographer: "Arghadeep chinya",
      aspectRatio: "4:3",
      gallery: [],
      notes: "Sun-drenched pit loom with hand-dyed cotton yarn spools illustrating 1409 CE GI-tagged Santipuri Tant."
    },
    "dalal_para_cluster": {
      id: "dalal_para_cluster",
      name: "Dalal Para & Baigachi Handlooms",
      coverImage: "/images/santipur/handloom/santipur-tant-weaving-workshop-01.jpg",
      imageVerified: true,
      permissionStatus: "authorized",
      source: "https://commons.wikimedia.org/wiki/File:Lakshmi_Textile_Tant_Workshop_Interior_-_2_Natun_Phulia_-_Nadia_2016-11-12_1805.JPG",
      license: "CC BY 3.0",
      photographer: "Biswarup Ganguly",
      aspectRatio: "3:2",
      gallery: [],
      notes: "Master weaver operating flying shuttle loom weaving 100x100 count fine combed cotton."
    },
    "ghoralia_cluster": {
      id: "ghoralia_cluster",
      name: "Ghoralia Wholesale Weavers Guild",
      coverImage: "/images/santipur/om-placeholder.svg",
      imageVerified: false,
      permissionStatus: "pending_verification",
      source: "Sacred Om Heritage Archival Placeholder",
      aspectRatio: "4:3",
      gallery: [],
      notes: "Wholesale boutique and export weavers guild sacred Om placeholder."
    },

    // 4. Artisans & Sweets
    "nikhuti": {
      id: "nikhuti",
      name: "200-Year-Old Authentic Shantipur Nikhuti",
      coverImage: "/images/santipur/om-placeholder.svg",
      imageVerified: false,
      permissionStatus: "pending_verification",
      source: "Sacred Om Heritage Archival Placeholder",
      aspectRatio: "4:3",
      gallery: [],
      notes: "Slender oblong golden chhena sweets flavored with cardamom and cracked black pepper."
    },
    "sutragarh_mritsilpi": {
      id: "sutragarh_mritsilpi",
      name: "Sutragarh Clay Idol & Terracotta Sculptors",
      coverImage: "/images/santipur/om-placeholder.svg",
      imageVerified: false,
      permissionStatus: "pending_verification",
      source: "Sacred Om Heritage Archival Placeholder",
      aspectRatio: "4:3",
      gallery: [],
      notes: "Master clay artisans sculpting towering Kali idols and Bhanga Rash tableaus."
    },
    "kansha_pitul_guild": {
      id: "kansha_pitul_guild",
      name: "Kansha-Pitul (Antique Bell Metal & Brass Guild)",
      coverImage: "/images/santipur/om-placeholder.svg",
      imageVerified: false,
      permissionStatus: "pending_verification",
      source: "Sacred Om Heritage Archival Placeholder",
      aspectRatio: "4:3",
      gallery: [],
      notes: "Traditional metal smiths crafting puja ghanta bells, heavy brass dhunuchis, and ceremonial bhog platters."
    }
  },

  getCover(listingId, defaultFallback = '/images/santipur/om-placeholder.svg') {
    const entry = this.mappings[listingId];
    if (entry && entry.coverImage && entry.coverImage.trim() !== '') return entry.coverImage;
    return defaultFallback;
  },

  getEntry(listingId) {
    return this.mappings[listingId] || null;
  }
};

