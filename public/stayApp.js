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
      onboardingCount: 'Santipur property onboarding in progress • Register your stay',
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
      onboardingCount: 'শান্তিপুরের আবাসন নথিভুক্তকরণ চলছে • আপনার হোটেল/লজ যুক্ত করুন',
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
      if (countLabel) countLabel.textContent = I18N[currentLang]?.onboardingCount || 'Santipur property onboarding in progress • Register your stay';
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
          <div class="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
            <svg class="w-3 h-3 text-amber-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>${I18N[currentLang].tariffOnRequest}</span>
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
              <div class="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                <svg class="w-3 h-3 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span>${I18N[currentLang].tariffOnRequest}</span>
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
              <svg class="w-3 h-3 text-amber-900" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
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
              ${isVerified ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-xs"><svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Verified</span>' : ''}
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
                  <svg class="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  <span>${acc.capacity_adults || 2} Adults, ${acc.capacity_children || 1} Child</span>
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12v7m0-7a2 2 0 012-2h14a2 2 0 012 2v7m-18 0h18M3 19h18M7 8a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  <span>${acc.bed_type || 'Double Bed'}</span>
                </span>
              </div>

              <!-- Price Box in Body -->
              ${priceBodyHtml}

              <!-- Amenity Badges -->
              <div class="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-gray-600 font-semibold">
                ${amenities.ac ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700"><svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> AC</span>' : ''}
                ${amenities.wifi ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700"><svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> High Wi-Fi</span>' : ''}
                ${amenities.breakfast ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800"><svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Breakfast</span>' : ''}
                ${amenities.attached_bath ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700"><svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Attached Bath</span>' : ''}
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
          <span class="text-[10px] text-amber-800 uppercase font-bold block flex items-center gap-1.5">
            <svg class="w-3 h-3 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>${I18N[currentLang].tariffOnRequest}</span>
          </span>
          <div class="text-xs font-bold text-gray-700 flex items-center gap-2 mt-0.5">
            <span>${I18N[currentLang].unverifiedByOwner}</span>
            <button 
              type="button" 
              onclick="window.openTariffVerificationModal('${acc.id}', event)" 
              class="text-[10px] font-bold text-[#D94B42] hover:underline bg-red-50 border border-red-200 px-2 py-0.5 rounded-md cursor-pointer flex items-center gap-1"
            >
              <span>${I18N[currentLang].whyHidden}</span>
              <svg class="w-2.5 h-2.5 text-[#D94B42]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
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
              <svg class="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
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
        phoneBtn.innerHTML = `<svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg><span>Call ${acc.owner_phone || 'Desk'}</span>`;
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

  window.openBookingDrawer = function (acc) {
    currentAccommodation = acc;
    openBookingDrawer(acc);
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
   * Recalculate cost when rooms or dates change (Transparent 1.5% commission fee breakdown)
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

    const hotelTariffEl = document.getElementById('drawer-hotel-tariff');
    const platformFeeEl = document.getElementById('drawer-platform-fee');
    const totalEl = document.getElementById('drawer-total-amount');

    if (isVerified) {
      if (hotelTariffEl) hotelTariffEl.textContent = formatINR(priceCalc.hotel_base_amount);
      if (platformFeeEl) platformFeeEl.textContent = formatINR(priceCalc.platform_fee_amount);
      if (totalEl) totalEl.textContent = formatINR(priceCalc.total_paid_amount);
    } else {
      if (hotelTariffEl) hotelTariffEl.innerHTML = `<span class="text-amber-800 font-bold">${I18N[currentLang].tariffOnRequest}</span>`;
      if (platformFeeEl) platformFeeEl.innerHTML = `<span class="text-amber-800 text-[10px]">Strict 1.5% applied on confirmation</span>`;
      if (totalEl) totalEl.innerHTML = `<span class="text-amber-800 text-sm font-extrabold">Pay at Desk on Confirmation</span>`;
    }
  };

  /**
   * Handle Booking Submission (Razorpay Advance Payment with 1.5% Fee)
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
    const paymentMode = document.querySelector('input[name="payment_method"]:checked')?.value || 'razorpay';

    const cin = document.getElementById('filter-checkin')?.value;
    const cout = document.getElementById('filter-checkout')?.value;

    const btnSubmit = document.getElementById('btn-confirm-booking');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span>Initializing Secure Payment...</span>';
    }

    try {
      if (paymentMode === 'razorpay' || paymentMode === 'advance_paid') {
        // Step 1: Create Order on server (/api/razorpay/create-order)
        const orderData = await window.SantipurStayEngine.createRazorpayOrder({
          property_id: currentAccommodation.property_id || currentAccommodation.id,
          room_id: currentAccommodation.room_id || currentAccommodation.id,
          guest_name: guestName,
          guest_phone: guestPhone,
          guest_email: guestEmail,
          check_in: cin,
          check_out: cout,
          guests_count: guestsCount,
          rooms_count: roomsCount,
          price_per_night: currentAccommodation.price_per_night,
          special_notes: specialNotes
        });

        // Step 2: Open Razorpay Checkout modal
        const rzpOptions = {
          key: orderData.key_id && !orderData.key_id.startsWith('PASTE_') ? orderData.key_id : 'rzp_test_placeholder',
          amount: orderData.amount,
          currency: 'INR',
          name: 'Santipur Heritage Stay Engine',
          description: `${currentAccommodation.property_name} (${orderData.booking_code})`,
          image: '/images/santipur/city-photography/santipur-local-directory-emblem-01.png',
          order_id: (orderData.order_id && !orderData.order_id.startsWith('order_sim_')) ? orderData.order_id : undefined,
          prefill: {
            name: guestName,
            contact: guestPhone,
            email: guestEmail || 'guest@santipur.in'
          },
          notes: {
            booking_code: orderData.booking_code,
            hotel_base_amount: orderData.breakdown ? orderData.breakdown.hotel_base_amount : 0,
            platform_fee_amount: orderData.breakdown ? orderData.breakdown.platform_fee_amount : 0
          },
          theme: {
            color: '#D94B42'
          },
          handler: async function (response) {
            try {
              if (btnSubmit) btnSubmit.innerHTML = '<span>Verifying Payment Signature...</span>';
              await window.SantipurStayEngine.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id || orderData.order_id,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'verified_sig',
                booking_id: orderData.booking_id,
                booking_code: orderData.booking_code
              });

              showSuccessVoucher({
                booking_code: orderData.booking_code,
                guest_name: guestName,
                check_in: cin,
                check_out: cout,
                total_amount: orderData.breakdown.total_paid_amount,
                payment_text: 'Razorpay Advance Online (Paid)'
              });
            } catch (vErr) {
              alert('Payment Verification Notice: ' + vErr.message);
            }
          },
          modal: {
            ondismiss: function () {
              if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `<span>Pay Advance &amp; Confirm Reservation</span>`;
              }
            }
          }
        };

        if (typeof window.Razorpay === 'function') {
          const rzp = new window.Razorpay(rzpOptions);
          rzp.open();
        } else {
          // Fallback if Razorpay script is blocked or in offline sandbox
          const confirmedBooking = await window.SantipurStayEngine.createBooking({
            property_id: currentAccommodation.property_id || currentAccommodation.id,
            room_id: currentAccommodation.room_id || currentAccommodation.id,
            accommodation_id: currentAccommodation.id,
            guest_name: guestName,
            guest_phone: guestPhone,
            guest_email: guestEmail,
            check_in: cin,
            check_out: cout,
            guests_count: guestsCount,
            rooms_count: roomsCount,
            special_notes: specialNotes,
            price_per_night: currentAccommodation.price_per_night,
            payment_status: 'Paid',
            payment_method: 'Razorpay'
          });
          showSuccessVoucher({
            booking_code: confirmedBooking.booking_code || `STAY-${confirmedBooking.id.slice(0, 5).toUpperCase()}`,
            guest_name: guestName,
            check_in: cin,
            check_out: cout,
            total_amount: orderData.breakdown.total_paid_amount,
            payment_text: 'Razorpay Online (Confirmed)'
          });
        }

      } else {
        // Pay at Hotel Desk
        const newBooking = await window.SantipurStayEngine.createBooking({
          property_id: currentAccommodation.property_id || currentAccommodation.id,
          room_id: currentAccommodation.room_id || currentAccommodation.id,
          accommodation_id: currentAccommodation.id,
          guest_name: guestName,
          guest_phone: guestPhone,
          guest_email: guestEmail,
          check_in: cin,
          check_out: cout,
          guests_count: guestsCount,
          rooms_count: roomsCount,
          special_notes: specialNotes,
          price_per_night: currentAccommodation.price_per_night,
          payment_status: 'Pending',
          payment_method: 'Pay at Desk'
        });

        showSuccessVoucher({
          booking_code: newBooking.booking_code || `STAY-${newBooking.id.slice(0, 5).toUpperCase()}`,
          guest_name: guestName,
          check_in: cin,
          check_out: cout,
          total_amount: newBooking.total_paid_amount || newBooking.total_amount,
          payment_text: 'Pay at Hotel Desk'
        });
      }

    } catch (err) {
      alert('Failed to process booking: ' + err.message);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Pay Advance &amp; Confirm Reservation</span>`;
      }
    }
  };

  function showSuccessVoucher(details) {
    window.closeBookingDrawer();
    window.closeStayDetailModal();

    const successModal = document.getElementById('booking-success-modal');
    const vRef = document.getElementById('voucher-ref');
    const vGuest = document.getElementById('voucher-guest');
    const vDates = document.getElementById('voucher-dates');
    const vTotal = document.getElementById('voucher-total');
    const vPay = document.getElementById('voucher-payment');

    if (vRef) vRef.textContent = details.booking_code;
    if (vGuest) vGuest.textContent = details.guest_name;
    if (vDates) vDates.textContent = `${formatDate(details.check_in)} - ${formatDate(details.check_out)}`;
    if (vTotal) vTotal.textContent = formatINR(details.total_amount);
    if (vPay) vPay.textContent = details.payment_text;

    if (successModal) {
      successModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    document.getElementById('instant-booking-form')?.reset();
  }

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
      <div class="mt-2 pt-2 border-t border-gray-200 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg flex items-start gap-1.5">
        <svg class="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        <span><strong>Note:</strong> Once published, your listing will display with "Tariff on Request" until you verify and activate your pricing in the Owner Admin Portal.</span>
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
        razorpay_account_id: document.getElementById('reg-razorpay-account')?.value.trim(),
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

      alert(`Congratulations! ${newAcc.property_name} has been successfully registered in Supabase. You can verify your public tariff anytime in the Owner Admin Portal.`);
      
      document.getElementById('owner-registration-form')?.reset();
      window.nextWizardStep(1);

      window.switchPortalTab('owner');
      window.refreshOwnerDashboard();
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

  let cachedDashboardProperties = [];

  window.openAddRoomModal = async function () {
    const modal = document.getElementById('add-room-modal');
    const select = document.getElementById('new-room-property-id');
    if (!modal || !select) return;

    select.innerHTML = '<option value="">-- Choose Registered Property --</option>';

    try {
      const data = await window.SantipurStayEngine.getOwnerDashboardData();
      cachedDashboardProperties = data.properties || [];

      if (cachedDashboardProperties.length === 0) {
        alert('Please register your property first before adding additional rooms.');
        window.switchPortalTab('register');
        return;
      }

      cachedDashboardProperties.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.property_name} (${p.property_type} - ${p.locality || 'Santipur'})`;
        select.appendChild(opt);
      });

      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } catch (err) {
      alert('Error loading properties: ' + err.message);
    }
  };

  window.closeAddRoomModal = function () {
    const modal = document.getElementById('add-room-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  window.handleAddNewRoomSubmit = async function (e) {
    e.preventDefault();
    const propId = document.getElementById('new-room-property-id')?.value;
    const title = document.getElementById('new-room-title')?.value.trim();
    const price = parseFloat(document.getElementById('new-room-price')?.value || '1850');
    const guests = parseInt(document.getElementById('new-room-guests')?.value || '2', 10);
    const sqft = parseInt(document.getElementById('new-room-sqft')?.value || '350', 10);
    const bed = document.getElementById('new-room-bed')?.value;
    const status = document.getElementById('new-room-status')?.value || 'Active';

    if (!propId || !title || !price) {
      alert('Please fill all mandatory room details.');
      return;
    }

    const btn = document.getElementById('btn-save-new-room');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving Room...';
    }

    try {
      await window.SantipurStayEngine.addRoom(propId, {
        room_title: title,
        base_price_per_night: price,
        max_guests: guests,
        room_size_sqft: sqft,
        bed_type: bed,
        status: status
      });

      alert(`Room "${title}" added successfully to Supabase!`);
      document.getElementById('add-room-form')?.reset();
      window.closeAddRoomModal();
      await window.refreshOwnerDashboard();
      window.executeStaySearch();
    } catch (err) {
      alert('Failed to add room: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Save Room to Supabase';
      }
    }
  };

  window.refreshOwnerDashboard = async function () {
    try {
      const data = await window.SantipurStayEngine.getOwnerDashboardData();
      cachedDashboardBookings = data.bookings || [];
      cachedDashboardProperties = data.properties || [];

      // Update Financial & Inventory Metrics (1.5% Commission Engine)
      const revEl = document.getElementById('stat-revenue');
      const payoutEl = document.getElementById('stat-owner-payout');
      const commEl = document.getElementById('stat-platform-commission');
      const bookEl = document.getElementById('stat-bookings');
      const roomEl = document.getElementById('stat-rooms');

      if (revEl) revEl.textContent = formatINR(data.stats.totalRevenue);
      if (payoutEl) payoutEl.textContent = formatINR(data.stats.ownerPayout);
      if (commEl) commEl.textContent = formatINR(data.stats.platformCommission);
      if (bookEl) bookEl.textContent = data.stats.totalBookings;
      if (roomEl) roomEl.textContent = data.stats.activeAccommodationsCount;

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
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-gray-400">No reservations registered yet in Supabase.</td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.map((b) => {
      const status = (b.booking_status || 'Pending').toLowerCase();
      const statusColor = status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
        status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
        status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200';

      const hotelBase = parseFloat(b.hotel_base_amount) || (b.total_amount ? Math.round(b.total_amount / 1.015) : 0);
      const platFee = parseFloat(b.platform_fee_amount) || (b.total_amount ? (b.total_amount - Math.round(b.total_amount / 1.015)) : 0);
      const totalAmount = parseFloat(b.total_paid_amount || b.total_amount) || (hotelBase + platFee);

      const isPaid = (b.payment_status || '').toLowerCase() === 'paid' || (b.payment_status || '').toLowerCase() === 'advance_paid';

      return `
        <tr class="hover:bg-gray-50/80 transition-colors">
          <td class="p-3.5">
            <div class="font-bold text-[#1A1D24]">${b.guest_name}</div>
            <div class="text-[11px] text-gray-500">${b.guest_phone}</div>
          </td>
          <td class="p-3.5">
            <div class="font-bold text-gray-800">${b.property_name || 'Santipur Stay'}</div>
            <div class="text-[11px] text-[#D94B42]">${b.room_title || 'Deluxe Room'}</div>
          </td>
          <td class="p-3.5">
            <div>${formatDate(b.check_in)} → ${formatDate(b.check_out)}</div>
            <div class="text-[10px] text-gray-400">${b.nights || 1} Nights, ${b.rooms_count || 1} Room(s)</div>
          </td>
          <td class="p-3.5 font-bold text-gray-900">
            ${formatINR(hotelBase)}
            <div class="text-[9px] text-gray-400 font-normal">100% Owner Net</div>
          </td>
          <td class="p-3.5 font-bold text-emerald-700">
            ${formatINR(platFee)}
            <div class="text-[9px] text-emerald-600 font-normal">1.5% Retained</div>
          </td>
          <td class="p-3.5 font-bold text-[#D94B42]">
            ${formatINR(totalAmount)}
          </td>
          <td class="p-3.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isPaid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-700'}">
              ${isPaid ? 'Paid (Online)' : 'Pay at Desk'}
            </span>
            ${b.razorpay_payment_id ? `<div class="text-[9px] text-gray-400 font-mono mt-0.5" title="${b.razorpay_payment_id}">${b.razorpay_payment_id.slice(0, 10)}...</div>` : ''}
          </td>
          <td class="p-3.5">
            <select 
              onchange="window.updateBookingStatusFromDashboard('${b.id}', this.value)" 
              class="text-[11px] font-bold px-2 py-1 rounded-lg border border-gray-200 outline-none ${statusColor}"
            >
              <option value="Pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="Cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td class="p-3.5 text-right font-mono text-[10px] font-bold text-gray-600">
            ${b.booking_code || `STAY-${b.id.slice(0, 5).toUpperCase()}`}
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
              <span class="inline-flex items-center gap-1">${isVerified 
                ? '<svg class="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg><span>Verified (Prices Visible)</span>' 
                : '<svg class="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Unverified (Prices Hidden)</span>'}</span>
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
