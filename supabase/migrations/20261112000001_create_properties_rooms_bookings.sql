-- ==============================================================================
-- SANTIPUR HERITAGE STAY & HOSPITALITY ENGINE (HOTELS / LODGES / HOMESTAYS)
-- Database Architecture: Normalized Properties, Rooms, and Bookings
-- Target Project ID: bnlhqkcyqymsvtqblwkv (SHANTIPUR LOCAL DIRECTORY)
-- Target Schema: public
--
-- HOW TO RUN IN SUPABASE:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bnlhqkcyqymsvtqblwkv
-- 2. Click "SQL Editor" on the left menu (icon with `>_`).
-- 3. Click "+ New query", paste this entire script, and click "Run" (or Ctrl + Enter).
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROPERTIES MASTER TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    owner_email TEXT,
    property_name TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('Hotel', 'Lodge', 'Heritage Homestay', 'Dharamshala', 'Guest House', 'Heritage Haveli')),
    locality TEXT NOT NULL DEFAULT 'Station Road', -- e.g., 'Bhutir Math', 'Station Road', 'Near Shyamchand Mandir', 'Near Sutragarh Haat'
    pincode TEXT NOT NULL DEFAULT '741404',
    full_address TEXT NOT NULL DEFAULT 'Santipur, Nadia, West Bengal - 741404',
    razorpay_account_id TEXT, -- Optional: linked owner account for Razorpay Route auto-splits
    main_image_url TEXT NOT NULL DEFAULT '/images/santipur/stays/santipur-stay-room-master.jpg',
    gallery_urls TEXT[] DEFAULT ARRAY[
        '/images/santipur/stays/santipur-stay-room-master.jpg',
        '/images/santipur/stays/santipur-stay-room-living.jpg',
        '/images/santipur/stays/santipur-stay-room-bath.jpg'
    ],
    description TEXT DEFAULT 'Verified Santipur property offering hospitable stay for pilgrims, tourists, and textile shoppers.',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

-- ==============================================================================
-- 2. ROOMS TABLE (Relational child of properties)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    room_title TEXT NOT NULL DEFAULT 'Deluxe Heritage Room',
    base_price_per_night NUMERIC NOT NULL,
    max_guests INT NOT NULL DEFAULT 2,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Sold Out')),
    room_size_sqft INT DEFAULT 350,
    bed_type TEXT DEFAULT 'Double Bed',
    floor_level TEXT DEFAULT '1st Floor',
    image_url TEXT DEFAULT '/images/santipur/stays/santipur-stay-room-master.jpg',
    amenities JSONB DEFAULT '{
        "ac": true,
        "wifi": true,
        "attached_bath": true,
        "tv": true,
        "balcony": false,
        "breakfast": true
    }'::jsonb,
    room_specs JSONB DEFAULT '{
        "bedroom": "1 Master Bedroom",
        "bathroom": "1 Attached Western Bath",
        "kitchen": "Complimentary morning tea/coffee",
        "accessibility": "Ground Floor / Elevator Access"
    }'::jsonb
);

