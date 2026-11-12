/**
 * Santipur Heritage Stay & Hospitality Engine (Hotels / Lodges / Homestays)
 * Core Controller & Data Layer (Pillars 1, 2 & 3)
 * Target Municipality: Santipur, Nadia, West Bengal (PIN: 741404)
 * Architecture: Supabase PostgreSQL (properties, rooms, bookings) + Razorpay 1.5% Commission Engine
 */

(function (window) {
  'use strict';

  // Live Supabase Client Configuration
  const SUPABASE_PROJECT_URL = 'https://bnlhqkcyqymsvtqblwkv.supabase.co';
  const SUPABASE_PUBLIC_KEY = 'sb_publishable_gRldZFx01gJWHI0JKjbaNQ_9G6OgFdp';

  let _sbClient = null;
  function getSupabase() {
    if (_sbClient) return _sbClient;
    if (window.staySupabaseClient) {
      _sbClient = window.staySupabaseClient;
      return _sbClient;
    }
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        _sbClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        window.staySupabaseClient = _sbClient;
        return _sbClient;
      } catch (e) {
        console.warn('Supabase initialization notice:', e);
      }
    }
    return null;
  }

  // Reliable UUID Generator for PostgreSQL UUID Columns
  function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Generate unique booking human code (e.g. 'STAY-7A2F9')
  function generateBookingCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `STAY-${code}`;
  }

  // =========================================================================
  // PUBLIC CONTROLLER INTERFACE
  // =========================================================================

  const SantipurStayEngine = {
    // -----------------------------------------------------------------------
    // PILLAR 1: CUSTOMER SEARCH, DETAIL & BOOKING
    // -----------------------------------------------------------------------

    /**
     * Search accommodations directly from Supabase (Zero mock fallback)
     */
    async searchAccommodations(filters = {}) {
      const sb = getSupabase();
      let list = [];

      if (!sb) {
        console.error('Supabase client unavailable. Please ensure internet connectivity.');
        return [];
      }

      try {
        // Attempt 1: Fetch normalized properties with active rooms
        const { data: propData, error: propErr } = await sb
          .from('properties')
          .select(`
            id,
            owner_name,
            owner_phone,
            owner_email,
            property_name,
            property_type,
            locality,
            pincode,
            full_address,
            razorpay_account_id,
            main_image_url,
            gallery_urls,
            description,
            is_verified,
            is_active,
            rooms (*)
          `)
          .eq('is_active', true);

        if (!propErr && Array.isArray(propData) && propData.length > 0) {
          // Flatten into accommodation room listing format
          propData.forEach(prop => {
            const propRooms = Array.isArray(prop.rooms) ? prop.rooms : [];
            const activeRooms = propRooms.filter(r => (r.status || 'Active').toLowerCase() === 'active');

            if (activeRooms.length > 0) {
              activeRooms.forEach(room => {
                list.push({
                  id: room.id,
                  room_id: room.id,
                  property_id: prop.id,
                  property_name: prop.property_name,
                  property_type: prop.property_type,
                  owner_name: prop.owner_name,
                  owner_phone: prop.owner_phone,
                  owner_email: prop.owner_email,
                  landmark_area: prop.locality || 'Station Road',
                  locality: prop.locality || 'Station Road',
                  full_address: prop.full_address || 'Santipur, Nadia, West Bengal - 741404',
                  pin_code: prop.pincode || '741404',
                  pincode: prop.pincode || '741404',
                  room_title: room.room_title || 'Deluxe Room',
                  category: 'Deluxe',
                  price_per_night: parseFloat(room.base_price_per_night) || 1500,
                  base_price_per_night: parseFloat(room.base_price_per_night) || 1500,
                  capacity_adults: parseInt(room.max_guests, 10) || 2,
                  capacity_children: 1,
                  room_size_sqft: parseInt(room.room_size_sqft, 10) || 350,
                  floor_level: room.floor_level || '1st Floor',
                  bed_type: room.bed_type || 'Double Bed',
                  main_image_url: room.image_url || prop.main_image_url || '/images/santipur/stays/santipur-stay-room-master.jpg',
                  gallery_urls: (prop.gallery_urls && prop.gallery_urls.length > 0) 
                    ? prop.gallery_urls 
                    : ['/images/santipur/stays/santipur-stay-room-master.jpg', '/images/santipur/stays/santipur-stay-room-living.jpg', '/images/santipur/stays/santipur-stay-room-bath.jpg'],
                  amenities: room.amenities || { ac: true, wifi: true, attached_bath: true, tv: true, balcony: false, breakfast: true },
                  room_specs: room.room_specs || { bedroom: '1 Master Bedroom', bathroom: '1 Attached Western Bath', kitchen: 'Complimentary tea/coffee', accessibility: 'Ground Floor / Elevator' },
                  description: prop.description,
                  is_verified: prop.is_verified === true,
                  status: (room.status || 'active').toLowerCase(),
                  razorpay_account_id: prop.razorpay_account_id || null
                });
              });
            }
          });
        } else {
          // Attempt 2: Fallback query on stay_accommodations (backward-compatible view/table)
          const { data: legacyData, error: legacyErr } = await sb
            .from('stay_accommodations')
            .select('*')
            .eq('status', 'active');

          if (!legacyErr && Array.isArray(legacyData)) {
            list = legacyData;
          }
        }
      } catch (e) {
        console.warn('Direct Supabase search notice:', e.message);
        list = [];
      }

      // Filter locally for active status and user criteria
      list = (list || []).filter(item => item && (item.status === 'active' || item.status === 'Active'));

      if (filters.property_type && filters.property_type !== 'all') {
        list = list.filter(item => (item.property_type || '').toLowerCase() === filters.property_type.toLowerCase());
      }

      if (filters.landmark_area && filters.landmark_area !== 'all') {
        list = list.filter(item => (item.landmark_area || item.locality || '').toLowerCase().includes(filters.landmark_area.toLowerCase()));
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
          (item.property_name && item.property_name.toLowerCase().includes(q)) ||
          (item.full_address && item.full_address.toLowerCase().includes(q)) ||
          (item.landmark_area && item.landmark_area.toLowerCase().includes(q)) ||
          (item.locality && item.locality.toLowerCase().includes(q)) ||
          (item.property_type && item.property_type.toLowerCase().includes(q)) ||
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
     * Get single accommodation details + bookings directly from Supabase
     */
    async getAccommodationById(id) {
      const sb = getSupabase();
      if (!sb) return null;

      try {
        // Fetch room with parent property
        const { data: room, error: roomErr } = await sb
          .from('rooms')
          .select(`
            *,
            properties (*)
          `)
          .eq('id', id)
          .single();

        if (!roomErr && room && room.properties) {
          const prop = room.properties;
          
          // Fetch existing bookings for this room
          const { data: bookings } = await sb
            .from('bookings')
            .select('*')
            .eq('room_id', id)
            .neq('booking_status', 'Cancelled');

          return {
            id: room.id,
            room_id: room.id,
            property_id: prop.id,
            property_name: prop.property_name,
            property_type: prop.property_type,
            owner_name: prop.owner_name,
            owner_phone: prop.owner_phone,
            owner_email: prop.owner_email,
            landmark_area: prop.locality,
            locality: prop.locality,
            full_address: prop.full_address,
            pin_code: prop.pincode,
            pincode: prop.pincode,
            price_per_night: parseFloat(room.base_price_per_night),
            base_price_per_night: parseFloat(room.base_price_per_night),
            capacity_adults: room.max_guests,
            capacity_children: 1,
            room_size_sqft: room.room_size_sqft,
            bed_type: room.bed_type,
            floor_level: room.floor_level,
            main_image_url: room.image_url || prop.main_image_url,
            gallery_urls: prop.gallery_urls,
            amenities: room.amenities,
            room_specs: room.room_specs,
            description: prop.description,
            is_verified: prop.is_verified === true,
            status: room.status.toLowerCase(),
            razorpay_account_id: prop.razorpay_account_id,
            bookings: bookings || []
          };
        }

        // Fallback to legacy stay_accommodations view
        const { data: legacyAcc } = await sb
          .from('stay_accommodations')
          .select('*')
          .eq('id', id)
          .single();

        if (legacyAcc) {
          const { data: legacyBookings } = await sb
            .from('stay_bookings')
            .select('*')
            .eq('accommodation_id', id);

          return {
            ...legacyAcc,
            bookings: legacyBookings || []
          };
        }
      } catch (err) {
        console.warn('Error fetching accommodation details:', err.message);
      }

      return null;
    },

    /**
     * Calculate stay pricing dynamically with strict 1.5% platform commission
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
      const rate = parseFloat(pricePerNight) || 0;

      // 1. Exact room tariff charged by owner (100%)
      const hotel_base_amount = Math.round(rate * nights * rooms * 100) / 100;

      // 2. Exact 1.5% site commission
      const platform_fee_amount = Math.round((hotel_base_amount * 0.015) * 100) / 100;

      // 3. Total Advance Payable
      const total_paid_amount = Math.round((hotel_base_amount + platform_fee_amount) * 100) / 100;

      return {
        nights,
        rooms,
        pricePerNight: rate,
        hotel_base_amount,
        platform_fee_amount,
        total_paid_amount,
        // Backward-compatible aliases
        baseAmount: hotel_base_amount,
        taxes: platform_fee_amount,
        totalAmount: total_paid_amount
      };
    },

    /**
     * Create Razorpay Booking Order on the server
     */
    async createRazorpayOrder(bookingData) {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Unable to initialize Razorpay checkout order.');
      }

      return await response.json();
    },

    /**
     * Verify Razorpay Payment Signature on the server
     */
    async verifyRazorpayPayment(paymentData) {
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Payment signature verification failed.');
      }

      return await response.json();
    },

    /**
     * Direct guest reservation (supports Pay at Desk or offline fallback)
     */
    async createBooking(bookingData) {
      if (!bookingData.guest_name || !bookingData.guest_phone || !bookingData.check_in || !bookingData.check_out) {
        throw new Error('Please fill all mandatory guest information and select valid stay dates.');
      }

      const sb = getSupabase();
      if (!sb) {
        throw new Error('Database connection unavailable. Please check your network connection.');
      }

      const pricing = this.calculateStayPricing(
        bookingData.price_per_night || 1500,
        bookingData.check_in,
        bookingData.check_out,
        bookingData.rooms_count || 1
      );

      const booking_code = generateBookingCode();
      const bookingRecord = {
        id: generateUUID(),
        booking_code,
        property_id: bookingData.property_id || bookingData.accommodation_id,
        room_id: bookingData.room_id || bookingData.accommodation_id,
        guest_name: bookingData.guest_name.trim(),
        guest_phone: bookingData.guest_phone.trim(),
        guest_email: (bookingData.guest_email || '').trim(),
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        nights: pricing.nights,
        guests_count: parseInt(bookingData.guests_count, 10) || 1,
        rooms_count: parseInt(bookingData.rooms_count, 10) || 1,
        hotel_base_amount: pricing.hotel_base_amount,
        platform_fee_amount: pricing.platform_fee_amount,
        total_paid_amount: pricing.total_paid_amount,
        payment_method: bookingData.payment_method || 'pay_at_desk',
        payment_status: bookingData.payment_status || 'Pending',
        booking_status: bookingData.booking_status || 'Confirmed',
        special_notes: (bookingData.special_notes || '').trim()
      };

      // Direct write to Supabase bookings
      const { data, error } = await sb.from('bookings').insert([bookingRecord]).select();
      if (error) {
        console.error('Supabase direct booking write error:', error.message);
        // Also attempt writing to stay_bookings view/table
        await sb.from('stay_bookings').insert([{
          id: bookingRecord.id,
          accommodation_id: bookingRecord.room_id,
          guest_name: bookingRecord.guest_name,
          guest_phone: bookingRecord.guest_phone,
          guest_email: bookingRecord.guest_email,
          check_in: bookingRecord.check_in,
          check_out: bookingRecord.check_out,
          guests_count: bookingRecord.guests_count,
          rooms_count: bookingRecord.rooms_count,
          total_amount: bookingRecord.total_paid_amount,
          special_notes: bookingRecord.special_notes,
          booking_status: 'confirmed',
          payment_status: 'pay_at_desk'
        }]);
      }

      return data && data[0] ? data[0] : bookingRecord;
    },

    // -----------------------------------------------------------------------
    // PILLAR 2: OWNER REGISTRATION PIPELINE
    // -----------------------------------------------------------------------

    /**
     * Register a new Santipur property & initial room into Supabase
     */
    async registerAccommodation(propertyData) {
      if (!propertyData.property_name || !propertyData.owner_name || !propertyData.owner_phone) {
        throw new Error('Property name, owner contact name, and phone are mandatory.');
      }

      const sb = getSupabase();
      if (!sb) {
        throw new Error('Supabase client is not initialized. Please check network connection.');
      }

      const propId = generateUUID();
      const roomId = generateUUID();

      const propertyPayload = {
        id: propId,
        owner_name: propertyData.owner_name.trim(),
        owner_phone: propertyData.owner_phone.trim(),
        owner_email: (propertyData.owner_email || '').trim(),
        property_name: propertyData.property_name.trim(),
        property_type: propertyData.property_type || 'Hotel',
        locality: propertyData.landmark_area || propertyData.locality || 'Station Road',
        pincode: '741404',
        full_address: (propertyData.full_address || 'Santipur, Nadia, West Bengal - 741404').trim(),
        razorpay_account_id: (propertyData.razorpay_account_id || '').trim() || null,
        main_image_url: propertyData.main_image_url || '/images/santipur/stays/santipur-stay-room-master.jpg',
        gallery_urls: (propertyData.gallery_urls && propertyData.gallery_urls.length > 0)
          ? propertyData.gallery_urls
          : [
              '/images/santipur/stays/santipur-stay-room-master.jpg',
              '/images/santipur/stays/santipur-stay-room-living.jpg',
              '/images/santipur/stays/santipur-stay-room-bath.jpg'
            ],
        description: propertyData.description || 'Verified Santipur property offering hospitable stay for pilgrims, tourists, and textile shoppers.',
        is_verified: false,
        is_active: true
      };

      const roomPayload = {
        id: roomId,
        property_id: propId,
        room_title: propertyData.room_title || `${propertyData.property_name} Deluxe Suite`,
        base_price_per_night: parseFloat(propertyData.price_per_night) || 1500,
        max_guests: parseInt(propertyData.capacity_adults, 10) || 2,
        status: 'Active',
        room_size_sqft: parseInt(propertyData.room_size_sqft, 10) || 350,
        bed_type: propertyData.bed_type || 'Double Bed',
        floor_level: propertyData.floor_level || '1st Floor',
        image_url: propertyData.main_image_url || '/images/santipur/stays/santipur-stay-room-master.jpg',
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
        }
      };

      // 1. Insert into properties table
      const { data: pRes, error: pErr } = await sb.from('properties').insert([propertyPayload]).select();
      if (pErr) {
        console.warn('Property table insert notice, attempting legacy stay_accommodations:', pErr.message);
        // Fallback for legacy schema
        const legacyAcc = {
          id: roomId,
          owner_name: propertyPayload.owner_name,
          owner_phone: propertyPayload.owner_phone,
          owner_email: propertyPayload.owner_email,
          property_name: propertyPayload.property_name,
          property_type: propertyPayload.property_type,
          landmark_area: propertyPayload.locality,
          full_address: propertyPayload.full_address,
          pin_code: '741404',
          price_per_night: roomPayload.base_price_per_night,
          capacity_adults: roomPayload.max_guests,
          capacity_children: 1,
          room_size_sqft: roomPayload.room_size_sqft,
          floor_level: roomPayload.floor_level,
          bed_type: roomPayload.bed_type,
          main_image_url: propertyPayload.main_image_url,
          gallery_urls: propertyPayload.gallery_urls,
          amenities: roomPayload.amenities,
          room_specs: roomPayload.room_specs,
          description: propertyPayload.description,
          is_verified: false,
          status: 'active'
        };
        const { error: legErr } = await sb.from('stay_accommodations').insert([legacyAcc]);
        if (legErr) throw new Error(`Supabase registration failed: ${pErr.message}`);
        return legacyAcc;
      }

      // 2. Insert room
      const { data: rRes, error: rErr } = await sb.from('rooms').insert([roomPayload]).select();
      if (rErr) {
        console.error('Room insert error:', rErr.message);
        throw new Error(`Room creation failed: ${rErr.message}`);
      }

      return {
        ...propertyPayload,
        room: roomPayload
      };
    },

    /**
     * Add a new room to an existing property
     */
    async addRoom(propertyId, roomData) {
      const sb = getSupabase();
      if (!sb) throw new Error('Database client unavailable');

      const roomPayload = {
        id: generateUUID(),
        property_id: propertyId,
        room_title: roomData.room_title || 'Executive Room',
        base_price_per_night: parseFloat(roomData.base_price_per_night || roomData.price_per_night) || 1600,
        max_guests: parseInt(roomData.max_guests || roomData.capacity_adults, 10) || 2,
        status: roomData.status || 'Active',
        room_size_sqft: parseInt(roomData.room_size_sqft, 10) || 350,
        bed_type: roomData.bed_type || 'Double Bed',
        floor_level: roomData.floor_level || '1st Floor',
        image_url: roomData.image_url || '/images/santipur/stays/santipur-stay-room-master.jpg',
        amenities: roomData.amenities || { ac: true, wifi: true, attached_bath: true, tv: true, balcony: false, breakfast: true },
        room_specs: roomData.room_specs || { bedroom: '1 Bedroom', bathroom: '1 Attached Western Bath', kitchen: 'Morning tea', accessibility: 'Elevator' }
      };

      const { data, error } = await sb.from('rooms').insert([roomPayload]).select();
      if (error) throw new Error(error.message);
      return data && data[0] ? data[0] : roomPayload;
    },

    // -----------------------------------------------------------------------
    // PILLAR 3: OWNER ADMIN PORTAL & DASHBOARD
    // -----------------------------------------------------------------------

    /**
     * Fetch management dashboard metrics, reservations, and room statuses directly from Supabase
     */
    async getOwnerDashboardData() {
      const sb = getSupabase();
      let properties = [];
      let rooms = [];
      let bookings = [];
      let accommodations = [];

      if (sb) {
        try {
          // 1. Fetch properties and rooms
          const [propRes, roomRes, bookRes] = await Promise.all([
            sb.from('properties').select('*').order('created_at', { ascending: false }),
            sb.from('rooms').select('*, properties(*)').order('created_at', { ascending: false }),
            sb.from('bookings').select('*, properties(property_name), rooms(room_title)').order('created_at', { ascending: false })
          ]);

          if (!propRes.error && Array.isArray(propRes.data)) {
            properties = propRes.data;
          }
          if (!roomRes.error && Array.isArray(roomRes.data)) {
            rooms = roomRes.data;
            // Map rooms to accommodations for UI consistency
            accommodations = rooms.map(r => ({
              id: r.id,
              room_id: r.id,
              property_id: r.property_id,
              property_name: r.properties ? r.properties.property_name : 'Santipur Property',
              property_type: r.properties ? r.properties.property_type : 'Lodge',
              room_title: r.room_title,
              base_price_per_night: parseFloat(r.base_price_per_night),
              price_per_night: parseFloat(r.base_price_per_night),
              status: (r.status || 'Active').toLowerCase(),
              is_verified: r.properties ? r.properties.is_verified : false,
              landmark_area: r.properties ? r.properties.locality : 'Santipur',
              main_image_url: r.image_url || (r.properties ? r.properties.main_image_url : '/images/santipur/stays/santipur-stay-room-master.jpg')
            }));
          }
          if (!bookRes.error && Array.isArray(bookRes.data)) {
            bookings = bookRes.data.map(b => ({
              ...b,
              property_name: b.properties ? b.properties.property_name : 'Santipur Heritage Stay',
              room_title: b.rooms ? b.rooms.room_title : 'Deluxe Room'
            }));
          }
        } catch (e) {
          console.warn('Dashboard fetch failover attempt to legacy tables:', e.message);
        }

        // If normalized tables returned empty, check legacy views
        if (accommodations.length === 0 && bookings.length === 0) {
          try {
            const [accRes, legBookRes] = await Promise.all([
              sb.from('stay_accommodations').select('*'),
              sb.from('stay_bookings').select('*')
            ]);
            if (!accRes.error && Array.isArray(accRes.data)) {
              accommodations = accRes.data;
            }
            if (!legBookRes.error && Array.isArray(legBookRes.data)) {
              bookings = legBookRes.data;
            }
          } catch (e) {}
        }
      }

      // STRICT FINANCIAL METRICS (1.5% COMMISSION ENGINE)
      let totalGrossRevenue = 0;       // Total paid by visitors
      let totalOwnerPayout = 0;         // 100% hotel tariff
      let totalPlatformFee = 0;         // 1.5% commission

      bookings.forEach(b => {
        const isCancelled = (b.booking_status || '').toLowerCase() === 'cancelled';
        if (!isCancelled) {
          const hotelBase = parseFloat(b.hotel_base_amount || b.total_paid_amount || b.total_amount) || 0;
          const platFee = parseFloat(b.platform_fee_amount) || (Math.round((hotelBase * 0.015) * 100) / 100);
          const totalPaid = parseFloat(b.total_paid_amount || b.total_amount) || (hotelBase + platFee);

          totalGrossRevenue += totalPaid;
          totalOwnerPayout += hotelBase;
          totalPlatformFee += platFee;
        }
      });

      const confirmedBookingsCount = bookings.filter(b => (b.booking_status || '').toLowerCase() === 'confirmed').length;
      const pendingBookingsCount = bookings.filter(b => (b.booking_status || '').toLowerCase() === 'pending').length;
      const activeAccommodationsCount = accommodations.filter(a => (a.status || '').toLowerCase() === 'active').length;
      const occupancyRate = Math.min(96, Math.round((confirmedBookingsCount / Math.max(1, accommodations.length * 3)) * 100));

      return {
        stats: {
          totalRevenue: totalGrossRevenue,
          ownerPayout: totalOwnerPayout,
          platformCommission: totalPlatformFee,
          totalBookings: bookings.length,
          confirmedBookingsCount,
          pendingBookingsCount,
          activeAccommodationsCount,
          occupancyRate
        },
        properties,
        rooms,
        accommodations,
        bookings
      };
    },

    /**
     * Update reservation status directly in Supabase
     */
    async updateBookingStatus(bookingId, newStatus) {
      const sb = getSupabase();
      if (!sb) throw new Error('Database client unavailable');

      const { data, error } = await sb
        .from('bookings')
        .update({ booking_status: newStatus })
        .eq('id', bookingId)
        .select();

      if (error) {
        // Fallback update on stay_bookings
        await sb.from('stay_bookings').update({ booking_status: newStatus }).eq('id', bookingId);
      }
      return data;
    },

    /**
     * Toggle room / accommodation availability status in Supabase
     */
    async updateAccommodationStatus(accId, newStatus) {
      const sb = getSupabase();
      if (!sb) throw new Error('Database client unavailable');

      // Update in rooms table
      const { data, error } = await sb
        .from('rooms')
        .update({ status: newStatus })
        .eq('id', accId)
        .select();

      if (error) {
        // Fallback update on stay_accommodations
        await sb.from('stay_accommodations').update({ status: newStatus.toLowerCase() }).eq('id', accId);
      }
      return data;
    },

    /**
     * Toggle owner tariff verification status in Supabase
     */
    async toggleAccommodationVerification(accId, isVerified) {
      const sb = getSupabase();
      if (!sb) throw new Error('Database client unavailable');

      // Look up property_id from room or assume accId is property
      const { data: roomData } = await sb.from('rooms').select('property_id').eq('id', accId).single();
      const targetPropId = roomData ? roomData.property_id : accId;

      const { data, error } = await sb
        .from('properties')
        .update({ is_verified: isVerified })
        .eq('id', targetPropId)
        .select();

      if (error) {
        await sb.from('stay_accommodations').update({ is_verified: isVerified }).eq('id', accId);
      }
      return data;
    },

    getAccommodations(filters) {
      return this.searchAccommodations(filters);
    },
    calculatePricing(pricePerNight, checkIn, checkOut, roomsCount) {
      return this.calculateStayPricing(pricePerNight, checkIn, checkOut, roomsCount);
    }
  };

  window.SantipurStayEngine = SantipurStayEngine;

})(window);
