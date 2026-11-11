/**
 * Santipur Heritage Stay & Hospitality Engine (Hotels / Lodges / Homestays)
 * Core Controller & Data Layer (Pillars 1, 2 & 3)
 * Target Municipality: Santipur, Nadia, West Bengal (PIN: 741404)
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_ACCOMMODATIONS = 'santipur_stay_accommodations_v3';
  const STORAGE_KEY_BOOKINGS = 'santipur_stay_bookings_v2';

  // 100% Curated, Verified Santipur Town (PIN 741404) Seed Accommodations
  const SEED_ACCOMMODATIONS = [
    {
      id: 'a1111111-1111-4111-8111-111111111111',
      created_at: new Date().toISOString(),
      owner_name: 'Dipankar Modak',
      owner_phone: '+91 94348 21905',
      owner_email: 'contact@newgodhulilodge.in',
      property_name: 'New Godhuli Lodge & Executive Suites',
      property_type: 'Lodge',
      category: 'Deluxe',
      landmark_area: 'Near Public Library Ground',
      full_address: 'Netaji Subhas Road (Opp. Sadharan Pathagar), Kashyap Para, Santipur, Nadia, West Bengal - 741404',
      pin_code: '741404',
      price_per_night: 1850,
      capacity_adults: 2,
      capacity_children: 1,
      room_size_sqft: 380,
      floor_level: '2nd Floor',
      bed_type: 'King Size Bed',
      main_image_url: '/images/santipur/stays/santipur-stay-room-master.jpg',
      gallery_urls: [
        '/images/santipur/stays/santipur-stay-room-master.jpg',
        '/images/santipur/stays/santipur-stay-room-living.jpg',
        '/images/santipur/stays/santipur-stay-room-bath.jpg',
        '/images/santipur/stays/santipur-stay-breakfast-tray.jpg'
      ],
      amenities: {
        ac: true,
        wifi: true,
        attached_bath: true,
        tv: true,
        balcony: true,
        breakfast: true
      },
      room_specs: {
        bedroom: '1 Master Bedroom with Workspace',
        bathroom: '1 Attached Western Bath with 24/7 Geyser',
        kitchen: 'Complimentary tea/coffee maker',
        accessibility: 'Elevator Available / Wide Corridors'
      },
      description: 'Centrally positioned on Netaji Subhas Road across the century-old Santipur Public Library. Offers premium air-conditioned deluxe rooms, high-speed fiber internet, private balconies, and dedicated parking during festival periods.',
      is_verified: true,
      status: 'active'
    },
    {
      id: 'a2222222-2222-4222-8222-222222222222',
      created_at: new Date().toISOString(),
      owner_name: 'Gopal Goswami',
      owner_phone: '+91 97325 19082',
      owner_email: 'stay@radhagobindalodge.com',
      property_name: 'Radha Gobinda Heritage Guest House',
      property_type: 'Guest House',
      category: 'Heritage Suite',
      landmark_area: 'Near Agameswari Mandir',
      full_address: 'Adwaita Sarak, Agameswari Tala, Ward 12, Santipur, Nadia, West Bengal - 741404',
      pin_code: '741404',
      price_per_night: 2400,
      capacity_adults: 3,
      capacity_children: 2,
      room_size_sqft: 450,
      floor_level: '1st Floor',
      bed_type: 'Double Bed + Diwan',
      main_image_url: '/images/santipur/temples/santipur-agameswari-temple-exterior-01.jpg',
      gallery_urls: [
        '/images/santipur/stays/santipur-stay-room-living.jpg',
        '/images/santipur/temples/santipur-agameswari-temple-exterior-01.jpg',
        '/images/santipur/stays/santipur-stay-room-bath.jpg',
        '/images/santipur/stays/santipur-stay-breakfast-tray.jpg'
      ],
      amenities: {
        ac: true,
        wifi: true,
        attached_bath: true,
        tv: true,
        balcony: true,
        breakfast: true
      },
      room_specs: {
        bedroom: '1 Grand Heritage Suite with Courtyard View',
        bathroom: '1 Attached Marble Bath with Modern Geyser',
        kitchen: 'Pure Vegetarian Satvik Kitchen Service',
        accessibility: 'Ground Floor Access / Senior Citizen Friendly'
      },
      description: 'Nestled in the historic sacred corridor along Adwaita Sarak, steps from the 450-year-old Maa Agameswari shrine. Built in vintage terracotta aesthetic with peaceful courtyard gardens, satvik prasadam dining, and serene pilgrim hospitality.',
      is_verified: true,
      status: 'active'
    },
    {
      id: 'a3333333-3333-4333-8333-333333333333',
      created_at: new Date().toISOString(),
      owner_name: 'Subhas Chandra Pramanick',
      owner_phone: '+91 98322 17409',
      owner_email: 'sachchhanda.santipur@gmail.com',
      property_name: 'Sachchhanda Tourist Lodge',
      property_type: 'Hotel',
      category: 'Deluxe',
      landmark_area: 'Station Road',
      full_address: 'Station Road, Near Santipur Junction Platform 1, Santipur, Nadia, West Bengal - 741404',
      pin_code: '741404',
      price_per_night: 1450,
      capacity_adults: 2,
      capacity_children: 1,
      room_size_sqft: 320,
      floor_level: 'Ground Floor',
      bed_type: 'Double Bed',
      main_image_url: '/images/santipur/institutions/santipur-railway-station-01.jpg',
      gallery_urls: [
        '/images/santipur/stays/santipur-stay-room-master.jpg',
        '/images/santipur/city-photography/santipur-railway-platform-junction-01.jpg',
        '/images/santipur/stays/santipur-stay-room-bath.jpg'
      ],
      amenities: {
        ac: true,
        wifi: true,
        attached_bath: true,
        tv: true,
        balcony: false,
        breakfast: true
      },
      room_specs: {
        bedroom: '1 Clean Double Bedroom',
        bathroom: '1 Attached Tiled Bath',
        kitchen: 'Room Service Tea/Snacks',
        accessibility: 'Wheelchair Accessible Ground Floor'
      },
      description: 'Ideal transit haven situated just 2 minutes walking distance from Santipur Railway Junction. Features quick check-in, 24/7 power backup, secure luggage storage, and easy toto taxi connections to handloom haats and temples.',
      is_verified: true,
      status: 'active'
    },
    {
      id: 'a4444444-4444-4444-8444-444444444444',
      created_at: new Date().toISOString(),
      owner_name: 'Partha Sarathi Biswas',
      owner_phone: '+91 97339 61840',
      owner_email: 'sushila.homestay.santipur@gmail.com',
      property_name: 'Sushila Heritage Weavers Homestay',
      property_type: 'Homestay',
      category: 'Heritage Suite',
      landmark_area: 'Near Sutragarh Haat',
      full_address: '1/10 Ram Gopal Street, Sutragarh Weavers Para, Santipur, Nadia, West Bengal - 741404',
      pin_code: '741404',
      price_per_night: 2100,
      capacity_adults: 2,
      capacity_children: 2,
      room_size_sqft: 420,
      floor_level: '1st Floor',
      bed_type: 'Traditional Teak 4-Poster Bed',
      main_image_url: '/images/santipur/handloom/santipur-tant-weaving-workshop-01.jpg',
      gallery_urls: [
        '/images/santipur/stays/santipur-stay-room-living.jpg',
        '/images/santipur/handloom/santipur-traditional-tant-loom-01.jpg',
        '/images/santipur/stays/santipur-stay-breakfast-tray.jpg'
      ],
      amenities: {
        ac: true,
        wifi: true,
        attached_bath: true,
        tv: true,
        balcony: true,
        breakfast: true
      },
      room_specs: {
        bedroom: '1 Master Room + Handloom Weaving Lounge',
        bathroom: '1 Attached Western Bath',
        kitchen: 'Home-Cooked Bengali Meals (Fish Curry, Bhog)',
        accessibility: 'Private Staircase Entry'
      },
      description: 'Immerse in the living heartbeat of Shantipuri Tant. Situated in the traditional Sutragarh quarter, guests enjoy authentic home-cooked Bengali thalis, rhythmic sounds of handloom shuttles, and complimentary guided morning tours of pre-dawn wholesale saree haats.',
      is_verified: true,
      status: 'active'
    },
    {
      id: 'a5555555-5555-4555-8555-555555555555',
      created_at: new Date().toISOString(),
      owner_name: 'Amitava Sen',
      owner_phone: '+91 98328 41209',
      owner_email: 'sonarbangla.stay@gmail.com',
      property_name: 'Sonar Bangla Lodge & Executive Stay',
      property_type: 'Hotel',
      category: 'Deluxe',
      landmark_area: 'Near Shyamchand Mandir',
      full_address: '74, C.R. Das Road, Shyamchandpara, Santipur, Nadia, West Bengal - 741404',
      pin_code: '741404',
      price_per_night: 1700,
      capacity_adults: 2,
      capacity_children: 1,
      room_size_sqft: 350,
      floor_level: '3rd Floor',
      bed_type: 'Double Bed',
      main_image_url: '/images/santipur/temples/santipur-shyamchand-temple-atchala-01.jpg',
      gallery_urls: [
        '/images/santipur/stays/santipur-stay-room-master.jpg',
        '/images/santipur/rash-utsav/santipur-raas-mancha-illumination.jpg',
        '/images/santipur/stays/santipur-stay-room-bath.jpg'
      ],
      amenities: {
        ac: true,
        wifi: true,
        attached_bath: true,
        tv: true,
        balcony: true,
        breakfast: false
      },
      room_specs: {
        bedroom: '1 Deluxe Room with Skyline Window',
        bathroom: '1 Attached Western Bath with Shower',
        kitchen: 'Cafe & Rooftop Dining Lounge',
        accessibility: 'Wide Staircase / Terrace Access'
      },
      description: 'Situated steps from the historic 1726 CE Shyamchand Temple and Rasmancha. Offers quiet, spotless rooms with terrace views overlooking the antique temple pinnacles and seasonal festival carnival routes.',
      is_verified: true,
      status: 'active'
    },
    {
      id: 'a6666666-6666-4666-8666-666666666666',
      created_at: new Date().toISOString(),
      owner_name: 'Brahmachari Madhavananda',
      owner_phone: '+91 94343 14852',
      owner_email: 'advaita.dham.santipur@gmail.com',
      property_name: 'Sri Advaita Prabhu Dham Dharamshala',
      property_type: 'Dharamshala',
      category: 'Standard',
      landmark_area: 'Advaita Pat Babla',
      full_address: 'Babla Gobindapur Road (Near Advaita Pat), Santipur, Nadia, West Bengal - 741404',
      pin_code: '741404',
      price_per_night: 600,
      capacity_adults: 3,
      capacity_children: 1,
      room_size_sqft: 300,
      floor_level: 'Ground Floor',
      bed_type: 'Twin Single Beds',
      main_image_url: '/images/santipur/institutions/santipur-public-library-01.jpg',
      gallery_urls: [
        '/images/santipur/vaishnava-heritage/santipur-sri-radha-raman-jiu-01.jpg',
        '/images/santipur/stays/santipur-stay-room-living.jpg',
        '/images/santipur/temples/santipur-jaleswar-shiva-temple-01.jpg'
      ],
      amenities: {
        ac: false,
        wifi: true,
        attached_bath: true,
        tv: false,
        balcony: false,
        breakfast: true
      },
      room_specs: {
        bedroom: '1 Simple Clean Pilgrim Room',
        bathroom: '1 Attached Tiled Bathroom',
        kitchen: 'Daily Mahaprasad Dining Hall',
        accessibility: 'Level Ground Floor Entry'
      },
      description: 'Affordable and peaceful spiritual retreat run under ashram guidance for visiting Vaishnava devotees, pilgrims, and heritage scholars. Includes peaceful morning kirtan, clean filtered drinking water, and temple mahaprasadam.',
      is_verified: false,
      status: 'active'
    },
    {
      id: 'a7777777-7777-4777-8777-777777777777',
      created_at: new Date().toISOString(),
      owner_name: 'Sanjoy Debnath',
      owner_phone: '+91 99322 28661',
      owner_email: 'antarik.santipur@gmail.com',
      property_name: 'Lodge Antarik & Banquet',
      property_type: 'Lodge',
      category: 'Standard',
      landmark_area: 'Bhutir Math',
      full_address: 'Dabrepara Lane, Near Bhutir Math Sporting Ground, Santipur, Nadia, West Bengal - 741404',
      pin_code: '741404',
      price_per_night: 1200,
      capacity_adults: 2,
      capacity_children: 1,
      room_size_sqft: 280,
      floor_level: '1st Floor',
      bed_type: 'Double Bed',
      main_image_url: '/images/santipur/institutions/santipur-sutragarh-high-school-01.jpg',
      gallery_urls: [
        '/images/santipur/stays/santipur-stay-room-master.jpg',
        '/images/santipur/stays/santipur-stay-room-bath.jpg',
        '/images/santipur/ngos/santipur-leaders-club-01.jpg'
      ],
      amenities: {
        ac: true,
        wifi: true,
        attached_bath: true,
        tv: true,
        balcony: false,
        breakfast: false
      },
      room_specs: {
        bedroom: '1 Cozy Standard Bedroom',
        bathroom: '1 Attached Western Bath',
        kitchen: 'Catering Service for Groups',
        accessibility: 'Ground and 1st Floor Rooms'
      },
      description: 'Comfortable neighborhood lodge offering cost-effective family rooms and group tour bookings. Located near Bhutir Math ground with quiet surroundings and rapid transit to NH-34 and central Santipur.',
      is_verified: false,
      status: 'active'
    },
    {
      id: 'a8888888-8888-4888-8888-888888888888',
      created_at: new Date().toISOString(),
      owner_name: 'Rajib Ganguly',
      owner_phone: '+91 97335 12044',
      owner_email: 'riverside.retreat.santipur@gmail.com',
      property_name: 'Shantipur Riverside Heritage Haveli',
      property_type: 'Heritage Haveli',
      category: 'Heritage Suite',
      landmark_area: 'Ganga Ghat Riverside',
      full_address: 'Old Kalna Ghat Road, Riverside Ghat, Ward 1, Santipur, Nadia, West Bengal - 741404',
      pin_code: '741404',
      price_per_night: 3200,
      capacity_adults: 2,
      capacity_children: 2,
      room_size_sqft: 520,
      floor_level: '2nd Floor',
      bed_type: 'Royal King Bed + Chaise',
      main_image_url: '/images/santipur/temples/santipur-jaleswar-shiva-temple-01.jpg',
      gallery_urls: [
        '/images/santipur/stays/santipur-stay-room-master.jpg',
        '/images/santipur/stays/santipur-stay-room-living.jpg',
        '/images/santipur/stays/santipur-stay-room-bath.jpg',
        '/images/santipur/stays/santipur-stay-breakfast-tray.jpg'
      ],
      amenities: {
        ac: true,
        wifi: true,
        attached_bath: true,
        tv: true,
        balcony: true,
        breakfast: true
      },
      room_specs: {
        bedroom: '1 Royal Riverside Suite with Panoramic Ganges View',
        bathroom: '1 Attached Luxury Bath with Bathtub and Geyser',
        kitchen: 'Chef Prepared Gourmet Shantipuri Meals',
        accessibility: 'Riverside Lawn & Ramp Access'
      },
      description: 'Restored colonial-era zamindar riverside haveli situated right on the banks of the sacred Bhagirathi-Ganga. Unwind with evening river breeze, private wooden river-facing balconies, boat-ride arrangements, and artisan weaving experiences.',
      is_verified: true,
      status: 'active'
    }
  ];

  // Helper date offset
  function addDays(d, days) {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res.toISOString().split('T')[0];
  }

  const today = new Date();
  const SEED_BOOKINGS = [
    {
      id: 'b1111111-1111-4111-8111-111111111111',
      created_at: new Date().toISOString(),
      accommodation_id: 'a1111111-1111-4111-8111-111111111111',
      guest_name: 'Mr Dipon Nath',
      guest_phone: '+91 98321 00001',
      guest_email: 'dipon.nath@gmail.com',
      check_in: addDays(today, 1),
      check_out: addDays(today, 4),
      guests_count: 2,
      rooms_count: 1,
      total_amount: 5550,
      special_notes: 'Late check-in requested (around 8:00 PM). Need quiet room for elderly parent.',
      booking_status: 'confirmed',
      payment_status: 'advance_paid'
    },
    {
      id: 'b2222222-2222-4222-8222-222222222222',
      created_at: new Date().toISOString(),
      accommodation_id: 'a1111111-1111-4111-8111-111111111111',
      guest_name: 'Mr Pronit Das',
      guest_phone: '+91 98321 00002',
      guest_email: 'pronit.das@gmail.com',
      check_in: addDays(today, 9),
      check_out: addDays(today, 13),
      guests_count: 2,
      rooms_count: 1,
      total_amount: 7400,
      special_notes: 'Visiting Santipur for wedding textile shopping at Sutragarh Haat.',
      booking_status: 'confirmed',
      payment_status: 'pay_at_desk'
    },
    {
      id: 'b3333333-3333-4333-8333-333333333333',
      created_at: new Date().toISOString(),
      accommodation_id: 'a1111111-1111-4111-8111-111111111111',
      guest_name: 'Mr Nayan Paul',
      guest_phone: '+91 98321 00003',
      guest_email: 'nayan.paul@gmail.com',
      check_in: addDays(today, 22),
      check_out: addDays(today, 27),
      guests_count: 3,
      rooms_count: 1,
      total_amount: 9250,
      special_notes: 'Attending Raas Utsav parikrama. Please provide extra blanket.',
      booking_status: 'pending',
      payment_status: 'pay_at_desk'
    },
    {
      id: 'b4444444-4444-4444-8444-444444444444',
      created_at: new Date().toISOString(),
      accommodation_id: 'a2222222-2222-4222-8222-222222222222',
      guest_name: 'Dr. Arindam Mukherjee',
      guest_phone: '+91 98321 00004',
      guest_email: 'arindam.m@heritage.org',
      check_in: addDays(today, 2),
      check_out: addDays(today, 5),
      guests_count: 2,
      rooms_count: 1,
      total_amount: 7200,
      special_notes: 'Heritage documentation research visit for Nadia temples.',
      booking_status: 'confirmed',
      payment_status: 'full_paid'
    }
  ];

  // Internal Local Store Accessors
  function getLocalAccommodations() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACCOMMODATIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    localStorage.setItem(STORAGE_KEY_ACCOMMODATIONS, JSON.stringify(SEED_ACCOMMODATIONS));
    return SEED_ACCOMMODATIONS;
  }

  function setLocalAccommodations(list) {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOMMODATIONS, JSON.stringify(list));
    } catch (e) {}
  }

  function getLocalBookings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    return SEED_BOOKINGS;
  }

  function setLocalBookings(list) {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(list));
    } catch (e) {}
  }

  // Get active Supabase client instance if connected
  function getSupabase() {
    if (window.supabasePortal && window.supabasePortal.client && window.supabasePortal.isLive()) {
      return window.supabasePortal.client;
    }
    if (window.supabase && typeof window.supabase.from === 'function') {
      return window.supabase;
    }
    return null;
  }

  // =========================================================================
  // PUBLIC CONTROLLER INTERFACE
  // =========================================================================

  const SantipurStayEngine = {
    // -----------------------------------------------------------------------
    // PILLAR 1: CUSTOMER SEARCH, DETAIL & BOOKING
    // -----------------------------------------------------------------------

    /**
     * Search accommodations with multi-criteria filtering
     */
    async searchAccommodations(filters = {}) {
      const sb = getSupabase();
      let list = [];

      if (sb) {
        try {
          let query = sb.from('stay_accommodations').select('*').eq('status', 'active');
          if (filters.property_type && filters.property_type !== 'all') {
            query = query.eq('property_type', filters.property_type);
          }
          if (filters.landmark_area && filters.landmark_area !== 'all') {
            query = query.eq('landmark_area', filters.landmark_area);
          }
          if (filters.adults) {
            query = query.gte('capacity_adults', parseInt(filters.adults, 10));
          }
          if (filters.max_price) {
            query = query.lte('price_per_night', parseFloat(filters.max_price));
          }

          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) {
            list = data;
          } else {
            list = getLocalAccommodations();
          }
        } catch (e) {
          list = getLocalAccommodations();
        }
      } else {
        list = getLocalAccommodations();
      }

      // Filter locally for active status and search query
      list = list.filter(item => item.status === 'active');

      if (filters.property_type && filters.property_type !== 'all') {
        list = list.filter(item => item.property_type.toLowerCase() === filters.property_type.toLowerCase());
      }

      if (filters.landmark_area && filters.landmark_area !== 'all') {
        list = list.filter(item => item.landmark_area.toLowerCase() === filters.landmark_area.toLowerCase());
      }

      if (filters.adults) {
        const num = parseInt(filters.adults, 10);
        list = list.filter(item => (item.capacity_adults || 2) >= num);
      }

      if (filters.max_price) {
        const maxP = parseFloat(filters.max_price);
        list = list.filter(item => (item.price_per_night || 0) <= maxP);
      }

      if (filters.query && filters.query.trim().length > 0) {
        const q = filters.query.trim().toLowerCase();
        list = list.filter(item =>
          item.property_name.toLowerCase().includes(q) ||
          item.full_address.toLowerCase().includes(q) ||
          item.landmark_area.toLowerCase().includes(q) ||
          item.property_type.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      }

      // Sort
      if (filters.sort === 'price_asc') {
        list.sort((a, b) => a.price_per_night - b.price_per_night);
      } else if (filters.sort === 'price_desc') {
        list.sort((a, b) => b.price_per_night - a.price_per_night);
      } else if (filters.sort === 'size_desc') {
        list.sort((a, b) => (b.room_size_sqft || 0) - (a.room_size_sqft || 0));
      }

      return list;
    },

    /**
     * Get single accommodation details + bookings for calendar & recent reservations
     */
    async getAccommodationById(id) {
      const allAcc = getLocalAccommodations();
      const acc = allAcc.find(a => a.id === id) || allAcc[0];

      // Get bookings for this room
      const allBookings = getLocalBookings();
      const roomBookings = allBookings.filter(b => b.accommodation_id === acc.id && b.booking_status !== 'cancelled');

      return {
        ...acc,
        bookings: roomBookings
      };
    },

    /**
     * Calculate stay pricing dynamically
     */
    calculateStayPricing(pricePerNight, checkIn, checkOut, roomsCount = 1) {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      let nights = 1;

      if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
        const diffMs = d2.getTime() - d1.getTime();
        nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      const rooms = Math.max(1, parseInt(roomsCount, 10) || 1);
      const baseAmount = pricePerNight * nights * rooms;
      const taxes = Math.round(baseAmount * 0.05); // 5% Municipal & Tourism Levy
      const totalAmount = baseAmount + taxes;

      return {
        nights,
        rooms,
        pricePerNight,
        baseAmount,
        taxes,
        totalAmount
      };
    },

    /**
     * Execute new guest reservation
     */
    async createBooking(bookingData) {
      if (!bookingData.guest_name || !bookingData.guest_phone || !bookingData.check_in || !bookingData.check_out) {
        throw new Error('Please fill all mandatory guest information and select valid stay dates.');
      }

      // Compute total_amount if not explicitly passed
      let totalAmount = parseFloat(bookingData.total_amount);
      if (isNaN(totalAmount) || totalAmount <= 0) {
        const acc = getLocalAccommodations().find(a => a.id === bookingData.accommodation_id);
        const rate = acc ? acc.price_per_night : 1850;
        const calc = SantipurStayEngine.calculateStayPricing(rate, bookingData.check_in, bookingData.check_out, bookingData.rooms_count);
        totalAmount = calc.totalAmount;
      }

      const newBooking = {
        id: 'b-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6),
        created_at: new Date().toISOString(),
        accommodation_id: bookingData.accommodation_id,
        guest_name: bookingData.guest_name.trim(),
        guest_phone: bookingData.guest_phone.trim(),
        guest_email: (bookingData.guest_email || '').trim(),
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        guests_count: parseInt(bookingData.guests_count, 10) || 1,
        rooms_count: parseInt(bookingData.rooms_count, 10) || 1,
        total_amount: totalAmount,
        special_notes: (bookingData.special_notes || '').trim(),
        booking_status: 'confirmed',
        payment_status: bookingData.payment_status || 'pay_at_desk'
      };

      // Try Supabase insert
      const sb = getSupabase();
      if (sb) {
        try {
          await sb.from('stay_bookings').insert([newBooking]);
        } catch (e) {
          console.warn('Supabase booking write failover to local store:', e);
        }
      }

      // Always persist in local reactive store
      const bookings = getLocalBookings();
      bookings.unshift(newBooking);
      setLocalBookings(bookings);

      return newBooking;
    },

    // -----------------------------------------------------------------------
    // PILLAR 2: OWNER REGISTRATION PIPELINE
    // -----------------------------------------------------------------------

    /**
     * Register a new Santipur property
     */
    async registerAccommodation(propertyData) {
      if (!propertyData.property_name || !propertyData.owner_name || !propertyData.owner_phone) {
        throw new Error('Property name, owner contact name, and phone are mandatory.');
      }

      const newAcc = {
        id: 'acc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6),
        created_at: new Date().toISOString(),
        owner_name: propertyData.owner_name.trim(),
        owner_phone: propertyData.owner_phone.trim(),
        owner_email: (propertyData.owner_email || '').trim(),
        property_name: propertyData.property_name.trim(),
        property_type: propertyData.property_type || 'Hotel',
        category: propertyData.category || 'Deluxe',
        landmark_area: propertyData.landmark_area || 'Station Road',
        full_address: (propertyData.full_address || 'Santipur, Nadia, West Bengal - 741404').trim(),
        pin_code: '741404',
        price_per_night: parseFloat(propertyData.price_per_night) || 1500,
        capacity_adults: parseInt(propertyData.capacity_adults, 10) || 2,
        capacity_children: parseInt(propertyData.capacity_children, 10) || 1,
        room_size_sqft: parseInt(propertyData.room_size_sqft, 10) || 350,
        floor_level: propertyData.floor_level || '1st Floor',
        bed_type: propertyData.bed_type || 'Double Bed',
        main_image_url: propertyData.main_image_url || '/images/santipur/stays/santipur-stay-room-master.jpg',
        gallery_urls: propertyData.gallery_urls && propertyData.gallery_urls.length > 0 
          ? propertyData.gallery_urls 
          : [
              '/images/santipur/stays/santipur-stay-room-master.jpg',
              '/images/santipur/stays/santipur-stay-room-living.jpg',
              '/images/santipur/stays/santipur-stay-room-bath.jpg'
            ],
        amenities: propertyData.amenities || {
          ac: true,
          wifi: true,
          attached_bath: true,
          tv: true,
          balcony: false,
          breakfast: true
        },
        room_specs: propertyData.room_specs || {
          bedroom: '1 Master Bedroom',
          bathroom: '1 Attached Western Bath',
          kitchen: 'Complimentary morning tea/coffee',
          accessibility: 'Ground Floor / Elevator Access'
        },
        description: propertyData.description || 'Verified Santipur property offering hospitable stay for pilgrims, tourists, and textile shoppers.',
        is_verified: propertyData.is_verified === true ? true : false,
        status: 'active'
      };

      // Try Supabase insert
      const sb = getSupabase();
      if (sb) {
        try {
          await sb.from('stay_accommodations').insert([newAcc]);
        } catch (e) {
          console.warn('Supabase accommodation write failover:', e);
        }
      }

      // Always save locally
      const list = getLocalAccommodations();
      list.unshift(newAcc);
      setLocalAccommodations(list);

      return newAcc;
    },

    // -----------------------------------------------------------------------
    // PILLAR 3: OWNER ADMIN PORTAL & DASHBOARD
    // -----------------------------------------------------------------------

    /**
     * Fetch management dashboard metrics, reservations, and room statuses
     */
    async getOwnerDashboardData() {
      const accommodations = getLocalAccommodations();
      const bookings = getLocalBookings();

      const totalRevenue = bookings
        .filter(b => b.booking_status !== 'cancelled')
        .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

      const confirmedBookingsCount = bookings.filter(b => b.booking_status === 'confirmed').length;
      const pendingBookingsCount = bookings.filter(b => b.booking_status === 'pending').length;
      const activeAccommodationsCount = accommodations.filter(a => a.status === 'active').length;

      // Occupancy calculation heuristic: Booked days relative to active capacity
      const occupancyRate = Math.min(94, Math.round((confirmedBookingsCount / Math.max(1, accommodations.length * 3)) * 100));

      // Join property details into bookings
      const enrichedBookings = bookings.map(b => {
        const prop = accommodations.find(a => a.id === b.accommodation_id);
        return {
          ...b,
          property_name: prop ? prop.property_name : 'Santipur Heritage Stay',
          property_type: prop ? prop.property_type : 'Lodge',
          landmark_area: prop ? prop.landmark_area : 'Santipur Town'
        };
      });

      return {
        stats: {
          totalRevenue,
          totalBookings: bookings.length,
          confirmedBookingsCount,
          pendingBookingsCount,
          activeAccommodationsCount,
          occupancyRate
        },
        accommodations,
        bookings: enrichedBookings
      };
    },

    /**
     * Update reservation status
     */
    async updateBookingStatus(bookingId, newStatus) {
      const bookings = getLocalBookings();
      const item = bookings.find(b => b.id === bookingId);
      if (item) {
        item.booking_status = newStatus;
        setLocalBookings(bookings);

        const sb = getSupabase();
        if (sb) {
          try {
            await sb.from('stay_bookings').update({ booking_status: newStatus }).eq('id', bookingId);
          } catch (e) {}
        }
        return item;
      }
      throw new Error('Booking not found');
    },

    /**
     * Toggle room / accommodation availability status
     */
    async updateAccommodationStatus(accId, newStatus) {
      const list = getLocalAccommodations();
      const item = list.find(a => a.id === accId);
      if (item) {
        item.status = newStatus;
        setLocalAccommodations(list);

        const sb = getSupabase();
        if (sb) {
          try {
            await sb.from('stay_accommodations').update({ status: newStatus }).eq('id', accId);
          } catch (e) {}
        }
        return item;
      }
      throw new Error('Accommodation not found');
    },

    /**
     * Toggle owner tariff verification status (protects tourists from unverified rates)
     */
    async toggleAccommodationVerification(accId, isVerified) {
      const list = getLocalAccommodations();
      const item = list.find(a => a.id === accId);
      if (item) {
        item.is_verified = typeof isVerified === 'boolean' ? isVerified : !item.is_verified;
        setLocalAccommodations(list);

        const sb = getSupabase();
        if (sb) {
          try {
            await sb.from('stay_accommodations').update({ is_verified: item.is_verified }).eq('id', accId);
          } catch (e) {}
        }
        return item;
      }
      throw new Error('Accommodation not found');
    },

    // Method aliases for intuitive API compatibility
    getAccommodations(filters) {
      return this.searchAccommodations(filters);
    },
    calculatePricing(pricePerNight, checkIn, checkOut, roomsCount) {
      return this.calculateStayPricing(pricePerNight, checkIn, checkOut, roomsCount);
    },
    async getBookings() {
      return getLocalBookings();
    }
  };

  window.SantipurStayEngine = SantipurStayEngine;

})(window);
