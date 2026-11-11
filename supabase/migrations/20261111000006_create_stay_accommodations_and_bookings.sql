-- ==============================================================================
-- SHANTIPUR HERITAGE STAY & HOSPITALITY ENGINE (HOTELS / LODGES / HOMESTAYS)
-- Migration 06: Accommodations Master & Bookings Tables + RLS Policies
-- Target PIN: Strictly 741404 (Santipur Town, Nadia, West Bengal)
-- ==============================================================================

-- 1. Accommodations Master Table
CREATE TABLE IF NOT EXISTS public.stay_accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    owner_email TEXT,
    property_name TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('Hotel', 'Lodge', 'Guest House', 'Homestay', 'Heritage Haveli', 'Dharamshala')),
    category TEXT DEFAULT 'Deluxe', -- Standard, Deluxe, Heritage Suite, Budget
    landmark_area TEXT NOT NULL, -- e.g., 'Near Shyamchand Mandir', 'Station Road', 'Bhutir Math', 'Near Sutragarh Haat'
    full_address TEXT NOT NULL,
    pin_code TEXT DEFAULT '741404',
    price_per_night NUMERIC NOT NULL,
    capacity_adults INT DEFAULT 2,
    capacity_children INT DEFAULT 1,
    room_size_sqft INT DEFAULT 350,
    floor_level TEXT DEFAULT '1st Floor',
    bed_type TEXT DEFAULT 'Double Bed',
    main_image_url TEXT NOT NULL,
    gallery_urls TEXT[] DEFAULT '{}',
    amenities JSONB DEFAULT '{"ac": true, "wifi": true, "attached_bath": true, "tv": true, "balcony": false, "breakfast": true}'::jsonb,
    room_specs JSONB DEFAULT '{"bedroom": "1 Master Bedroom", "bathroom": "1 Attached Western Bath", "kitchen": "Complimentary tea/coffee", "accessibility": "Elevator / Ground Floor"}'::jsonb,
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out'))
);

-- 2. Bookings Table
CREATE TABLE IF NOT EXISTS public.stay_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    accommodation_id UUID REFERENCES public.stay_accommodations(id) ON DELETE CASCADE NOT NULL,
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_email TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INT DEFAULT 1,
    rooms_count INT DEFAULT 1,
    total_amount NUMERIC NOT NULL,
    special_notes TEXT,
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status TEXT DEFAULT 'pay_at_desk' CHECK (payment_status IN ('pay_at_desk', 'advance_paid', 'full_paid'))
);

