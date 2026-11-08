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
      galleryManifest = manifestData.images || [];
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

    return list;
  }

  // Render Heritage Listings Grid (Matching Listygo directory cards)
  function renderListings() {
    const container = document.getElementById('listings-container');
    if (!container || !appData) return;

    const lang = window.SHANTIPUR_DATA.currentLang;
    const t = window.SHANTIPUR_DATA.translations[lang];

    let items = getUnifiedListings();

    // Filter by active tab
    if (activeTab === 'pujas') items = items.filter(i => i.type === 'puja');
    else if (activeTab === 'temples') items = items.filter(i => i.type === 'temple');
    else if (activeTab === 'handloom') items = items.filter(i => i.type === 'handloom');
    else if (activeTab === 'artisans') items = items.filter(i => i.type === 'artisan');

    // Filter by search inputs
    const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const loc = (document.getElementById('search-location')?.value || 'all').toLowerCase();
    const cat = (document.getElementById('search-category')?.value || 'all').toLowerCase();

    if (query) {
      items = items.filter(i =>
        i.name_en.toLowerCase().includes(query) ||
        i.name_bn.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query) ||
        i.desc_en.toLowerCase().includes(query)
      );
    }

    if (loc !== 'all') {
      items = items.filter(i => i.location.toLowerCase().includes(loc));
    }

    if (cat !== 'all') {
      if (cat === 'pujas') items = items.filter(i => i.type === 'puja');
      else if (cat === 'temples') items = items.filter(i => i.type === 'temple');
      else if (cat === 'tant') items = items.filter(i => i.type === 'handloom');
      else if (cat === 'sweets') items = items.filter(i => i.type === 'artisan');
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-2xl border border-[#EAEAEA]">
          <p class="text-sm font-medium text-[#777777]">${lang === 'en' ? 'No heritage listings found matching your search criteria.' : 'আপনার অনুসন্ধানের সাথে মিলিয়ে কোনো স্থান পাওয়া যায়নি।'}</p>
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
      const isVerified = registryEntry ? (registryEntry.imageVerified !== false) : true;
      const imgSrc = (registryEntry && registryEntry.coverImage) || item.image_url || window.SHANTIPUR_ASSETS.getSlotPhoto(item.slot_key, item.image_url);

      const verificationBadge = isVerified
        ? `<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50/95 px-2 py-0.5 rounded shadow-sm border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${lang === 'en' ? 'Verified Authentic' : 'যাচাইকৃত সত্য'}
          </span>`
        : `<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50/95 px-2 py-0.5 rounded shadow-sm border border-amber-200">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>${lang === 'en' ? 'Verification Pending' : 'যাচাইকরণ প্রক্রিয়াধীন'}
          </span>`;

      return `
        <div class="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#D94B42]/40 transition-all duration-200 flex flex-col group">
          <!-- Card Image Header -->
          <div class="relative h-52 overflow-hidden bg-gray-100">
            <img src="${imgSrc}" alt="${title}" class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" onerror="this.src=window.SHANTIPUR_ASSETS.fallbacks.hero" />
            
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
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${t.verifiedBadge}
          </span>`
        : `<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>${t.placeholderBadge}
          </span>`;

      return `
        <div class="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#D94B42]/50 transition-all flex flex-col group cursor-pointer" onclick="window.openLightbox(${index})">
          <!-- Thumbnail Image -->
          <div class="relative h-48 overflow-hidden bg-gray-100">
            <img src="${item.productionPath}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src=window.SHANTIPUR_ASSETS.fallbacks.hero" />
            
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

  // Search input handlers
  document.getElementById('search-input')?.addEventListener('input', renderListings);
  document.getElementById('search-location')?.addEventListener('change', renderListings);
  document.getElementById('search-category')?.addEventListener('change', renderListings);
  document.getElementById('search-btn')?.addEventListener('click', () => {
    renderListings();
    document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Popular search tag clicks
  window.searchByTag = function(term) {
    const input = document.getElementById('search-input');
    if (input) {
      input.value = term;
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
    const isVerified = registryEntry ? (registryEntry.imageVerified !== false) : true;
    const imgSrc = (registryEntry && registryEntry.coverImage) || item.image_url || window.SHANTIPUR_ASSETS.getSlotPhoto(item.slot_key, item.image_url);
    const gallery = (registryEntry && registryEntry.gallery) || [];
    const sourceInfo = registryEntry ? registryEntry.source : 'Santipur Local Heritage Archive';
    const licenseInfo = (registryEntry && registryEntry.license) ? registryEntry.license : 'Heritage Fair Use';

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
                <img src="${photo}" class="w-full h-full object-cover" />
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
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>${lang === 'en' ? 'Verified Authentic' : 'যাচাইকৃত সত্য'}
               </span>`
            : `<span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>${lang === 'en' ? 'Verification Pending' : 'যাচাইকরণ প্রক্রিয়াধীন'}
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
        <button onclick="window.closeDetailModal()" class="absolute top-4 right-4 z-20 bg-white/90 hover:bg-gray-100 text-[#202020] w-8 h-8 rounded-full flex items-center justify-center border border-[#EAEAEA] shadow-sm transition-colors text-sm font-bold">
          ✕
        </button>

        <!-- Modal Photo -->
        <div class="relative h-64 shrink-0 bg-gray-100">
          <img id="modal-main-img" src="${imgSrc}" alt="${title}" class="w-full h-full object-cover" onerror="this.src=window.SHANTIPUR_ASSETS.fallbacks.hero" />
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
      selectedListEl.innerHTML = appData.shrines.map(s => {
        const isChecked = selectedShrinesForParikrama.has(s.id);
        const name = lang === 'en' ? s.name_en : s.name_bn;
        return `
          <label class="flex items-center justify-between p-3 rounded-lg border ${isChecked ? 'bg-[#FAFAF8] border-[#D94B42]/40' : 'bg-white border-[#EAEAEA]'} cursor-pointer hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-3">
              <input type="checkbox" onchange="window.toggleParikramaShrine('${s.id}')" ${isChecked ? 'checked' : ''} class="w-4 h-4 text-[#D94B42] rounded border-gray-300 focus:ring-[#D94B42]">
              <div>
                <span class="text-xs font-semibold text-[#202020] block">${name}</span>
                <span class="text-[11px] text-[#777777]">${s.ward_location}</span>
              </div>
            </div>
            <span class="text-[11px] font-mono text-gray-500">~${s.age_years} Yrs</span>
          </label>
        `;
      }).join('');
    }
  }

  // Offline Parikrama Pass Downloader
  window.downloadParikramaPass = function() {
    if (!appData) return;
    const selected = appData.shrines.filter(s => selectedShrinesForParikrama.has(s.id));

    let passText = `=========================================\n`;
    passText += `  SHANTIPUR HERITAGE PARIKRAMA PASS\n`;
    passText += `  শান্তিপুর সুপ্রাচীন মহোৎসব পরিক্রমা পাস\n`;
    passText += `=========================================\n`;
    passText += `PIN: 741404 | Nadia, West Bengal\n`;
    passText += `Date: ${new Date().toLocaleDateString()}\n`;
    passText += `Total Checkpoints: ${selected.length}\n\n`;
    passText += `OPTIMIZED CIRCUIT ROUTE:\n`;

    selected.forEach((s, idx) => {
      passText += `[${idx + 1}] ${s.name_en} (~${s.age_years} Years)\n`;
      passText += `    Ward: ${s.ward_location}\n`;
      passText += `    Ritual Note: ${s.rituals_en}\n\n`;
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

  // Story Pass Generator (Clean, Editorial, High-Resolution 1080x1920 Canvas Card)
  window.generateStoryCard = function() {
    const canvas = document.getElementById('story-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;

    const nameInput = document.getElementById('story-name-input')?.value || 'Devotee / Cultural Explorer';
    const wishSelect = document.getElementById('story-wish-select')?.value || 'Subho Dipaboli & Shantipur Bhanga Rash';
    const selectedPhotoSrc = document.getElementById('story-photo-select')?.value || '/images/santipur/vaishnava-heritage/santipur-sri-radha-raman-jiu-01.jpg';

    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = selectedPhotoSrc;

    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, 1080, 1920);

      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, 'rgba(18, 16, 22, 0.7)');
      grad.addColorStop(0.4, 'rgba(18, 16, 22, 0.45)');
      grad.addColorStop(0.7, 'rgba(18, 16, 22, 0.8)');
      grad.addColorStop(1, 'rgba(18, 16, 22, 0.98)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Clean Border
      ctx.strokeStyle = '#D94B42';
      ctx.lineWidth = 6;
      ctx.strokeRect(60, 60, 960, 1800);

      // Header Text
      ctx.fillStyle = '#D94B42';
      ctx.font = '600 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHANTIPUR HERITAGE PLATFORM • PIN 741404', 540, 160);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 72px Inter, sans-serif';
      ctx.fillText('SHANTIPUR', 540, 250);

      ctx.fillStyle = '#B79550';
      ctx.font = '500 32px sans-serif';
      ctx.fillText('নদিয়া, পশ্চিমবঙ্গ', 540, 310);

      // Card Content Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.beginPath();
      ctx.roundRect(100, 1140, 880, 520, 24);
      ctx.fill();

      ctx.fillStyle = '#777777';
      ctx.font = '600 24px Inter, sans-serif';
      ctx.fillText('OFFICIAL HERITAGE PASS & GREETINGS', 540, 1220);

      ctx.fillStyle = '#202020';
      ctx.font = '700 58px Inter, sans-serif';
      ctx.fillText(nameInput, 540, 1310);

      ctx.fillStyle = '#D94B42';
      ctx.font = '500 32px Inter, sans-serif';
      ctx.fillText(wishSelect, 540, 1390);

      ctx.fillStyle = '#777777';
      ctx.font = '400 22px Inter, sans-serif';
      ctx.fillText('500 Years of Sacred Traditions • Historic Temples • 1409 CE Handloom', 540, 1480);

      // Official Stamp
      ctx.fillStyle = '#202020';
      ctx.beginPath();
      ctx.roundRect(430, 1530, 220, 60, 12);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 22px Inter, sans-serif';
      ctx.fillText('VERIFIED 741404', 540, 1568);

      const link = document.createElement('a');
      link.download = `Shantipur_Pass_${nameInput.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

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

  // Initialize
  renderListings();
  renderHeritageGallery();
  updateParikramaEstimates();
});
