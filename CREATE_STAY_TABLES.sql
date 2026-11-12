-- ==============================================================================
-- SANTIPUR HERITAGE STAY & HOSPITALITY ENGINE (HOTELS / LODGES / HOMESTAYS)
-- Target Database: Supabase (Project ID: bnlhqkcyqymsvtqblwkv)
-- Schema: public
-- Tables: stay_accommodations, stay_bookings
-- INSTRUCTIONS FOR USER:
-- 1. In your Supabase Dashboard, click the SQL Editor (icon with `>_` on the left sidebar).
-- 2. Click "+ New query".
-- 3. Paste this script and click "Run" (or press Ctrl + Enter).
-- 4. The tables will be formed immediately and ready to collect real owner registrations!
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
    category TEXT DEFAULT 'Deluxe',
    landmark_area TEXT NOT NULL,
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

-- 3. Fast Performance Indexes
CREATE INDEX IF NOT EXISTS idx_stay_accommodations_status ON public.stay_accommodations(status);
CREATE INDEX IF NOT EXISTS idx_stay_accommodations_type ON public.stay_accommodations(property_type);
CREATE INDEX IF NOT EXISTS idx_stay_accommodations_area ON public.stay_accommodations(landmark_area);
CREATE INDEX IF NOT EXISTS idx_stay_accommodations_phone ON public.stay_accommodations(owner_phone);
CREATE INDEX IF NOT EXISTS idx_stay_bookings_acc_id ON public.stay_bookings(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_stay_bookings_dates ON public.stay_bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_stay_bookings_phone ON public.stay_bookings(guest_phone);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.stay_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stay_bookings ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if re-running
DROP POLICY IF EXISTS "Public Read Active Accommodations" ON public.stay_accommodations;
DROP POLICY IF EXISTS "Public Insert Accommodations" ON public.stay_accommodations;
DROP POLICY IF EXISTS "Owner Update Accommodations" ON public.stay_accommodations;
DROP POLICY IF EXISTS "Public Read Own Bookings or Phone Lookup" ON public.stay_bookings;
DROP POLICY IF EXISTS "Public Insert Bookings" ON public.stay_bookings;
DROP POLICY IF EXISTS "Public Update Bookings" ON public.stay_bookings;

-- 6. Clean Public Policies for Accommodations (0% Commission, Open Registry)
CREATE POLICY "Public Read Active Accommodations" ON public.stay_accommodations 
FOR SELECT USING (status = 'active');

CREATE POLICY "Public Insert Accommodations" ON public.stay_accommodations 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner Update Accommodations" ON public.stay_accommodations 
FOR UPDATE USING (true);

-- 7. Clean Public Policies for Bookings
CREATE POLICY "Public Read Own Bookings or Phone Lookup" ON public.stay_bookings 
FOR SELECT USING (true);

CREATE POLICY "Public Insert Bookings" ON public.stay_bookings 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Bookings" ON public.stay_bookings 
FOR UPDATE USING (true);

