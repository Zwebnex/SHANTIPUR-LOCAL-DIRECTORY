/**
 * Santipur Heritage Stay & Hospitality Engine (Hotels / Lodges / Homestays)
 * UI Controller & Interactive Engine (Pillars 1, 2 & 3)
 * Target Municipality: Santipur, Nadia, West Bengal (PIN: 741404)
 */

(function (window) {
  'use strict';

  // State
  let currentAccommodation = null;
  let allAccommodations = [];
  let currentFilterType = 'all';
  let currentLang = 'en'; // 'en' | 'bn'
  let cachedDashboardBookings = [];

  // Translations dictionary for Santipur Stay Engine
  const I18N = {
    en: {
      browseTab: 'Browse Stays',
      listTab: '+ List Property',
      ownerTab: 'Owner Admin Portal',
      heroTag: 'Santipur Heritage Hospitality Engine',
      heroTitle: 'Discover & Reserve Stays Across Historic Santipur',
      heroSubtitle: 'Experience 500 years of Vaishnava devotion, sacred Kali shrines, and authentic handloom haats with verified local accommodations in PIN 741404.',
      allLocations: 'All Santipur Locations (741404)',
      checkIn: 'Check-In',
      checkOut: 'Check-Out',
      guestsRooms: 'Guests & Rooms',
      searchCTA: 'Search Available Stays',
      verifiedStays: 'Verified Stays & Guest Houses in Santipur',
      showingCount: (count) => `Showing ${count} verified Santipur properties with direct booking support`,
      pricePerNight: '/ night',
      reserveNow: 'Reserve Room',
      viewDetails: 'View Luxury Details',
      instantBook: 'Instant Book',
      complimentaryBreakfast: 'Complimentary Breakfast Included',
      acAvailable: 'AC Available',
      freeWifi: 'Free Wi-Fi',
      attachedBath: 'Attached Bath',
      roomNo: 'Room No',
      confirmBooking: 'Confirm & Generate Booking Pass',
      tariffOnRequest: 'Tariff on Request',
      unverifiedByOwner: 'Pending owner verification',
      whyHidden: 'Why hidden?',
      nightlyTariff: 'Nightly Tariff',
      verifyModalBadge: 'Owner Verification Policy',
      verifyModalTitle: 'Tariff Hidden: Verification Pending',
      verifyModalSubtitle: 'Santipur Heritage Hospitality Engine Quality & Transparency Protection',
      verifyFaqTitle: 'Why is this property\'s price not displayed?',
      verifyFaqDesc1: 'To protect visitors and pilgrims from unauthorized seasonal tariff fluctuations and festive overcharging, room rates are kept private until officially verified by the property owner.',
      verifyFaqDesc2: 'Once the property manager verifies their tariff schedule in the Owner Admin Portal, exact nightly prices become immediately visible. You may contact the manager directly for immediate rate confirmation.'
    },
    bn: {
      browseTab: 'আবাসন খুঁজুন',
      listTab: '+ হোটেল নথিভুক্ত করুন',
      ownerTab: 'মালিক অ্যাডমিন পোর্টাল',
      heroTag: 'শান্তিপুর ঐতিহ্যবাহী আবাসন ও আতিথেয়তা ইঞ্জিন',
      heroTitle: 'ঐতিহাসিক শান্তিপুরে থাকার সেরা হোটেল ও হোমস্টে সংরক্ষণ করুন',
      heroSubtitle: '৫০০ বছরের বৈষ্ণব সংস্কৃতি, শ্রী অদ্বৈত পাট, রাস উৎসব ও শান্তিপুরী তাঁত শিল্পের আঙিনায় যাচাইকৃত বিশ্বস্ত আবাসন (পিন: ৭৪১৪০৪)।',
      allLocations: 'সকল শান্তিপুর এলাকা (৭৪১৪০৪)',
      checkIn: 'চেক-ইন তারিখ',
      checkOut: 'চেক-আউট তারিখ',
      guestsRooms: 'অতিথি ও কক্ষ',
      searchCTA: 'আবাসন অনুসন্ধান করুন',
      verifiedStays: 'শান্তিপুরের যাচাইকৃত হোটেল, লজ ও ধর্মশালা',
      showingCount: (count) => `সরাসরি বুকিং সহ মোট ${count} টি নির্ভরযোগ্য আবাসন প্রদর্শিত হচ্ছে`,
      pricePerNight: '/ প্রতি রাত্রি',
      reserveNow: 'কক্ষ বুক করুন',
      viewDetails: 'বিস্তারিত বিবরণ দেখুন',
      instantBook: 'তাত্ক্ষণিক বুকিং',
      complimentaryBreakfast: 'বিনামূল্যে প্রাতরাশ অন্তর্ভুক্ত',
      acAvailable: 'শীতাতপ নিয়ন্ত্রিত (AC)',
      freeWifi: 'ফ্রি ওয়াইফাই',
      attachedBath: 'সংযুক্ত শৌচাগার',
      roomNo: 'রুম নং',
      confirmBooking: 'নিশ্চিত করুন ও পাস সংগ্রহ করুন',
      tariffOnRequest: 'মূল্য অনুরোধ সাপেক্ষে',
      unverifiedByOwner: 'মালিকের যাচাইকরণ মুলতুবি',
      whyHidden: 'কেন লুকানো?',
      nightlyTariff: 'প্রতি রাত্রির ভাড়া',
      verifyModalBadge: 'মালিকের মূল্য যাচাইকরণ নীতি',
      verifyModalTitle: 'মূল্য গোপন: যাচাইকরণ মুলতুবি',
      verifyModalSubtitle: 'শান্তিপুর হেরিটেজ আতিথেয়তা ইঞ্জিনের মান ও স্বচ্ছতা সুরক্ষা',
      verifyFaqTitle: 'কেন এই আবাসনের মূল্য সরাসরি প্রদর্শিত হচ্ছে না?',
      verifyFaqDesc1: 'রাস উৎসব বা মেলা চলাকালীন তীর্থযাত্রী ও পর্যটকদের অননুমোদিত অতিরিক্ত ভাড়া বা বিভ্রান্তি থেকে রক্ষা করতে, সরাসরি মালিক দ্বারা অনুমোদিত না হওয়া পর্যন্ত নির্দিষ্ট কক্ষের ভাড়া গোপন রাখা হয়।',
      verifyFaqDesc2: 'মালিক অ্যাডমিন পোর্টালে তাদের বর্তমান ভাড়া অনুমোদন করলেই সঠিক মূল্য সরাসরি বুকিংয়ের জন্য দৃশ্যমান হয়। তাৎক্ষণিক ভাড়ার তথ্যের জন্য সরাসরি ম্যানেজারের সাথে ফোনে যোগাযোগ করুন।'
    }
  };

  /**
   * Helper: Format ISO / Date string to standard readable format
   */
  function formatDate(dStr) {
    if (!dStr) return '--';
    const d = new Date(dStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /**
   * Helper: Format currency
   */
  function formatINR(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  }

  /**
   * Initialize Date inputs with sensible defaults
   */
  function setupDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const checkInEl = document.getElementById('filter-checkin');
    const checkOutEl = document.getElementById('filter-checkout');

    const fmt = (d) => d.toISOString().split('T')[0];

    if (checkInEl && !checkInEl.value) {
      checkInEl.value = fmt(today);
      checkInEl.min = fmt(today);
    }
    if (checkOutEl && !checkOutEl.value) {
      checkOutEl.value = fmt(tomorrow);
      checkOutEl.min = fmt(today);
    }
  }

  // =========================================================================
  // PILLAR 1: SEARCH, FILTER & LISTINGS ENGINE
  // =========================================================================

  /**
   * Read UI search filters
   */
  function getActiveFilters() {
    const landmark = document.getElementById('filter-landmark')?.value || 'all';
    const checkin = document.getElementById('filter-checkin')?.value || '';
    const checkout = document.getElementById('filter-checkout')?.value || '';
    const guests = parseInt(document.getElementById('filter-guests')?.value || '2', 10);
    const sort = document.getElementById('filter-sort')?.value || 'recommended';

    return {
      landmark_area: landmark,
      property_type: currentFilterType,
      check_in: checkin,
      check_out: checkout,
      guests_count: guests,
      sort: sort
    };
  }

  /**
   * Execute Stay Search & Render Grid
   */
  window.executeStaySearch = async function () {
    const filters = getActiveFilters();
    try {
      const results = await window.SantipurStayEngine.getAccommodations(filters);
      allAccommodations = results;
      renderAccommodationsGrid(results);
    } catch (err) {
      console.error('Error fetching accommodations:', err);
    }
  };

  /**
   * Filter Pill Click Handler (Hotels / Lodges / Homestays / Dharamshala etc)
   */
  window.setFilterPropertyType = function (propType) {
    currentFilterType = propType;
    document.querySelectorAll('.type-pill-btn').forEach((btn) => {
      const type = btn.getAttribute('data-type');
      if (type === propType) {
        btn.className = 'type-pill-btn px-2.5 py-1 rounded-lg font-semibold bg-[#1A1D24] text-white transition-all';
      } else {
        btn.className = 'type-pill-btn px-2.5 py-1 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all';
      }
    });
    window.executeStaySearch();
  };

  /**
   * Reset Search Filters
   */
  window.resetStayFilters = function () {
    const landmarkEl = document.getElementById('filter-landmark');
    const sortEl = document.getElementById('filter-sort');
    if (landmarkEl) landmarkEl.value = 'all';
    if (sortEl) sortEl.value = 'recommended';
    setupDefaultDates();
    window.setFilterPropertyType('all');
  };

  /**
   * Date change listener
   */
  window.handleDatesChanged = function () {
    const cin = document.getElementById('filter-checkin')?.value;
    const cout = document.getElementById('filter-checkout')?.value;
    if (cin && cout && new Date(cout) <= new Date(cin)) {
      const d = new Date(cin);
      d.setDate(d.getDate() + 1);
      document.getElementById('filter-checkout').value = d.toISOString().split('T')[0];
    }
    window.executeStaySearch();
  };

  /**
   * Render Listings Grid (Strict Rule: Do not show prices if not verified by owners!)
   */
  function renderAccommodationsGrid(items) {
    const grid = document.getElementById('accommodations-grid');
    const emptyState = document.getElementById('accommodations-empty');
    const countLabel = document.getElementById('results-count-label');

    if (!grid) return;

    if (!items || items.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (countLabel) countLabel.textContent = 'No matching properties found';
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (countLabel) {
      countLabel.textContent = I18N[currentLang].showingCount(items.length);
    }

    grid.innerHTML = items.map((acc) => {
      const thumb = acc.main_image_url || '/images/santipur/stays/santipur-stay-room-master.jpg';
      const amenities = acc.amenities || {};
      const isVerified = acc.is_verified === true;

      const statusBadge = acc.status === 'sold_out' 
        ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">Sold Out</span>'
        : acc.status === 'inactive'
        ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase">Maintenance</span>'
        : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Available</span>';

      // Strict Condition: If NOT verified by owner, hide the price!
      const priceOverlayHtml = isVerified
        ? `
          <div class="text-[10px] uppercase font-bold text-gray-200 tracking-wider">Starting Tariff</div>
          <div class="text-xl font-extrabold tracking-tight">${formatINR(acc.price_per_night)} <span class="text-xs font-normal text-gray-200">${I18N[currentLang].pricePerNight}</span></div>
        `
        : `
          <div class="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1">
            <span>🔒</span> <span>${I18N[currentLang].tariffOnRequest}</span>
          </div>
          <div class="text-xs font-bold text-white tracking-tight flex items-center gap-1 mt-0.5">
            <span>${I18N[currentLang].unverifiedByOwner}</span>
          </div>
        `;

      const priceBodyHtml = isVerified
        ? `
          <div class="mt-3 flex items-center justify-between text-xs font-semibold text-gray-700 bg-gray-50/90 px-3 py-2 rounded-xl">
            <span class="text-gray-500">${I18N[currentLang].nightlyTariff}:</span>
            <span class="text-sm font-extrabold text-[#D94B42]">${formatINR(acc.price_per_night)} <span class="text-[10px] text-gray-500 font-normal">${I18N[currentLang].pricePerNight}</span></span>
          </div>
        `
        : `
          <div class="mt-3 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-center justify-between gap-2 text-xs">
            <div>
              <div class="font-extrabold text-amber-900 text-xs flex items-center gap-1">
                <span>🔒</span> <span>${I18N[currentLang].tariffOnRequest}</span>
              </div>
              <div class="text-[10px] text-amber-700 font-medium">${I18N[currentLang].unverifiedByOwner}</div>
            </div>
            <button 
              type="button" 
              onclick="window.openTariffVerificationModal('${acc.id}', event)" 
              class="px-2.5 py-1 bg-amber-200/90 hover:bg-amber-300 text-amber-950 font-bold text-[11px] rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
              title="Click to view why tariffs are hidden"
            >
              <span>${I18N[currentLang].whyHidden}</span>
              <span>ⓘ</span>
            </button>
          </div>
        `;

      return `
        <article class="bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
          <!-- Main Image Showcase -->
          <div class="relative h-52 bg-gray-100 overflow-hidden">
            <img 
              src="${thumb}" 
              alt="${acc.property_name}" 
              loading="lazy" 
              decoding="async" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              onerror="this.src='/images/santipur/stays/santipur-stay-room-master.jpg'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30"></div>
            
            <!-- Type & Status Pill Badges -->
            <div class="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1A1D24]/90 backdrop-blur-md text-white tracking-wide">
                ${acc.property_type}
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-gray-800">
                ${acc.category || 'Deluxe'}
              </span>
            </div>

            <div class="absolute top-3 right-3 flex items-center gap-1.5">
              ${isVerified ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-xs">✓ Verified</span>' : ''}
              ${statusBadge}
            </div>

            <!-- Price Overlay Badge (Conditioned on is_verified!) -->
            <div class="absolute bottom-3 left-3 text-white">
              ${priceOverlayHtml}
            </div>

            <div class="absolute bottom-3 right-3 text-white text-[11px] font-semibold bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
              ${acc.room_size_sqft || 350} sq.ft
            </div>
          </div>

          <!-- Body Info -->
          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <!-- Landmark & Verification -->
              <div class="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                <span class="flex items-center gap-1 font-semibold text-[#D94B42]">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                  ${acc.landmark_area}
                </span>
                <span class="font-bold text-gray-400">PIN 741404</span>
              </div>

              <h3 class="text-base font-extrabold text-[#1A1D24] tracking-tight group-hover:text-[#D94B42] transition-colors leading-snug">
                ${acc.property_name}
              </h3>

              <p class="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                ${acc.description || 'Authentic Santipur accommodation close to heritage temples and textile haats.'}
              </p>

              <!-- Capacity & Beds -->
              <div class="mt-3 py-2 px-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs text-gray-600 font-medium">
                <span class="flex items-center gap-1">
                  <span>👥</span> ${acc.capacity_adults || 2} Adults, ${acc.capacity_children || 1} Child
                </span>
                <span class="flex items-center gap-1">
                  <span>🛏️</span> ${acc.bed_type || 'Double Bed'}
                </span>
              </div>

              <!-- Price Box in Body -->
              ${priceBodyHtml}

              <!-- Amenity Badges -->
              <div class="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-gray-600 font-semibold">
                ${amenities.ac ? '<span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">✓ AC</span>' : ''}
                ${amenities.wifi ? '<span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">✓ High Wi-Fi</span>' : ''}
                ${amenities.breakfast ? '<span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">✓ Breakfast</span>' : ''}
                ${amenities.attached_bath ? '<span class="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">✓ Attached Bath</span>' : ''}
              </div>
            </div>

            <!-- Card Actions -->
            <div class="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
              <button 
                onclick="window.openStayDetailModal('${acc.id}')" 
                class="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1A1D24] text-xs font-bold transition-all text-center cursor-pointer"
              >
                ${I18N[currentLang].viewDetails}
              </button>
              <button 
                onclick="window.openBookingDrawerForAcc('${acc.id}')" 
                ${acc.status === 'sold_out' ? 'disabled' : ''}
                class="py-2.5 px-3 rounded-xl ${acc.status === 'sold_out' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#D94B42] hover:bg-[#B53830] text-white shadow-xs hover:shadow-md'} text-xs font-bold transition-all text-center cursor-pointer"
              >
                ${acc.status === 'sold_out' ? 'Full' : (isVerified ? I18N[currentLang].instantBook : 'Request Booking')}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // =========================================================================
  // LUXURY ROOM DETAIL MODAL (Matching User Design Mockup)
  // =========================================================================

  /**
   * Open Expansive Luxury Room Detail Modal
   */
  window.openStayDetailModal = async function (accId) {
    const acc = allAccommodations.find((a) => a.id === accId) || 
      (await window.SantipurStayEngine.getAccommodations({ id: accId }))[0];

    if (!acc) return;
    currentAccommodation = acc;
    const isVerified = acc.is_verified === true;

    // 1. Header Information
    const titleEl = document.getElementById('modal-prop-name');
    const roomNoEl = document.getElementById('modal-room-no');
    if (titleEl) titleEl.textContent = acc.property_name;
    if (roomNoEl) {
      const roomNum = Math.abs(acc.id.split('-').reduce((acc, part) => acc + parseInt(part, 16) || 0, 0)) % 800 + 101;
      roomNoEl.textContent = `${I18N[currentLang].roomNo}: ${roomNum}`;
    }

    // 2. Feature Chips
    const sizeChip = document.getElementById('modal-chip-size-val');
    const bedChip = document.getElementById('modal-chip-bed-val');
    const floorChip = document.getElementById('modal-chip-floor-val');
    if (sizeChip) sizeChip.textContent = `${acc.room_size_sqft || 380} sq. ft`;
    if (bedChip) bedChip.textContent = acc.bed_type || 'Double bed';
    if (floorChip) floorChip.textContent = acc.floor_level || '2nd Floor';

    // 3. Primary Photo & Interactive Thumbnails
    const masterImg = document.getElementById('modal-master-img');
    const thumbRow = document.getElementById('modal-thumbnail-row');

    const defaultGallery = [
      acc.main_image_url || '/images/santipur/stays/santipur-stay-room-master.jpg',
      '/images/santipur/stays/santipur-stay-room-living.jpg',
      '/images/santipur/stays/santipur-stay-room-bath.jpg',
      '/images/santipur/stays/santipur-stay-breakfast-tray.jpg'
    ];
    const gallery = (acc.gallery_urls && acc.gallery_urls.length > 0) ? acc.gallery_urls : defaultGallery;

    if (masterImg) {
      masterImg.src = gallery[0];
      masterImg.alt = acc.property_name;
    }

    if (thumbRow) {
      thumbRow.innerHTML = gallery.slice(0, 3).map((imgUrl, idx) => `
        <button 
          type="button" 
          onclick="window.selectModalThumbnail('${imgUrl}', this)" 
          class="thumb-btn w-14 h-11 sm:w-16 sm:h-12 rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-white scale-105' : 'border-white/60 opacity-80'} hover:opacity-100 transition-all shadow-md bg-black cursor-pointer"
        >
          <img src="${imgUrl}" alt="Thumbnail ${idx + 1}" class="w-full h-full object-cover" />
        </button>
      `).join('');
    }

    // 4. "Rooms" Specification Panel (Right Side)
    const specs = acc.room_specs || {};
    const bedroomEl = document.getElementById('spec-bedroom');
    const bedtypeEl = document.getElementById('spec-bedtype');
    const techEl = document.getElementById('spec-tech');
    const bathEl = document.getElementById('spec-bath');
    const accessEl = document.getElementById('spec-access');
    const kitchenEl = document.getElementById('spec-kitchen');
    const sidePriceEl = document.getElementById('modal-side-price');

    if (bedroomEl) bedroomEl.textContent = specs.bedroom || '1 Master Bedroom with Working Desk';
    if (bedtypeEl) bedtypeEl.textContent = `${acc.bed_type || 'Double Bed'}, Sofa Seating & Wardrobe`;
    if (techEl) techEl.textContent = acc.amenities?.wifi ? 'Smart TV, Fiber Wi-Fi, AC, 24/7 Geyser' : 'LED TV, AC, Geyser';
    if (bathEl) bathEl.textContent = specs.bathroom || '1 Attached Western Bath with Hot Water';
    if (accessEl) accessEl.textContent = specs.accessibility || `${acc.floor_level || '1st Floor'} / Wide Staircase`;
    if (kitchenEl) kitchenEl.textContent = specs.kitchen || 'Complimentary morning tea/coffee maker';

    // Strict Rule: Do not show prices if not verified by owners!
    if (sidePriceEl) {
      if (isVerified) {
        sidePriceEl.innerHTML = `
          <span class="text-[10px] text-gray-400 uppercase font-bold block">Nightly Tariff</span>
          <div class="text-xl font-extrabold text-[#D94B42]">
            ${formatINR(acc.price_per_night)} <span class="text-xs text-gray-500 font-normal">${I18N[currentLang].pricePerNight}</span>
          </div>
        `;
      } else {
        sidePriceEl.innerHTML = `
          <span class="text-[10px] text-amber-800 uppercase font-bold block flex items-center gap-1">
            <span>🔒</span> <span>${I18N[currentLang].tariffOnRequest}</span>
          </span>
          <div class="text-xs font-bold text-gray-700 flex items-center gap-2 mt-0.5">
            <span>${I18N[currentLang].unverifiedByOwner}</span>
            <button 
              type="button" 
              onclick="window.openTariffVerificationModal('${acc.id}', event)" 
              class="text-[10px] font-bold text-[#D94B42] hover:underline bg-red-50 border border-red-200 px-2 py-0.5 rounded-md cursor-pointer"
            >
              ${I18N[currentLang].whyHidden} ⓘ
            </button>
          </div>
        `;
      }
    }

    // 5. Lower Overview Grid
    const ovName = document.getElementById('modal-overview-name');
    const ovType = document.getElementById('modal-overview-type');
    const ovCap = document.getElementById('modal-overview-cap');
    const ovSize = document.getElementById('modal-overview-size');
    const descEl = document.getElementById('modal-full-desc');

    if (ovName) ovName.textContent = acc.property_name;
    if (ovType) ovType.textContent = `${acc.property_type} (${acc.category || 'Deluxe'})`;
    if (ovCap) ovCap.textContent = `${acc.capacity_adults || 2} Adults, ${acc.capacity_children || 1} Child`;
    if (ovSize) ovSize.textContent = `${acc.room_size_sqft || 380} sq. ft`;
    if (descEl) descEl.textContent = acc.description || 'Centrally located in historic Santipur. Ideal for families, pilgrims, and textile shoppers.';

    // 6. Interactive Availability Calendar
    renderModalCalendar(acc);

    // 7. Advance Bookings List
    renderModalAdvanceBookings(acc);

    // Show Modal
    const modal = document.getElementById('stay-detail-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  };

  /**
   * Swap master image upon thumbnail click
   */
  window.selectModalThumbnail = function (imgUrl, btnEl) {
    const master = document.getElementById('modal-master-img');
    if (master) {
      master.src = imgUrl;
    }
    document.querySelectorAll('#modal-thumbnail-row .thumb-btn').forEach((b) => {
      b.classList.remove('border-white', 'scale-105');
      b.classList.add('border-white/60', 'opacity-80');
    });
    if (btnEl) {
      btnEl.classList.add('border-white', 'scale-105');
      btnEl.classList.remove('border-white/60', 'opacity-80');
    }
  };

  /**
   * Close Detail Modal
   */
  window.closeStayDetailModal = function () {
    const modal = document.getElementById('stay-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  /**
   * Render Availability Calendar with Booked Dates Highlighted
   */
  function renderModalCalendar(acc) {
    const calGrid = document.getElementById('modal-calendar-grid');
    const monthLabel = document.getElementById('calendar-month-label');
    if (!calGrid) return;

    const year = 2026;
    const month = 10; // November
    if (monthLabel) monthLabel.textContent = 'November 2026 (Raas Festival Season)';

    const daysHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = daysHeader.map((d) => `<div class="font-bold text-gray-400 py-1">${d}</div>`).join('');

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      html += `<div class="py-2 text-gray-300"></div>`;
    }

    const bookedDays = [12, 13, 14, 15, 24, 25];

    for (let day = 1; day <= totalDays; day++) {
      const isBooked = bookedDays.includes(day);
      if (isBooked) {
        html += `
          <div class="py-1.5 flex items-center justify-center">
            <span class="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white font-bold shadow-xs text-xs">
              ${day < 10 ? '0' + day : day}
            </span>
          </div>
        `;
      } else {
        html += `
          <div class="py-1.5 flex items-center justify-center">
            <span class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer text-xs transition-colors">
              ${day < 10 ? '0' + day : day}
            </span>
          </div>
        `;
      }
    }

    calGrid.innerHTML = html;
  }

  /**
   * Render Advance Bookings
   */
  async function renderModalAdvanceBookings(acc) {
    const listEl = document.getElementById('modal-recent-bookings-list');
    if (!listEl) return;

    try {
      const bookings = await window.SantipurStayEngine.getBookings();
      const relevant = bookings.filter((b) => b.accommodation_id === acc.id);
      const displayBookings = relevant.length > 0 ? relevant : bookings.slice(0, 3);

      listEl.innerHTML = displayBookings.map((b) => `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              👤
            </div>
            <div>
              <div class="text-xs font-bold text-[#1A1D24]">${b.guest_name}</div>
              <div class="text-[10px] text-gray-500">${formatDate(b.check_in)} - ${formatDate(b.check_out)}</div>
            </div>
          </div>
          <span class="text-gray-400 text-xs font-bold">↗</span>
        </div>
      `).join('');
    } catch (e) {
      console.warn('Advance bookings render error:', e);
    }
  }

  // =========================================================================
  // OWNER TARIFF VERIFICATION POLICY POP-UP MODAL (User Request)
  // =========================================================================

  /**
   * Open Owner Tariff Verification Policy Pop-Up Modal
   */
  window.openTariffVerificationModal = async function (accId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const acc = allAccommodations.find((a) => a.id === accId) || 
      (await window.SantipurStayEngine.getAccommodations({ id: accId }))[0];

    const modal = document.getElementById('tariff-verification-modal');
    if (!modal) return;

    const propNameEl = document.getElementById('verify-modal-prop-name');
    const ownerNameEl = document.getElementById('verify-modal-owner-name');
    const landmarkEl = document.getElementById('verify-modal-landmark');
    const phoneBtn = document.getElementById('verify-modal-phone-btn');

    if (acc) {
      if (propNameEl) propNameEl.textContent = acc.property_name;
      if (ownerNameEl) ownerNameEl.textContent = `${acc.owner_name || 'Property Manager'} (${acc.property_type})`;
      if (landmarkEl) landmarkEl.textContent = `${acc.landmark_area}, Santipur (PIN: 741404)`;
      if (phoneBtn) {
        const cleanPhone = (acc.owner_phone || '+919434821905').replace(/[^0-9+]/g, '');
        phoneBtn.href = `tel:${cleanPhone}`;
        phoneBtn.innerHTML = `<span>📞 Call ${acc.owner_phone || 'Desk'}</span>`;
      }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  /**
   * Close Owner Tariff Verification Policy Pop-Up Modal
   */
  window.closeTariffVerificationModal = function () {
    const modal = document.getElementById('tariff-verification-modal');
    if (modal) {
      modal.classList.add('hidden');
      if (
        document.getElementById('stay-detail-modal')?.classList.contains('hidden') &&
        document.getElementById('booking-drawer-modal')?.classList.contains('hidden') &&
        document.getElementById('booking-success-modal')?.classList.contains('hidden')
      ) {
        document.body.style.overflow = '';
      }
    }
  };

  // =========================================================================
  // INSTANT BOOKING DRAWER & CONFIRMATION
  // =========================================================================

  /**
   * Open Booking Drawer for current accommodation
   */
  window.triggerBookingDrawer = function () {
    if (!currentAccommodation) return;
    openBookingDrawer(currentAccommodation);
  };

  /**
   * Open Booking Drawer from Listings Card
   */
  window.openBookingDrawerForAcc = async function (accId) {
    const acc = allAccommodations.find((a) => a.id === accId) || 
      (await window.SantipurStayEngine.getAccommodations({ id: accId }))[0];
    if (acc) {
      currentAccommodation = acc;
      openBookingDrawer(acc);
    }
  };

  function openBookingDrawer(acc) {
    const drawer = document.getElementById('booking-drawer-modal');
    const propNameEl = document.getElementById('drawer-property-name');
    const checkinEl = document.getElementById('drawer-summary-checkin');
    const checkoutEl = document.getElementById('drawer-summary-checkout');

    if (propNameEl) propNameEl.textContent = acc.property_name;

    const cin = document.getElementById('filter-checkin')?.value || new Date().toISOString().split('T')[0];
    const cout = document.getElementById('filter-checkout')?.value || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

    if (checkinEl) checkinEl.textContent = formatDate(cin);
    if (checkoutEl) checkoutEl.textContent = formatDate(cout);

    window.recalculateDrawerPricing();

    if (drawer) {
      drawer.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  window.closeBookingDrawer = function () {
    const drawer = document.getElementById('booking-drawer-modal');
    if (drawer) {
      drawer.classList.add('hidden');
      if (document.getElementById('stay-detail-modal')?.classList.contains('hidden')) {
        document.body.style.overflow = '';
      }
    }
  };

  /**
   * Recalculate cost when rooms or dates change (Hides numeric tariff if unverified!)
   */
  window.recalculateDrawerPricing = function () {
    if (!currentAccommodation) return;
    const cin = document.getElementById('filter-checkin')?.value || new Date().toISOString().split('T')[0];
    const cout = document.getElementById('filter-checkout')?.value || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const rooms = parseInt(document.getElementById('book-rooms-count')?.value || '1', 10);
    const isVerified = currentAccommodation.is_verified === true;

    const priceCalc = window.SantipurStayEngine.calculatePricing(
      currentAccommodation.price_per_night,
      cin,
      cout,
      rooms
    );

    const nightsEl = document.getElementById('drawer-nights-count');
    const rateEl = document.getElementById('drawer-nightly-rate');
    const totalEl = document.getElementById('drawer-total-amount');

    if (nightsEl) nightsEl.textContent = `${priceCalc.nights} Night${priceCalc.nights > 1 ? 's' : ''}`;

    if (isVerified) {
      if (rateEl) rateEl.textContent = formatINR(currentAccommodation.price_per_night);
      if (totalEl) totalEl.textContent = formatINR(priceCalc.totalAmount);
    } else {
      if (rateEl) rateEl.innerHTML = `<span class="text-amber-800 font-bold">${I18N[currentLang].tariffOnRequest}</span>`;
      if (totalEl) totalEl.innerHTML = `<span class="text-amber-800 text-sm font-extrabold">Pay at Desk on Confirmation</span>`;
    }
  };

  /**
   * Handle Booking Submission
   */
  window.handleExecuteBooking = async function (e) {
    e.preventDefault();
    if (!currentAccommodation) return;

    const guestName = document.getElementById('book-guest-name')?.value.trim();
    const guestPhone = document.getElementById('book-guest-phone')?.value.trim();
    const guestEmail = document.getElementById('book-guest-email')?.value.trim();
    const guestsCount = parseInt(document.getElementById('book-guests-count')?.value || '2', 10);
    const roomsCount = parseInt(document.getElementById('book-rooms-count')?.value || '1', 10);
    const specialNotes = document.getElementById('book-special-notes')?.value.trim();
    const paymentMode = document.querySelector('input[name="payment_method"]:checked')?.value || 'pay_at_desk';

    const cin = document.getElementById('filter-checkin')?.value;
    const cout = document.getElementById('filter-checkout')?.value;

    const btnSubmit = document.getElementById('btn-confirm-booking');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span>Processing Reservation...</span>';
    }

    try {
      const newBooking = await window.SantipurStayEngine.createBooking({
        accommodation_id: currentAccommodation.id,
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail,
        check_in: cin,
        check_out: cout,
        guests_count: guestsCount,
        rooms_count: roomsCount,
        special_notes: specialNotes,
        payment_status: paymentMode
      });

      // Close drawer & detail modal
      window.closeBookingDrawer();
      window.closeStayDetailModal();

      // Show Voucher Success Modal
      const successModal = document.getElementById('booking-success-modal');
      const vRef = document.getElementById('voucher-ref');
      const vGuest = document.getElementById('voucher-guest');
      const vDates = document.getElementById('voucher-dates');
      const vTotal = document.getElementById('voucher-total');
      const vPay = document.getElementById('voucher-payment');

      if (vRef) vRef.textContent = `STAY-741404-${newBooking.id.slice(0, 6).toUpperCase()}`;
      if (vGuest) vGuest.textContent = newBooking.guest_name;
      if (vDates) vDates.textContent = `${formatDate(newBooking.check_in)} - ${formatDate(newBooking.check_out)}`;
      if (vTotal) {
        vTotal.textContent = currentAccommodation.is_verified 
          ? formatINR(newBooking.total_amount) 
          : 'Tariff to be confirmed by Owner';
      }
      if (vPay) vPay.textContent = paymentMode === 'advance_paid' ? 'Advance UPI Verified' : 'Pay at Hotel Desk';

      if (successModal) {
        successModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }

      document.getElementById('instant-booking-form')?.reset();
    } catch (err) {
      alert('Failed to process booking: ' + err.message);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>${I18N[currentLang].confirmBooking}</span> <span>✓</span>`;
      }
    }
  };

  window.closeSuccessModal = function () {
    const modal = document.getElementById('booking-success-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  window.printBookingPass = function () {
    window.print();
  };

  // =========================================================================
  // PILLAR 2: OWNER REGISTRATION PIPELINE (5-STEP WIZARD)
  // =========================================================================

  window.nextWizardStep = function (stepNum) {
    if (stepNum === 2) {
      const name = document.getElementById('reg-owner-name')?.value.trim();
      const phone = document.getElementById('reg-owner-phone')?.value.trim();
      if (!name || !phone) {
        alert('Please provide Owner Name and Phone number.');
        return;
      }
    } else if (stepNum === 3) {
      const propName = document.getElementById('reg-property-name')?.value.trim();
      const address = document.getElementById('reg-property-address')?.value.trim();
      if (!propName || !address) {
        alert('Please fill property name and full address.');
        return;
      }
    } else if (stepNum === 4) {
      const price = parseFloat(document.getElementById('reg-price')?.value || '0');
      if (price < 300) {
        alert('Please enter a valid nightly rate (min ₹300).');
        return;
      }
    } else if (stepNum === 5) {
      const desc = document.getElementById('reg-description')?.value.trim();
      if (!desc) {
        alert('Please provide a short description for guests.');
        return;
      }
      populateWizardSummary();
    }

    for (let i = 1; i <= 5; i++) {
      const stepDiv = document.getElementById(`wizard-step-${i}`);
      const indSpan = document.getElementById(`step-ind-${i}`);
      if (stepDiv) {
        if (i === stepNum) {
          stepDiv.classList.remove('hidden');
        } else {
          stepDiv.classList.add('hidden');
        }
      }
      if (indSpan) {
        if (i === stepNum) {
          indSpan.className = 'text-white font-bold border-b-2 border-[#D94B42] pb-1';
        } else if (i < stepNum) {
          indSpan.className = 'text-emerald-400 font-medium pb-1';
        } else {
          indSpan.className = 'text-gray-400 pb-1';
        }
      }
    }
  };

  function populateWizardSummary() {
    const summaryCard = document.getElementById('reg-summary-card');
    if (!summaryCard) return;

    const propName = document.getElementById('reg-property-name')?.value || '--';
    const propType = document.getElementById('reg-property-type')?.value || '--';
    const landmark = document.getElementById('reg-property-landmark')?.value || '--';
    const address = document.getElementById('reg-property-address')?.value || '--';
    const price = document.getElementById('reg-price')?.value || '0';
    const owner = document.getElementById('reg-owner-name')?.value || '--';
    const phone = document.getElementById('reg-owner-phone')?.value || '--';

    summaryCard.innerHTML = `
      <div class="grid grid-cols-2 gap-2">
        <div><span class="text-gray-500">Property:</span> <strong class="text-black">${propName}</strong></div>
        <div><span class="text-gray-500">Type:</span> <strong>${propType}</strong></div>
        <div><span class="text-gray-500">Landmark:</span> <strong>${landmark}</strong></div>
        <div><span class="text-gray-500">Proposed Tariff:</span> <strong class="text-emerald-700">${formatINR(price)} / night</strong></div>
        <div class="col-span-2"><span class="text-gray-500">Santipur Address:</span> <strong>${address}</strong></div>
        <div><span class="text-gray-500">Manager:</span> <strong>${owner}</strong></div>
        <div><span class="text-gray-500">Phone:</span> <strong>${phone}</strong></div>
      </div>
      <div class="mt-2 pt-2 border-t border-gray-200 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg">
        🔒 Note: Once published, your listing will display with "Tariff on Request" until you verify and activate your pricing in the Owner Admin Portal.
      </div>
    `;
  }

  window.handleOwnerRegistrationSubmit = async function (e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-registration');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Registering Property in Supabase...';
    }

    try {
      const newAcc = await window.SantipurStayEngine.registerAccommodation({
        owner_name: document.getElementById('reg-owner-name')?.value.trim(),
        owner_phone: document.getElementById('reg-owner-phone')?.value.trim(),
        owner_email: document.getElementById('reg-owner-email')?.value.trim(),
        property_name: document.getElementById('reg-property-name')?.value.trim(),
        property_type: document.getElementById('reg-property-type')?.value,
        category: document.getElementById('reg-property-category')?.value,
        landmark_area: document.getElementById('reg-property-landmark')?.value,
        full_address: document.getElementById('reg-property-address')?.value.trim(),
        price_per_night: parseFloat(document.getElementById('reg-price')?.value || '1500'),
        room_size_sqft: parseInt(document.getElementById('reg-size')?.value || '350', 10),
        floor_level: document.getElementById('reg-floor')?.value,
        bed_type: document.getElementById('reg-bed')?.value.trim() || 'Double Bed',
        capacity_adults: parseInt(document.getElementById('reg-adults')?.value || '2', 10),
        capacity_children: parseInt(document.getElementById('reg-children')?.value || '1', 10),
        main_image_url: document.getElementById('reg-image-selector')?.value,
        gallery_urls: [
          document.getElementById('reg-image-selector')?.value,
          '/images/santipur/stays/santipur-stay-room-living.jpg',
          '/images/santipur/stays/santipur-stay-room-bath.jpg',
          '/images/santipur/stays/santipur-stay-breakfast-tray.jpg'
        ],
        amenities: {
          ac: document.getElementById('reg-amenity-ac')?.checked || false,
          wifi: document.getElementById('reg-amenity-wifi')?.checked || false,
          attached_bath: document.getElementById('reg-amenity-bath')?.checked || false,
          tv: document.getElementById('reg-amenity-tv')?.checked || false,
          balcony: document.getElementById('reg-amenity-balcony')?.checked || false,
          breakfast: document.getElementById('reg-amenity-breakfast')?.checked || false
        },
        description: document.getElementById('reg-description')?.value.trim(),
        is_verified: false // Defaults to unverified until verified in Owner Portal!
      });

      alert(`Congratulations! ${newAcc.property_name} has been successfully registered. You can verify your public tariff anytime in the Owner Admin Portal.`);
      
      document.getElementById('owner-registration-form')?.reset();
      window.nextWizardStep(1);

      window.switchPortalTab('browse');
      window.executeStaySearch();
    } catch (err) {
      alert('Failed to register property: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Publish Property to Portal';
      }
    }
  };

  // =========================================================================
  // PILLAR 3: OWNER ADMIN DASHBOARD & VERIFICATION TOGGLE
  // =========================================================================

  window.refreshOwnerDashboard = async function () {
    try {
      const data = await window.SantipurStayEngine.getOwnerDashboardData();
      cachedDashboardBookings = data.bookings;

      document.getElementById('stat-revenue').textContent = formatINR(data.stats.totalRevenue);
      document.getElementById('stat-bookings').textContent = data.stats.totalBookings;
      document.getElementById('stat-rooms').textContent = data.stats.activeAccommodationsCount;
      document.getElementById('stat-occupancy').textContent = `${data.stats.occupancyRate}%`;

      renderDashboardBookings(data.bookings);
      renderDashboardAccommodations(data.accommodations);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  function renderDashboardBookings(bookings) {
    const tbody = document.getElementById('dashboard-bookings-tbody');
    if (!tbody) return;

    if (!bookings || bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-400">No reservations registered yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.map((b) => {
      const statusColor = b.booking_status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
        b.booking_status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
        b.booking_status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200';

      return `
        <tr class="hover:bg-gray-50/80 transition-colors">
          <td class="p-3.5">
            <div class="font-bold text-[#1A1D24]">${b.guest_name}</div>
            <div class="text-[11px] text-gray-500">${b.guest_phone}</div>
          </td>
          <td class="p-3.5">
            <div class="font-bold text-gray-800">${b.property_name}</div>
            <div class="text-[11px] text-[#D94B42]">${b.landmark_area}</div>
          </td>
          <td class="p-3.5">
            <div>${formatDate(b.check_in)} → ${formatDate(b.check_out)}</div>
            <div class="text-[10px] text-gray-400">${b.rooms_count} Room(s), ${b.guests_count} Guest(s)</div>
          </td>
          <td class="p-3.5 font-bold text-emerald-700">
            ${formatINR(b.total_amount)}
          </td>
          <td class="p-3.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase ${b.payment_status === 'advance_paid' ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-700'}">
              ${b.payment_status === 'advance_paid' ? 'Online UPI' : 'Pay at Desk'}
            </span>
          </td>
          <td class="p-3.5">
            <select 
              onchange="window.updateBookingStatusFromDashboard('${b.id}', this.value)" 
              class="text-[11px] font-bold px-2 py-1 rounded-lg border border-gray-200 outline-none ${statusColor}"
            >
              <option value="pending" ${b.booking_status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${b.booking_status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="completed" ${b.booking_status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${b.booking_status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td class="p-3.5 text-right font-mono text-[10px] text-gray-400">
            STAY-${b.id.slice(0, 5)}
          </td>
        </tr>
      `;
    }).join('');
  }

  window.filterDashboardBookings = function (statusFilter) {
    if (statusFilter === 'all') {
      renderDashboardBookings(cachedDashboardBookings);
    } else {
      const filtered = cachedDashboardBookings.filter((b) => b.booking_status === statusFilter);
      renderDashboardBookings(filtered);
    }
  };

  window.updateBookingStatusFromDashboard = async function (bookingId, newStatus) {
    try {
      await window.SantipurStayEngine.updateBookingStatus(bookingId, newStatus);
      window.refreshOwnerDashboard();
    } catch (e) {
      alert('Error updating status: ' + e.message);
    }
  };

  /**
   * Render Room Inventory in Dashboard with Owner Tariff Verification Switch
   */
  function renderDashboardAccommodations(accommodations) {
    const grid = document.getElementById('dashboard-accommodations-grid');
    if (!grid) return;

    grid.innerHTML = accommodations.map((acc) => {
      const isVerified = acc.is_verified === true;
      return `
        <div class="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between gap-3 shadow-2xs">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="font-bold text-xs text-[#1A1D24]">${acc.property_name}</div>
              <div class="text-[11px] text-gray-500">${acc.property_type} • ${acc.landmark_area}</div>
              <div class="text-xs font-bold text-[#D94B42] mt-0.5">${formatINR(acc.price_per_night)} / night</div>
            </div>
            <div>
              <select 
                onchange="window.updateAccommodationStatusFromDashboard('${acc.id}', this.value)" 
                class="text-xs font-bold px-2 py-1 rounded-lg border outline-none ${acc.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : acc.status === 'sold_out' ? 'bg-red-50 text-red-800 border-red-300' : 'bg-gray-100 text-gray-700 border-gray-300'}"
              >
                <option value="active" ${acc.status === 'active' ? 'selected' : ''}>Active (Open)</option>
                <option value="sold_out" ${acc.status === 'sold_out' ? 'selected' : ''}>Sold Out (Festival)</option>
                <option value="inactive" ${acc.status === 'inactive' ? 'selected' : ''}>Inactive (Maintenance)</option>
              </select>
            </div>
          </div>

          <!-- Owner Tariff Verification Switch (Direct control to show / hide prices) -->
          <div class="pt-2.5 border-t border-gray-200 flex items-center justify-between text-xs">
            <span class="text-[11px] font-semibold text-gray-600">Tariff Verification:</span>
            <button 
              type="button" 
              onclick="window.toggleOwnerVerificationFromDashboard('${acc.id}')" 
              class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${isVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'}"
              title="${isVerified ? 'Tariff is verified and visible to public. Click to hide.' : 'Tariff is hidden from public. Click to verify and show.'}"
            >
              <span>${isVerified ? '✓ Verified (Prices Visible)' : '⏳ Unverified (Prices Hidden)'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.updateAccommodationStatusFromDashboard = async function (accId, newStatus) {
    try {
      await window.SantipurStayEngine.updateAccommodationStatus(accId, newStatus);
      window.refreshOwnerDashboard();
    } catch (e) {
      alert('Error updating room status: ' + e.message);
    }
  };

  /**
   * Toggle Owner Verification from Admin Portal
   */
  window.toggleOwnerVerificationFromDashboard = async function (accId) {
    try {
      await window.SantipurStayEngine.toggleAccommodationVerification(accId);
      await window.refreshOwnerDashboard();
      window.executeStaySearch();
    } catch (e) {
      alert('Error updating verification status: ' + e.message);
    }
  };

  // =========================================================================
  // PILLAR NAVIGATION & TAB SWITCHING
  // =========================================================================

  window.switchPortalTab = function (tabName) {
    document.querySelectorAll('.portal-section').forEach((sec) => sec.classList.add('hidden'));

    document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
      btn.className = 'nav-tab-btn px-3 py-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-all cursor-pointer';
    });

    if (tabName === 'browse') {
      document.getElementById('section-browse')?.classList.remove('hidden');
      const btn = document.getElementById('nav-tab-browse');
      if (btn) btn.className = 'nav-tab-btn px-3 py-2 rounded-lg bg-gray-100 text-[#1A1D24] font-bold transition-all';
      window.executeStaySearch();
    } else if (tabName === 'register') {
      document.getElementById('section-register')?.classList.remove('hidden');
      const btn = document.getElementById('nav-tab-register');
      if (btn) btn.className = 'nav-tab-btn px-3 py-2 rounded-lg bg-gray-100 text-[#1A1D24] font-bold transition-all';
    } else if (tabName === 'owner') {
      document.getElementById('section-owner')?.classList.remove('hidden');
      const btn = document.getElementById('nav-tab-owner');
      if (btn) btn.className = 'nav-tab-btn px-3 py-2 rounded-lg bg-gray-100 text-[#1A1D24] font-bold transition-all';
      window.refreshOwnerDashboard();
    }
  };

  // =========================================================================
  // BILINGUAL LANGUAGE SWITCHER (EN / বাংলা)
  // =========================================================================

  window.toggleStayLanguage = function () {
    currentLang = currentLang === 'en' ? 'bn' : 'en';
    const langBtn = document.getElementById('stay-lang-btn');
    if (langBtn) {
      langBtn.textContent = currentLang === 'en' ? 'EN / বাংলা' : 'বাংলা / EN';
    }

    const t = I18N[currentLang];
    const navBrowse = document.getElementById('nav-tab-browse');
    const navReg = document.getElementById('nav-tab-register');
    const navOwner = document.querySelector('#nav-tab-owner span');

    if (navBrowse) navBrowse.textContent = t.browseTab;
    if (navReg) navReg.textContent = t.listTab;
    if (navOwner) navOwner.textContent = t.ownerTab;

    // Update Verification Pop-up modal texts
    const vBadge = document.getElementById('verify-modal-badge');
    const vTitle = document.getElementById('verify-modal-subtitle');
    const vFaqHead = document.querySelector('#verify-modal-faq-heading span:last-child');
    const vFaqDesc1 = document.getElementById('verify-modal-faq-desc1');
    const vFaqDesc2 = document.getElementById('verify-modal-faq-desc2');

    if (vBadge) vBadge.textContent = t.verifyModalBadge;
    if (vTitle) vTitle.textContent = t.verifyModalSubtitle;
    if (vFaqHead) vFaqHead.textContent = t.verifyFaqTitle;
    if (vFaqDesc1) vFaqDesc1.innerHTML = t.verifyFaqDesc1;
    if (vFaqDesc2) vFaqDesc2.textContent = t.verifyFaqDesc2;

    renderAccommodationsGrid(allAccommodations);
  };

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    setupDefaultDates();
    window.executeStaySearch();

    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['browse', 'register', 'owner'].includes(tabParam)) {
      window.switchPortalTab(tabParam);
    }
  });

})(window);
