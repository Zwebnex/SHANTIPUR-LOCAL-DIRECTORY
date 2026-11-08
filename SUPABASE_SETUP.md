# SUPABASE SETUP & INTEGRATION GUIDE — SHANTIPUR LOCAL DIRECTORY

## 1. Project Configuration Overview

- **Project Name:** `SHANTIPUR LOCAL DIRECTORY`
- **Project ID:** `bnlhqkcyqymsvtqblwkv`
- **Supabase URL:** `https://bnlhqkcyqymsvtqblwkv.supabase.co`
- **Client Architecture:** Vanilla JS (ES2022+), HTML5, Tailwind CSS, Supabase JS v2 SDK, Node.js HTTP Security Gateway Server.
- **Port / Localhost:** `http://127.0.0.1:5173` / `http://localhost:5173`

---

## 2. Environment Variables Configuration

The project uses `.env.local` for local execution and `.env.example` as a template.

### `.env.example` (Template)
```bash
# Public Client Credentials (Safe for browser / Vite / HTML)
VITE_SUPABASE_URL=https://bnlhqkcyqymsvtqblwkv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Optional Public CAPTCHA Site Key (Cloudflare Turnstile / hCaptcha)
VITE_CAPTCHA_SITE_KEY=

# Server-Side / Edge Function Secrets (NEVER expose to frontend code)
# SUPABASE_SERVICE_ROLE_KEY=
# DATABASE_URL=
# CAPTCHA_SECRET_KEY=
```

### Git Security
- `.env` and `.env.local` are explicitly added to `.gitignore`.
- Secrets are never pushed to version control or included in client production bundles.

---

## 3. Database Migration Execution (Dashboard SQL Editor)

Because CLI access without your personal access token is restricted, all migrations have been prepared as deterministic, idempotent SQL scripts in `supabase/migrations/`.

### Execution Order in Supabase Dashboard (SQL Editor)

Navigate to **[Supabase Dashboard](https://supabase.com/dashboard/project/bnlhqkcyqymsvtqblwkv)** > **SQL Editor** > **New Query**:

1. **Migration 01 — Schemas & Rate Limiting:**
   - File: `supabase/migrations/20261108000001_create_schemas_and_rate_limiting.sql`
   - Purpose: Creates isolated `private` schema, `private.login_attempts` table, indexes, and atomic functions (`check_login_rate_limit`, `record_failed_login`, `clear_login_attempts`).
   - Run Query in SQL Editor.

2. **Migration 02 — Application Tables & Triggers:**
   - File: `supabase/migrations/20261108000002_create_application_tables.sql`
   - Purpose: Creates `profiles`, `businesses`, `heritage_listings`, `community_contributions`, `saved_places`, `reviews`, and `audit_logs` with foreign keys and `handle_new_user` trigger.
   - Run Query in SQL Editor.

3. **Migration 03 — Row Level Security (RLS) & Policies:**
   - File: `supabase/migrations/20261108000003_enable_rls_and_policies.sql`
   - Purpose: Enables RLS on all 7 tables, installs `public.is_admin()` security definer function, creates role escalation triggers, and assigns granular SELECT/INSERT/UPDATE/DELETE policies.
   - Run Query in SQL Editor.

4. **Migration 04 — Storage Buckets & Storage RLS:**
   - File: `supabase/migrations/20261108000004_storage_buckets_and_policies.sql`
   - Purpose: Configures `heritage-media` (public read, admin write), `business-documents` (private owner/admin), and `user-uploads` (authenticated).
   - Run Query in SQL Editor.

---

## 4. Authentication Configuration in Supabase Dashboard

Go to **Supabase Dashboard** > **Authentication**:

1. **Email Provider:**
   - Navigate to **Authentication** > **Providers** > **Email**.
   - Ensure **Enable Email provider** is turned **ON**.
   - Ensure **Confirm email** is enabled for production account verification.
   - Set **Minimum password length** to **8** (matching the application's strong password validator).

2. **URL Configuration:**
   - Navigate to **Authentication** > **URL Configuration**.
   - **Site URL:** Set to your production URL (or `http://localhost:5173` during development).
   - **Redirect URLs (Allowlist):**
     - `http://localhost:5173/**`
     - `http://127.0.0.1:5173/**`
     - `https://your-production-domain.vercel.app/**`

3. **Rate Limits & Brute Force Protection:**
   - Navigate to **Authentication** > **Rate Limits**.
   - Ensure native email and sign-in rate limits remain active.

4. **CAPTCHA Protection (Cloudflare Turnstile or hCaptcha):**
   - Navigate to **Authentication** > **Attack Protection** > **Enable CAPTCHA**.
   - Select Cloudflare Turnstile or hCaptcha.
   - Provide your Site Key (public) and Secret Key (private).

---

## 5. Rate Limiting Architecture (5 Failed Attempts in 50 Seconds)

### Exact Rule Enforced
- **Maximum 5 failed attempts** are permitted within any rolling **50-second window**.
- An attempt exceeding the limit returns **HTTP 429 Too Many Requests** with `Retry-After: <seconds>` and a user-friendly countdown timer.
- **Successful authentication** resets the failed attempt counter.

### Multi-Layer Defense:
1. **Edge Function Gateway (`supabase/functions/login-gateway/index.ts`):**
   - Normalizes email, computes SHA-256 hash (preventing plain text logging).
   - Atomically queries `private.check_login_rate_limit(clientIp, emailHash)`.
   - Returns generic `401 Unauthorized` on failure (zero email enumeration).
   - Returns `429 Too Many Requests` when threshold is exceeded.
2. **Local HTTP Server Gateway (`server.js`):**
   - Intercepts `POST /api/auth/login-gateway` during local development and testing, enforcing identical rate-limiting logic.
3. **Frontend UI (`public/app.js` & `public/supabaseClient.js`):**
   - Routes login submissions through the gateway.
   - Dynamically displays countdown timer when 429 is received.

### Important Architectural Boundary
A custom Edge Function or Gateway protects login requests routed through that endpoint. It cannot prevent an attacker with your publishable key from calling the raw Supabase Auth token API directly unless backed by Supabase native rate limits or a cloud WAF (Cloudflare). Native Supabase rate limits must remain active.

---

## 6. How to Deploy Edge Function (Optional CLI)

Once you authenticate the Supabase CLI (`npx supabase login`):
```bash
npx supabase functions deploy login-gateway --project-ref bnlhqkcyqymsvtqblwkv
```
Set the service key secret for the function:
```bash
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key --project-ref bnlhqkcyqymsvtqblwkv
```

