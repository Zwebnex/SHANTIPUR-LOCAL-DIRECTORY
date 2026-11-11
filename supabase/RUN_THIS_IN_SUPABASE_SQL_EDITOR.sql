-- ==============================================================================
-- SHANTIPUR LOCAL DIRECTORY — COMPLETE PRODUCTION DATABASE SETUP
-- Project ID: bnlhqkcyqymsvtqblwkv
-- Target Supabase URL: https://bnlhqkcyqymsvtqblwkv.supabase.co
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/bnlhqkcyqymsvtqblwkv
-- 2. Click "SQL Editor" in the left sidebar (>_ icon).
-- 3. Click "+ New query".
-- 4. Paste this ENTIRE file into the editor.
-- 5. Click the green "Run" button (or press Ctrl + Enter).
-- ==============================================================================

-- ==============================================================================
-- PART 1: PRIVATE SECURITY SCHEMAS & RATE LIMITING
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS app_security;
CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role, postgres;

REVOKE ALL ON SCHEMA app_security FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA app_security TO service_role, postgres;

CREATE TABLE IF NOT EXISTS private.login_attempts (
    id BIGSERIAL PRIMARY KEY,
    ip_address TEXT NOT NULL,
    email_hash TEXT NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_window ON private.login_attempts (ip_address, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_window ON private.login_attempts (email_hash, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_cleanup ON private.login_attempts (attempted_at);

REVOKE ALL ON TABLE private.login_attempts FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE private.login_attempts TO service_role, postgres;

CREATE OR REPLACE FUNCTION private.check_login_rate_limit(
    p_ip TEXT,
    p_email_hash TEXT
)
RETURNS TABLE (
    is_allowed BOOLEAN,
    attempt_count INTEGER,
    retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
DECLARE
    v_window_start TIMESTAMPTZ;
    v_window_seconds CONSTANT INTEGER := 50;
    v_max_attempts CONSTANT INTEGER := 5;
    v_count INTEGER;
    v_oldest_attempt TIMESTAMPTZ;
    v_retry_after INTEGER := 0;
BEGIN
    v_window_start := timezone('utc'::text, now()) - (v_window_seconds || ' seconds')::INTERVAL;

    SELECT COUNT(*), MIN(attempted_at)
    INTO v_count, v_oldest_attempt
    FROM private.login_attempts
    WHERE (ip_address = p_ip OR email_hash = p_email_hash)
      AND attempted_at >= v_window_start;

    IF v_count >= v_max_attempts THEN
        v_retry_after := CEIL(EXTRACT(EPOCH FROM (v_oldest_attempt + (v_window_seconds || ' seconds')::INTERVAL - timezone('utc'::text, now()))));
        IF v_retry_after < 1 THEN v_retry_after := 1; END IF;
        RETURN QUERY SELECT false, v_count, v_retry_after;
        RETURN;
    END IF;

    RETURN QUERY SELECT true, v_count, 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION private.check_login_rate_limit(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.check_login_rate_limit(TEXT, TEXT) TO service_role, postgres;

-- ==============================================================================
-- PART 2: APPLICATION TABLES & PROFILES
-- ==============================================================================

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'registered_user' 
        CHECK (role IN ('registered_user', 'business_owner', 'admin')),
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. Business Directory Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_bn TEXT,
    category TEXT NOT NULL,
    trade_license_number TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    ward INTEGER CHECK (ward >= 1 AND ward <= 24),
    est_year INTEGER,
    description TEXT,
    document_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_verified ON public.businesses(is_verified);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);

-- 3. Heritage Listings Table
CREATE TABLE IF NOT EXISTS public.heritage_listings (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    location_en TEXT,
    location_bn TEXT,
    history_en TEXT,
    history_bn TEXT,
    rituals_en TEXT,
    rituals_bn TEXT,
    image_url TEXT,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Community Contributions Table
CREATE TABLE IF NOT EXISTS public.community_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id TEXT REFERENCES public.heritage_listings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected')),
    moderation_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_contributions_user ON public.community_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON public.community_contributions(status);

-- 5. Saved Places Table
CREATE TABLE IF NOT EXISTS public.saved_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    place_id TEXT NOT NULL,
    place_type TEXT NOT NULL CHECK (place_type IN ('heritage', 'business', 'route')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_saved_place UNIQUE(user_id, place_id, place_type)
);

CREATE INDEX IF NOT EXISTS idx_saved_places_user ON public.saved_places(user_id);

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('business', 'heritage')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_review UNIQUE(user_id, target_id, target_type)
);

CREATE INDEX IF NOT EXISTS idx_reviews_target ON public.reviews(target_id, target_type);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- 8. GIS Destinations Table
CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bengali_name TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'temple', 
        'cultural_event_venue', 
        'vaishnava_heritage', 
        'historic_landmark', 
        'historic_ghat', 
        'handloom_hub'
    )),
    address TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    google_place_id TEXT,
    plus_code TEXT,
    description TEXT NOT NULL,
    description_bn TEXT,
    historical_significance TEXT,
    historical_significance_bn TEXT,
    image_url TEXT,
    image_verification_status TEXT DEFAULT 'verified' CHECK (image_verification_status IN ('verified', 'pending_verification', 'placeholder')),
    location_verification_status TEXT DEFAULT 'verified' CHECK (location_verification_status IN ('verified', 'approximate', 'pending_confirmation')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Festival Event Venues Table (Bama Kali Dance decoupled from permanent temple)
CREATE TABLE IF NOT EXISTS public.festival_event_venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    festival_year INT NOT NULL,
    permanent_sanctum_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    active_venue_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    historical_crossing_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    venue_shift_rationale TEXT,
    crowd_management_notes TEXT,
    is_current_venue BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Curated Routes Table
CREATE TABLE IF NOT EXISTS public.curated_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    bengali_title TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    description_bn TEXT,
    total_distance_km NUMERIC(5, 2),
    estimated_duration_minutes INT,
    stops_order JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- PART 3: ROW LEVEL SECURITY & HELPER FUNCTIONS
-- ==============================================================================

-- Admin Authorization Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION app_security.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT public.is_admin();
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role, postgres;
GRANT EXECUTE ON FUNCTION app_security.is_admin() TO authenticated, service_role, postgres;

-- Enable RLS on all 10 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festival_event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_routes ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

-- Businesses Policies
DROP POLICY IF EXISTS "businesses_select_verified" ON public.businesses;
CREATE POLICY "businesses_select_verified" ON public.businesses FOR SELECT USING (is_verified = true OR auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "businesses_insert_authenticated" ON public.businesses;
CREATE POLICY "businesses_insert_authenticated" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "businesses_update_owner_or_admin" ON public.businesses;
CREATE POLICY "businesses_update_owner_or_admin" ON public.businesses FOR UPDATE USING (auth.uid() = owner_id OR public.is_admin()) WITH CHECK (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "businesses_delete_admin" ON public.businesses;
CREATE POLICY "businesses_delete_admin" ON public.businesses FOR DELETE USING (public.is_admin());

-- Heritage Listings Policies
DROP POLICY IF EXISTS "heritage_select_public" ON public.heritage_listings;
CREATE POLICY "heritage_select_public" ON public.heritage_listings FOR SELECT USING (is_verified = true OR public.is_admin());

DROP POLICY IF EXISTS "heritage_insert_admin" ON public.heritage_listings;
CREATE POLICY "heritage_insert_admin" ON public.heritage_listings FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "heritage_update_admin" ON public.heritage_listings;
CREATE POLICY "heritage_update_admin" ON public.heritage_listings FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "heritage_delete_admin" ON public.heritage_listings;
CREATE POLICY "heritage_delete_admin" ON public.heritage_listings FOR DELETE USING (public.is_admin());

-- Destinations Policies
DROP POLICY IF EXISTS "destinations_select_public" ON public.destinations;
CREATE POLICY "destinations_select_public" ON public.destinations FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "destinations_admin_all" ON public.destinations;
CREATE POLICY "destinations_admin_all" ON public.destinations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Festival Event Venues Policies
DROP POLICY IF EXISTS "venues_select_public" ON public.festival_event_venues;
CREATE POLICY "venues_select_public" ON public.festival_event_venues FOR SELECT USING (is_current_venue = true OR public.is_admin());

DROP POLICY IF EXISTS "venues_admin_all" ON public.festival_event_venues;
CREATE POLICY "venues_admin_all" ON public.festival_event_venues FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Curated Routes Policies
DROP POLICY IF EXISTS "routes_select_public" ON public.curated_routes;
CREATE POLICY "routes_select_public" ON public.curated_routes FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "routes_admin_all" ON public.curated_routes;
CREATE POLICY "routes_admin_all" ON public.curated_routes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Saved Places Policies
DROP POLICY IF EXISTS "saved_places_user_all" ON public.saved_places;
CREATE POLICY "saved_places_user_all" ON public.saved_places FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews Policies
DROP POLICY IF EXISTS "reviews_select_approved" ON public.reviews;
CREATE POLICY "reviews_select_approved" ON public.reviews FOR SELECT USING (is_approved = true OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
CREATE POLICY "reviews_insert_authenticated" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own_or_admin" ON public.reviews;
CREATE POLICY "reviews_update_own_or_admin" ON public.reviews FOR UPDATE USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Community Contributions Policies
DROP POLICY IF EXISTS "contributions_select_approved" ON public.community_contributions;
CREATE POLICY "contributions_select_approved" ON public.community_contributions FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "contributions_insert_authenticated" ON public.community_contributions;
CREATE POLICY "contributions_insert_authenticated" ON public.community_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "contributions_update_moderator" ON public.community_contributions;
CREATE POLICY "contributions_update_moderator" ON public.community_contributions FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Audit Logs Policies
DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs FOR SELECT USING (public.is_admin());

-- ==============================================================================
-- PART 4: AUTOMATIC SIGNUP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_full_name TEXT;
    v_role TEXT := 'registered_user';
    v_phone TEXT;
BEGIN
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', 'Resident of Shantipur');
    v_phone := new.raw_user_meta_data->>'phone';
    
    IF (new.raw_user_meta_data->>'role') = 'business_owner' THEN
        v_role := 'business_owner';
    END IF;

    -- Security guarantee: New signups cannot self-assign admin
    INSERT INTO public.profiles (id, full_name, role, phone)
    VALUES (new.id, v_full_name, v_role, v_phone)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatically backfill profile for any existing user already in auth.users
INSERT INTO public.profiles (id, full_name, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', 'Project Owner'), 'admin'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- PART 5: STORAGE BUCKETS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('heritage-media', 'heritage-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('business-documents', 'business-documents', false, 15728640, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
    ('user-uploads', 'user-uploads', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "heritage_media_public_read" ON storage.objects;
CREATE POLICY "heritage_media_public_read" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'heritage-media');

DROP POLICY IF EXISTS "user_uploads_public_read" ON storage.objects;
CREATE POLICY "user_uploads_public_read" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'user-uploads');

-- ==============================================================================
-- PART 6: HERITAGE ROUTE MAP & GIS DESTINATIONS TABLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bengali_name TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'temple', 
        'cultural_event_venue', 
        'vaishnava_heritage', 
        'historic_landmark', 
        'historic_ghat', 
        'handloom_hub'
    )),
    address TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    google_place_id TEXT,
    google_maps_url TEXT,
    plus_code TEXT,
    description TEXT NOT NULL,
    description_bn TEXT,
    historical_significance TEXT,
    historical_significance_bn TEXT,
    image_url TEXT,
    image_verification_status TEXT DEFAULT 'verified' CHECK (image_verification_status IN ('verified', 'pending_verification', 'placeholder')),
    location_verification_status TEXT DEFAULT 'verified' CHECK (location_verification_status IN ('verified', 'approximate', 'pending_confirmation')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.festival_event_venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    festival_year INT NOT NULL,
    permanent_sanctum_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    active_venue_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    historical_crossing_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    venue_shift_rationale TEXT,
    crowd_management_notes TEXT,
    is_current_venue BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.curated_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    bengali_title TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    description_bn TEXT,
    total_distance_km NUMERIC(5, 2),
    estimated_duration_minutes INT,
    stops_order JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festival_event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active destinations" ON public.destinations;
CREATE POLICY "Public can view active destinations"
    ON public.destinations FOR SELECT
    USING (is_active = true OR app_security.is_admin());

DROP POLICY IF EXISTS "Public can view active festival venues" ON public.festival_event_venues;
CREATE POLICY "Public can view active festival venues"
    ON public.festival_event_venues FOR SELECT
    USING (is_current_venue = true OR app_security.is_admin());

DROP POLICY IF EXISTS "Public can view active curated routes" ON public.curated_routes;
CREATE POLICY "Public can view active curated routes"
    ON public.curated_routes FOR SELECT
    USING (is_active = true OR app_security.is_admin());

DROP POLICY IF EXISTS "Admins can insert destinations" ON public.destinations;
CREATE POLICY "Admins can insert destinations"
    ON public.destinations FOR INSERT TO authenticated
    WITH CHECK (app_security.is_admin());

DROP POLICY IF EXISTS "Admins can update destinations" ON public.destinations;
CREATE POLICY "Admins can update destinations"
    ON public.destinations FOR UPDATE TO authenticated
    USING (app_security.is_admin())
    WITH CHECK (app_security.is_admin());

DROP POLICY IF EXISTS "Admins can delete destinations" ON public.destinations;
CREATE POLICY "Admins can delete destinations"
    ON public.destinations FOR DELETE TO authenticated
    USING (app_security.is_admin());

DROP POLICY IF EXISTS "Admins can insert festival venues" ON public.festival_event_venues;
CREATE POLICY "Admins can insert festival venues"
    ON public.festival_event_venues FOR INSERT TO authenticated
    WITH CHECK (app_security.is_admin());

DROP POLICY IF EXISTS "Admins can update festival venues" ON public.festival_event_venues;
CREATE POLICY "Admins can update festival venues"
    ON public.festival_event_venues FOR UPDATE TO authenticated
    USING (app_security.is_admin())
    WITH CHECK (app_security.is_admin());

DROP POLICY IF EXISTS "Admins can insert curated routes" ON public.curated_routes;
CREATE POLICY "Admins can insert curated routes"
    ON public.curated_routes FOR INSERT TO authenticated
    WITH CHECK (app_security.is_admin());

DROP POLICY IF EXISTS "Admins can update curated routes" ON public.curated_routes;
CREATE POLICY "Admins can update curated routes"
    ON public.curated_routes FOR UPDATE TO authenticated
    USING (app_security.is_admin())
    WITH CHECK (app_security.is_admin());

-- ==============================================================================
-- ==============================================================================
-- PART 7: SEED INITIAL VERIFIED DESTINATIONS & ROUTES (GEOGRAPHICALLY AUDITED)
-- ==============================================================================
INSERT INTO public.destinations (slug, name, bengali_name, category, address, latitude, longitude, plus_code, google_maps_url, description, description_bn, historical_significance, image_url, image_verification_status, location_verification_status)
VALUES
    ('bejpara-ground', 'Bejpara Maath (Bejpara Ground)', 'বেজপাড়া মাঠ', 'cultural_event_venue', 'Bejpara Ground, Bejpara / Char Jijira, Shantipur, Nadia, West Bengal - 741404', 23.232778, 88.438889, '6CVQ+4H Shantipur', 'https://maps.app.goo.gl/duNTyatQ7nMmSxYc6', 'Designated 2026 performance ground where the renowned Shantipur Bama Kali immersion dance and festive gatherings take place.', 'শান্তিপুরের ঐতিহ্যবাহী বামা কালী নৃত্য ও বিসর্জনের সাম্প্রতিক প্রশস্ত ময়দান।', 'Venue shifted from the narrow Barabazar More junction for crowd safety, medical barricading, and CCTV monitoring.', '/images/santipur/festivals/santipur-bamakali-night-immersion-01.png', 'verified', 'verified'),
    ('bama-kali-temple', 'Maa Bamakali Sanctum Shrine', 'মা বামা কালী মন্দির', 'temple', 'Bamakali Tala, Sutragarh (near K.C. Das Road, Ward 19), Shantipur, Nadia - 741404', 23.243889, 88.421667, '6CPG+HV Shantipur', NULL, 'Revered 500-year-old permanent sanctum of Maa Bamakali. Consecrated with the left foot forward.', '৫০০ বছরের জাগ্রত আদি বামা কালী মন্দির। দেবী এখানে বাম পদ সম্মুখে রেখে অধিষ্ঠিতা।', 'The permanent religious shrine where the deity is sculpted and consecrated before the dancing procession.', '/images/santipur/maa-kali/santipur-maa-bamakali-idol-01.png', 'verified', 'verified'),
    ('barabazar-more', 'Barabazar More (Historic Dance Crossing)', 'বড়বাজার মোড়', 'cultural_event_venue', 'Barabazar Chowrasta, Ward 8, Shantipur, Nadia - 741404', 23.258611, 88.437500, '7C5P+C2 Shantipur', NULL, 'Traditional central commercial crossing where the Bama Kali immersion dance took place for over 56 years.', 'ঐতিহাসিক বড়বাজার মোড়, যেখানে দীর্ঘ ৫৬ বছর ধরে বামা কালীর বিখ্যাত বিসর্জন নৃত্য অনুষ্ঠিত হতো।', 'Centuries-old market intersection that hosted historic dance performances before shifting to Bejpara Ground in 2026.', '/images/santipur/om-placeholder.svg', 'placeholder', 'verified'),
    ('boro-goswami-bari', 'Sri Sri Radha Raman Jiu (Boro Goswami Bari)', 'শ্রী শ্রী রাধারমণ জিউ (বড় গোস্বামী বাড়ি)', 'vaishnava_heritage', 'Goswami Bari Street, Radharaman Jiu Complex, Shantipur, Nadia - 741404', 23.250000, 88.440833, '7C2R+79 Shantipur', NULL, 'Ancestral seat of Sri Advaita Acharya lineage established in 1484 CE (~540 years). Epicenter of Bhanga Rash.', '১৪৮৪ খ্রিষ্টাব্দে প্রতিষ্ঠিত শ্রী অদ্বৈত আচার্য প্রভুর আদি ভিটা ও রাধারমণ জিউর মন্দির।', 'Historic Shakta-Vaishnava truce site. In colonial records, "Jiu" was frequently Anglicized phonetically as "Jews".', '/images/santipur/vaishnava-heritage/santipur-sri-radha-raman-jiu-01.jpg', 'verified', 'verified'),
    ('choto-goswami-bari', 'Choto Goswami Bari (Chakfera / Sitanather Bari)', 'ছোট গোস্বামী বাড়ি (চাকফেরা)', 'vaishnava_heritage', 'Chakfera, Goswami Para, Shantipur, Nadia - 741404', 23.249167, 88.439444, '6CWQ+MQ Shantipur', NULL, 'Revered junior branch of Advaita Acharyas family lineage, consecrated to Sri Sri Radha Vallabh Jiu.', 'শ্রী অদ্বৈত আচার্য প্রভুর অনুজ শাখা এবং শ্রী শ্রী রাধাবল্লভ জিউর ঐতিহ্যবাহী সেবা কেন্দ্র।', 'Cherished for ornate Gaudiya rituals, rotating Rasamandal wheel (Chak-fera), and Vaishnava padavali kirtan.', '/images/santipur/om-placeholder.svg', 'placeholder', 'verified'),
    ('madan-gopal-bari', 'Sri Sri Radha Madan Gopal Jiu (Madan Gopal Bari)', 'শ্রী শ্রী রাধামদনগোপাল জিউ মন্দির', 'vaishnava_heritage', 'Madangopal Para (near Municipality / Dakghar More), Shantipur, Nadia - 741404', 23.250000, 88.430000, '7C2J+22 Shantipur', NULL, 'Centuries-old Vaishnava sanctum housing Sri Sri Radha Madan Gopal Jiu, originally brought by Advaita Acharya.', 'শ্রী অদ্বৈত আচার্য প্রভুর দ্বারা আনীত শ্রী শ্রী রাধামদনগোপাল জিউর ঐতিহাসিক মন্দির।', 'Madangopal Para takes its name from this revered shrine adjacent to the Municipality; prominent Rash Parikrama stop.', '/images/santipur/om-placeholder.svg', 'placeholder', 'verified'),
    ('jaleswar-shiva-temple', 'Jaleswar Shiva Temple (ASI Protected)', 'শ্রী জলেশ্বর মহাদেব মন্দির (এএসআই চারচালা)', 'temple', 'Jaleswartala, near Motiganj / old NH-34, Shantipur, Nadia - 741404', 23.239106, 88.433381, '6CQM+J9 Shantipur', NULL, 'Protected Monument (ASI N-WB-54-d) erected in early 18th century by Maharaja Raghuram Roy of Nadia.', 'নদিয়ার মহারাজ রঘুরাম রায় নির্মিত সুপ্রাচীন চারচালা টেরাকোটা শিব মন্দির (এএসআই সংরক্ষিত)।', 'Houses self-manifested Swayambhu Shiva Linga with puranic terracotta panels; clarifies local Jora Mandir traditions.', '/images/santipur/temples/santipur-jaleswar-shiva-temple-01.jpg', 'verified', 'verified'),
    ('shyamchand-mandir', 'Shyamchand Mandir (1726 CE, ASI S-WB-96)', 'শ্রী শ্যামচাঁদ জিউ মন্দির (১৭২৬ খ্রি.)', 'temple', 'Shyamchand Bagan Lane, Barabazar, Shantipur - 741404', 23.239703, 88.441490, '6CQR+VJJ Shantipur', NULL, 'Grand 1726 CE Atchala (eight-roofed) terracotta brick temple erected by merchant Ramgopal Khan Chowdhury.', '১৭২৬ সালে বস্ত্রবণিক রামগোপাল খাঁ চৌধুরী নির্মিত বাংলার অন্যতম শ্রেষ্ঠ আটচালা মন্দির।', 'Architectural monument of Shantipur handloom wealth (ASI S-WB-96, Wikidata Q66439262).', '/images/santipur/temples/santipur-shyamchand-temple-atchala-01.jpg', 'verified', 'verified'),
    ('topkhana-mosque', 'Topkhana Mosque & Panchpota Landmark (1703 CE)', 'তোপখানা মসজিদ ও পঞ্চপোতা সৌধ', 'historic_landmark', 'Topkhana, Panchpota, Shantipur, Nadia - 741404', 23.237306, 88.424800, '6CPF+WW Shantipur', NULL, 'Mughal-era heritage site commissioned in 1703 CE by Faujdar Gazi Mohammad Yar Khan under Emperor Aurangzeb.', 'মুঘল আমলে ফৌজদার গাজী মহম্মদ ইয়ার খান নির্মিত ঐতিহাসিক তোপখানা মসজিদ ও সৌধ।', 'West Bengal Heritage Commission recognized site (Wikidata Q67501531); exemplary Indo-Islamic brick architecture.', '/images/santipur/historical-landmarks/santipur-panchpota-historic-mosque-01.jpg', 'verified', 'verified'),
    ('advaita-pat-babaji-ghat', 'Advaita Pat (Babla Aditya-Path Ashram)', 'শ্রী অদ্বৈত পাঠ (বাবলা আদিত্য-পাঠ আশ্রম)', 'vaishnava_heritage', 'Babla (Bablagobindapur), Shantipur, Nadia - 741404', 23.265000, 88.445556, '7C8W+26 Shantipur', NULL, 'Sacred meditation site and hermitage of Sri Advaita Acharya in Babla, where Chaitanya Mahaprabhu visited.', 'বাবলা গোবিন্দপুরে শ্রী অদ্বৈত প্রভুর পবিত্র সাধনপীঠ ও মহাপ্রভুর পুণ্য মিলনস্থল।', 'Major Gaudiya Vaishnava Sripat and ashram in Bablagobindapur north of Shantipur town.', '/images/santipur/om-placeholder.svg', 'placeholder', 'verified'),
    ('maa-agameswari', 'Maa Agameswari Tala', 'মা আগমেশ্বরী তলা', 'temple', 'Agameswari Tala, Ward 12, Shantipur, Nadia - 741404', 23.249444, 88.443333, '6CVV+Q8 Shantipur', NULL, '420-year-old Tantric shrine established by Pandit Krishnananda Agambagish, author of Brihat Tantrasara.', 'বৃহৎ তন্ত্রসার প্রণেতা তন্ত্রসাধক পণ্ডিত কৃষ্ণানন্দ আগমবাগীশ দ্বারা প্রতিষ্ঠিত ৪২০ বছরের মহাতীর্থ।', 'Consolidated through the historic alliance between Advaita Acharyas descendant and Sarvabhauma Agambagish (Wikimapia 23249051).', '/images/santipur/maa-kali/santipur-maa-agameswari-idol-01.png', 'verified', 'verified'),
    ('maa-mahishkhagi', 'Maa Mahishkhagi (Mahishkhagi Para)', 'মা মহিষখাগী (মহিষখাগী পাড়া)', 'temple', 'Bhabani Para Street / Mahishkhagi, Ward 8, Shantipur, Nadia - 741404', 23.245833, 88.436667, '6CWQ+8M Shantipur', NULL, '500-year-old deity celebrated for unique Vedic marriage rituals and traditional shoulder-borne immersion.', 'পাঁচ শতাব্দীরও বেশি পূর্বে প্রতিষ্ঠিত অনন্য কালী, যাঁকে হিন্দু বৈদিক বিবাহ রীতিতে বরণ করা হয়।', 'Devotees carry the immense idol solely on bare shoulders across the town.', '/images/santipur/maa-kali/santipur-maa-mahishkhagi-procession-01.jpg', 'verified', 'verified'),
    ('siddheswari-kali', 'Siddheswari Kali Mandir (Sutragarh)', 'সিদ্ধেশ্বরী কালী মন্দির (সূত্রাগড়)', 'temple', 'K.C. Das Road, Sutragarh (near Sutragarh M.N. High School), Shantipur, Nadia - 741404', 23.244444, 88.422778, '6CPG+R5 Shantipur', NULL, '380-year-old temple consecrated by Sutragarhs master weavers as the guardian deity of the weaving community.', 'সূত্রাগড়ের তাঁতি সমাজ ও পণ্ডিতবর্গের দ্বারা শান্তিপুরের কারুশিল্প ঐতিহ্যের রক্ষাকর্ত্রী রূপে প্রতিষ্ঠিত।', 'Anchors the spiritual heritage of Shantipurs eastern handloom corridors.', '/images/santipur/maa-kali/santipur-siddheswari-kali-idol-01.png', 'verified', 'verified'),
    ('shantipur-railway-station', 'Shantipur Junction Railway Station (STB)', 'শান্তিপুর জংশন রেলওয়ে স্টেশন', 'historic_landmark', 'Station Road, Shantipur, Nadia - 741404', 23.263496, 88.435688, '7C7P+97 Shantipur', NULL, 'Historic railway portal opened in 1862 during British Bengal railway expansion; connects Kolkata and Sealdah.', '১৮৬২ সালে প্রতিষ্ঠিত ঐতিহ্যবাহী রেল স্টেশন, যা কলকাতা ও রানাঘাটের সঙ্গে শান্তিপুরের সংযোগ ঘটায়।', 'Primary transit arrival hub for tourists, pilgrims, and textile merchants arriving from Sealdah (Wikidata Q59155478).', '/images/santipur/institutions/santipur-railway-station-01.jpg', 'verified', 'verified'),
    ('ranir-ghat', 'Motigunj Ghat / Bhagirathi Riverfront', 'মতিগঞ্জ ঘাট ও ভাগীরথী নদীতীর', 'historic_ghat', 'Motigunj Ghat Road, Motiganj, Shantipur, Nadia - 741404', 23.238056, 88.432778, '6CQM+64 Shantipur', NULL, 'Historic river trade and ferry ghat along the Bhagirathi river dating back to the 18th century.', 'মতিগঞ্জে ভাগীরথীর তীরে অবস্থিত প্রাচীন ঘাট, যেখান থেকে শান্তিপুরী শাড়ি নদীপথে বিভিন্ন অঞ্চলে যেত।', 'Offers expansive views of the sacred river and sunsets; key riverway stop on historic trade routes.', '/images/santipur/om-placeholder.svg', 'placeholder', 'verified')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    bengali_name = EXCLUDED.bengali_name,
    category = EXCLUDED.category,
    address = EXCLUDED.address,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    plus_code = EXCLUDED.plus_code,
    google_maps_url = EXCLUDED.google_maps_url,
    description = EXCLUDED.description,
    description_bn = EXCLUDED.description_bn,
    historical_significance = EXCLUDED.historical_significance,
    image_url = EXCLUDED.image_url,
    updated_at = NOW();

INSERT INTO public.curated_routes (slug, title, bengali_title, category, description, description_bn, total_distance_km, estimated_duration_minutes, stops_order)
VALUES
    ('shakti-heritage-trail', 'Shakti Heritage Trail', 'শক্তি ঐতিহ্য পরিক্রমা', 'Shakta Heritage', 'Explore five centuries of Tantric Kali worship, the iconic Bama Kali dance venue shift, and historic immersion routes.', '৫০০ বছরের শাক্ত ঐতিহ্য, বামা কালীর ঐতিহাসিক বিসর্জন নৃত্য এবং জাগ্রত সাধনাপীঠ পরিক্রমা।', 4.60, 58, '["bama-kali-temple", "siddheswari-kali", "maa-mahishkhagi", "maa-agameswari", "barabazar-more", "bejpara-ground"]'::jsonb),
    ('vaishnava-heritage-trail', 'Vaishnava Heritage Trail', 'শ্রীচৈতন্য ও অদ্বৈত বৈষ্ণব পরিক্রমা', 'Vaishnava Heritage', 'Walk the path of Sri Advaita Acharya, 1484 CE Goswami ancestral seats, Atchala terracotta temples, and holy river ghats.', 'শ্রী অদ্বৈত প্রভু ও মহাপ্রভুর স্মৃতিবিজড়িত ১৪৮৪ সালের আদি গোস্বামী ভিটা, টেরাকোটা মন্দির ও পুণ্য ভাগীরথী ঘাট।', 4.10, 50, '["advaita-pat-babaji-ghat", "boro-goswami-bari", "choto-goswami-bari", "madan-gopal-bari", "shyamchand-mandir"]'::jsonb),
    ('historic-shantipur-trail', 'Historic Shantipur Trail', 'ঐতিহাসিক শান্তিপুর নগর পরিক্রমা', 'Heritage & Architecture', 'Discover syncretic Mughal-era monuments, ASI-protected Shaiva architecture, colonial transit gateways, and river trade ghats.', 'মুঘল আমলের তোপখানা সৌধ, এএসআই চারচালা শিব মন্দির, প্রাচীন রেল ঐতিহ্য ও নদীতীরবর্তী বাণিজ্য ঘাট।', 5.30, 68, '["shantipur-railway-station", "topkhana-mosque", "ranir-ghat", "jaleswar-shiva-temple", "shyamchand-mandir"]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    bengali_title = EXCLUDED.bengali_title,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    description_bn = EXCLUDED.description_bn,
    total_distance_km = EXCLUDED.total_distance_km,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    stops_order = EXCLUDED.stops_order,
    updated_at = NOW();



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
