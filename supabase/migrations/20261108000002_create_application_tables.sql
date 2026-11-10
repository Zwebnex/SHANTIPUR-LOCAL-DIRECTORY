-- ==============================================================================
-- SHANTIPUR LOCAL DIRECTORY — MIGRATION 02: APPLICATION TABLES & TRIGGERS
-- Project ID: bnlhqkcyqymsvtqblwkv
-- Description: Creates profiles, businesses, heritage listings, community
--              contributions, bookmarks, reviews, and audit logs.
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

-- Index on role for fast authorization checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. Business Directory Table (Strict Verification Architecture)
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
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_heritage_category ON public.heritage_listings(category);

-- 4. Community Contributions Table (Crowdsourced heritage lore)
CREATE TABLE IF NOT EXISTS public.community_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected')),
    moderated_by UUID REFERENCES auth.users(id),
    moderated_at TIMESTAMPTZ,
    moderation_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_contributions_user ON public.community_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON public.community_contributions(status);

-- 5. Saved Places / Bookmarks Table
CREATE TABLE IF NOT EXISTS public.saved_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    place_id TEXT NOT NULL,
    place_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_place UNIQUE(user_id, place_id, place_type)
);

CREATE INDEX IF NOT EXISTS idx_saved_places_user ON public.saved_places(user_id);

-- 6. Reviews & Feedback Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    place_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reviews_place ON public.reviews(place_id);

-- 7. Audit Logs Table (Tamper-evident system activity)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_table TEXT,
    target_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- 8. Automatic Profile Creation Trigger on New Signup
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
    
    -- Check if user metadata requested business_owner role
    IF (new.raw_user_meta_data->>'role') = 'business_owner' THEN
        v_role := 'business_owner';
    END IF;

    -- SECURITY GUARANTEE: Newly registered users can NEVER self-assign 'admin'
    -- 'admin' role can only be assigned by project owner or direct database promotion
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

-- 9. Profile Updated At Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    new.updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_business_updated ON public.businesses;
CREATE TRIGGER on_business_updated
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