-- ==============================================================================
-- 3. BOOKINGS TABLE (Advance Booking + 1.5% Platform Commission)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    booking_code TEXT NOT NULL UNIQUE, -- e.g., 'STAY-7A2F9'
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_email TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL DEFAULT 1,
    guests_count INT NOT NULL DEFAULT 1,
    rooms_count INT NOT NULL DEFAULT 1,
    hotel_base_amount NUMERIC NOT NULL,     -- Exact room tariff charged by owner
    platform_fee_amount NUMERIC NOT NULL,   -- Strict 1.5% site commission
    total_paid_amount NUMERIC NOT NULL,     -- hotel_base_amount + platform_fee_amount
    payment_method TEXT NOT NULL DEFAULT 'Razorpay',
    payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    booking_status TEXT NOT NULL DEFAULT 'Pending' CHECK (booking_status IN ('Confirmed', 'Pending', 'Cancelled')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    special_notes TEXT
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON public.properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_locality ON public.properties(locality);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_owner_phone ON public.properties(owner_phone);

CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON public.rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON public.rooms(base_price_per_night);

CREATE INDEX IF NOT EXISTS idx_bookings_code ON public.bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_prop_id ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON public.bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_phone ON public.bookings(guest_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON public.bookings(booking_status);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop prior policies if re-running script cleanly
DROP POLICY IF EXISTS "Public Read Active Properties" ON public.properties;
DROP POLICY IF EXISTS "Public Read All Properties For Dashboard" ON public.properties;
DROP POLICY IF EXISTS "Public Insert Properties" ON public.properties;
DROP POLICY IF EXISTS "Public Update Properties" ON public.properties;

DROP POLICY IF EXISTS "Public Read Active Rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public Read All Rooms For Dashboard" ON public.rooms;
DROP POLICY IF EXISTS "Public Insert Rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public Update Rooms" ON public.rooms;

DROP POLICY IF EXISTS "Public Read Bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public Insert Bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public Update Bookings" ON public.bookings;

-- PROPERTIES POLICIES:
-- Public can read all active properties
CREATE POLICY "Public Read Active Properties" ON public.properties
FOR SELECT USING (is_active = true);

-- Public / Owner can register a new property
CREATE POLICY "Public Insert Properties" ON public.properties
FOR INSERT WITH CHECK (true);

-- Owners can update property status / verification
CREATE POLICY "Public Update Properties" ON public.properties
FOR UPDATE USING (true);

-- ROOMS POLICIES:
-- Public can read active rooms
CREATE POLICY "Public Read Active Rooms" ON public.rooms
FOR SELECT USING (true);

-- Property owners can insert new rooms
CREATE POLICY "Public Insert Rooms" ON public.rooms
FOR INSERT WITH CHECK (true);

-- Property owners can update rooms (e.g. toggle active/inactive/sold_out)
CREATE POLICY "Public Update Rooms" ON public.rooms
FOR UPDATE USING (true);

-- BOOKINGS POLICIES:
-- Public & owners can read bookings
CREATE POLICY "Public Read Bookings" ON public.bookings
FOR SELECT USING (true);

-- Guests can create new reservation requests
CREATE POLICY "Public Insert Bookings" ON public.bookings
FOR INSERT WITH CHECK (true);

-- Backend API & verification can update booking status & payment status
CREATE POLICY "Public Update Bookings" ON public.bookings
FOR UPDATE USING (true);

-- ==============================================================================
-- 6. BACKWARD COMPATIBILITY VIEWS (Preserves legacy code gracefully)
-- ==============================================================================
CREATE OR REPLACE VIEW public.stay_accommodations AS
SELECT 
    r.id AS id,
    r.created_at,
    p.owner_name,
    p.owner_phone,
    p.owner_email,
    p.property_name,
    p.property_type,
    'Deluxe' AS category,
    p.locality AS landmark_area,
    p.full_address,
    p.pincode AS pin_code,
    r.base_price_per_night AS price_per_night,
    r.max_guests AS capacity_adults,
    1 AS capacity_children,
    r.room_size_sqft,
    r.floor_level,
    r.bed_type,
    p.main_image_url,
    p.gallery_urls,
    r.amenities,
    r.room_specs,
    p.description,
    p.is_verified,
    CASE 
        WHEN p.is_active = false THEN 'inactive'
        WHEN lower(r.status) = 'sold out' THEN 'sold_out'
        WHEN lower(r.status) = 'inactive' THEN 'inactive'
        ELSE 'active'
    END AS status,
    p.id AS property_id,
    p.razorpay_account_id
FROM public.properties p
JOIN public.rooms r ON r.property_id = p.id;

CREATE OR REPLACE VIEW public.stay_bookings AS
SELECT
    b.id,
    b.created_at,
    b.room_id AS accommodation_id,
    b.property_id,
    b.guest_name,
    b.guest_phone,
    b.guest_email,
    b.check_in,
    b.check_out,
    b.guests_count,
    b.rooms_count,
    b.total_paid_amount AS total_amount,
    b.special_notes,
    lower(b.booking_status) AS booking_status,
    lower(b.payment_status) AS payment_status,
    b.booking_code,
    b.hotel_base_amount,
    b.platform_fee_amount,
    b.razorpay_order_id,
    b.razorpay_payment_id
FROM public.bookings b;
