/**
 * Shantipur Local Directory — Dedicated Heritage Route Map & GIS Navigation System
 * Coordinates, Interactive Leaflet Engine, Google Maps Universal Navigation, & Bama Kali Venue Architecture.
 */

(function (window) {
  'use strict';

  let routesData = null;
  let leafletMap = null;
  let mapMarkers = [];
  let activeCategory = 'all';
  let activeTravelMode = 'walking'; // 'walking', 'driving', 'bicycling', 'transit'
  let searchQuery = '';
  let activeCuratedRouteSlug = 'shakti-heritage-trail';

  // Category Configuration & Colors
  const CATEGORY_CONFIG = {
    temple: {
      label_en: 'Sacred Temples',
      label_bn: 'পবিত্র মন্দির',
      color: '#D94B42', // Heritage Red
      bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
      iconSvg: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>'
    },
    cultural_event_venue: {
      label_en: 'Event & Dance Venues',
      label_bn: 'উৎসব ও নৃত্য ময়দান',
      color: '#D97706', // Amber Gold
      bgClass: 'bg-amber-50 text-amber-800 border-amber-200',
      iconSvg: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'
    },
    vaishnava_heritage: {
      label_en: 'Vaishnava Heritage',
      label_bn: 'শ্রীচৈতন্য ও বৈষ্ণব ভিটা',
      color: '#7C3AED', // Royal Purple
      bgClass: 'bg-purple-50 text-purple-700 border-purple-200',
      iconSvg: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
    },
    historic_landmark: {
      label_en: 'Historic Landmarks',
      label_bn: 'ঐতিহাসিক সৌধ',
      color: '#059669', // Emerald
      bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconSvg: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>'
    },
    historic_ghat: {
      label_en: 'Sacred River Ghats',
      label_bn: 'পবিত্র নদীঘাট',
      color: '#0284C7', // Sky / River Blue
      bgClass: 'bg-sky-50 text-sky-800 border-sky-200',
      iconSvg: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>'
    }
  };

  // Helper: Create Custom Leaflet SVG Pin
  function createCustomMarkerIcon(category, isFeatured = false) {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.temple;
    const size = isFeatured ? 42 : 36;
    const pinColor = config.color;

    const svgHtml = `
      <div style="position: relative; width: ${size}px; height: ${size + 10}px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;">
        <svg viewBox="0 0 36 46" width="${size}" height="${size + 10}" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.25));">
          <path d="M18 0C8.05887 0 0 8.05887 0 18C0 29.5 18 46 18 46C18 46 36 29.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="${pinColor}"/>
          <circle cx="18" cy="18" r="14" fill="#FFFFFF"/>
        </svg>
        <div style="position: absolute; top: ${size * 0.22}px; left: 50%; transform: translateX(-50%); color: ${pinColor}; display: flex; align-items: center; justify-content: center;">
          ${config.iconSvg}
        </div>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-heritage-pin',
      iconSize: [size, size + 10],
      iconAnchor: [size / 2, size + 10],
      popupAnchor: [0, -(size + 10)]
    });
  }

  // Universal Google Maps Navigation URL Builder
  // Follows Google Maps official Universal Directions URL format:
  // https://www.google.com/maps/dir/?api=1&destination=LAT,LNG&travelmode=MODE
  // Crucial: Omit origin so Google Maps automatically pulls device current GPS location!
  window.openGoogleMapsRoute = function (lat, lng, placeId, plusCode) {
    const mode = activeTravelMode || 'walking';
    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`;
    if (placeId) {
      url += `&destination_place_id=${encodeURIComponent(placeId)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Curated Multi-Stop Google Maps Route Builder
  window.openCuratedGoogleMapsRoute = function (routeSlug) {
    if (!routesData || !routesData.curated_routes) return;
    const route = routesData.curated_routes.find(r => r.slug === routeSlug);
    if (!route || !route.stops || route.stops.length < 2) return;

    const stopsList = route.stops
      .map(slug => routesData.destinations.find(d => d.slug === slug))
      .filter(Boolean);

    if (stopsList.length < 2) return;

    const mode = activeTravelMode || 'walking';
    const origin = stopsList[0];
    const destination = stopsList[stopsList.length - 1];
    const waypoints = stopsList.slice(1, -1);

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=${mode}`;

    if (waypoints.length > 0) {
      const waypointsParam = waypoints.map(w => `${w.latitude},${w.longitude}`).join('%7C');
      url += `&waypoints=${waypointsParam}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Set Active Travel Mode (Walking, Driving, Two-Wheeler, Transit)
  window.setTravelMode = function (mode) {
    activeTravelMode = mode;
    const buttons = document.querySelectorAll('.travel-mode-btn');
    buttons.forEach(btn => {
      const btnMode = btn.getAttribute('data-mode');
      if (btnMode === mode) {
        btn.classList.add('bg-[#D94B42]', 'text-white', 'shadow-2xs');
        btn.classList.remove('bg-white', 'text-[#777777]');
      } else {
        btn.classList.remove('bg-[#D94B42]', 'text-white', 'shadow-2xs');
        btn.classList.add('bg-white', 'text-[#777777]');
      }
    });

    // Re-render popup if open to update travel button tooltip
    if (leafletMap) {
      const openPopup = leafletMap._popup;
      if (openPopup && openPopup.isOpen()) {
        const dest = openPopup._source?.destinationData;
        if (dest) {
          openPopup.setContent(buildPopupHtml(dest));
        }
      }
    }
  };

  // Build Popup Content HTML
  function buildPopupHtml(dest) {
    const isBn = window.SHANTIPUR_DATA?.currentLang === 'bn';
    const name = (isBn && dest.name_bn) ? dest.name_bn : dest.name_en;
    const desc = (isBn && dest.short_desc_bn) ? dest.short_desc_bn : dest.short_desc_en;
    const cat = CATEGORY_CONFIG[dest.category] || CATEGORY_CONFIG.temple;
    const catLabel = isBn ? cat.label_bn : cat.label_en;
    const modeLabel = activeTravelMode.charAt(0).toUpperCase() + activeTravelMode.slice(1);

    return `
      <div class="max-w-[280px] sm:max-w-[320px] p-1 font-sans text-[#202020]">
        <div class="relative h-32 rounded-lg overflow-hidden mb-2 bg-[#FAFAF8]">
          <img src="${dest.image_url || '/images/santipur/om-placeholder.svg'}" 
               alt="${name}" 
               loading="lazy"
               class="w-full h-full object-cover" 
               onerror="window.handleImageError(this)"/>
          <span class="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.bgClass} shadow-xs">
            ${catLabel}
          </span>
          ${dest.is_event_venue ? `
            <span class="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
              Festival Venue
            </span>
          ` : ''}
        </div>
        <h4 class="text-sm font-bold tracking-tight text-[#202020] leading-snug">${name}</h4>
        <p class="text-[11px] text-[#777777] truncate mt-0.5">${dest.address}</p>
        <p class="text-xs text-[#555555] line-clamp-2 mt-1.5 leading-relaxed">${desc}</p>
        
        <div class="pt-2.5 mt-2 border-t border-[#EAEAEA] flex items-center justify-between gap-2">
          <button onclick="window.openDestinationModal('${dest.slug}')" 
                  class="text-xs font-semibold text-[#202020] hover:text-[#D94B42] transition-colors py-1 px-2 border border-[#EAEAEA] rounded-md hover:bg-[#FAFAF8]">
            View Details
          </button>
          <button onclick="window.openGoogleMapsRoute(${dest.latitude}, ${dest.longitude}, '${dest.google_place_id || ''}', '${dest.plus_code || ''}')" 
                  class="text-xs font-bold text-white bg-[#D94B42] hover:bg-[#B53830] transition-colors py-1.5 px-3 rounded-md shadow-2xs inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>Show Route (${modeLabel})</span>
          </button>
        </div>
      </div>
    `;
  }

  // Initialize Leaflet Map
  function initLeafletMap() {
    const mapContainer = document.getElementById('routes-map');
    if (!mapContainer) return;

    if (leafletMap) {
      leafletMap.invalidateSize();
      return;
    }

    if (typeof L === 'undefined') {
      console.warn('Leaflet JS is loading asynchronously...');
      setTimeout(initLeafletMap, 300);
      return;
    }

    const centerLat = routesData?.meta?.center?.latitude || 23.2450;
    const centerLng = routesData?.meta?.center?.longitude || 88.4350;
    const defaultZoom = routesData?.meta?.center?.default_zoom || 14;

    leafletMap = L.map('routes-map', {
      center: [centerLat, centerLng],
      zoom: defaultZoom,
      zoomControl: false,
      scrollWheelZoom: false
    });

    // Position Zoom control top-right for better mobile UX
    L.control.zoom({ position: 'topright' }).addTo(leafletMap);

    // Clean OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);

    renderMapMarkers();
  }

  // Render Markers on Map
  function renderMapMarkers() {
    if (!leafletMap || !routesData) return;

    // Clear existing markers
    mapMarkers.forEach(m => leafletMap.removeLayer(m));
    mapMarkers = [];

    const filtered = getFilteredDestinations();

    filtered.forEach(dest => {
      const isFeatured = dest.slug === 'bejpara-ground' || dest.slug === 'bama-kali-temple';
      const icon = createCustomMarkerIcon(dest.category, isFeatured);
      const marker = L.marker([dest.latitude, dest.longitude], { icon }).addTo(leafletMap);

      marker.destinationData = dest;
      marker.bindPopup(buildPopupHtml(dest), {
        maxWidth: 340,
        className: 'custom-heritage-popup'
      });

      marker.on('click', () => {
        highlightDestinationCard(dest.slug);
      });

      mapMarkers.push(marker);
    });

    // Auto-fit bounds if destinations exist
    if (filtered.length > 0) {
      const group = new L.featureGroup(mapMarkers);
      leafletMap.fitBounds(group.getBounds().pad(0.1));
    }
  }

  // Filter Logic
  function getFilteredDestinations() {
    if (!routesData || !routesData.destinations) return [];

    return routesData.destinations.filter(d => {
      // Category filter
      if (activeCategory !== 'all' && d.category !== activeCategory) {
        return false;
      }
      // Search text filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = d.name_en.toLowerCase().includes(query) || (d.name_bn && d.name_bn.toLowerCase().includes(query));
        const matchAddr = d.address.toLowerCase().includes(query);
        const matchDesc = d.description_en.toLowerCase().includes(query) || (d.description_bn && d.description_bn.toLowerCase().includes(query));
        if (!matchName && !matchAddr && !matchDesc) return false;
      }
      return true;
    });
  }

  // Category Filter Pill Selector
  window.setRouteCategoryFilter = function (cat) {
    activeCategory = cat;
    const pills = document.querySelectorAll('.route-cat-pill');
    pills.forEach(pill => {
      const pCat = pill.getAttribute('data-cat');
      if (pCat === cat) {
        pill.classList.add('bg-[#202020]', 'text-white');
        pill.classList.remove('bg-white', 'text-[#777777]');
      } else {
        pill.classList.remove('bg-[#202020]', 'text-white');
        pill.classList.add('bg-white', 'text-[#777777]');
      }
    });

    renderMapMarkers();
    renderDestinationCards();
  };

  // Search Places Handler
  window.handleRouteSearch = function (e) {
    searchQuery = e.target.value;
    renderMapMarkers();
    renderDestinationCards();
  };

  // Render Destination Cards Grid
  function renderDestinationCards() {
    const container = document.getElementById('destination-cards-grid');
    const countBadge = document.getElementById('destinations-count-badge');
    if (!container) return;

    const filtered = getFilteredDestinations();
    if (countBadge) countBadge.innerText = `${filtered.length} Places Found`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white rounded-xl border border-[#EAEAEA] p-6">
          <p class="text-sm font-semibold text-[#777777]">No destinations match your search or filter criteria.</p>
          <button onclick="window.resetRouteFilters()" class="mt-3 text-xs font-bold text-[#D94B42] hover:underline">
            Reset Filters
          </button>
        </div>
      `;
      return;
    }

    const isBn = window.SHANTIPUR_DATA?.currentLang === 'bn';

    container.innerHTML = filtered.map(d => {
      const name = (isBn && d.name_bn) ? d.name_bn : d.name_en;
      const desc = (isBn && d.short_desc_bn) ? d.short_desc_bn : d.short_desc_en;
      const cat = CATEGORY_CONFIG[d.category] || CATEGORY_CONFIG.temple;
      const catLabel = isBn ? cat.label_bn : cat.label_en;

      return `
        <div id="card-${d.slug}" class="dest-card bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-[#D94B42]/50 transition-all flex flex-col group">
          <div class="relative h-44 overflow-hidden bg-[#FAFAF8]">
            <img src="${d.image_url || '/images/santipur/om-placeholder.svg'}" 
                 alt="${name}" 
                 loading="lazy"
                 decoding="async"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                 onerror="window.handleImageError(this)" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
            
            <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.bgClass} shadow-xs">
                ${catLabel}
              </span>
              ${d.slug === 'bejpara-ground' ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                  2026 Dance Venue
                </span>
              ` : ''}
              ${d.slug === 'bama-kali-temple' ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D94B42] text-white shadow-xs">
                  Permanent Sanctum
                </span>
              ` : ''}
            </div>

            <div class="absolute bottom-2.5 left-3 right-3 text-white">
              <h3 class="text-sm font-bold tracking-tight leading-snug drop-shadow-sm">${name}</h3>
              <p class="text-[10px] text-white/90 truncate flex items-center gap-1 mt-0.5">
                <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>${d.address}</span>
              </p>
            </div>
          </div>

          <div class="p-4 flex-1 flex flex-col justify-between">
            <p class="text-xs text-[#555555] line-clamp-3 leading-relaxed mb-4">
              ${desc}
            </p>

            <div class="pt-3 border-t border-[#EAEAEA] flex items-center justify-between gap-2">
              <button onclick="window.focusDestinationOnMap('${d.slug}')" class="text-xs font-semibold text-[#777777] hover:text-[#202020] transition-colors inline-flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                <span>View on Map</span>
              </button>

              <div class="flex items-center gap-1.5">
                <button onclick="window.openDestinationModal('${d.slug}')" 
                        class="text-xs font-semibold text-[#202020] hover:text-[#D94B42] px-2.5 py-1.5 border border-[#EAEAEA] rounded-lg hover:bg-[#FAFAF8] transition-colors">
                  Details
                </button>
                <button onclick="window.openGoogleMapsRoute(${d.latitude}, ${d.longitude}, '${d.google_place_id || ''}', '${d.plus_code || ''}')" 
                        class="text-xs font-bold text-white bg-[#D94B42] hover:bg-[#B53830] px-3 py-1.5 rounded-lg shadow-2xs transition-all inline-flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  <span>Show Route</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Highlight Card when marker clicked
  function highlightDestinationCard(slug) {
    document.querySelectorAll('.dest-card').forEach(c => c.classList.remove('ring-2', 'ring-[#D94B42]'));
    const target = document.getElementById(`card-${slug}`);
    if (target) {
      target.classList.add('ring-2', 'ring-[#D94B42]');
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Focus Marker when clicked from list
  window.focusDestinationOnMap = function (slug) {
    if (!leafletMap || !routesData) return;
    const dest = routesData.destinations.find(d => d.slug === slug);
    if (!dest) return;

    leafletMap.flyTo([dest.latitude, dest.longitude], 16, { duration: 1.2 });

    const marker = mapMarkers.find(m => m.destinationData?.slug === slug);
    if (marker) {
      setTimeout(() => marker.openPopup(), 1250);
    }

    // Scroll to map container smoothly
    const mapSection = document.getElementById('routes-map-container');
    if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Reset Filters
  window.resetRouteFilters = function () {
    activeCategory = 'all';
    searchQuery = '';
    const input = document.getElementById('route-search-input');
    if (input) input.value = '';
    window.setRouteCategoryFilter('all');
  };

  // Open Individual Destination Detail Modal & Support Deep Linking
  window.openDestinationModal = function (slug) {
    if (!routesData || !routesData.destinations) return;
    const dest = routesData.destinations.find(d => d.slug === slug);
    if (!dest) return;

    const modal = document.getElementById('destination-detail-modal');
    const content = document.getElementById('destination-modal-content');
    if (!modal || !content) return;

    const isBn = window.SHANTIPUR_DATA?.currentLang === 'bn';
    const name = (isBn && dest.name_bn) ? dest.name_bn : dest.name_en;
    const cat = CATEGORY_CONFIG[dest.category] || CATEGORY_CONFIG.temple;
    const catLabel = isBn ? cat.label_bn : cat.label_en;
    const desc = (isBn && dest.description_bn) ? dest.description_bn : dest.description_en;
    const history = (isBn && dest.historical_significance_bn) ? dest.historical_significance_bn : dest.historical_significance_en;

    // Nearby places cards
    const nearbyHtml = (dest.nearby_destinations || [])
      .map(nearSlug => routesData.destinations.find(d => d.slug === nearSlug))
      .filter(Boolean)
      .map(near => `
        <div class="bg-white border border-[#EAEAEA] rounded-lg p-2.5 flex items-center justify-between gap-3 hover:border-[#D94B42]/50 transition-all">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <img src="${near.image_url || '/images/santipur/om-placeholder.svg'}" class="w-10 h-10 rounded-md object-cover shrink-0" onerror="window.handleImageError(this)"/>
            <div class="truncate">
              <h5 class="text-xs font-bold text-[#202020] truncate">${near.name_en}</h5>
              <span class="text-[10px] text-[#777777]">${CATEGORY_CONFIG[near.category]?.label_en || near.category}</span>
            </div>
          </div>
          <button onclick="window.openGoogleMapsRoute(${near.latitude}, ${near.longitude})" class="text-[11px] font-bold text-[#D94B42] hover:text-[#B53830] shrink-0">
            Route &rarr;
          </button>
        </div>
      `).join('');

    content.innerHTML = `
      <div class="relative">
        <!-- Close Button -->
        <button onclick="window.closeDestinationModal()" class="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md rounded-full p-2 text-[#202020] hover:text-[#D94B42] shadow-sm transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <!-- Cover Image -->
        <div class="relative h-64 sm:h-80 w-full bg-[#121016]">
          <img src="${dest.image_url || '/images/santipur/om-placeholder.svg'}" 
               alt="${name}" 
               class="w-full h-full object-cover" 
               onerror="window.handleImageError(this)"/>
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
          
          <div class="absolute bottom-5 left-5 right-5 text-white">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${cat.bgClass} shadow-xs">
                ${catLabel}
              </span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                GPS Verified
              </span>
              ${dest.is_event_venue ? `
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                  Official 2026 Event Venue
                </span>
              ` : ''}
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">${name}</h2>
            ${dest.name_bn ? `<p class="text-sm font-semibold text-white/80 font-bangla mt-0.5">${dest.name_bn}</p>` : ''}
          </div>
        </div>

        <!-- Body Content -->
        <div class="p-6 sm:p-8 space-y-6">
          <!-- Coordinates & Location Bar -->
          <div class="bg-[#FAFAF8] border border-[#EAEAEA] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div class="space-y-1">
              <p class="font-semibold text-[#202020] flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>${dest.address}</span>
              </p>
              <div class="flex items-center gap-3 text-[11px] text-[#777777] font-mono">
                <span>GPS: ${dest.latitude.toFixed(6)}, ${dest.longitude.toFixed(6)}</span>
                ${dest.plus_code ? `<span>• Plus Code: ${dest.plus_code}</span>` : ''}
              </div>
            </div>

            <!-- Primary Navigation Actions -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
              ${dest.google_maps_url ? `
                <a href="${dest.google_maps_url}" target="_blank" rel="noopener noreferrer" 
                   class="bg-white hover:bg-[#FAFAF8] text-[#202020] border border-[#CCCCCC] font-bold px-4 py-2.5 rounded-lg shadow-2xs transition-all inline-flex items-center justify-center gap-2 text-xs">
                  <svg class="w-4 h-4 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  <span>Open Google Maps Pin</span>
                </a>
              ` : ''}
              <button onclick="window.openGoogleMapsRoute(${dest.latitude}, ${dest.longitude}, '${dest.google_place_id || ''}', '${dest.plus_code || ''}')" 
                      class="bg-[#D94B42] hover:bg-[#B53830] text-white font-bold px-5 py-2.5 rounded-lg shadow-sm transition-all inline-flex items-center justify-center gap-2 text-xs">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                <span>Show Route in Google Maps</span>
              </button>
            </div>
          </div>

          <!-- Description & History -->
          <div class="space-y-4">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-[#777777] mb-1">Cultural Overview</h4>
              <p class="text-sm text-[#333333] leading-relaxed">${desc}</p>
            </div>

            ${history ? `
              <div class="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                <h4 class="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  <span>Historical &amp; Event Significance</span>
                </h4>
                <p class="text-xs text-amber-900/90 leading-relaxed">${history}</p>
              </div>
            ` : ''}
          </div>

          <!-- Nearby Curated Destinations -->
          ${nearbyHtml ? `
            <div class="pt-4 border-t border-[#EAEAEA]">
              <h4 class="text-xs font-bold uppercase tracking-wider text-[#777777] mb-3">Nearby Destinations on Route</h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                ${nearbyHtml}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Update browser URL silently for shareability
    if (window.history && window.history.pushState) {
      window.history.pushState({ slug }, name, `/routes/${slug}`);
    }
  };

  // Close Destination Modal
  window.closeDestinationModal = function () {
    const modal = document.getElementById('destination-detail-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';

    if (window.history && window.history.pushState) {
      window.history.pushState({}, 'Explore Routes', '/routes');
    }
  };

  // Curated Trail Selector
  window.selectCuratedTrail = function (trailSlug) {
    activeCuratedRouteSlug = trailSlug;
    const tabs = document.querySelectorAll('.curated-trail-tab');
    tabs.forEach(tab => {
      const slug = tab.getAttribute('data-trail');
      if (slug === trailSlug) {
        tab.classList.add('border-[#D94B42]', 'bg-white', 'text-[#202020]', 'shadow-2xs');
        tab.classList.remove('border-transparent', 'bg-transparent', 'text-[#777777]');
      } else {
        tab.classList.remove('border-[#D94B42]', 'bg-white', 'text-[#202020]', 'shadow-2xs');
        tab.classList.add('border-transparent', 'bg-transparent', 'text-[#777777]');
      }
    });

    renderCuratedTrailStops(trailSlug);
  };

  // Render Curated Trail Timeline
  function renderCuratedTrailStops(trailSlug) {
    const container = document.getElementById('curated-trail-details');
    if (!container || !routesData) return;

    const route = routesData.curated_routes.find(r => r.slug === trailSlug);
    if (!route) return;

    const isBn = window.SHANTIPUR_DATA?.currentLang === 'bn';
    const title = (isBn && route.title_bn) ? route.title_bn : route.title_en;
    const tagline = (isBn && route.tagline_bn) ? route.tagline_bn : route.tagline_en;

    const stopsData = (route.stops || [])
      .map(slug => routesData.destinations.find(d => d.slug === slug))
      .filter(Boolean);

    const stopsListHtml = stopsData.map((stop, idx) => {
      const stopName = (isBn && stop.name_bn) ? stop.name_bn : stop.name_en;
      const cat = CATEGORY_CONFIG[stop.category] || CATEGORY_CONFIG.temple;

      return `
        <div class="relative pl-6 pb-6 last:pb-0 group">
          <!-- Timeline line -->
          ${idx < stopsData.length - 1 ? `<span class="absolute left-2.5 top-6 bottom-0 w-0.5 bg-[#EAEAEA]"></span>` : ''}
          
          <!-- Stop number badge -->
          <span class="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-[#D94B42] text-[10px] font-bold text-[#D94B42] flex items-center justify-center shadow-2xs group-hover:bg-[#D94B42] group-hover:text-white transition-colors">
            ${idx + 1}
          </span>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h5 class="text-xs font-bold text-[#202020]">${stopName}</h5>
                <span class="text-[9px] font-semibold px-2 py-0.5 rounded-full ${cat.bgClass}">${cat.label_en}</span>
              </div>
              <p class="text-[11px] text-[#777777] truncate mt-0.5">${stop.address}</p>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button onclick="window.focusDestinationOnMap('${stop.slug}')" class="text-[11px] font-semibold text-[#777777] hover:text-[#202020] transition-colors">
                Map
              </button>
              <button onclick="window.openGoogleMapsRoute(${stop.latitude}, ${stop.longitude})" 
                      class="text-[11px] font-bold text-[#D94B42] hover:text-[#B53830] transition-colors inline-flex items-center gap-1">
                <span>Route</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bg-white border border-[#EAEAEA] rounded-xl p-5 shadow-2xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#D94B42] border border-rose-200">
                ${route.badge}
              </span>
              <span class="text-xs font-semibold text-[#777777]">• ${route.total_distance_km} km</span>
              <span class="text-xs font-semibold text-[#777777]">• ~${route.estimated_walking_mins} mins walk (~${route.estimated_driving_mins} mins drive)</span>
            </div>
            <h3 class="text-base font-bold text-[#202020] mt-1">${title}</h3>
            <p class="text-xs text-[#777777] mt-0.5">${tagline}</p>
          </div>

          <!-- Multi-stop Google Maps Launcher -->
          <button onclick="window.openCuratedGoogleMapsRoute('${route.slug}')" 
                  class="bg-[#202020] hover:bg-[#D94B42] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all inline-flex items-center justify-center gap-2 shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
            <span>Open Multi-Stop Route in Google Maps</span>
          </button>
        </div>

        <!-- Stops Sequence -->
        <div class="space-y-1">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#777777] mb-3">Curated Waypoints Sequence (${stopsData.length} Stops)</h4>
          ${stopsListHtml}
        </div>
      </div>
    `;
  }

  // Navigate to Routes Section from Navigation Bar
  window.navigateToRoutes = function () {
    const routesSection = document.getElementById('routes-section');
    if (routesSection) {
      routesSection.scrollIntoView({ behavior: 'smooth' });
      if (window.history && window.history.pushState) {
        window.history.pushState({}, 'Explore Shantipur Routes', '/routes');
      }
      setTimeout(() => {
        if (leafletMap) leafletMap.invalidateSize();
      }, 500);
    }
  };

  // Main Controller Initialization
  async function initRoutesExplorer() {
    try {
      const res = await fetch('/api/routes_data.json');
      if (res.ok) {
        routesData = await res.json();
      }
    } catch (e) {
      console.warn('Could not load routes_data.json, using fallback', e);
    }

    if (!routesData) return;

    // Initialize UI components
    initLeafletMap();
    renderDestinationCards();
    window.selectCuratedTrail('shakti-heritage-trail');

    // Handle initial URL route /routes/:slug
    handleInitialUrlRoute();
  }

  // Handle URL Deep Linking
  function handleInitialUrlRoute() {
    const path = window.location.pathname;
    const hash = window.location.hash;

    let targetSlug = null;
    if (path.startsWith('/routes/')) {
      targetSlug = path.replace('/routes/', '').trim();
    } else if (hash.startsWith('#routes/')) {
      targetSlug = hash.replace('#routes/', '').trim();
    }

    if (targetSlug) {
      setTimeout(() => {
        window.openDestinationModal(targetSlug);
      }, 600);
    } else if (path === '/routes' || hash === '#routes-section' || hash === '#routes') {
      setTimeout(() => {
        window.navigateToRoutes();
      }, 400);
    }
  }

  // Window popstate handler for back/forward navigation
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.slug) {
      window.openDestinationModal(e.state.slug);
    } else {
      const modal = document.getElementById('destination-detail-modal');
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }
  });

  // Attach DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoutesExplorer);
  } else {
    initRoutesExplorer();
  }

})(window);