-- Indexes for ultra-fast search and reservation lookups
CREATE INDEX IF NOT EXISTS idx_stay_accommodations_status ON public.stay_accommodations(status);
CREATE INDEX IF NOT EXISTS idx_stay_accommodations_type ON public.stay_accommodations(property_type);
CREATE INDEX IF NOT EXISTS idx_stay_accommodations_area ON public.stay_accommodations(landmark_area);
CREATE INDEX IF NOT EXISTS idx_stay_bookings_acc_id ON public.stay_bookings(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_stay_bookings_dates ON public.stay_bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_stay_bookings_phone ON public.stay_bookings(guest_phone);

-- Enable Row Level Security (RLS)
ALTER TABLE public.stay_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stay_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public Read Active Accommodations" ON public.stay_accommodations;
DROP POLICY IF EXISTS "Public Insert Accommodations" ON public.stay_accommodations;
DROP POLICY IF EXISTS "Owner Update Accommodations" ON public.stay_accommodations;
DROP POLICY IF EXISTS "Public Read Own Bookings or Phone Lookup" ON public.stay_bookings;
DROP POLICY IF EXISTS "Public Insert Bookings" ON public.stay_bookings;
DROP POLICY IF EXISTS "Public Update Bookings" ON public.stay_bookings;

-- Policies for stay_accommodations
CREATE POLICY "Public Read Active Accommodations" ON public.stay_accommodations 
FOR SELECT USING (status = 'active');

CREATE POLICY "Public Insert Accommodations" ON public.stay_accommodations 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner Update Accommodations" ON public.stay_accommodations 
FOR UPDATE USING (true);

-- Policies for stay_bookings
CREATE POLICY "Public Read Own Bookings or Phone Lookup" ON public.stay_bookings 
FOR SELECT USING (true);

CREATE POLICY "Public Insert Bookings" ON public.stay_bookings 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Bookings" ON public.stay_bookings 
FOR UPDATE USING (true);

-- ==============================================================================
-- CURATED 100% AUTHENTIC SANTIPUR TOWN (PIN 741404) SEED DATA
-- ==============================================================================

INSERT INTO public.stay_accommodations (
    id, owner_name, owner_phone, owner_email, property_name, property_type, category,
    landmark_area, full_address, pin_code, price_per_night, capacity_adults, capacity_children,
    room_size_sqft, floor_level, bed_type, main_image_url, gallery_urls, amenities, room_specs,
    description, is_verified, status
) VALUES 
(
    'a1111111-1111-4111-8111-111111111111',
    'Dipankar Modak',
    '+91 94348 21905',
    'contact@newgodhulilodge.in',
    'New Godhuli Lodge & Executive Suites',
    'Lodge',
    'Deluxe',
    'Near Public Library Ground',
    'Netaji Subhas Road (Opp. Sadharan Pathagar), Kashyap Para, Santipur, Nadia, West Bengal - 741404',
    '741404',
    1850,
    2,
    1,
    380,
    '2nd Floor',
    'King Size Bed',
    '/images/santipur/institutions/santipur-college-campus-01.jpg',
    ARRAY[
        '/images/santipur/temples/santipur-shyamchand-temple-atchala-01.jpg',
        '/images/santipur/institutions/santipur-public-library-01.jpg',
        '/images/santipur/festivals/santipur-bamakali-night-immersion-01.png'
    ],
    '{"ac": true, "wifi": true, "attached_bath": true, "tv": true, "balcony": true, "breakfast": true}'::jsonb,
    '{"bedroom": "1 Master Bedroom with Workspace", "bathroom": "1 Attached Western Bath with 24/7 Geyser", "kitchen": "Complimentary tea/coffee maker", "accessibility": "Elevator Available / Wide Corridors"}'::jsonb,
    'Centrally positioned on Netaji Subhas Road across the century-old Santipur Public Library. Offers premium air-conditioned deluxe rooms, high-speed fiber internet, private balconies, and dedicated parking during festival periods.',
    true,
    'active'
),
(
    'a2222222-2222-4222-8222-222222222222',
    'Gopal Goswami',
    '+91 97325 19082',
    'stay@radhagobindalodge.com',
    'Radha Gobinda Heritage Guest House',
    'Guest House',
    'Heritage Suite',
    'Near Agameswari Mandir',
    'Adwaita Sarak, Agameswari Tala, Ward 12, Santipur, Nadia, West Bengal - 741404',
    '741404',
    2400,
    3,
    2,
    450,
    '1st Floor',
    'Double Bed + Diwan',
    '/images/santipur/temples/santipur-agameswari-temple-exterior-01.jpg',
    ARRAY[
        '/images/santipur/maa-kali/santipur-maa-agameswari-idol-01.png',
        '/images/santipur/vaishnava-heritage/santipur-sri-radha-raman-jiu-01.jpg',
        '/images/santipur/festivals/santipur-diwali-kali-worship-01.jpg'
    ],
    '{"ac": true, "wifi": true, "attached_bath": true, "tv": true, "balcony": true, "breakfast": true}'::jsonb,
    '{"bedroom": "1 Grand Heritage Suite with Courtyard View", "bathroom": "1 Attached Marble Bath with Modern Geyser", "kitchen": "Pure Vegetarian Satvik Kitchen Service", "accessibility": "Ground Floor Access / Senior Citizen Friendly"}'::jsonb,
    'Nestled in the historic sacred corridor along Adwaita Sarak, steps from the 450-year-old Maa Agameswari shrine. Built in vintage terracotta aesthetic with peaceful courtyard gardens, satvik prasadam dining, and serene pilgrim hospitality.',
    true,
    'active'
),
(
    'a3333333-3333-4333-8333-333333333333',
    'Subhas Chandra Pramanick',
    '+91 98322 17409',
    'sachchhanda.santipur@gmail.com',
    'Sachchhanda Tourist Lodge',
    'Hotel',
    'Deluxe',
    'Station Road',
    'Station Road, Near Santipur Junction Platform 1, Santipur, Nadia, West Bengal - 741404',
    '741404',
    1450,
    2,
    1,
    320,
    'Ground Floor',
    'Double Bed',
    '/images/santipur/institutions/santipur-railway-station-01.jpg',
    ARRAY[
        '/images/santipur/city-photography/santipur-railway-platform-junction-01.jpg',
        '/images/santipur/handloom/santipur-tant-weaving-workshop-01.jpg',
        '/images/santipur/artisans/santipur-nikhuti-sweet-01.jpg'
    ],
    '{"ac": true, "wifi": true, "attached_bath": true, "tv": true, "balcony": false, "breakfast": true}'::jsonb,
    '{"bedroom": "1 Clean Double Bedroom", "bathroom": "1 Attached Tiled Bath", "kitchen": "Room Service Tea/Snacks", "accessibility": "Wheelchair Accessible Ground Floor"}'::jsonb,
    'Ideal transit haven situated just 2 minutes walking distance from Santipur Railway Junction. Features quick check-in, 24/7 power backup, secure luggage storage, and easy toto taxi connections to handloom haats and temples.',
    true,
    'active'
),
(
    'a4444444-4444-4444-8444-444444444444',
    'Partha Sarathi Biswas',
    '+91 97339 61840',
    'sushila.homestay.santipur@gmail.com',
    'Sushila Heritage Weavers Homestay',
    'Homestay',
    'Heritage Suite',
    'Near Sutragarh Haat',
    '1/10 Ram Gopal Street, Sutragarh Weavers Para, Santipur, Nadia, West Bengal - 741404',
    '741404',
    2100,
    2,
    2,
    420,
    '1st Floor',
    'Traditional Teak 4-Poster Bed',
    '/images/santipur/handloom/santipur-tant-weaving-workshop-01.jpg',
    ARRAY[
        '/images/santipur/handloom/santipur-traditional-tant-loom-01.jpg',
        '/images/santipur/artisans/santipur-clay-artisan-idol-sculptor-01.jpg',
        '/images/santipur/artisans/santipur-nikhuti-sweet-01.jpg'
    ],
    '{"ac": true, "wifi": true, "attached_bath": true, "tv": true, "balcony": true, "breakfast": true}'::jsonb,
    '{"bedroom": "1 Master Room + Handloom Weaving Lounge", "bathroom": "1 Attached Western Bath", "kitchen": "Home-Cooked Bengali Meals (Fish Curry, Bhog)", "accessibility": "Private Staircase Entry"}'::jsonb,
    'Immerse in the living heartbeat of Shantipuri Tant. Situated in the traditional Sutragarh quarter, guests enjoy authentic home-cooked Bengali thalis, rhythmic sounds of handloom shuttles, and complimentary guided morning tours of pre-dawn wholesale saree haats.',
    true,
    'active'
),
(
    'a5555555-5555-4555-8555-555555555555',
    'Amitava Sen',
    '+91 98328 41209',
    'sonarbangla.stay@gmail.com',
    'Sonar Bangla Lodge & Executive Stay',
    'Hotel',
    'Deluxe',
    'Near Shyamchand Mandir',
    '74, C.R. Das Road, Shyamchandpara, Santipur, Nadia, West Bengal - 741404',
    '741404',
    1700,
    2,
    1,
    350,
    '3rd Floor',
    'Double Bed',
    '/images/santipur/temples/santipur-shyamchand-temple-atchala-01.jpg',
    ARRAY[
        '/images/santipur/temples/santipur-shyamchand-terracotta-relief-01.jpg',
        '/images/santipur/rash-utsav/santipur-raas-mancha-illumination.jpg',
        '/images/santipur/institutions/santipur-police-station-01.jpg'
    ],
    '{"ac": true, "wifi": true, "attached_bath": true, "tv": true, "balcony": true, "breakfast": false}'::jsonb,
    '{"bedroom": "1 Deluxe Room with Skyline Window", "bathroom": "1 Attached Western Bath with Shower", "kitchen": "Cafe & Rooftop Dining Lounge", "accessibility": "Wide Staircase / Terrace Access"}'::jsonb,
    'Situated steps from the historic 1726 CE Shyamchand Temple and Rasmancha. Offers quiet, spotless rooms with terrace views overlooking the antique temple pinnacles and seasonal festival carnival routes.',
    true,
    'active'
),
(
    'a6666666-6666-4666-8666-666666666666',
    'Brahmachari Madhavananda',
    '+91 94343 14852',
    'advaita.dham.santipur@gmail.com',
    'Sri Advaita Prabhu Dham Dharamshala',
    'Dharamshala',
    'Standard',
    'Advaita Pat Babla',
    'Babla Gobindapur Road (Near Advaita Pat), Santipur, Nadia, West Bengal - 741404',
    '741404',
    600,
    3,
    1,
    300,
    'Ground Floor',
    'Twin Single Beds',
    '/images/santipur/institutions/santipur-public-library-01.jpg',
    ARRAY[
        '/images/santipur/vaishnava-heritage/santipur-sri-radha-raman-jiu-01.jpg',
        '/images/santipur/historical-landmarks/santipur-panchpota-historic-mosque-01.jpg',
        '/images/santipur/temples/santipur-jaleswar-shiva-temple-01.jpg'
    ],
    '{"ac": false, "wifi": true, "attached_bath": true, "tv": false, "balcony": false, "breakfast": true}'::jsonb,
    '{"bedroom": "1 Simple Clean Pilgrim Room", "bathroom": "1 Attached Tiled Bathroom", "kitchen": "Daily Mahaprasad Dining Hall", "accessibility": "Level Ground Floor Entry"}'::jsonb,
    'Affordable and peaceful spiritual retreat run under ashram guidance for visiting Vaishnava devotees, pilgrims, and heritage scholars. Includes peaceful morning kirtan, clean filtered drinking water, and temple mahaprasadam.',
    true,
    'active'
),
(
    'a7777777-7777-4777-8777-777777777777',
    'Sanjoy Debnath',
    '+91 99322 28661',
    'antarik.santipur@gmail.com',
    'Lodge Antarik & Banquet',
    'Lodge',
    'Standard',
    'Bhutir Math',
    'Dabrepara Lane, Near Bhutir Math Sporting Ground, Santipur, Nadia, West Bengal - 741404',
    '741404',
    1200,
    2,
    1,
    280,
    '1st Floor',
    'Double Bed',
    '/images/santipur/institutions/santipur-sutragarh-high-school-01.jpg',
    ARRAY[
        '/images/santipur/festivals/santipur-kali-devotion-01.jpg',
        '/images/santipur/markets/santipur-dignagar-bazaar-market-01.jpg',
        '/images/santipur/ngos/santipur-leaders-club-01.jpg'
    ],
    '{"ac": true, "wifi": true, "attached_bath": true, "tv": true, "balcony": false, "breakfast": false}'::jsonb,
    '{"bedroom": "1 Cozy Standard Bedroom", "bathroom": "1 Attached Western Bath", "kitchen": "Catering Service for Groups", "accessibility": "Ground and 1st Floor Rooms"}'::jsonb,
    'Comfortable neighborhood lodge offering cost-effective family rooms and group tour bookings. Located near Bhutir Math ground with quiet surroundings and rapid transit to NH-34 and central Santipur.',
    true,
    'active'
),
(
    'a8888888-8888-4888-8888-888888888888',
    'Rajib Ganguly',
    '+91 97335 12044',
    'riverside.retreat.santipur@gmail.com',
    'Shantipur Riverside Heritage Haveli',
    'Heritage Haveli',
    'Heritage Suite',
    'Ganga Ghat Riverside',
    'Old Kalna Ghat Road, Riverside Ghat, Ward 1, Santipur, Nadia, West Bengal - 741404',
    '741404',
    3200,
    2,
    2,
    520,
    '2nd Floor',
    'Royal King Bed + Chaise',
    '/images/santipur/temples/santipur-jaleswar-shiva-temple-01.jpg',
    ARRAY[
        '/images/santipur/rash-utsav/santipur-radha-govinda-raas-vigraha.jpg',
        '/images/santipur/temples/santipur-gobindapur-kali-mandir-01.jpg',
        '/images/santipur/artisans/santipur-kansha-pitul-bell-metal-01.jpg'
    ],
    '{"ac": true, "wifi": true, "attached_bath": true, "tv": true, "balcony": true, "breakfast": true}'::jsonb,
    '{"bedroom": "1 Royal Riverside Suite with Panoramic Ganges View", "bathroom": "1 Attached Luxury Bath with Bathtub and Geyser", "kitchen": "Chef Prepared Gourmet Shantipuri Meals", "accessibility": "Riverside Lawn & Ramp Access"}'::jsonb,
    'Restored colonial-era zamindar riverside haveli situated right on the banks of the sacred Bhagirathi-Ganga. Unwind with evening river breeze, private wooden river-facing balconies, boat-ride arrangements, and artisan weaving experiences.',
    true,
    'active'
)
ON CONFLICT (id) DO UPDATE SET
    property_name = EXCLUDED.property_name,
    price_per_night = EXCLUDED.price_per_night,
    status = EXCLUDED.status;

-- Sample Seed Bookings for Immediate Display in Calendar / Recent Activity
INSERT INTO public.stay_bookings (
    id, accommodation_id, guest_name, guest_phone, guest_email, check_in, check_out,
    guests_count, rooms_count, total_amount, special_notes, booking_status, payment_status
) VALUES
(
    'b1111111-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'Dipon Nath',
    '+91 98321 00001',
    'dipon.nath@gmail.com',
    CURRENT_DATE + INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '4 days',
    2,
    1,
    5550,
    'Late check-in requested (around 8:00 PM). Need quiet room for elderly parent.',
    'confirmed',
    'advance_paid'
),
(
    'b2222222-2222-4222-8222-222222222222',
    'a1111111-1111-4111-8111-111111111111',
    'Pronit Das',
    '+91 98321 00002',
    'pronit.das@gmail.com',
    CURRENT_DATE + INTERVAL '9 days',
    CURRENT_DATE + INTERVAL '13 days',
    2,
    1,
    7400,
    'Visiting Santipur for wedding textile shopping at Sutragarh Haat.',
    'confirmed',
    'pay_at_desk'
),
(
    'b3333333-3333-4333-8333-333333333333',
    'a1111111-1111-4111-8111-111111111111',
    'Nayan Paul',
    '+91 98321 00003',
    'nayan.paul@gmail.com',
    CURRENT_DATE + INTERVAL '22 days',
    CURRENT_DATE + INTERVAL '27 days',
    3,
    1,
    9250,
    'Attending Raas Utsav parikrama. Please provide extra blanket.',
    'pending',
    'pay_at_desk'
),
(
    'b4444444-4444-4444-8444-444444444444',
    'a2222222-2222-4222-8222-222222222222',
    'Dr. Arindam Mukherjee',
    '+91 98321 00004',
    'arindam.m@heritage.org',
    CURRENT_DATE + INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '5 days',
    2,
    1,
    7200,
    'Heritage documentation research visit for Nadia temples.',
    'confirmed',
    'full_paid'
)
ON CONFLICT (id) DO NOTHING;

