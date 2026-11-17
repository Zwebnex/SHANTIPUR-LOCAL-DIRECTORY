-- ==============================================================================
-- SHANTIPUR LOCAL DIRECTORY & STAY ENGINE — ADMIN USERS TABLE & CREDENTIALS
-- Migration: 20261117000002_create_admin_users.sql
-- Master Administrator: Bipra Das (Password: Bipra@2k4)
-- Target Schema: public
-- ==============================================================================

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'superadmin',
    password_hash TEXT,
    password_plain TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reading admin_users for authentication verification
DROP POLICY IF EXISTS "Allow public admin lookup" ON public.admin_users;
CREATE POLICY "Allow public admin lookup" ON public.admin_users
    FOR SELECT
    USING (true);

-- 3. Seed Master Administrator Account
INSERT INTO public.admin_users (username, full_name, role, password_hash, password_plain, is_active)
VALUES (
    'Bipra Das',
    'Bipra Das',
    'superadmin',
    crypt('Bipra@2k4', gen_salt('bf')),
    'Bipra@2k4',
    true
)
ON CONFLICT (username) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    password_hash = crypt('Bipra@2k4', gen_salt('bf')),
    password_plain = EXCLUDED.password_plain,
    is_active = true;
