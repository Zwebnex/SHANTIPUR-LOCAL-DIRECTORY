# ROLE-BASED SECURITY & ACCESS PERMISSION MATRIX
# SHANTIPUR LOCAL DIRECTORY (SUPABASE PROJECT: `bnlhqkcyqymsvtqblwkv`)

This matrix details the exact, granular permissions granted by PostgreSQL Row Level Security (RLS) policies and triggers across all application roles.

---

## 1. Application User Roles Definition

| Role Identifier | Description | Privileges Scope |
| :--- | :--- | :--- |
| **Public Visitor (`anon`)** | Unauthenticated public visitor exploring the directory. | Read-only access to approved cultural heritage, verified businesses, and public images. |
| **Registered User (`authenticated`)** | Verified resident or community member of Shantipur. | Profile management, personal bookmarks/saved places, lore submissions (pending moderation). |
| **Business Owner (`authenticated`)** | Local merchant, weaver, artisan, or business proprietor. | Business registration submission, management of their own unverified listing, private document upload. |
| **Project Administrator (`admin`)** | Project owner with unrestricted administrative privileges. | Content verification, business approval, lore moderation, full audit access, heritage curation. |

---

## 2. Table-by-Table CRUD Permissions Matrix

| Table Name | Operation | Public Visitor (`anon`) | Registered User | Business Owner | Administrator (`admin`) | Policy / Enforcement Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`public.profiles`** | **SELECT** | ❌ Blocked | ✅ Own Profile | ✅ Own Profile | ✅ All Profiles | `auth.uid() = id OR public.is_admin()` |
| | **INSERT** | ❌ Blocked | ✅ Own ID | ✅ Own ID | ✅ Any Profile | System trigger / `auth.uid() = id` |
| | **UPDATE** | ❌ Blocked | ✅ Name/Phone Only | ✅ Name/Phone Only | ✅ Full Profile | Role changes strictly trigger-blocked for non-admins |
| | **DELETE** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed | `public.is_admin()` only |
| **`public.businesses`** | **SELECT** | ✅ Verified Only | ✅ Verified + Own | ✅ Verified + Own | ✅ All Listings | `is_verified = true OR auth.uid() = owner_id OR public.is_admin()` |
| | **INSERT** | ❌ Blocked | ✅ As Unverified | ✅ As Unverified | ✅ Allowed | Forced `is_verified = false` on insert |
| | **UPDATE** | ❌ Blocked | ✅ Own (Unverified) | ✅ Own (Unverified) | ✅ All Listings | Trigger blocks self-verification without admin sign-off |
| | **DELETE** | ❌ Blocked | ✅ Own Listing | ✅ Own Listing | ✅ All Listings | `auth.uid() = owner_id OR public.is_admin()` |
| **`public.heritage_listings`** | **SELECT** | ✅ Public All | ✅ Public All | ✅ Public All | ✅ Public All | Open public read for historical archives |
| | **INSERT** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed | `public.is_admin()` only |
| | **UPDATE** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed | `public.is_admin()` only |
| | **DELETE** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed | `public.is_admin()` only |
| **`public.community_contributions`** | **SELECT** | ✅ Approved Only | ✅ Approved + Own | ✅ Approved + Own | ✅ All Submissions | `status = 'approved' OR auth.uid() = user_id OR public.is_admin()` |
| | **INSERT** | ❌ Blocked | ✅ Pending Only | ✅ Pending Only | ✅ Allowed | Forced `status = 'pending'` on insert |
| | **UPDATE** | ❌ Blocked | ✅ Own (Pending) | ✅ Own (Pending) | ✅ All Submissions | `(auth.uid() = user_id AND status = 'pending') OR public.is_admin()` |
| | **DELETE** | ❌ Blocked | ✅ Own | ✅ Own | ✅ All Submissions | `auth.uid() = user_id OR public.is_admin()` |
| **`public.saved_places`** | **SELECT** | ❌ Blocked | ✅ Own Only | ✅ Own Only | ✅ Allowed | Strictly isolated by `auth.uid() = user_id` |
| | **INSERT** | ❌ Blocked | ✅ Own Only | ✅ Own Only | ✅ Allowed | User cannot bookmark on another user's behalf |
| | **UPDATE** | ❌ Blocked | ✅ Own Only | ✅ Own Only | ✅ Allowed | `auth.uid() = user_id` |
| | **DELETE** | ❌ Blocked | ✅ Own Only | ✅ Own Only | ✅ Allowed | `auth.uid() = user_id` |
| **`public.reviews`** | **SELECT** | ✅ Approved Only | ✅ Approved + Own | ✅ Approved + Own | ✅ All Reviews | `is_approved = true OR auth.uid() = user_id OR public.is_admin()` |
| | **INSERT** | ❌ Blocked | ✅ Own Review | ✅ Own Review | ✅ Allowed | `auth.uid() = user_id` |
| | **UPDATE** | ❌ Blocked | ✅ Own Review | ✅ Own Review | ✅ All Reviews | `auth.uid() = user_id OR public.is_admin()` |
| | **DELETE** | ❌ Blocked | ✅ Own Review | ✅ Own Review | ✅ All Reviews | `auth.uid() = user_id OR public.is_admin()` |
| **`public.audit_logs`** | **SELECT** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Read-Only | Confidential system audit trail |
| | **INSERT** | ❌ Blocked | ✅ System Events | ✅ System Events | ✅ System Events | Append-only ledger |
| | **UPDATE** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | **IMMUTABLE LEDGER** (No updates allowed) |
| | **DELETE** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | **IMMUTABLE LEDGER** (No deletions allowed) |
| **`private.login_attempts`** | **ALL** | ❌ REVOKED | ❌ REVOKED | ❌ REVOKED | ❌ REVOKED | Schema isolated completely from PostgREST Data API (Service Role only) |

---

## 3. Storage Bucket Permissions Matrix

| Storage Bucket | Access Type | Public Visitor (`anon`) | Authenticated User | Business Owner | Administrator (`admin`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`heritage-media`** | **READ** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| | **WRITE** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed (`public.is_admin()`) |
| **`business-documents`** | **READ** | ❌ Blocked | ❌ Blocked | ✅ Own Folder (`auth.uid()/*`) | ✅ Full Access (Verification) |
| | **WRITE** | ❌ Blocked | ❌ Blocked | ✅ Own Folder (`auth.uid()/*`) | ✅ Full Access |
| **`user-uploads`** | **READ** | ✅ Approved Media | ✅ Approved Media | ✅ Approved Media | ✅ Full Access |
| | **WRITE** | ❌ Blocked | ✅ Own Folder (`auth.uid()/*`) | ✅ Own Folder (`auth.uid()/*`) | ✅ Full Access |

---

## 4. Key Security Guarantees

1. **Zero Data Tampering:** Ordinary users and business owners cannot edit another user's records, read private trade documents, or view unapproved community lore.
2. **Zero Self-Promotion:** Newly registered accounts can never elevate their own permissions to `admin`. The `trg_protect_profile_role` trigger raises a database exception upon unauthorized attempts.
3. **Zero Spam Publishing:** Businesses must go through physical and trade license verification before appearing in public listings. The `trg_protect_business_verification` trigger enforces admin sign-off.
4. **Brute Force Defense:** Failed authentication attempts are tracked atomically in `private.login_attempts`, triggering HTTP 429 throttling after 5 failed attempts in 50 seconds.
