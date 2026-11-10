// app.js - Complete Professional Controller for Shantipur Heritage Platform (Listygo Editorial System)
document.addEventListener('DOMContentLoaded', async () => {
  let appData = null;
  let galleryManifest = null;
  let activeTab = 'all';
  let activeGalleryCategory = 'all';
  let activeLightboxIndex = 0;
  let filteredGalleryAssets = [];
  let selectedShrinesForParikrama = new Set(['agameswari', 'mahishkhagi', 'bamakali']);

  // Fetch API or fallback
  try {
    const res = await fetch('api/heritage.json');
    if (res.ok) {
      appData = await res.json();
    }
  } catch (e) {
    console.warn('Using local fallback data payload', e);
  }

  // Fetch Image Manifest
  try {
    const manifestRes = await fetch('/images/santipur/image-manifest.json');
    if (manifestRes.ok) {
      const manifestData = await manifestRes.json();
      galleryManifest = (manifestData.images || []).filter(item => 
        item.id !== 'santipur-city-002' && 
        item.subcategory !== 'emblem-logo' && 
        !(item.title && item.title.toLowerCase().includes('directory seal'))
      );
    }
  } catch (e) {
    console.warn('Error loading image manifest:', e);
  }

  // Fallback if manifest fetch failed
  if (!galleryManifest && window.SHANTIPUR_ASSETS) {
    galleryManifest = (window.SHANTIPUR_ASSETS.uploaded_photos || []).map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      location: "Santipur, Nadia, West Bengal",
      productionPath: p.src,
      sourcePage: "Santipur Cultural Archive",
      license: "Heritage Archive",
      permissionStatus: "owner-authorized",
      verified: true,
      verificationNotes: p.tags.join(', ')
    }));
  }

  // Audio lore synthesizer (subtle temple chime)
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  function playTempleChime(freq = 528) {
    try {
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, audioCtx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, audioCtx.currentTime + 1.1);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 2.1);
    } catch (err) {
      console.log('Audio on interaction', err);
    }
  }

  // Combine listings for unified discovery
  function getUnifiedListings() {
    if (!appData) return [];
    const list = [];

    const getResolvedCover = (id, fallback) => {
      if (window.SANTIPUR_LISTING_IMAGE_REGISTRY && typeof window.SANTIPUR_LISTING_IMAGE_REGISTRY.getCover === 'function') {
        const cover = window.SANTIPUR_LISTING_IMAGE_REGISTRY.getCover(id);
        if (cover) return cover;
      }
      return fallback;
    };

    // Sacred Pujas
    appData.shrines.forEach(s => {
      list.push({
        id: s.id,
        type: 'puja',
        category_en: 'Sacred Puja',
        category_bn: 'সুপ্রাচীন পূজা',
        badge_en: `~${s.age_years} Years`,
        badge_bn: `~${s.age_years} বছর`,
        name_en: s.name_en,
        name_bn: s.name_bn,
        desc_en: s.history_en,
        desc_bn: s.history_bn,
        location: s.ward_location,
        location_pin: s.location_pin,
        image_url: getResolvedCover(s.id, s.image_url),
        slot_key: `shrine_${s.id}`,
        raw: s
      });
    });

    // Historic Temples
    appData.temples.forEach(t => {
      list.push({
        id: t.id,
        type: 'temple',
        category_en: 'Historic Temple',
        category_bn: 'ঐতিহাসিক মন্দির',
        badge_en: t.founded_year,
        badge_bn: t.founded_year,
        name_en: t.name_en,
        name_bn: t.name_bn,
        desc_en: t.significance_en,
        desc_bn: t.significance_bn,
        location: t.tradition,
        location_pin: 'https://maps.google.com/?q=' + encodeURIComponent(t.name_en + ' Shantipur'),
        image_url: getResolvedCover(t.id, t.image_url),
        slot_key: `temple_${t.id}`,
        raw: t
      });
    });

    // Handloom Clusters
    appData.handloom_clusters.forEach(h => {
      list.push({
        id: h.id,
        type: 'handloom',
        category_en: 'Shantipuri Handloom',
        category_bn: 'শান্তিপুরী তাঁত',
        badge_en: '1409 CE Tradition',
        badge_bn: '১৪০৯ খ্রিস্টাব্দের ঐতিহ্য',
        name_en: h.name_en,
        name_bn: h.name_bn,
        desc_en: h.specialty_en,
        desc_bn: h.specialty_bn,
        location: h.cluster_area,
        location_pin: 'https://maps.google.com/?q=' + encodeURIComponent(h.cluster_area + ' Shantipur'),
        image_url: getResolvedCover(h.id, h.image_url),
        slot_key: `handloom_${h.id}`,
        raw: h
      });
    });

    // Artisans & Sweets
    appData.artisans_and_sweets.forEach(a => {
      list.push({
        id: a.id,
        type: 'artisan',
        category_en: 'Artisan & Confectionery',
        category_bn: 'ঐতিহ্যবাহী মিষ্টান্ন ও শিল্প',
        badge_en: a.origin_era,
        badge_bn: a.origin_era,
        name_en: a.title_en,
        name_bn: a.title_bn,
        desc_en: a.description_en,
        desc_bn: a.description_bn,
        location: a.ingredients_or_material,
        location_pin: 'https://maps.google.com/?q=' + encodeURIComponent(a.title_en + ' Shantipur'),
        image_url: getResolvedCover(a.id, a.image_url),
        slot_key: `artisan_${a.id}`,
        raw: a
      });
    });

    // Educational Institutes (Colleges & Schools)
    if (Array.isArray(appData.educational_institutes)) {
      appData.educational_institutes.forEach(e => {
        list.push({
          id: e.id,
          type: 'education',
          category_en: e.category_en,
          category_bn: e.category_bn,
          badge_en: e.established_year,
          badge_bn: e.established_year_bn,
          name_en: e.name_en,
          name_bn: e.name_bn,
          desc_en: e.history_en,
          desc_bn: e.history_bn,
          location: e.address,
          location_pin: 'https://maps.google.com/?q=' + encodeURIComponent(e.name_en + ' Shantipur'),
          image_url: getResolvedCover(e.id, e.image_url),
          slot_key: `edu_${e.id}`,
          raw: e
        });
      });
    }

    // Official & Civic Institutes
    if (Array.isArray(appData.official_institutes)) {
      appData.official_institutes.forEach(o => {
        list.push({
          id: o.id,
          type: 'official',
          category_en: o.category_en,
          category_bn: o.category_bn,
          badge_en: o.badge_en || o.established_year,
          badge_bn: o.badge_bn || o.established_year_bn,
          name_en: o.name_en,
          name_bn: o.name_bn,
          desc_en: o.history_en,
          desc_bn: o.history_bn,
          location: o.address,
          location_pin: 'https://maps.google.com/?q=' + encodeURIComponent(o.name_en + ' Shantipur'),
          image_url: getResolvedCover(o.id, o.image_url),
          slot_key: `off_${o.id}`,
          raw: o
        });
      });
    }

    return list;
  }

  // Render Heritage Listings Grid (Matching Listygo directory cards)
  function renderListings() {
    const container = document.getElementById('listings-container');
    if (!container || !appData) return;

    const lang = window.SHANTIPUR_DATA.currentLang;
    const t = window.SHANTIPUR_DATA.translations[lang];

    let items = getUnifiedListings();

    // Filter by search inputs
    const searchInput = document.getElementById('search-input');
    const query = (searchInput?.value || '').toLowerCase().trim();
    const loc = (document.getElementById('search-location')?.value || 'all').toLowerCase();
    const cat = (document.getElementById('search-category')?.value || 'all').toLowerCase();

    // Toggle Clear Search Button
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', query.length === 0);
    }

    // Only apply active tab filter if there is no global text query OR if query is empty
    if (!query) {
      if (activeTab === 'pujas') items = items.filter(i => i.type === 'puja');
      else if (activeTab === 'temples') items = items.filter(i => i.type === 'temple');
      else if (activeTab === 'handloom') items = items.filter(i => i.type === 'handloom');
      else if (activeTab === 'artisans') items = items.filter(i => i.type === 'artisan');
      else if (activeTab === 'education') items = items.filter(i => i.type === 'education');
      else if (activeTab === 'official') items = items.filter(i => i.type === 'official');
    }

    if (query) {
      items = items.filter(i =>
        (i.name_en && i.name_en.toLowerCase().includes(query)) ||
        (i.name_bn && i.name_bn.toLowerCase().includes(query)) ||
        (i.location && i.location.toLowerCase().includes(query)) ||
        (i.desc_en && i.desc_en.toLowerCase().includes(query)) ||
        (i.desc_bn && i.desc_bn.toLowerCase().includes(query)) ||
        (i.category_en && i.category_en.toLowerCase().includes(query)) ||
        (i.category_bn && i.category_bn.toLowerCase().includes(query)) ||
        (i.badge_en && i.badge_en.toLowerCase().includes(query))
      );
    }

    if (loc !== 'all') {
      items = items.filter(i => i.location && i.location.toLowerCase().includes(loc));
    }

    if (cat !== 'all') {
      if (cat === 'pujas') items = items.filter(i => i.type === 'puja');
      else if (cat === 'temples') items = items.filter(i => i.type === 'temple');
      else if (cat === 'tant') items = items.filter(i => i.type === 'handloom');
      else if (cat === 'sweets') items = items.filter(i => i.type === 'artisan');
      else if (cat === 'education') items = items.filter(i => i.type === 'education');
      else if (cat === 'official') items = items.filter(i => i.type === 'official');
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-14 px-4 text-center bg-white rounded-2xl border border-[#EAEAEA] shadow-2xs">
          <div class="w-12 h-12 rounded-full bg-gray-100 text-[#4B5563] flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <h4 class="text-base font-bold text-[#111827] mb-1">
            ${lang === 'en' ? 'No matching Santipur listings found' : 'আপনার অনুসন্ধানের সাথে মিলিয়ে কোনো স্থান পাওয়া যায়নি'}
          </h4>
          <p class="text-xs text-[#6B7280] mb-5 max-w-md mx-auto">
            ${query 
              ? (lang === 'en' ? `No listings matched "${query}". Try one of the verified suggestions below:` : `"${query}" এর সাথে কোনো তালিকা মেলেনি। নিচের যেকোনো একটি নির্বাচন করুন:`)
              : (lang === 'en' ? 'Try adjusting your locality or category filter criteria.' : 'আপনার এলাকা বা বিভাগের ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।')
            }
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
            <button type="button" onclick="window.searchByTag('Agameswari')" class="px-3 py-1.5 rounded-lg bg-[#FAFAF8] hover:bg-gray-100 border border-[#EAEAEA] text-xs font-semibold text-[#111827] transition-colors">Maa Agameswari</button>
            <button type="button" onclick="window.searchByTag('Shyamchand')" class="px-3 py-1.5 rounded-lg bg-[#FAFAF8] hover:bg-gray-100 border border-[#EAEAEA] text-xs font-semibold text-[#111827] transition-colors">Shyamchand Mandir</button>
            <button type="button" onclick="window.searchByTag('Boro Goswami')" class="px-3 py-1.5 rounded-lg bg-[#FAFAF8] hover:bg-gray-100 border border-[#EAEAEA] text-xs font-semibold text-[#111827] transition-colors">Boro Goswami Bari</button>
            <button type="button" onclick="window.searchByTag('Santipur College')" class="px-3 py-1.5 rounded-lg bg-[#FAFAF8] hover:bg-gray-100 border border-[#EAEAEA] text-xs font-semibold text-[#111827] transition-colors">Santipur College</button>
            <button type="button" onclick="window.searchByTag('Tant')" class="px-3 py-1.5 rounded-lg bg-[#FAFAF8] hover:bg-gray-100 border border-[#EAEAEA] text-xs font-semibold text-[#111827] transition-colors">Shantipuri Tant</button>
            <button type="button" onclick="window.searchByTag('Police')" class="px-3 py-1.5 rounded-lg bg-[#FAFAF8] hover:bg-gray-100 border border-[#EAEAEA] text-xs font-semibold text-[#111827] transition-colors">Police Station</button>
            <button type="button" onclick="window.clearHeroSearch()" class="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-700 transition-colors">
              ${lang === 'en' ? 'Reset All Filters' : 'সকল ফিল্টার রিসেট'}
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const title = lang === 'en' ? item.name_en : item.name_bn;
      const desc = lang === 'en' ? item.desc_en : item.desc_bn;
      const category = lang === 'en' ? item.category_en : item.category_bn;
      const badge = lang === 'en' ? item.badge_en : item.badge_bn;
      const registryEntry = window.SANTIPUR_LISTING_IMAGE_REGISTRY ? window.SANTIPUR_LISTING_IMAGE_REGISTRY.getEntry(item.id) : null;
      const isVerified = registryEntry ? (registryEntry.image?.verified !== false && !registryEntry.placeholder?.enabled) : true;
      const rawImg = (registryEntry && registryEntry.image && registryEntry.image.path) || (registryEntry && registryEntry.coverImage) || item.image_url;
      const imgSrc = (rawImg && rawImg.trim() !== '' && !rawImg.includes('undefined')) ? rawImg : '/images/santipur/om-placeholder.svg';

      const verificationBadge = isVerified
        ? `<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50/95 px-2 py-0.5 rounded shadow-sm border border-emerald-200">
            <svg class="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <span>${lang === 'en' ? 'Verified Authentic' : 'যাচাইকৃত সত্য'}</span>
          </span>`
        : `<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50/95 px-2 py-0.5 rounded shadow-sm border border-amber-200">
            <svg class="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v5l3 3"/></svg>
            <span>${lang === 'en' ? 'Verification Pending' : 'যাচাইকরণ প্রক্রিয়াধীন'}</span>
          </span>`;

      return `
        <div class="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#D94B42]/40 transition-all duration-200 flex flex-col group">
          <!-- Card Image Header -->
          <div class="relative h-52 overflow-hidden bg-gray-100">
            <img src="${imgSrc}" alt="${title}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" onerror="window.handleImageError(this)" />
            
            <!-- Category Badge Top-Left -->
            <div class="absolute top-3 left-3 bg-white/95 text-[#D94B42] text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-md shadow-sm border border-gray-100">
              ${category}
            </div>

            <!-- Verification Status Badge Bottom-Left -->
            <div class="absolute bottom-2.5 left-3">
              ${verificationBadge}
            </div>

            <!-- Era Badge Top-Right -->
            <div class="absolute top-3 right-3 bg-[#202020]/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-md backdrop-blur-sm">
              ${badge}
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <!-- Location Metadata -->
              <div class="flex items-center gap-1.5 text-xs text-[#777777] mb-2 font-medium">
                <svg class="w-3.5 h-3.5 text-[#D94B42] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span class="truncate">${item.location}</span>
              </div>

              <!-- Listing Title -->
              <h3 class="text-base font-bold text-[#202020] mb-2 group-hover:text-[#D94B42] transition-colors leading-snug">
                ${title}
              </h3>

              <!-- Short Description -->
              <p class="text-xs text-[#777777] leading-relaxed line-clamp-2 mb-4">
                ${desc}
              </p>
            </div>

            <!-- Card Footer Row -->
            <div class="pt-3 border-t border-[#EAEAEA] flex items-center justify-between gap-2 mt-auto">
              <button onclick="window.openDetailModal('${item.id}', '${item.type}')" class="text-xs font-semibold text-[#D94B42] hover:text-[#B53830] transition-colors flex items-center gap-1">
                <span>${t.viewDetails}</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>

              <a href="${item.location_pin}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-medium text-[#777777] hover:text-[#202020] transition-colors flex items-center gap-1" title="Open Map Directions">
                <svg class="w-3.5 h-3.5 text-gray-400 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                <span>${t.directions}</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Filter Tabs Handler
  window.setFilterTab = function(tabName) {
    activeTab = tabName;
    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
      const match = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('bg-[#D94B42]', match);
      btn.classList.toggle('text-white', match);
      btn.classList.toggle('bg-white', !match);
      btn.classList.toggle('text-[#777777]', !match);
      btn.classList.toggle('border-[#D94B42]', match);
      btn.classList.toggle('border-[#EAEAEA]', !match);
    });
    renderListings();
  };

  // Category Card Quick Jump & Filter
  window.filterByCategoryCard = function(categoryType) {
    window.setFilterTab(categoryType);
    const target = document.getElementById('listings-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // HERITAGE IMAGE DISCOVERY GALLERY CONTROLLER (PHASE 7)
  function renderHeritageGallery() {
    const container = document.getElementById('gallery-grid');
    if (!container || !galleryManifest) return;

    const lang = window.SHANTIPUR_DATA.currentLang;
    const t = window.SHANTIPUR_DATA.translations[lang];

    let assets = galleryManifest;
    if (activeGalleryCategory === 'maa-kali') {
      assets = assets.filter(a => a.category === 'religious-heritage' || a.subcategory === 'maa-kali');
    } else if (activeGalleryCategory === 'temples') {
      assets = assets.filter(a => a.category === 'temples');
    } else if (activeGalleryCategory === 'rash-utsav') {
      assets = assets.filter(a => a.category === 'rash-utsav' || a.category === 'festivals');
    } else if (activeGalleryCategory === 'handloom') {
      assets = assets.filter(a => a.category === 'handloom');
    } else if (activeGalleryCategory === 'historical-landmarks') {
      assets = assets.filter(a => a.category === 'historical-landmarks' || a.category === 'city-photography' || a.category === 'markets');
    } else if (activeGalleryCategory === 'institutions') {
      assets = assets.filter(a => a.category === 'institutions' || a.category === 'civic');
    } else if (activeGalleryCategory === 'businesses') {
      assets = assets.filter(a => a.category === 'businesses' || !a.verified);
    }

    filteredGalleryAssets = assets;

    if (assets.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-[#FAFAF8] rounded-xl border border-[#EAEAEA]">
          <p class="text-xs text-[#777777]">${lang === 'en' ? 'No images found in this collection category.' : 'এই বিভাগে কোনো চিত্র খুঁজে পাওয়া যায়নি।'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = assets.map((item, index) => {
      const isVerified = item.verified !== false;
      const statusBadge = isVerified
        ? `<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <svg class="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <span>${t.verifiedBadge}</span>
          </span>`
        : `<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <svg class="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v5l3 3"/></svg>
            <span>${t.placeholderBadge}</span>
          </span>`;

      return `
        <div class="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#D94B42]/50 transition-all flex flex-col group cursor-pointer" onclick="window.openLightbox(${index})">
          <!-- Thumbnail Image -->
          <div class="relative h-48 overflow-hidden bg-gray-100">
            <img src="${item.productionPath || '/images/santipur/om-placeholder.svg'}" alt="${item.title}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="window.handleImageError(this)" />
            
            <div class="absolute top-2.5 left-2.5">
              ${statusBadge}
            </div>

            <!-- Overlay Hover Cue -->
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span>${t.viewHighRes}</span>
            </div>
          </div>

          <!-- Metadata Body -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h4 class="text-xs font-bold text-[#202020] mb-1 line-clamp-1 group-hover:text-[#D94B42] transition-colors">
                ${item.title}
              </h4>
              <p class="text-[11px] text-[#777777] line-clamp-1 mb-2 font-medium">
                ${item.location}
              </p>
            </div>

            <div class="pt-2 border-t border-[#EAEAEA] flex items-center justify-between text-[10px] text-gray-500">
              <span class="truncate max-w-[150px]">${item.license || 'Heritage Archive'}</span>
              <span class="font-mono">${item.duplicateStatus === 'duplicate' ? 'Ref Linked' : 'Primary'}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.setGalleryCategory = function(catKey) {
    activeGalleryCategory = catKey;
    document.querySelectorAll('.gallery-tab-btn').forEach(btn => {
      const match = btn.getAttribute('data-gal-tab') === catKey;
      btn.classList.toggle('bg-[#D94B42]', match);
      btn.classList.toggle('text-white', match);
      btn.classList.toggle('bg-white', !match);
      btn.classList.toggle('text-[#777777]', !match);
      btn.classList.toggle('border-[#D94B42]', match);
      btn.classList.toggle('border-[#EAEAEA]', !match);
    });
    renderHeritageGallery();
  };

  // Lightbox Modal Controller
  window.openLightbox = function(index) {
    if (!filteredGalleryAssets || !filteredGalleryAssets[index]) return;
    activeLightboxIndex = index;
    updateLightboxUI();

    const modal = document.getElementById('lightbox-modal');
    modal?.classList.remove('hidden');
    modal?.classList.add('flex');
  };

  window.closeLightbox = function() {
    const modal = document.getElementById('lightbox-modal');
    modal?.classList.add('hidden');
    modal?.classList.remove('flex');
  };

  window.nextLightbox = function() {
    if (!filteredGalleryAssets.length) return;
    activeLightboxIndex = (activeLightboxIndex + 1) % filteredGalleryAssets.length;
    updateLightboxUI();
  };

  window.prevLightbox = function() {
    if (!filteredGalleryAssets.length) return;
    activeLightboxIndex = (activeLightboxIndex - 1 + filteredGalleryAssets.length) % filteredGalleryAssets.length;
    updateLightboxUI();
  };

  function updateLightboxUI() {
    const item = filteredGalleryAssets[activeLightboxIndex];
    if (!item) return;

    document.getElementById('lightbox-title').textContent = item.title;
    document.getElementById('lightbox-meta').textContent = `${item.location} • ID: ${item.id}`;
    document.getElementById('lightbox-img').src = item.productionPath;
    document.getElementById('lightbox-desc').textContent = item.verificationNotes || item.title;
    document.getElementById('lightbox-license').textContent = item.license || 'Heritage Fair Use';
    document.getElementById('lightbox-owner').textContent = item.photographerOrOwner || 'Local Heritage Archive';
    
    const sourceLink = document.getElementById('lightbox-source-link');
    if (sourceLink) {
      sourceLink.href = item.sourcePage || item.productionPath;
    }
  }

  // Keyboard navigation for Lightbox
  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightbox-modal');
    if (modal && !modal.classList.contains('hidden')) {
      if (e.key === 'Escape') window.closeLightbox();
      if (e.key === 'ArrowRight') window.nextLightbox();
      if (e.key === 'ArrowLeft') window.prevLightbox();
    }
  });

  // Search input handlers & Advanced Real-Time Instant Filter
  const heroSearchInput = document.getElementById('search-input');
  heroSearchInput?.addEventListener('input', (e) => {
    renderListings();
    renderSearchLiveDropdown(e.target.value);
  });

  heroSearchInput?.addEventListener('focus', (e) => {
    if (e.target.value && e.target.value.trim().length >= 2) {
      renderSearchLiveDropdown(e.target.value);
    }
  });

  heroSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      window.hideLiveSearchDropdown();
      renderListings();
      document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'Escape') {
      window.hideLiveSearchDropdown();
    }
  });

  // Hide dropdown on click outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('search-live-dropdown');
    const searchInput = document.getElementById('search-input');
    if (dropdown && !dropdown.contains(e.target) && e.target !== searchInput) {
      window.hideLiveSearchDropdown();
    }
  });

  document.getElementById('search-location')?.addEventListener('change', () => {
    renderListings();
    window.hideLiveSearchDropdown();
  });
  document.getElementById('search-category')?.addEventListener('change', () => {
    renderListings();
    window.hideLiveSearchDropdown();
  });
  document.getElementById('search-btn')?.addEventListener('click', () => {
    window.hideLiveSearchDropdown();
    renderListings();
    document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Live Auto-suggest Dropdown Controller
  function renderSearchLiveDropdown(rawQuery) {
    const dropdown = document.getElementById('search-live-dropdown');
    if (!dropdown) return;

    const q = (rawQuery || '').toLowerCase().trim();
    if (!q || q.length < 2) {
      dropdown.classList.add('hidden');
      dropdown.innerHTML = '';
      return;
    }

    const lang = window.SHANTIPUR_DATA.currentLang;
    const listings = getUnifiedListings();
    const destinations = (window.SHANTIPUR_GIS_DATA && window.SHANTIPUR_GIS_DATA.destinations) || [];

    // Find directory matches
    const matchedListings = listings.filter(i =>
      (i.name_en && i.name_en.toLowerCase().includes(q)) ||
      (i.name_bn && i.name_bn.toLowerCase().includes(q)) ||
      (i.location && i.location.toLowerCase().includes(q)) ||
      (i.desc_en && i.desc_en.toLowerCase().includes(q))
    ).slice(0, 4);

    // Find route destination matches (Bejpara Ground, etc.)
    const matchedDestinations = destinations.filter(d =>
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.bengali_name && d.bengali_name.toLowerCase().includes(q)) ||
      (d.address && d.address.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q))
    ).slice(0, 3);

    // Civic services matches (Police, Hospital, Municipality, Fire)
    const civicEntries = [
      { id: 'police', title: 'Santipur Police Station (শান্তিপুর থানা)', sub: 'Shyamchandpara • 03472-278030', keywords: 'police thana cop emergency 112 100 ranaghat' },
      { id: 'hospital', title: 'Santipur State General Hospital', sub: 'Hospital Road • 03472-278244', keywords: 'hospital medical doctor emergency casualty 102 108' },
      { id: 'civic', title: 'Shantipur Municipality (শান্তিপুর পুরসভা)', sub: 'Netaji Subhash Road • 03472-278029', keywords: 'municipality civic wards tax death birth certificate' },
      { id: 'fire', title: 'Santipur Fire & Rescue Station', sub: 'Ranaghat Subdivision • 101 / 03472-278101', keywords: 'fire rescue brigade disaster emergency 101' }
    ];
    const matchedCivic = civicEntries.filter(c =>
      c.title.toLowerCase().includes(q) || c.keywords.includes(q)
    ).slice(0, 2);

    const totalCount = matchedListings.length + matchedDestinations.length + matchedCivic.length;

    if (totalCount === 0) {
      dropdown.innerHTML = `
        <div class="p-4 text-center">
          <p class="text-xs font-bold text-[#111827] mb-1">
            ${lang === 'en' ? `No matching Santipur listings found for "${rawQuery}"` : `"${rawQuery}" এর জন্য কোনো তালিকা মেলেনি`}
          </p>
          <p class="text-[11px] text-[#6B7280] mb-3">
            ${lang === 'en' ? 'Try these popular verified places:' : 'জনপ্রিয় স্থানসমূহ:'}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-1.5">
            <button type="button" onclick="window.selectLiveSearchItem('Agameswari')" class="px-2.5 py-1 rounded-md bg-[#FAFAF8] hover:bg-gray-100 border border-[#EAEAEA] text-[11px] font-semibold text-[#111827]">Maa Agameswari</button>
            <button type="button" onclick="window.selectLiveSearchItem('Bejpara')" class="px-2.5 py-1 rounded-md bg-[#FAFAF8] hover:bg-gray-100 border border-[#EAEAEA] text-[11px] font-semibold text-[#111827]">Bejpara Ground</button>
            <button type="button" onclick="window.selectLiveSearchItem('Shyamchand')" class="px-2.5 py-1 rounded-md bg-[#FAFAF8] hover:bg-gray-100 border border-[#EAEAEA] text-[11px] font-semibold text-[#111827]">Shyamchand</button>
            <button type="button" onclick="window.selectLiveSearchItem('Police')" class="px-2.5 py-1 rounded-md bg-[#FAFAF8] hover:bg-gray-100 border border-[#EAEAEA] text-[11px] font-semibold text-[#111827]">Police Station</button>
          </div>
        </div>
      `;
      dropdown.classList.remove('hidden');
      return;
    }

    let html = `
      <div class="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-[#6B7280] bg-[#FAFAF8] rounded-t-xl mb-1">
        <span>${lang === 'en' ? `Found ${totalCount} instant matches` : `${totalCount}টি মিল পাওয়া গেছে`}</span>
        <button type="button" onclick="window.clearHeroSearch()" class="text-xs text-[#D94B42] hover:underline font-semibold">${lang === 'en' ? 'Clear' : 'মুছুন'}</button>
      </div>
      <div class="space-y-1">
    `;

    // 1. Directory Listings
    matchedListings.forEach(item => {
      const title = lang === 'en' ? item.name_en : item.name_bn;
      const cat = lang === 'en' ? item.category_en : item.category_bn;
      html += `
        <div onclick="window.openDetailModal('${item.id}', '${item.type}'); window.hideLiveSearchDropdown();" class="p-2 hover:bg-[#FAFAF8] rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors group">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-gray-100 shrink-0 overflow-hidden border border-[#EAEAEA]">
              <img src="${item.image_url || '/images/santipur/om-placeholder.svg'}" alt="${title}" class="w-full h-full object-cover" onerror="window.handleImageError(this)" />
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold text-[#111827] group-hover:text-[#D94B42] transition-colors truncate">${title}</div>
              <div class="text-[10px] text-[#6B7280] truncate">${item.location}</div>
            </div>
          </div>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-[#4B5563] shrink-0">${cat}</span>
        </div>
      `;
    });

    // 2. Route Destinations
    matchedDestinations.forEach(dest => {
      const name = lang === 'en' ? dest.name : (dest.bengali_name || dest.name);
      html += `
        <div onclick="window.focusDestinationOnMap('${dest.slug}'); window.hideLiveSearchDropdown();" class="p-2 hover:bg-amber-50/60 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors group">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold text-[#111827] group-hover:text-[#D94B42] transition-colors truncate">${name}</div>
              <div class="text-[10px] text-[#6B7280] truncate">${dest.address}</div>
            </div>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">Route Map</span>
        </div>
      `;
    });

    // 3. Civic Contacts
    matchedCivic.forEach(civic => {
      html += `
        <div onclick="window.openCivicDirectoryModal(); window.hideLiveSearchDropdown();" class="p-2 hover:bg-red-50/60 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors group">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold text-[#111827] group-hover:text-red-700 transition-colors truncate">${civic.title}</div>
              <div class="text-[10px] text-[#6B7280] truncate">${civic.sub}</div>
            </div>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-900 shrink-0">Civic Desk</span>
        </div>
      `;
    });

    html += `
      </div>
      <div class="pt-2 mt-2 border-t border-gray-100 text-center">
        <button type="button" onclick="document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' }); window.hideLiveSearchDropdown();" class="text-xs font-bold text-[#D94B42] hover:underline inline-flex items-center gap-1">
          <span>${lang === 'en' ? 'View all filtered results in directory' : 'ডিরেক্টরিতে সকল ফলাফল দেখুন'}</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>
    `;

    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');
  }

  window.hideLiveSearchDropdown = function() {
    const dropdown = document.getElementById('search-live-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
  };

  window.selectLiveSearchItem = function(term) {
    const input = document.getElementById('search-input');
    if (input) {
      input.value = term;
      const clearBtn = document.getElementById('search-clear-btn');
      if (clearBtn) clearBtn.classList.remove('hidden');
      renderListings();
      renderSearchLiveDropdown(term);
      document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.clearHeroSearch = function() {
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    if (input) input.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    window.hideLiveSearchDropdown();
    const loc = document.getElementById('search-location');
    const cat = document.getElementById('search-category');
    if (loc) loc.value = 'all';
    if (cat) cat.value = 'all';
    renderListings();
  };

  // Popular search tag clicks
  window.searchByTag = function(term) {
    const input = document.getElementById('search-input');
    if (input) {
      input.value = term;
      const clearBtn = document.getElementById('search-clear-btn');
      if (clearBtn) clearBtn.classList.remove('hidden');
      window.hideLiveSearchDropdown();
      renderListings();
      document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Switch active photo in detail modal sub-gallery
  window.switchModalImage = function(src) {
    const mainImg = document.getElementById('modal-main-img');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.modal-sub-thumb').forEach(t => {
      if (t.getAttribute('data-thumb-src') === src) {
        t.classList.add('ring-2', 'ring-[#D94B42]', 'border-transparent');
      } else {
        t.classList.remove('ring-2', 'ring-[#D94B42]', 'border-transparent');
      }
    });
  };

  // Detail Modal Handler
  window.openDetailModal = function(id, type) {
    if (!appData) return;
    const items = getUnifiedListings();
    const item = items.find(i => i.id === id);
    if (!item) return;

    playTempleChime(528);

    const lang = window.SHANTIPUR_DATA.currentLang;
    const t = window.SHANTIPUR_DATA.translations[lang];
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-modal-content');

    const title = lang === 'en' ? item.name_en : item.name_bn;
    const desc = lang === 'en' ? item.desc_en : item.desc_bn;
    const category = lang === 'en' ? item.category_en : item.category_bn;
    const badge = lang === 'en' ? item.badge_en : item.badge_bn;

    const registryEntry = window.SANTIPUR_LISTING_IMAGE_REGISTRY ? window.SANTIPUR_LISTING_IMAGE_REGISTRY.getEntry(item.id) : null;
    const isVerified = registryEntry ? (registryEntry.image?.verified !== false && !registryEntry.placeholder?.enabled) : true;
    const imgSrc = (registryEntry && registryEntry.image && registryEntry.image.path) || (registryEntry && registryEntry.coverImage) || item.image_url || window.SHANTIPUR_ASSETS.getSlotPhoto(item.slot_key, item.image_url);
    const rawGallery = (registryEntry && registryEntry.gallery) || [];
    const gallery = rawGallery.map(g => (typeof g === 'string' ? g : g.path)).filter(Boolean);
    const sourceInfo = (registryEntry && registryEntry.image && registryEntry.image.source) || (registryEntry && registryEntry.source) || 'Santipur Local Heritage Archive';
    const licenseInfo = (registryEntry && registryEntry.image && registryEntry.image.license) || (registryEntry && registryEntry.license) || 'Heritage Fair Use';

    let extraDetails = '';
    if (item.type === 'puja' && item.raw.rituals_en) {
      const rituals = lang === 'en' ? item.raw.rituals_en : item.raw.rituals_bn;
      extraDetails = `
        <div class="mt-4 pt-4 border-t border-[#EAEAEA]">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#D94B42] mb-1.5">
            ${lang === 'en' ? 'Ritual Highlights & Traditions' : 'বিশেষ পূজাবিধি ও বিসর্জনের আচার'}
          </h4>
          <p class="text-xs text-[#202020] leading-relaxed bg-[#FAFAF8] p-3 rounded-lg border border-[#EAEAEA]">
            ${rituals}
          </p>
        </div>
      `;
    } else if (item.type === 'education') {
      const founder = item.raw.founder ? `<p class="text-xs text-[#444444] mb-1"><strong class="text-[#202020]">${lang === 'en' ? 'Founder / Patron:' : 'প্রতিষ্ঠাতা / পৃষ্ঠপোষক:'}</strong> ${item.raw.founder}</p>` : '';
      const affil = item.raw.affiliation ? `<p class="text-xs text-[#444444] mb-1"><strong class="text-[#202020]">${lang === 'en' ? 'Affiliation & Accreditation:' : 'অনুমোদন ও স্বীকৃতি:'}</strong> ${item.raw.affiliation}</p>` : '';
      const portal = item.raw.official_website || item.raw.official_portal ? `<p class="text-xs text-[#444444]"><strong class="text-[#202020]">${lang === 'en' ? 'Official Portal:' : 'অফিসিয়াল পোর্টাল:'}</strong> <a href="${item.raw.official_website || item.raw.official_portal}" target="_blank" rel="noopener noreferrer" class="text-[#D94B42] hover:underline font-semibold">${item.raw.official_website || item.raw.official_portal}</a></p>` : '';
      extraDetails = `
        <div class="mt-4 pt-4 border-t border-[#EAEAEA]">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#D94B42] mb-1.5">
            ${lang === 'en' ? 'Academic Credentials & Heritage Background' : 'একাডেমিক বিবরণ ও ঐতিহ্যগত পটভূমি'}
          </h4>
          <div class="bg-[#FAFAF8] p-3 rounded-lg border border-[#EAEAEA] space-y-1">
            ${founder}
            ${affil}
            ${portal}
          </div>
        </div>
      `;
    } else if (item.type === 'official') {
      const contact = item.raw.contact ? `<p class="text-xs text-[#444444] mb-1"><strong class="text-[#202020]">${lang === 'en' ? 'Helpline / Contact:' : 'যোগাযোগ ও হেল্পলাইন:'}</strong> ${item.raw.contact}</p>` : '';
      const portal = item.raw.official_website ? `<p class="text-xs text-[#444444] mb-1"><strong class="text-[#202020]">${lang === 'en' ? 'Official Portal:' : 'অফিসিয়াল পোর্টাল:'}</strong> <a href="${item.raw.official_website}" target="_blank" rel="noopener noreferrer" class="text-[#D94B42] hover:underline font-semibold">${item.raw.official_website}</a></p>` : '';
      extraDetails = `
        <div class="mt-4 pt-4 border-t border-[#EAEAEA]">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#D94B42] mb-1.5">
            ${lang === 'en' ? 'Civic Administration & Public Welfare' : 'প্রশাসনিক অধিক্ষেত্র ও নাগরিক পরিষেবা'}
          </h4>
          <div class="bg-[#FAFAF8] p-3 rounded-lg border border-[#EAEAEA] space-y-1">
            <p class="text-xs text-[#444444] mb-1"><strong class="text-[#202020]">${lang === 'en' ? 'Office Location:' : 'কার্যালয়ের ঠিকানা:'}</strong> ${item.location}</p>
            ${contact}
            ${portal}
          </div>
        </div>
      `;
    }

    let galleryHtml = '';
    if (gallery.length > 0) {
      const allPhotos = [imgSrc, ...gallery];
      galleryHtml = `
        <div class="mt-4 pt-4 border-t border-[#EAEAEA]">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#202020] mb-2">
            ${lang === 'en' ? 'Archival Photographs & Perspectives' : 'ঐতিহাসিক আলোকচিত্র ও দৃশ্যপট'}
          </h4>
          <div class="flex items-center gap-2 overflow-x-auto pb-1">
            ${allPhotos.map((photo, i) => `
              <button onclick="window.switchModalImage('${photo}')" data-thumb-src="${photo}" class="modal-sub-thumb shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-[#EAEAEA] hover:border-[#D94B42] transition-all ${i === 0 ? 'ring-2 ring-[#D94B42] border-transparent' : ''}">
                <img src="${photo}" loading="lazy" decoding="async" class="w-full h-full object-cover" onerror="window.handleImageError(this)" />
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    const verificationBox = `
      <div class="mt-4 pt-3 border-t border-[#EAEAEA] flex flex-wrap items-center justify-between gap-2 text-xs bg-[#FAFAF8] p-3 rounded-lg border border-[#EAEAEA]">
        <div class="flex items-center gap-2 min-w-0">
          ${isVerified 
            ? `<span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                <svg class="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                <span>${lang === 'en' ? 'Verified Authentic' : 'যাচাইকৃত সত্য'}</span>
               </span>`
            : `<span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                <svg class="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v5l3 3"/></svg>
                <span>${lang === 'en' ? 'Verification Pending' : 'যাচাইকরণ প্রক্রিয়াধীন'}</span>
               </span>`
          }
          <span class="text-[11px] text-[#777777] font-medium truncate" title="${sourceInfo}">
            ${sourceInfo.startsWith('http') ? `<a href="${sourceInfo}" target="_blank" rel="noopener noreferrer" class="hover:underline text-[#D94B42]">Wikimedia Commons ↗</a>` : sourceInfo}
          </span>
        </div>
        <span class="text-[10px] font-mono text-[#777777] bg-white px-2 py-0.5 rounded border border-gray-200 shrink-0">${licenseInfo}</span>
      </div>
    `;

    content.innerHTML = `
      <div class="relative bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-xl border border-[#EAEAEA] overflow-hidden max-h-[90vh] flex flex-col">
        <!-- Close Button -->
        <button onclick="window.closeDetailModal()" class="absolute top-4 right-4 z-20 bg-white/90 hover:bg-gray-100 text-[#202020] w-8 h-8 rounded-full flex items-center justify-center border border-[#EAEAEA] shadow-sm transition-colors" aria-label="Close">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <!-- Modal Photo -->
        <div class="relative h-64 shrink-0 bg-gray-100">
          <img id="modal-main-img" src="${imgSrc}" alt="${title}" decoding="async" class="w-full h-full object-cover" onerror="window.handleImageError(this)" />
          <div class="absolute bottom-3 left-3 bg-white/95 text-[#D94B42] text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm border border-gray-100">
            ${category} • ${badge}
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto">
          <div class="flex items-center gap-1.5 text-xs text-[#777777] mb-2 font-medium">
            <svg class="w-3.5 h-3.5 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${item.location}</span>
          </div>

          <h2 class="text-xl font-bold text-[#202020] mb-3 leading-snug">
            ${title}
          </h2>

          <p class="text-xs sm:text-sm text-[#777777] leading-relaxed mb-4">
            ${desc}
          </p>

          ${extraDetails}
          ${galleryHtml}
          ${verificationBox}

          <!-- Footer Action Buttons -->
          <div class="mt-6 pt-4 border-t border-[#EAEAEA] flex items-center justify-between gap-3">
            <a href="${item.location_pin}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#202020] text-xs font-semibold transition-colors flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>${lang === 'en' ? 'Open in Google Maps' : 'গুগল ম্যাপে দেখুন'}</span>
            </a>

            <button onclick="window.closeDetailModal()" class="px-5 py-2 rounded-lg bg-[#D94B42] hover:bg-[#B53830] text-white text-xs font-semibold transition-colors">
              ${t.close}
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeDetailModal = function() {
    const modal = document.getElementById('detail-modal');
    modal?.classList.add('hidden');
    modal?.classList.remove('flex');
  };

  // Parikrama Selection & Calculator
  window.toggleParikramaShrine = function(id) {
    if (selectedShrinesForParikrama.has(id)) {
      selectedShrinesForParikrama.delete(id);
    } else {
      selectedShrinesForParikrama.add(id);
    }
    updateParikramaEstimates();
  };

  function updateParikramaEstimates() {
    const count = selectedShrinesForParikrama.size;
    const estTotoEl = document.getElementById('est-toto-time');
    const estWalkEl = document.getElementById('est-walk-time');
    const selectedListEl = document.getElementById('selected-shrine-list');
    const lang = window.SHANTIPUR_DATA.currentLang;

    const totoMins = count * 15 + Math.max(0, (count - 1) * 8);
    const walkMins = count * 15 + Math.max(0, (count - 1) * 22);

    if (estTotoEl) estTotoEl.textContent = `${totoMins} ${lang === 'en' ? 'Mins' : 'মিনিট'}`;
    if (estWalkEl) estWalkEl.textContent = `${walkMins} ${lang === 'en' ? 'Mins' : 'মিনিট'}`;

    if (selectedListEl && appData) {
      const allParikramaSpots = [...appData.shrines, ...appData.temples];
      selectedListEl.innerHTML = allParikramaSpots.map(s => {
        const isChecked = selectedShrinesForParikrama.has(s.id);
        const name = lang === 'en' ? s.name_en : s.name_bn;
        const loc = s.ward_location || s.tradition;
        const badge = s.age_years ? `~${s.age_years} ${lang === 'en' ? 'Yrs' : 'বছর'}` : (s.founded_year || 'Heritage');
        return `
          <label class="flex items-center justify-between p-3 rounded-lg border ${isChecked ? 'bg-[#FAFAF8] border-[#D94B42]/40' : 'bg-white border-[#EAEAEA]'} cursor-pointer hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-3">
              <input type="checkbox" onchange="window.toggleParikramaShrine('${s.id}')" ${isChecked ? 'checked' : ''} class="w-4 h-4 text-[#D94B42] rounded border-gray-300 focus:ring-[#D94B42]">
              <div>
                <span class="text-xs font-semibold text-[#202020] block">${name}</span>
                <span class="text-[11px] text-[#777777]">${loc}</span>
              </div>
            </div>
            <span class="text-[11px] font-mono text-gray-500">${badge}</span>
          </label>
        `;
      }).join('');
    }
  }

  // Offline Parikrama Pass Downloader
  window.downloadParikramaPass = function() {
    if (!appData) return;
    const allParikramaSpots = [...appData.shrines, ...appData.temples];
    const selected = allParikramaSpots.filter(s => selectedShrinesForParikrama.has(s.id));

    let passText = `=========================================\n`;
    passText += `  SHANTIPUR HERITAGE PARIKRAMA PASS\n`;
    passText += `  শান্তিপুর সুপ্রাচীন মহোৎসব পরিক্রমা পাস\n`;
    passText += `=========================================\n`;
    passText += `PIN: 741404 | Nadia, West Bengal\n`;
    passText += `Date: ${new Date().toLocaleDateString()}\n`;
    passText += `Total Checkpoints: ${selected.length}\n\n`;
    passText += `OPTIMIZED CIRCUIT ROUTE:\n`;

    selected.forEach((s, idx) => {
      const title = s.name_en || s.name_bn;
      const age = s.age_years ? `~${s.age_years} Years` : (s.founded_year || 'Heritage');
      const loc = s.ward_location || s.tradition;
      const note = s.rituals_en || s.significance_en || '';
      passText += `[${idx + 1}] ${title} (${age})\n`;
      passText += `    Location: ${loc}\n`;
      if (note) passText += `    Heritage Note: ${note}\n`;
      passText += `\n`;
    });

    passText += `KEY FESTIVAL RITUALS:\n`;
    passText += `- Chakshu Daan: Midnight Amavasya (Agameswari Tala)\n`;
    passText += `- Dadhimangal & Paate Otha: Pre-dawn (Mahishkhagi Para)\n`;
    passText += `- Synchronized Dancing Immersion: Evening (Bamakali Tala)\n`;
    passText += `=========================================\n`;

    const blob = new Blob([passText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shantipur_Parikrama_Pass_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =========================================================================
  // PRODUCTION AUTHENTICATION & PORTAL CENTER (SECURE RATE-LIMITED GATEWAY)
  // Enforces 5-failed-attempts/50s gateway, strong passwords, RLS, & role management
  // =========================================================================
  const BIZ_STORAGE_KEY = 'santipur_registered_businesses';
  let cooldownTimerInterval = null;

  function getStoredBusinesses() {
    try {
      return JSON.parse(localStorage.getItem(BIZ_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveStoredBusinesses(list) {
    localStorage.setItem(BIZ_STORAGE_KEY, JSON.stringify(list));
  }

  function updateNavAuthState() {
    const user = window.ShantipurAuth ? window.ShantipurAuth.getUser() : null;
    const profile = window.ShantipurAuth ? window.ShantipurAuth.getProfile() : null;
    const navLabel = document.getElementById('nav-auth-label');
    const mobileLabel = document.getElementById('mobile-auth-label');

    const lang = window.SHANTIPUR_DATA ? window.SHANTIPUR_DATA.currentLang : 'en';
    let textToDisplay = lang === 'en' ? 'Sign In' : 'প্রবেশ করুন';

    if (user) {
      const displayName = profile?.full_name || user.email?.split('@')[0] || 'My Account';
      const role = profile?.role || 'user';
      let roleBadge = '';
      if (role === 'admin') roleBadge = ' (Admin)';
      else if (role === 'business_owner') roleBadge = ' (Merchant)';
      textToDisplay = displayName + roleBadge;
    }

    if (navLabel) navLabel.textContent = textToDisplay;
    if (mobileLabel) mobileLabel.textContent = textToDisplay;
  }

  // Live Auth state subscriber
  if (window.ShantipurAuth) {
    window.ShantipurAuth.onAuthStateChange((event, session, user, profile) => {
      updateNavAuthState();
      if (user) {
        renderUserPortal();
      }
    });
  }

  window.openAuthModal = function(tab = 'login') {
    const modal = document.getElementById('business-auth-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const user = window.ShantipurAuth ? window.ShantipurAuth.getUser() : null;
    if (user && tab !== 'register-biz') {
      window.switchAuthTab('dashboard');
    } else {
      window.switchAuthTab(tab);
    }
  };

  window.closeAuthModal = function() {
    const modal = document.getElementById('business-auth-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if (cooldownTimerInterval) {
      clearInterval(cooldownTimerInterval);
      cooldownTimerInterval = null;
    }
  };

  // Backward compatibility aliases
  window.openBusinessAuth = function(tab = 'register') {
    window.openAuthModal(tab === 'register' ? 'register-biz' : tab);
  };
  window.closeBusinessAuth = function() {
    window.closeAuthModal();
  };

  window.switchAuthTab = function(tab) {
    const views = {
      'login': document.getElementById('auth-view-login'),
      'signup': document.getElementById('auth-view-signup'),
      'register-biz': document.getElementById('auth-view-register-biz'),
      'forgot': document.getElementById('auth-view-forgot'),
      'reset': document.getElementById('auth-view-reset'),
      'dashboard': document.getElementById('auth-view-dashboard')
    };

    const tabs = {
      'login': document.getElementById('auth-tab-btn-login'),
      'signup': document.getElementById('auth-tab-btn-signup'),
      'register-biz': document.getElementById('auth-tab-btn-register-biz'),
      'forgot': document.getElementById('auth-tab-btn-forgot'),
      'reset': document.getElementById('auth-tab-btn-reset'),
      'dashboard': document.getElementById('auth-tab-btn-dashboard')
    };

    // Hide all views
    Object.values(views).forEach(v => { if (v) v.classList.add('hidden'); });

    // Reset tab buttons
    Object.values(tabs).forEach(btn => {
      if (btn) {
        btn.classList.remove('border-[#D94B42]', 'text-[#D94B42]');
        btn.classList.add('border-transparent', 'text-[#777777]');
      }
    });

    // Show target view & tab
    if (views[tab]) views[tab].classList.remove('hidden');
    if (tabs[tab]) {
      tabs[tab].classList.remove('hidden', 'border-transparent', 'text-[#777777]');
      tabs[tab].classList.add('border-[#D94B42]', 'text-[#D94B42]');
    }

    if (tab === 'dashboard') {
      renderUserPortal();
    }
  };

  window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  };

  window.checkPasswordStrengthLive = function(pass) {
    const checkRule = (id, condition) => {
      const el = document.getElementById(id);
      if (!el) return;
      const dot = el.querySelector('span:first-child');
      if (condition) {
        el.classList.remove('text-[#777777]');
        el.classList.add('text-emerald-700', 'font-medium');
        if (dot) {
          dot.classList.remove('bg-gray-400');
          dot.classList.add('bg-emerald-600');
        }
      } else {
        el.classList.remove('text-emerald-700', 'font-medium');
        el.classList.add('text-[#777777]');
        if (dot) {
          dot.classList.remove('bg-emerald-600');
          dot.classList.add('bg-gray-400');
        }
      }
    };

    checkRule('rule-length', pass.length >= 8);
    checkRule('rule-upper', /[A-Z]/.test(pass));
    checkRule('rule-lower', /[a-z]/.test(pass));
    checkRule('rule-number', /[0-9]/.test(pass));
    checkRule('rule-special', /[^A-Za-z0-9]/.test(pass));
  };

  window.handleAuthLogin = async function(event) {
    event.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const errorBox = document.getElementById('login-error-msg');
    const cooldownBox = document.getElementById('login-cooldown-box');
    const cooldownSecs = document.getElementById('login-cooldown-seconds');
    const submitBtn = document.getElementById('login-submit-btn');
    const spinner = document.getElementById('login-spinner');
    const btnText = document.getElementById('login-btn-text');

    if (errorBox) errorBox.classList.add('hidden');
    if (cooldownBox) cooldownBox.classList.add('hidden');

    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.classList.remove('hidden');
    if (btnText) btnText.textContent = 'Verifying...';

    try {
      const res = await window.ShantipurAuth.signIn({ email, password });

      if (res.isRateLimited) {
        if (cooldownBox && cooldownSecs) {
          let remaining = res.retryAfterSeconds || 50;
          cooldownSecs.textContent = remaining;
          cooldownBox.classList.remove('hidden');

          if (cooldownTimerInterval) clearInterval(cooldownTimerInterval);
          cooldownTimerInterval = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
              clearInterval(cooldownTimerInterval);
              cooldownBox.classList.add('hidden');
              if (submitBtn) submitBtn.disabled = false;
            } else {
              cooldownSecs.textContent = remaining;
            }
          }, 1000);
        }
        return;
      }

      if (!res.success) {
        if (errorBox) {
          errorBox.textContent = res.error || 'Email or password is incorrect.';
          errorBox.classList.remove('hidden');
        }
        return;
      }

      // Success
      document.getElementById('auth-login-form')?.reset();
      updateNavAuthState();
      window.switchAuthTab('dashboard');
    } finally {
      if (submitBtn && !cooldownTimerInterval) submitBtn.disabled = false;
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Sign In';
    }
  };

  window.handleAuthSignUp = async function(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const phone = document.getElementById('signup-phone')?.value.trim();
    const roleRadio = document.querySelector('input[name="signup-role"]:checked');
    const role = roleRadio ? roleRadio.value : 'registered_user';
    const password = document.getElementById('signup-password')?.value;
    const confirmPassword = document.getElementById('signup-confirm-password')?.value;

    const errorBox = document.getElementById('signup-error-msg');
    const successBox = document.getElementById('signup-success-msg');
    const submitBtn = document.getElementById('signup-submit-btn');
    const spinner = document.getElementById('signup-spinner');
    const btnText = document.getElementById('signup-btn-text');

    if (errorBox) errorBox.classList.add('hidden');
    if (successBox) successBox.classList.add('hidden');

    if (password !== confirmPassword) {
      if (errorBox) {
        errorBox.textContent = 'Passwords do not match. Please re-enter identical passwords.';
        errorBox.classList.remove('hidden');
      }
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.classList.remove('hidden');
    if (btnText) btnText.textContent = 'Creating Account...';

    try {
      const res = await window.ShantipurAuth.signUp({
        email,
        password,
        fullName: name,
        phone,
        role
      });

      if (!res.success) {
        if (errorBox) {
          errorBox.textContent = res.error || 'Registration could not be completed.';
          errorBox.classList.remove('hidden');
        }
        return;
      }

      if (successBox) {
        successBox.innerHTML = `
          <strong class="font-bold block text-emerald-950 mb-1">Registration Successful!</strong>
          ${res.message || 'Please verify your email address to complete your account setup.'}
          <div class="mt-2 text-[11px] text-emerald-900">
            A confirmation link has been sent to <strong>${email}</strong>. Once confirmed, you can sign in with your credentials.
          </div>
        `;
        successBox.classList.remove('hidden');
      }
      document.getElementById('auth-signup-form')?.reset();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Create Free Account';
    }
  };

  window.handleAuthForgotPassword = async function(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-email')?.value.trim();
    const msgBox = document.getElementById('forgot-status-msg');

    const res = await window.ShantipurAuth.resetPasswordForEmail(email);
    if (msgBox) {
      msgBox.textContent = res.message || 'If an account exists with this email, a reset link has been dispatched.';
      msgBox.classList.remove('hidden');
    }
    document.getElementById('auth-forgot-form')?.reset();
  };

  window.handleAuthResetPassword = async function(event) {
    event.preventDefault();
    const p1 = document.getElementById('reset-new-password')?.value;
    const p2 = document.getElementById('reset-confirm-password')?.value;
    const errorBox = document.getElementById('reset-error-msg');
    const successBox = document.getElementById('reset-success-msg');

    if (p1 !== p2) {
      if (errorBox) {
        errorBox.textContent = 'Passwords do not match.';
        errorBox.classList.remove('hidden');
      }
      return;
    }

    const res = await window.ShantipurAuth.updatePassword(p1);
    if (!res.success) {
      if (errorBox) {
        errorBox.textContent = res.error || 'Password update failed.';
        errorBox.classList.remove('hidden');
      }
      return;
    }

    if (successBox) {
      successBox.textContent = res.message || 'Password updated successfully!';
      successBox.classList.remove('hidden');
    }
    document.getElementById('auth-reset-form')?.reset();
    setTimeout(() => {
      window.switchAuthTab('login');
    }, 2000);
  };

  window.handleAuthSignOut = async function() {
    await window.ShantipurAuth.signOut();
    updateNavAuthState();
    window.switchAuthTab('login');
  };

  window.handleBusinessRegister = async function(event) {
    event.preventDefault();
    const errorBox = document.getElementById('biz-reg-error-msg');
    if (errorBox) errorBox.classList.add('hidden');

    const name = document.getElementById('reg-biz-name')?.value.trim();
    const owner = document.getElementById('reg-owner-name')?.value.trim();
    const category = document.getElementById('reg-category')?.value;
    const phone = document.getElementById('reg-phone')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim().toLowerCase();
    const password = document.getElementById('reg-password')?.value;
    const address = document.getElementById('reg-address')?.value.trim();
    const tradeLicense = document.getElementById('reg-trade-license')?.value.trim() || 'Pending Submission';
    const estYear = document.getElementById('reg-est-year')?.value.trim() || 'Not specified';
    const desc = document.getElementById('reg-desc')?.value.trim() || 'Registered local business in Shantipur.';

    const businesses = getStoredBusinesses();
    if (businesses.some(b => b.email === email || b.phone === phone)) {
      if (errorBox) {
        errorBox.textContent = 'A business registration with this email or phone number already exists.';
        errorBox.classList.remove('hidden');
      }
      return;
    }

    const newBusiness = {
      id: 'STP-BUS-' + Date.now().toString().slice(-6),
      businessName: name,
      ownerName: owner,
      category,
      phone,
      email,
      address,
      tradeLicense,
      estYear,
      description: desc,
      verificationStatus: 'pending_verification',
      registrationDate: new Date().toISOString()
    };

    // Register user account via real Supabase Auth
    const authRes = await window.ShantipurAuth.signUp({
      email,
      password,
      fullName: owner,
      role: 'business_owner'
    });

    if (!authRes.success) {
      if (errorBox) {
        errorBox.textContent = authRes.error || 'Registration failed. Please check your information and try again.';
        errorBox.classList.remove('hidden');
      }
      return;
    }

    businesses.push(newBusiness);
    saveStoredBusinesses(businesses);

    document.getElementById('business-registration-form')?.reset();
    window.switchAuthTab('dashboard');
  };

  function renderUserPortal() {
    const container = document.getElementById('user-portal-content');
    if (!container) return;

    const user = window.ShantipurAuth ? window.ShantipurAuth.getUser() : null;
    const profile = window.ShantipurAuth ? window.ShantipurAuth.getProfile() : null;
    const businesses = getStoredBusinesses();
    const userBiz = businesses.find(b => b.email === user?.email);

    if (!user) {
      container.innerHTML = `
        <div class="text-center py-8 space-y-3">
          <p class="text-xs text-[#777777]">No active authentication session.</p>
          <button onclick="window.switchAuthTab('login')" class="px-4 py-2 bg-[#D94B42] text-white rounded-lg text-xs font-bold">Sign In</button>
        </div>
      `;
      return;
    }

    const role = profile?.role || user.role || 'registered_user';
    let roleBadge = '';
    if (role === 'admin') {
      roleBadge = '<span class="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">Owner / System Administrator</span>';
    } else if (role === 'business_owner') {
      roleBadge = '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">Verified Merchant</span>';
    } else {
      roleBadge = '<span class="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">Community Resident</span>';
    }

    container.innerHTML = `
      <div class="space-y-4">
        <!-- User Profile Card -->
        <div class="bg-[#FAFAF8] border border-[#EAEAEA] rounded-xl p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-[#D94B42] text-white font-bold flex items-center justify-center text-sm shadow-sm">
              ${(profile?.full_name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h5 class="text-sm font-bold text-[#202020]">${profile?.full_name || 'Resident of Shantipur'}</h5>
                ${roleBadge}
              </div>
              <p class="text-xs text-[#777777] font-mono mt-0.5">${user.email}</p>
            </div>
          </div>
          <button onclick="window.handleAuthSignOut()" class="px-3 py-1.5 rounded-lg border border-[#EAEAEA] bg-white hover:bg-gray-100 text-xs font-semibold text-[#202020] transition-colors">
            Sign Out
          </button>
        </div>

        ${role === 'admin' ? `
          <!-- Administrator Console Notice -->
          <div class="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2 text-xs">
            <div class="flex items-center gap-2 text-red-900 font-bold">
              <svg class="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span>Project Administrator Console (Owner-Only)</span>
            </div>
            <p class="text-red-950 leading-relaxed">
              You are authenticated with unrestricted project-level administrator privileges. You can verify municipal business submissions, moderate community lore contributions, and manage heritage records under PostgreSQL Row Level Security.
            </p>
          </div>
        ` : ''}

        ${userBiz ? `
          <!-- Business Status Card -->
          <div class="p-4 rounded-xl border ${userBiz.verificationStatus === 'verified' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}">
            <div class="flex items-center justify-between mb-2">
              <span class="inline-flex items-center gap-1.5 text-xs font-bold ${userBiz.verificationStatus === 'verified' ? 'text-emerald-800' : 'text-amber-800'}">
                ${userBiz.verificationStatus === 'verified' 
                  ? `<svg class="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>` 
                  : `<svg class="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v5l3 3"/></svg>`
                }
                ${userBiz.verificationStatus === 'verified' ? 'OFFICIALLY VERIFIED & PUBLISHED' : 'VERIFICATION IN PROGRESS (24-48 HRS)'}
              </span>
              <span class="text-[11px] font-mono text-[#777777]">ID: ${userBiz.id}</span>
            </div>
            <div class="text-xs text-[#202020] space-y-1">
              <div><strong>Business Name:</strong> ${userBiz.businessName}</div>
              <div><strong>Category:</strong> ${userBiz.category}</div>
              <div><strong>Trade License:</strong> <span class="font-mono">${userBiz.tradeLicense}</span></div>
              <div><strong>Address:</strong> ${userBiz.address}</div>
            </div>
          </div>
        ` : `
          <!-- Community Resident Actions -->
          <div class="border border-[#EAEAEA] rounded-xl p-4 bg-white space-y-2 text-xs">
            <h6 class="font-bold text-[#202020]">Community Activity &amp; Saved Places</h6>
            <p class="text-[#777777]">You can bookmark heritage temples, participate in Bhanga Rash discussions, and contribute authentic oral folklore.</p>
          </div>
        `}
      </div>
    `;
  }

  // Weaver Wholesale Inquiry
  window.bookWeaverModal = function(name) {
    const text = encodeURIComponent(`Inquiry regarding certified Shantipuri Tant handloom collection for ${name}.`);
    window.open(`https://wa.me/919832012345?text=${text}`, '_blank');
  };

  // Bilingual Switcher
  window.toggleLanguage = function(lang) {
    window.SHANTIPUR_DATA.currentLang = lang;
    const t = window.SHANTIPUR_DATA.translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) el.setAttribute('placeholder', t[key]);
    });

    // Language pills active state
    document.getElementById('lang-btn-en')?.classList.toggle('text-[#D94B42]', lang === 'en');
    document.getElementById('lang-btn-en')?.classList.toggle('font-bold', lang === 'en');
    document.getElementById('lang-btn-bn')?.classList.toggle('text-[#D94B42]', lang === 'bn');
    document.getElementById('lang-btn-bn')?.classList.toggle('font-bold', lang === 'bn');

    renderListings();
    renderHeritageGallery();
    updateParikramaEstimates();
  };

  // ==============================================================================
  // NAVIGATION DROPDOWNS & RESPONSIVE MOBILE ACCORDION SYSTEM
  // ==============================================================================

  // 1. Mobile Menu Toggle
  window.toggleMobileMenu = function (forceClose = false) {
    const drawer = document.getElementById('mobile-menu-drawer');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');
    const toggleBtn = document.getElementById('mobile-menu-toggle-btn');
    if (!drawer) return;

    const isCurrentlyOpen = !drawer.classList.contains('hidden');
    const shouldClose = forceClose || isCurrentlyOpen;

    if (shouldClose) {
      drawer.classList.add('hidden');
      if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      drawer.classList.remove('hidden');
      if (hamburgerIcon) hamburgerIcon.classList.add('hidden');
      if (closeIcon) closeIcon.classList.remove('hidden');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    }
  };

  // 2. Mobile Accordion Toggle
  window.toggleMobileAccordion = function (accId) {
    const target = document.getElementById(accId);
    const icon = document.getElementById(`${accId}-icon`);
    if (!target) return;

    const isHidden = target.classList.contains('hidden');

    // Close other mobile accordions for accordion behavior
    ['acc-routes', 'acc-heritage', 'acc-institutes', 'acc-civic'].forEach(id => {
      if (id !== accId) {
        document.getElementById(id)?.classList.add('hidden');
        document.getElementById(`${id}-icon`)?.classList.remove('rotate-180');
      }
    });

    if (isHidden) {
      target.classList.remove('hidden');
      if (icon) icon.classList.add('rotate-180');
    } else {
      target.classList.add('hidden');
      if (icon) icon.classList.remove('rotate-180');
    }
  };

  // 3. Desktop Dropdown Touch / Click Toggle (supports tablets & click accessibility)
  window.toggleNavDropdown = function (btn) {
    const parent = btn.closest('.nav-dropdown-item');
    if (!parent) return;
    const menu = parent.querySelector('.dropdown-menu');
    if (!menu) return;

    const isOpen = menu.classList.contains('active-dropdown');

    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu.active-dropdown').forEach(m => {
      m.classList.remove('active-dropdown', 'opacity-100', 'pointer-events-auto', 'translate-y-0');
      m.closest('.nav-dropdown-item')?.querySelector('button')?.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      menu.classList.add('active-dropdown', 'opacity-100', 'pointer-events-auto', 'translate-y-0');
      btn.setAttribute('aria-expanded', 'true');
    }
  };

  // Dismiss dropdowns on outside click or escape key
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown-item')) {
      document.querySelectorAll('.dropdown-menu.active-dropdown').forEach(m => {
        m.classList.remove('active-dropdown', 'opacity-100', 'pointer-events-auto', 'translate-y-0');
        m.closest('.nav-dropdown-item')?.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.dropdown-menu.active-dropdown').forEach(m => {
        m.classList.remove('active-dropdown', 'opacity-100', 'pointer-events-auto', 'translate-y-0');
      });
      window.closeCivicDirectoryModal();
      window.toggleMobileMenu(true);
    }
  });

  // 4. Smooth Navigate to Routes
  window.navigateToRoutes = function (trailSlug) {
    const routesSec = document.getElementById('routes-section');
    if (routesSec) {
      routesSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (trailSlug && typeof window.selectCuratedTrail === 'function') {
      window.selectCuratedTrail(trailSlug);
    }
  };

  // ==============================================================================
  // CIVIC & EMERGENCY DIRECTORY MODAL SYSTEM
  // ==============================================================================

  window.openCivicDirectoryModal = function (category = 'all') {
    const modal = document.getElementById('civic-directory-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (category) {
      window.filterCivicDirectory(category);
    }
    const searchInput = document.getElementById('civic-search-input');
    if (searchInput) {
      searchInput.value = '';
      window.handleCivicSearch('');
    }
  };

  window.closeCivicDirectoryModal = function () {
    const modal = document.getElementById('civic-directory-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  window.filterCivicDirectory = function (cat) {
    document.querySelectorAll('.civic-tab-btn').forEach(btn => {
      const isMatch = btn.getAttribute('data-civic-tab') === cat;
      btn.classList.toggle('active', isMatch);
      btn.classList.toggle('bg-[#202020]', isMatch);
      btn.classList.toggle('text-white', isMatch);
      btn.classList.toggle('bg-[#FAFAF8]', !isMatch);
      btn.classList.toggle('text-[#555555]', !isMatch);
    });

    const cards = document.querySelectorAll('.civic-card');
    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (cat === 'all' || cardCat === cat) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  };

  window.handleCivicSearch = function (query) {
    const q = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.civic-card');
    cards.forEach(card => {
      const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const text = card.textContent.toLowerCase();
      if (!q || keywords.includes(q) || text.includes(q)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  };

  window.copyCivicContact = function (text, btnElement) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btnElement.innerText;
      btnElement.innerText = 'Copied!';
      btnElement.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-300');
      setTimeout(() => {
        btnElement.innerText = originalText;
        btnElement.classList.remove('bg-emerald-50', 'text-emerald-700', 'border-emerald-300');
      }, 1800);
    }).catch(err => {
      console.warn('Clipboard copy error:', err);
    });
  };

  // Initialize
  renderListings();
  renderHeritageGallery();
  updateParikramaEstimates();
  updateNavAuthState();
});
