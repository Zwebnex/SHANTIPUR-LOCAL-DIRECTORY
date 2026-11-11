/**
 * Santipur Heritage Stay & Hospitality Engine (Hotels / Lodges / Homestays)
 * Core Controller & Data Layer (Pillars 1, 2 & 3)
 * Target Municipality: Santipur, Nadia, West Bengal (PIN: 741404)
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_ACCOMMODATIONS = 'santipur_stay_accommodations_v6';
  const STORAGE_KEY_BOOKINGS = 'santipur_stay_bookings_v6';

  // Strict: Purge all legacy storage keys so no pre-populated/mock listings ever leak into view
  ['santipur_stay_accommodations', 'santipur_stay_accommodations_v1', 'santipur_stay_accommodations_v2', 'santipur_stay_accommodations_v3', 'santipur_stay_accommodations_v4', 'santipur_stay_accommodations_v5'].forEach(function (k) {
    try { localStorage.removeItem(k); } catch (e) {}
  });

  // Initially empty: Real owners register their properties first!
  const SEED_ACCOMMODATIONS = [];
  const SEED_BOOKINGS = [];

  // Helper: Reliable UUID Generator for PostgreSQL UUID Columns
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

  // Internal Local Store Accessors
  function getLocalAccommodations() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACCOMMODATIONS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
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
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
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

  // Live Supabase Client: Explicitly bound to Project bnlhqkcyqymsvtqblwkv
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
          if (!error && Array.isArray(data)) {
            // When Supabase table is empty, data is [] (No mock fallback!)
            list = data;
          } else {
            // If table does not exist or network fail, use empty local store
            list = getLocalAccommodations();
          }
        } catch (e) {
          list = getLocalAccommodations();
        }
      } else {
        list = getLocalAccommodations();
      }

      // Filter locally for active status and search query
      list = (list || []).filter(item => item && item.status === 'active');

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
        id: generateUUID(),
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
        id: generateUUID(),
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
          const { data, error } = await sb.from('stay_accommodations').insert([newAcc]).select();
          if (!error && Array.isArray(data) && data[0]) {
            console.log('Successfully saved to Supabase stay_accommodations:', data[0].id);
          } else if (error) {
            console.warn('Supabase accommodation insert notice:', error.message);
          }
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
      let accommodations = getLocalAccommodations();
      let bookings = getLocalBookings();

      const sb = getSupabase();
      if (sb) {
        try {
          const [accRes, bookRes] = await Promise.all([
            sb.from('stay_accommodations').select('*'),
            sb.from('stay_bookings').select('*')
          ]);
          if (!accRes.error && Array.isArray(accRes.data)) {
            accommodations = accRes.data;
            setLocalAccommodations(accommodations);
          }
          if (!bookRes.error && Array.isArray(bookRes.data)) {
            bookings = bookRes.data;
            setLocalBookings(bookings);
          }
        } catch (e) {
          console.warn('Supabase dashboard fetch failover:', e);
        }
      }

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
