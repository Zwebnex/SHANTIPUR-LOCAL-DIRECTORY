-- ==============================================================================
-- SHANTIPUR LOCAL DIRECTORY — MIGRATION 03: ROW LEVEL SECURITY & POLICIES
-- Project ID: bnlhqkcyqymsvtqblwkv
-- Description: Enables RLS on all exposed tables and creates strict, granular
--              SELECT, INSERT, UPDATE, DELETE policies for each role.
-- ==============================================================================

-- 1. Administrative Authorization Helper Function (Security Definer with safe search path)
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

-- Revoke execute from public, grant to authenticated and service_role
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role, postgres;

-- 2. Privilege Escalation Prevention Trigger (Protects 'role' column)
CREATE OR REPLACE FUNCTION public.protect_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    -- If role is changing and caller is NOT a confirmed admin, abort
    IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: Role promotion requires project administrator privileges.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role_escalation();

-- 3. Business Verification Protection Trigger (Protects 'is_verified' column)
CREATE OR REPLACE FUNCTION public.protect_business_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    -- If is_verified is changing and caller is NOT a confirmed admin, abort
    IF (OLD.is_verified IS DISTINCT FROM NEW.is_verified) AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: Business verification requires authorized administrator sign-off.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_business_verification ON public.businesses;
CREATE TRIGGER trg_protect_business_verification
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.protect_business_verification();

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL EXPOSED APPLICATION TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- TABLE 1: PROFILES POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;
CREATE POLICY "profiles_delete_admin_only" ON public.profiles
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- TABLE 2: BUSINESSES POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "businesses_select_public_verified_or_owner_or_admin" ON public.businesses;
CREATE POLICY "businesses_select_public_verified_or_owner_or_admin" ON public.businesses
    FOR SELECT TO anon, authenticated
    USING (is_verified = true OR auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "businesses_insert_authenticated_owner" ON public.businesses;
CREATE POLICY "businesses_insert_authenticated_owner" ON public.businesses
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id AND is_verified = false);

DROP POLICY IF EXISTS "businesses_update_owner_unverified_or_admin" ON public.businesses;
CREATE POLICY "businesses_update_owner_unverified_or_admin" ON public.businesses
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id OR public.is_admin())
    WITH CHECK (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "businesses_delete_owner_or_admin" ON public.businesses;
CREATE POLICY "businesses_delete_owner_or_admin" ON public.businesses
    FOR DELETE TO authenticated
    USING (auth.uid() = owner_id OR public.is_admin());

-- ==============================================================================
-- TABLE 3: HERITAGE LISTINGS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "heritage_select_public" ON public.heritage_listings;
CREATE POLICY "heritage_select_public" ON public.heritage_listings
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "heritage_insert_admin_only" ON public.heritage_listings;
CREATE POLICY "heritage_insert_admin_only" ON public.heritage_listings
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "heritage_update_admin_only" ON public.heritage_listings;
CREATE POLICY "heritage_update_admin_only" ON public.heritage_listings
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "heritage_delete_admin_only" ON public.heritage_listings;
CREATE POLICY "heritage_delete_admin_only" ON public.heritage_listings
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- TABLE 4: COMMUNITY CONTRIBUTIONS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "contributions_select_approved_or_owner_or_admin" ON public.community_contributions;
CREATE POLICY "contributions_select_approved_or_owner_or_admin" ON public.community_contributions
    FOR SELECT TO anon, authenticated
    USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "contributions_insert_authenticated_user" ON public.community_contributions;
CREATE POLICY "contributions_insert_authenticated_user" ON public.community_contributions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "contributions_update_owner_pending_or_admin" ON public.community_contributions;
CREATE POLICY "contributions_update_owner_pending_or_admin" ON public.community_contributions
    FOR UPDATE TO authenticated
    USING ((auth.uid() = user_id AND status = 'pending') OR public.is_admin())
    WITH CHECK ((auth.uid() = user_id AND status = 'pending') OR public.is_admin());

DROP POLICY IF EXISTS "contributions_delete_owner_or_admin" ON public.community_contributions;
CREATE POLICY "contributions_delete_owner_or_admin" ON public.community_contributions
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- TABLE 5: SAVED PLACES (BOOKMARKS) POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "saved_places_select_own_only" ON public.saved_places;
CREATE POLICY "saved_places_select_own_only" ON public.saved_places
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_places_insert_own_only" ON public.saved_places;
CREATE POLICY "saved_places_insert_own_only" ON public.saved_places
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_places_delete_own_only" ON public.saved_places;
CREATE POLICY "saved_places_delete_own_only" ON public.saved_places
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- TABLE 6: REVIEWS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "reviews_select_approved_or_owner_or_admin" ON public.reviews;
CREATE POLICY "reviews_select_approved_or_owner_or_admin" ON public.reviews
    FOR SELECT TO anon, authenticated
    USING (is_approved = true OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reviews_insert_authenticated_user" ON public.reviews;
CREATE POLICY "reviews_insert_authenticated_user" ON public.reviews
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own_or_admin" ON public.reviews;
CREATE POLICY "reviews_update_own_or_admin" ON public.reviews
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reviews_delete_own_or_admin" ON public.reviews;
CREATE POLICY "reviews_delete_own_or_admin" ON public.reviews
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- TABLE 7: AUDIT LOGS POLICIES (IMMUTABLE LOGS)
-- ==============================================================================
DROP POLICY IF EXISTS "audit_logs_select_admin_only" ON public.audit_logs;
CREATE POLICY "audit_logs_select_admin_only" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_insert_authenticated_or_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_authenticated_or_admin" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

-- No UPDATE or DELETE policies are granted on audit_logs (append-only ledger)

