/**
 * Santipur Hotels & Guest Houses Directory (শান্তিপুরের অতিথি নিবাস ও লজ ডিরেক্টরি)
 * Target: Santipur, Nadia, West Bengal (PIN: 741404)
 * Features:
 * - 15 Geocoded Santipur Lodges with exact Lat/Lng & Plus Codes
 * - Live Leaflet.js / OpenStreetMap Interactive Multi-Pin Map
 * - One-Tap Turn-by-Turn GPS Navigation via Google Maps
 * - "Near Me" GPS Distance Calculator using Haversine formula & Nearest-First Sort
 * - 1-Click Coordinate & Plus Code Copy to Clipboard
 * - Dual/Direct Phone Call Action Bar
 * - Community "Add a Lodge" Submission Modal
 * - Full Bilingual Support (English / বাংলা)
 * - Information Compilation & Special Courtesy: Adrip Goswami (লেখা - Adrip Goswami)
 */

(function (window) {
  'use strict';

  // State Management
  let lodgesList = [];
  let userCoords = null; // { lat, lng }
  let currentLocality = 'all';
  let searchQuery = '';
  let currentSort = 'recommended';
  let currentLang = 'en'; // 'en' | 'bn'
  let leafletMap = null;
  let markersLayer = null;
  let userMarker = null;
  let lodgeMarkersMap = {}; // { lodgeId: marker }
  let isMapExpanded = true;

  // Bilingual Dictionary for Lodges Directory
  const DICT = {
    en: {
      badge: 'Santipur Pilgrimage & Heritage Stay Directory',
      heading: 'Santipur Hotels & Guest Houses Directory',
      subheading: 'Verified accommodations for Kali Puja, Jagaddhatri Puja, and Santipur Rash Yatra pilgrims and visitors. View exact coordinates and launch one-tap GPS navigation.',
      searchPlaceholder: 'Search lodge by name, street, area...',
      allAreas: 'All Santipur Localities (741404)',
      areaStation: 'Station Road',
      areaMotiganj: 'Motiganj / Municipality Area',
      areaTown: 'Santipur Town / Central',
      areaAdwaita: 'Adwaita Sarak / Agameswaritala',
      areaSutragarh: 'Sutragarh / Tant Haat',
      areaDabrepara: 'Dabrepara / C.R. Das Road',
      nearMeBtn: 'Distance from My Location',
      nearMeActive: 'GPS Distance Active',
      nearMeLocating: 'Detecting GPS...',
      sortLabel: 'Sort by:',
      sortRecommended: 'Recommended & Verified',
      sortNearest: 'Nearest First (GPS)',
      sortName: 'Alphabetical (A - Z)',
      addLodgeBtn: '+ Add a Lodge',
      verifiedTag: 'Verified Santipur Lodge',
      callNow: 'Call',
      callDesk: 'Call Reception',
      navigateNow: 'Start Navigation',
      viewOnMap: 'View on Map',
      copyCoords: 'Copy Pin',
      copied: 'Copied!',
      away: 'away',
      km: 'km',
      noResultsTitle: 'No Lodges Found Matching Your Filter',
      noResultsDesc: 'Try adjusting your search terms or locality filter to see all 15 verified Santipur lodges.',
      resetFilters: 'Reset All Filters',
      mapHeader: 'Interactive Map of Santipur Lodges (PIN: 741404)',
      toggleMapHide: 'Hide Map',
      toggleMapShow: 'Show Map',
      recenterMap: 'Recenter Map',
      userLocationPopup: '<b>Your Current Location</b><br>আমার অবস্থান',
      attributionTitle: 'Information Compilation & Special Courtesy',
      attributionText: 'Information compilation & courtesy: Adrip Goswami (লেখা - Adrip Goswami)',
      attributionNote: 'Coordinates, contact details, and locations verified for Santipur Rash Yatra, Kali Puja, and pilgrims visiting historical Vaishnava patabaris.',
      modalTitle: 'Submit a Santipur Lodge / Guest House',
      modalSubtitle: 'Help visitors find authentic accommodations across Santipur (PIN: 741404)',
      modalPropName: 'Property / Lodge Name *',
      modalLocality: 'Santipur Locality / Landmark *',
      modalAddress: 'Full Street Address (PIN: 741404) *',
      modalContactPerson: 'Contact Person / Manager Name',
      modalPhone: 'Contact Phone Number(s) *',
      modalType: 'Property Category',
      modalNotes: 'Facilities / Amenities (AC, Wi-Fi, Attached Bath, etc.)',
      modalCancel: 'Cancel',
      modalSubmit: 'Submit Listing for Verification',
      modalSuccess: 'Thank you! Your lodge details have been submitted for community review and will be verified shortly.'
    },
    bn: {
      badge: 'শান্তিপুর তীর্থ ও ঐতিহ্যবাহী আবাসন ডিরেক্টরি',
      heading: 'শান্তিপুরের অতিথি নিবাস ও লজ ডিরেক্টরি',
      subheading: 'শান্তিপুরের ঐতিহাসিক রাস উৎসব, দীপান্বিতা কালীপূজা ও জগদ্ধাত্রী পূজায় আগত পুণ্যার্থী ও পর্যটকদের সুবিধার্থে সমস্ত নির্ভরযোগ্য অতিথি নিবাসের ফোন নম্বর, সঠিক অবস্থান ও লাইভ জিপিএস নেভিগেশন।',
      searchPlaceholder: 'লজের নাম, রাস্তা বা এলাকা দিয়ে খুঁজুন...',
      allAreas: 'সকল শান্তিপুর এলাকা (৭৪১৪০৪)',
      areaStation: 'স্টেশন রোড',
      areaMotiganj: 'মতিগঞ্জ / পৌরসভা এলাকা',
      areaTown: 'মধ্য শান্তিপুর / টাউন',
      areaAdwaita: 'অদ্বৈত সরণি / আগমেশ্বরীতলা',
      areaSutragarh: 'সূত্রাগড় / শান্তিপুরী তাঁত হাট',
      areaDabrepara: 'ডাবরেপাড়া / সি.আর. দাশ রোড',
      nearMeBtn: 'আমার অবস্থান থেকে দূরত্ব',
      nearMeActive: 'জিপিএস দূরত্ব সক্রিয়',
      nearMeLocating: 'অবস্থান নির্ণয় হচ্ছে...',
      sortLabel: 'ক্রমানুসার:',
      sortRecommended: 'সুপারিশকৃত ও যাচাইকৃত',
      sortNearest: 'কাছাকাছি আগে (জিপিএস)',
      sortName: 'নামানুসারে (ক - হ)',
      addLodgeBtn: '+ লজ যুক্ত করুন',
      verifiedTag: 'যাচাইকৃত শান্তিপুরের লজ',
      callNow: 'ফোন করুন',
      callDesk: 'অভ্যর্থনা ডেস্কে কল',
      navigateNow: 'দিকনির্দেশ পান',
      viewOnMap: 'ম্যাপে দেখুন',
      copyCoords: 'পিন কপি',
      copied: 'কপি হয়েছে!',
      away: 'দূরে',
      km: 'কিমি',
      noResultsTitle: 'কোনো লজের তথ্য পাওয়া যায়নি',
      noResultsDesc: 'অন্য কোনো নাম বা এলাকা নির্বাচন করে পুনরায় চেষ্টা করুন। শান্তিপুরের মোট ১৫টি যাচাইকৃত লজ সংরক্ষিত রয়েছে।',
      resetFilters: 'সব ফিল্টার মুছুন',
      mapHeader: 'শান্তিপুরের লজসমূহের ইন্টার‍্যাক্টিভ মানচিত্র (৭৪১৪০৪)',
      toggleMapHide: 'ম্যাপ লুকান',
      toggleMapShow: 'ম্যাপ দেখুন',
      recenterMap: 'ম্যাপ রিকেন্দ্রীকরণ',
      userLocationPopup: '<b>আপনার বর্তমান অবস্থান</b>',
      attributionTitle: 'তথ্য সংকলন ও বিশেষ কৃতজ্ঞতা',
      attributionText: 'তথ্য সংকলন ও কৃতজ্ঞতা: Adrip Goswami (লেখা - Adrip Goswami)',
      attributionNote: 'শান্তিপুরের ঐতিহ্যবাহী রাস উৎসব, কালীপূজা ও অদ্বৈত প্রভুর পুণ্যতীর্থ পরিক্রমায় আগত দর্শনার্থীদের সুবিধার্থে তথ্যসমূহ সংকলিত।',
      modalTitle: 'শান্তিপুরের কোনো লজ বা অতিথি নিবাস যুক্ত করুন',
      modalSubtitle: 'শান্তিপুরের পর্যটক ও তীর্থযাত্রীদের সঠিক আশ্রয়ের তথ্য পৌঁছে দিতে সহযোগিতা করুন',
      modalPropName: 'লজ / অতিথি নিবাসের নাম *',
      modalLocality: 'শান্তিপুরের এলাকা / ল্যান্ডমার্ক *',
      modalAddress: 'সম্পূর্ণ ঠিকানা (পিন: ৭৪১৪০৪) *',
      modalContactPerson: 'মালিক / পরিচালকের নাম',
      modalPhone: 'মোবাইল / যোগাযোগের নম্বর *',
      modalType: 'আবাসনের ধরন',
      modalNotes: 'উপলব্ধ সুযোগ-সুবিধা (শীতাতপ নিয়ন্ত্রিত, ওয়াইফাই, সংযুক্ত বাথ ইত্যাদি)',
      modalCancel: 'বাতিল করুন',
      modalSubmit: 'যাচাইকরণের জন্য জমা দিন',
      modalSuccess: 'ধন্যবাদ! আপনার প্রস্তাবিত লজের তথ্য সফলভাবে জমা হয়েছে। স্থানীয় যাচাইকরণ শেষে এটি যুক্ত করা হবে।'
    }
  };

  /**
   * Haversine formula to compute geodesic distance between two points in kilometers
   */
  function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 10) / 10; // 1 decimal place
  }

  /**
   * Convert Latin numbers to Bengali digits
   */
  function toBengaliDigits(num) {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, function (w) {
      return bnNums[+w];
    });
  }

  /**
   * Generate universal Google Maps Turn-by-Turn Navigation URL
   */
  function getGoogleMapsNavigationUrl(lat, lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  }

  /**
   * Toast Notification Helper
   */
  function showToast(message, type = 'info') {
    const existing = document.getElementById('lodge-toast-container');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'lodge-toast-container';
    toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all transform animate-bounce flex items-center gap-2 ${
      type === 'success' ? 'bg-emerald-800 text-white' : type === 'error' ? 'bg-red-800 text-white' : 'bg-[#1A1D24] text-white'
    }`;
    toast.innerHTML = `
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="${type === 'success' ? 'M5 13l4 4L19 7' : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  /**
   * Initialize Leaflet Interactive Multi-Pin Map
   */
  function initLeafletMap() {
    const mapContainer = document.getElementById('lodges-leaflet-map');
    if (!mapContainer || leafletMap) return;

    if (typeof L === 'undefined') {
      console.warn('Leaflet library (L) is not loaded yet.');
      return;
    }

    // Centered around central Santipur Municipality (approx 23.2450, 88.4340)
    leafletMap = L.map('lodges-leaflet-map', {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView([23.2450, 88.4340], 14);

    // OpenStreetMap standard tile layer with proper attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | Santipur Heritage'
    }).addTo(leafletMap);

    markersLayer = L.layerGroup().addTo(leafletMap);

    // Populate markers
    updateMapMarkers();
  }

  /**
   * Create custom terracotta pin marker icon for Santipur Lodges
   */
  function createLodgeMarkerIcon(lodgeName) {
    return L.divIcon({
      className: 'custom-lodge-pin-icon',
      html: `
        <div class="relative group cursor-pointer" title="${lodgeName}">
          <div class="w-8 h-8 rounded-full bg-[#D94B42] text-white flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-125">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#D94B42] rotate-45 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [32, 38],
      iconAnchor: [16, 38],
      popupAnchor: [0, -38]
    });
  }

  /**
   * Update map markers based on filtered lodges
   */
  function updateMapMarkers() {
    if (!leafletMap || !markersLayer) return;

    markersLayer.clearLayers();
    lodgeMarkersMap = {};

    const filtered = getFilteredLodges();
    const bounds = L.latLngBounds();

    filtered.forEach((lodge) => {
      const isBn = currentLang === 'bn';
      const name = isBn ? (lodge.nameBengali || lodge.nameBn || lodge.name) : (lodge.nameEnglish || lodge.name);
      const area = isBn ? (lodge.areaTagBn || lodge.areaTag) : lodge.areaTag;
      const primaryPhone = (lodge.phones && lodge.phones[0]) || (lodge.contacts && lodge.contacts[0] && lodge.contacts[0].phone) || '';
      const addressText = isBn ? (lodge.verifiedAddressBn || lodge.address || lodge.verifiedAddress) : (lodge.address || lodge.verifiedAddress);
      const navUrl = getGoogleMapsNavigationUrl(lodge.lat, lodge.lng);
      const imgPath = `/assets/images/lodges/${lodge.imageKey}`;

      const popupHtml = `
        <div class="p-0 overflow-hidden font-sans text-left max-w-[280px]">
          <div class="relative w-full h-28 bg-gray-100 overflow-hidden">
            <img src="${imgPath}" alt="${name}" class="w-full h-full object-cover" onerror="this.src='/assets/images/lodges/default-lodge.jpg'" />
            <div class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1A1D24]/85 backdrop-blur-xs text-[10px] font-bold text-white">
              ${lodge.category || 'Lodge'}
            </div>
            <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-700 text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span>${isBn ? 'যাচাইকৃত' : 'Verified'}</span>
            </div>
          </div>
          <div class="p-3">
            <div class="font-extrabold text-xs text-[#1A1D24] leading-tight">${name}</div>
            <div class="text-[11px] text-[#D94B42] font-semibold mt-0.5">${area}</div>
            <div class="text-[10px] text-gray-500 mt-1 line-clamp-2">${addressText}</div>
            
            <div class="mt-3 flex items-center gap-2">
              ${primaryPhone ? `
                <a href="tel:${primaryPhone.replace(/[^0-9+]/g, '')}" class="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-[#1A1D24] rounded-lg text-center text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                  <svg class="w-3 h-3 text-[#1A1D24]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <span>${isBn ? 'কল' : 'Call'}</span>
                </a>
              ` : ''}
              <a href="${navUrl}" target="_blank" rel="noopener noreferrer" class="nav-btn flex-1 py-1.5 px-2 bg-[#D94B42] hover:bg-[#B53830] text-white rounded-lg text-center text-[11px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                <span>${isBn ? 'দিকনির্দেশ পান' : 'Start Navigation'}</span>
              </a>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([lodge.lat, lodge.lng], {
        icon: createLodgeMarkerIcon(name),
        title: name
      }).bindPopup(popupHtml, {
        maxWidth: 300,
        className: 'lodge-map-custom-popup'
      });

      marker.addTo(markersLayer);
      lodgeMarkersMap[lodge.id] = marker;
      bounds.extend([lodge.lat, lodge.lng]);
    });

    if (userCoords) {
      bounds.extend([userCoords.lat, userCoords.lng]);
    }

    if (filtered.length > 0) {
      leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }

  /**
   * Filter & Sort Lodges
   */
  function getFilteredLodges() {
    let list = [...lodgesList];

    // Locality Filter
    if (currentLocality && currentLocality !== 'all') {
      list = list.filter((l) => {
        const area = (l.areaTag || '').toLowerCase();
        const address = (l.verifiedAddress || '').toLowerCase();
        const target = currentLocality.toLowerCase();

        if (target === 'station') {
          return area.includes('station') || address.includes('station');
        } else if (target === 'motiganj') {
          return area.includes('motiganj') || area.includes('municipality') || address.includes('motiganj') || address.includes('roy road');
        } else if (target === 'town') {
          return area.includes('town') || area.includes('central') || area.includes('m.g') || address.includes('town');
        } else if (target === 'adwaita') {
          return area.includes('adwaita') || area.includes('agameswari') || address.includes('adwaita') || address.includes('nh-12');
        } else if (target === 'sutragarh') {
          return area.includes('sutragarh') || area.includes('tant') || address.includes('sutragarh');
        } else if (target === 'dabrepara') {
          return area.includes('dabrepara') || area.includes('c.r. das') || area.includes('b.k. goswami') || address.includes('dabrepara');
        }
        return true;
      });
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((l) => {
        const nameEn = (l.nameEnglish || l.name || '').toLowerCase();
        const nameBn = (l.nameBengali || l.nameBn || '');
        const areaEn = (l.areaTag || '').toLowerCase();
        const areaBn = (l.areaTagBn || '');
        const addrEn = (l.address || l.verifiedAddress || '').toLowerCase();
        const addrBn = (l.verifiedAddressBn || '');
        const phones = (l.phones || (l.contacts ? l.contacts.map((c) => c.phone) : []));
        const contacts = (l.contacts ? l.contacts.map((c) => c.name) : (l.contactPersons || []));
        return (
          nameEn.includes(q) ||
          nameBn.includes(q) ||
          areaEn.includes(q) ||
          areaBn.includes(q) ||
          addrEn.includes(q) ||
          addrBn.includes(q) ||
          phones.some((p) => p && p.includes(q)) ||
          contacts.some((c) => c && c.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    if (currentSort === 'nearest' && userCoords) {
      list.sort((a, b) => {
        const distA = a.distanceKm !== undefined ? a.distanceKm : 9999;
        const distB = b.distanceKm !== undefined ? b.distanceKm : 9999;
        return distA - distB;
      });
    } else if (currentSort === 'name_asc') {
      list.sort((a, b) => {
        const nameA = currentLang === 'bn' ? (a.nameBn || a.name) : a.name;
        const nameB = currentLang === 'bn' ? (b.nameBn || b.name) : b.name;
        return nameA.localeCompare(nameB);
      });
    }

    return list;
  }

  /**
   * Render the 15 Verified Lodge Cards Grid
   */
  function renderLodgesGrid() {
    const grid = document.getElementById('verified-lodges-grid');
    const countLabel = document.getElementById('lodges-count-badge');
    const emptyState = document.getElementById('lodges-empty-state');
    if (!grid) return;

    const filtered = getFilteredLodges();
    const t = DICT[currentLang];
    const isBn = currentLang === 'bn';

    if (countLabel) {
      const countStr = isBn ? toBengaliDigits(filtered.length) : filtered.length;
      countLabel.textContent = isBn ? `${countStr} টি যাচাইকৃত লজ` : `${countStr} Verified Lodges`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
    }

    grid.innerHTML = filtered.map((lodge) => {
      const name = isBn ? (lodge.nameBengali || lodge.nameBn || lodge.name) : (lodge.nameEnglish || lodge.name);
      const subName = isBn ? (lodge.nameEnglish || lodge.name) : (lodge.nameBengali || lodge.nameBn || '');
      const area = isBn ? (lodge.areaTagBn || lodge.areaTag) : lodge.areaTag;
      const address = isBn ? (lodge.verifiedAddressBn || lodge.address || lodge.verifiedAddress) : (lodge.address || lodge.verifiedAddress);
      const category = isBn ? (lodge.categoryBn || lodge.category || 'লজ') : (lodge.category || 'Lodge');
      const navUrl = getGoogleMapsNavigationUrl(lodge.lat, lodge.lng);
      const imgPath = `/assets/images/lodges/${lodge.imageKey}`;

      // Contacts & Phones
      let phones = lodge.phones || [];
      if (phones.length === 0 && lodge.contacts && Array.isArray(lodge.contacts)) {
        phones = lodge.contacts.map((c) => c.phone).filter(Boolean);
      }
      let contactPersons = isBn ? (lodge.contactPersonsBn || lodge.contactPersons || []) : (lodge.contactPersons || []);
      if (contactPersons.length === 0 && lodge.contacts && Array.isArray(lodge.contacts)) {
        contactPersons = lodge.contacts.map((c) => c.name).filter(Boolean);
      }
      const primaryContact = contactPersons.length > 0 ? contactPersons.join(', ') : (isBn ? 'রিসেপশন' : 'Reception');

      // Distance
      let distanceBadge = '';
      if (lodge.distanceKm !== undefined) {
        const distStr = isBn ? toBengaliDigits(lodge.distanceKm) : lodge.distanceKm;
        distanceBadge = `
          <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${distStr} ${t.km} ${t.away}</span>
          </div>
        `;
      }

      // Dual / Phone action buttons
      let phoneButtonsHtml = '';
      if (phones.length === 1) {
        const cleanPhone = phones[0].replace(/[^0-9+]/g, '');
        phoneButtonsHtml = `
          <a href="tel:${cleanPhone}" class="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1A1D24] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs">
            <svg class="w-3.5 h-3.5 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            <span>${phones[0]}</span>
          </a>
        `;
      } else if (phones.length >= 2) {
        phoneButtonsHtml = `
          <div class="grid grid-cols-2 gap-2 w-full">
            <a href="tel:${phones[0].replace(/[^0-9+]/g, '')}" class="py-2 px-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1A1D24] text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs truncate" title="${contactPersons[0] ? contactPersons[0] + ': ' : ''}${phones[0]}">
              <svg class="w-3 h-3 text-[#D94B42] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              <span class="truncate">${phones[0]}</span>
            </a>
            <a href="tel:${phones[1].replace(/[^0-9+]/g, '')}" class="py-2 px-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1A1D24] text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs truncate" title="${contactPersons[1] ? contactPersons[1] + ': ' : ''}${phones[1]}">
              <svg class="w-3 h-3 text-[#D94B42] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              <span class="truncate">${phones[1]}</span>
            </a>
          </div>
        `;
      }

      return `
        <article class="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group" id="lodge-card-${lodge.id}">
          
          <!-- Image Container (Strict 16:9 Aspect Ratio) -->
          <div class="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
            <img 
              src="${imgPath}" 
              alt="${name}" 
              loading="lazy" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              onerror="this.src='/assets/images/lodges/default-lodge.jpg'" 
            />
            
            <!-- Category & Area Overlay -->
            <div class="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-[#1A1D24] shadow-sm backdrop-blur-xs">
                ${category}
              </span>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1A1D24]/80 text-white shadow-sm backdrop-blur-xs">
                ${area}
              </span>
            </div>

            <!-- Verified Badge Overlay -->
            <div class="absolute top-3 right-3 z-10">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-700/90 text-white shadow-sm backdrop-blur-xs border border-emerald-400/40">
                <svg class="w-3 h-3 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                <span>${t.verifiedTag}</span>
              </span>
            </div>

            <!-- Gradient Shade for Text Legibility -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            <!-- Bottom Image Bar: Distance or Plus Code -->
            <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold z-10">
              <span class="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs">
                ${lodge.plusCode ? 'Plus Code: ' + lodge.plusCode : 'Santipur 741404'}
              </span>
              ${distanceBadge ? distanceBadge : ''}
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            
            <div>
              <!-- Titles -->
              <h3 class="text-base sm:text-lg font-black text-[#1A1D24] tracking-tight group-hover:text-[#D94B42] transition-colors leading-snug">
                ${name}
              </h3>
              ${subName ? `<div class="text-xs font-semibold text-gray-500 mt-0.5">${subName}</div>` : ''}

              <!-- Address with Map Pin -->
              <div class="mt-2.5 flex items-start gap-1.5 text-xs text-gray-600 leading-relaxed">
                <svg class="w-4 h-4 text-[#D94B42] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>${address}</span>
              </div>

              <!-- Coordinates Chip with 1-Click Copy -->
              <div class="mt-3 flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200/80 text-[11px] text-gray-700">
                <div class="flex items-center gap-1 font-mono text-[10px] text-gray-600 truncate">
                  <svg class="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                  <span class="truncate">${lodge.lat.toFixed(4)}° N, ${lodge.lng.toFixed(4)}° E</span>
                </div>
                <button 
                  type="button" 
                  onclick="window.copyLodgeCoordinates('${lodge.lat}', '${lodge.lng}', this)" 
                  class="ml-2 px-2 py-0.5 rounded-lg bg-white border border-gray-200 hover:border-[#D94B42] text-[10px] font-bold text-gray-700 hover:text-[#D94B42] transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Copy Lat/Lng to clipboard"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  <span>${t.copyCoords}</span>
                </button>
              </div>

              <!-- Contact Person Notice -->
              <div class="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <span>${isBn ? 'দায়িত্বপ্রাপ্ত' : 'Contact'}: <strong>${primaryContact}</strong></span>
              </div>
            </div>

            <!-- Phone Call Action Bar -->
            <div class="pt-1 border-t border-gray-100">
              ${phoneButtonsHtml}
            </div>

            <!-- Card Primary Action Footer -->
            <div class="grid grid-cols-2 gap-2 pt-1">
              <!-- Start Google Maps Navigation Button -->
              <a 
                href="${navUrl}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="nav-btn py-2.5 px-3 rounded-xl bg-[#D94B42] hover:bg-[#B53830] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                title="Launch turn-by-turn driving directions in Google Maps"
              >
                <svg class="w-3.5 h-3.5 text-white transform group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                <span>${t.navigateNow}</span>
              </a>

              <!-- Focus on Leaflet Map Button -->
              <button 
                type="button" 
                onclick="window.focusLodgeOnMap('${lodge.id}')" 
                class="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                <span>${t.viewOnMap}</span>
              </button>
            </div>

          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * Copy Coordinates to Clipboard with user feedback
   */
  window.copyLodgeCoordinates = function (lat, lng, btnEl) {
    const text = `${lat}, ${lng}`;
    const t = DICT[currentLang];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        const origHtml = btnEl.innerHTML;
        btnEl.innerHTML = `<span class="text-emerald-600 font-extrabold flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> ${t.copied}</span>`;
        btnEl.classList.add('border-emerald-500');
        setTimeout(() => {
          btnEl.innerHTML = origHtml;
          btnEl.classList.remove('border-emerald-500');
        }, 1800);
      }).catch(() => {
        showToast(`Coordinates: ${text}`);
      });
    } else {
      showToast(`Coordinates: ${text}`);
    }
  };

  /**
   * Scroll and Focus a Lodge on Leaflet Map
   */
  window.focusLodgeOnMap = function (lodgeId) {
    const mapSection = document.getElementById('lodges-map-container');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!leafletMap) {
      initLeafletMap();
    }

    const lodge = lodgesList.find((l) => l.id === lodgeId);
    if (!lodge) return;

    if (leafletMap) {
      leafletMap.flyTo([lodge.lat, lodge.lng], 17, {
        animate: true,
        duration: 1.2
      });

      const marker = lodgeMarkersMap[lodgeId];
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 800);
      }
    }
  };

  /**
   * Toggle Map Visibility (Collapse / Expand)
   */
  window.toggleLodgesMap = function () {
    const mapWrapper = document.getElementById('lodges-map-wrapper');
    const toggleBtn = document.getElementById('toggle-map-btn');
    const t = DICT[currentLang];

    isMapExpanded = !isMapExpanded;
    if (mapWrapper) {
      if (isMapExpanded) {
        mapWrapper.classList.remove('hidden');
        if (toggleBtn) toggleBtn.innerHTML = `<span>${t.toggleMapHide}</span>`;
        if (leafletMap) {
          setTimeout(() => leafletMap.invalidateSize(), 200);
        }
      } else {
        mapWrapper.classList.add('hidden');
        if (toggleBtn) toggleBtn.innerHTML = `<span>${t.toggleMapShow}</span>`;
      }
    }
  };

  /**
   * Recenter Map to encompass all pins
   */
  window.recenterLodgesMap = function () {
    if (!leafletMap) return;
    const filtered = getFilteredLodges();
    const bounds = L.latLngBounds();
    filtered.forEach((l) => bounds.extend([l.lat, l.lng]));
    if (userCoords) bounds.extend([userCoords.lat, userCoords.lng]);
    if (bounds.isValid()) {
      leafletMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  };

  /**
   * "Distance from My Location" Geolocation Activation
   */
  window.activateLodgeGeolocation = function () {
    const btn = document.getElementById('lodge-near-me-btn');
    const t = DICT[currentLang];

    if (!navigator.geolocation) {
      showToast(currentLang === 'bn' ? 'আপনার ব্রাউজারে জিপিএস সুবিধা সমর্থিত নয়' : 'Geolocation is not supported by your browser', 'error');
      return;
    }

    if (btn) {
      btn.innerHTML = `
        <svg class="w-4 h-4 animate-spin text-[#D94B42]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>${t.nearMeLocating}</span>
      `;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        // Compute distances for all lodges
        lodgesList.forEach((lodge) => {
          lodge.distanceKm = calculateHaversineDistance(userCoords.lat, userCoords.lng, lodge.lat, lodge.lng);
        });

        // Set sort to 'nearest'
        currentSort = 'nearest';
        const sortSelect = document.getElementById('lodge-sort-select');
        if (sortSelect) sortSelect.value = 'nearest';

        // Update button appearance
        if (btn) {
          btn.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-blue-600 text-white shadow-md';
          btn.innerHTML = `
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            <span>${t.nearMeActive}</span>
          `;
        }

        // Add User Location Pin to Leaflet Map
        if (leafletMap) {
          if (userMarker) leafletMap.removeLayer(userMarker);
          userMarker = L.circleMarker([userCoords.lat, userCoords.lng], {
            radius: 9,
            fillColor: '#2563EB',
            color: '#FFFFFF',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9
          }).addTo(leafletMap);
          userMarker.bindPopup(t.userLocationPopup);
        }

        renderLodgesGrid();
        updateMapMarkers();
        showToast(currentLang === 'bn' ? 'অবস্থান সনাক্ত হয়েছে! নিকটবর্তী লজ আগে সাজানো হলো।' : 'GPS location found! Lodges sorted by nearest first.', 'success');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        if (btn) {
          btn.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200';
          btn.innerHTML = `
            <svg class="w-4 h-4 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${t.nearMeBtn}</span>
          `;
        }
        showToast(currentLang === 'bn' ? 'অবস্থান নির্ণয় করা সম্ভব হয়নি। অনুগ্রহ করে জিপিএস পারমিশন চালু করুন।' : 'Could not retrieve GPS location. Please check browser permissions.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  /**
   * Reset All Directory Filters
   */
  window.resetLodgesFilters = function () {
    searchQuery = '';
    currentLocality = 'all';
    currentSort = 'recommended';

    const searchInput = document.getElementById('lodge-search-input');
    const localitySelect = document.getElementById('lodge-locality-select');
    const sortSelect = document.getElementById('lodge-sort-select');

    if (searchInput) searchInput.value = '';
    if (localitySelect) localitySelect.value = 'all';
    if (sortSelect) sortSelect.value = 'recommended';

    renderLodgesGrid();
    updateMapMarkers();
  };

  /**
   * Search Input Handler
   */
  window.handleLodgeSearch = function (value) {
    searchQuery = value;
    renderLodgesGrid();
    updateMapMarkers();
  };

  /**
   * Locality Select Handler
   */
  window.handleLocalityFilter = function (value) {
    currentLocality = value;
    renderLodgesGrid();
    updateMapMarkers();
  };

  /**
   * Sort Select Handler
   */
  window.handleSortChange = function (value) {
    currentSort = value;
    renderLodgesGrid();
    updateMapMarkers();
  };

  /**
   * Community Modal Open / Close
   */
  window.openCommunityLodgeModal = function () {
    const modal = document.getElementById('community-lodge-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  };

  window.closeCommunityLodgeModal = function () {
    const modal = document.getElementById('community-lodge-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  };

  /**
   * Handle Community Lodge Form Submission
   */
  window.handleCommunityLodgeSubmit = function (e) {
    e.preventDefault();
    const form = e.target;
    const t = DICT[currentLang];

    const propName = document.getElementById('comm-prop-name')?.value;
    const locality = document.getElementById('comm-locality')?.value;
    const address = document.getElementById('comm-address')?.value;
    const manager = document.getElementById('comm-manager')?.value;
    const phone = document.getElementById('comm-phone')?.value;
    const propType = document.getElementById('comm-type')?.value;
    const notes = document.getElementById('comm-notes')?.value;

    const submission = {
      id: 'comm_' + Date.now(),
      created_at: new Date().toISOString(),
      property_name: propName,
      locality: locality,
      full_address: address,
      owner_name: manager,
      owner_phone: phone,
      property_type: propType,
      amenities_notes: notes,
      status: 'pending_verification'
    };

    try {
      const stored = JSON.parse(localStorage.getItem('santipur_community_lodges') || '[]');
      stored.push(submission);
      localStorage.setItem('santipur_community_lodges', JSON.stringify(stored));
    } catch (err) {
      console.warn('LocalStorage save notice:', err);
    }

    showToast(t.modalSuccess, 'success');
    form.reset();
    window.closeCommunityLodgeModal();
  };

  /**
   * Update all text strings for Bilingual Toggle (EN / বাংলা)
   */
  window.setDirectoryLanguage = function (lang) {
    currentLang = lang === 'bn' ? 'bn' : 'en';
    const t = DICT[currentLang];

    // Headings & Badges
    const badgeEl = document.getElementById('dir-header-badge');
    const headingEl = document.getElementById('dir-header-title');
    const subheadingEl = document.getElementById('dir-header-subtitle');
    const searchInput = document.getElementById('lodge-search-input');
    const nearMeBtn = document.getElementById('lodge-near-me-btn');
    const addBtn = document.getElementById('lodge-add-btn');
    const mapHead = document.getElementById('dir-map-header-title');
    const mapToggle = document.getElementById('toggle-map-btn');
    const mapRecenter = document.getElementById('recenter-map-btn');
    const sortLabel = document.getElementById('lodge-sort-label');
    const attrTitle = document.getElementById('attr-box-title');
    const attrText = document.getElementById('attr-box-text');
    const attrNote = document.getElementById('attr-box-note');

    if (badgeEl) badgeEl.textContent = t.badge;
    if (headingEl) headingEl.textContent = t.heading;
    if (subheadingEl) subheadingEl.textContent = t.subheading;
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    if (nearMeBtn && !userCoords) {
      nearMeBtn.querySelector('span') && (nearMeBtn.querySelector('span').textContent = t.nearMeBtn);
    }
    if (addBtn) addBtn.querySelector('span') && (addBtn.querySelector('span').textContent = t.addLodgeBtn);
    if (mapHead) mapHead.textContent = t.mapHeader;
    if (mapToggle) mapToggle.querySelector('span') && (mapToggle.querySelector('span').textContent = isMapExpanded ? t.toggleMapHide : t.toggleMapShow);
    if (mapRecenter) mapRecenter.querySelector('span') && (mapRecenter.querySelector('span').textContent = t.recenterMap);
    if (sortLabel) sortLabel.textContent = t.sortLabel;
    if (attrTitle) attrTitle.textContent = t.attributionTitle;
    if (attrText) attrText.textContent = t.attributionText;
    if (attrNote) attrNote.textContent = t.attributionNote;

    // Locality Dropdown Options
    const locSelect = document.getElementById('lodge-locality-select');
    if (locSelect) {
      const opts = locSelect.options;
      if (opts.length >= 7) {
        opts[0].text = t.allAreas;
        opts[1].text = t.areaStation;
        opts[2].text = t.areaMotiganj;
        opts[3].text = t.areaTown;
        opts[4].text = t.areaAdwaita;
        opts[5].text = t.areaSutragarh;
        opts[6].text = t.areaDabrepara;
      }
    }

    // Sort Dropdown Options
    const sortSelect = document.getElementById('lodge-sort-select');
    if (sortSelect) {
      const sOpts = sortSelect.options;
      if (sOpts.length >= 3) {
        sOpts[0].text = t.sortRecommended;
        sOpts[1].text = t.sortNearest;
        sOpts[2].text = t.sortName;
      }
    }

    // Modal texts
    const mTitle = document.getElementById('comm-modal-title');
    const mSub = document.getElementById('comm-modal-sub');
    const mSubmitBtn = document.getElementById('comm-modal-submit-btn');
    if (mTitle) mTitle.textContent = t.modalTitle;
    if (mSub) mSub.textContent = t.modalSubtitle;
    if (mSubmitBtn) mSubmitBtn.textContent = t.modalSubmit;

    renderLodgesGrid();
    updateMapMarkers();
  };

  /**
   * Bootstrapping Lodges Directory
   */
  function initLodgesDirectory() {
    if (window.SANTIPUR_LODGES && Array.isArray(window.SANTIPUR_LODGES)) {
      lodgesList = [...window.SANTIPUR_LODGES];
      renderLodgesGrid();
      initLeafletMap();
    } else {
      fetch('/data/santipur_lodges.json')
        .then((res) => res.json())
        .then((data) => {
          lodgesList = data;
          renderLodgesGrid();
          initLeafletMap();
        })
        .catch((err) => {
          console.error('Failed to load Santipur Lodges data:', err);
        });
    }
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLodgesDirectory);
  } else {
    initLodgesDirectory();
  }

  // Export to window
  window.SantipurLodgesDirectory = {
    init: initLodgesDirectory,
    getLodges: () => lodgesList,
    setLanguage: window.setDirectoryLanguage,
    focusOnMap: window.focusLodgeOnMap
  };

})(window);

