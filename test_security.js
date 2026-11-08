// test_security.js - Automated Security & Penetration Testing Suite for Shantipur Local Directory
// Enforces: 5-in-50s rate limiter, credential scanning, password policy, RLS audit, and role guards.

const http = require('http');
const fs = require('fs');
const path = require('path');

const SERVER_BASE = 'http://127.0.0.1:5173';
let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function request(urlPath, method = 'GET', body = null, headers = {}) {
  const url = new URL(urlPath, SERVER_BASE);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runSecuritySuite() {
  console.log('================================================================');
  console.log('🛡️  SHANTIPUR LOCAL DIRECTORY — AUTOMATED SECURITY AUDIT & PEN-TEST');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 1: STRICT 5-FAILED-ATTEMPTS-IN-50-SECONDS RATE LIMITER
  // --------------------------------------------------------------------------
  console.log('▶ [TEST SUITE 1] Mandatory Rate Limiting Gateway (5 attempts / 50 seconds)');
  const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
  const testEmail = `pentest_${Date.now()}@shantipur.org`;

  // First 5 failed attempts must be handled (HTTP 401)
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await request('/api/auth/login-gateway', 'POST', {
      email: testEmail,
      password: 'WrongPassword123!',
    }, { 'x-forwarded-for': testIp });
    assert(
      res.status === 401,
      `Attempt #${attempt}/5 is evaluated and rejected with HTTP 401 Unauthorized.`
    );
    assert(
      res.body.error === 'Email or password is incorrect.',
      `Attempt #${attempt} returns generic message (zero user/email enumeration).`
    );
  }

  // 6th attempt inside the 50-second window MUST be blocked (HTTP 429)
  const blockedRes = await request('/api/auth/login-gateway', 'POST', {
    email: testEmail,
    password: 'WrongPassword123!',
  }, { 'x-forwarded-for': testIp });

  assert(
    blockedRes.status === 429,
    'Attempt #6 is strictly blocked with HTTP 429 Too Many Requests.'
  );
  assert(
    typeof blockedRes.body.retryAfterSeconds === 'number' && blockedRes.body.retryAfterSeconds > 0,
    `HTTP 429 response includes retryAfterSeconds (${blockedRes.body.retryAfterSeconds}s).`
  );
  assert(
    blockedRes.headers['retry-after'] !== undefined,
    `HTTP 429 response contains standard RFC 6585 'Retry-After' header.`
  );

  // Test reset behavior on fresh IP/account:
  const resetIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
  const resetTestEmail = `reset_test_${Date.now()}@shantipur.org`;

  // Send 2 failed attempts
  await request('/api/auth/login-gateway', 'POST', { email: resetTestEmail, password: 'Wrong1' }, { 'x-forwarded-for': resetIp });
  await request('/api/auth/login-gateway', 'POST', { email: resetTestEmail, password: 'Wrong2' }, { 'x-forwarded-for': resetIp });

  // Successful authentication resets the failed counter
  const validRes = await request('/api/auth/login-gateway', 'POST', {
    email: resetTestEmail,
    password: 'ShantipurSecure2026!',
  }, { 'x-forwarded-for': resetIp });

  assert(
    validRes.status === 200,
    'Authentic login succeeds with HTTP 200 and resets rate limit counter.'
  );

  // After successful reset, user gets fresh 5 attempts instead of having 2 lingering strikes
  let freshAllowedCount = 0;
  for (let i = 1; i <= 5; i++) {
    const res = await request('/api/auth/login-gateway', 'POST', {
      email: resetTestEmail,
      password: 'WrongAfterReset!',
    }, { 'x-forwarded-for': resetIp });
    if (res.status === 401) freshAllowedCount++;
  }
  assert(
    freshAllowedCount === 5,
    'Successful login wiped failed strikes: user granted full 5 fresh attempts.'
  );

  console.log('');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: CLIENT CREDENTIAL & PRIVILEGED SECRET EXPOSURE SCAN
  // --------------------------------------------------------------------------
  console.log('▶ [TEST SUITE 2] Static Code & Public Asset Credential Leakage Scan');

  const publicFiles = ['public/index.html', 'public/app.js', 'public/supabaseClient.js', 'server.js'];
  const dangerousPatterns = [
    /service_role/i,
    /sbp_[a-zA-Z0-9]{30,}/,
    /postgresql:\/\/[^:]+:[^@]+@/i,
    /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]{50,}\.[a-zA-Z0-9_-]{40,}/, // Full JWT service keys
  ];

  for (const file of publicFiles) {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');

    let leaked = false;
    for (const pat of dangerousPatterns) {
      if (pat.test(content)) {
        // Exclude migration SQL file comments or Deno index templates
        if (!file.includes('migrations') && !file.includes('functions')) {
          leaked = true;
          break;
        }
      }
    }
    assert(!leaked, `File '${file}' contains NO service_role keys, database passwords, or private secrets.`);
  }

  // Verify .env.local is in .gitignore
  const gitignore = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
  assert(
    gitignore.includes('.env.local') && gitignore.includes('.env'),
    '.gitignore strictly excludes .env and .env.local from version control.'
  );

  console.log('');

  // --------------------------------------------------------------------------
  // TEST SUITE 3: PASSWORD COMPLEXITY & VALIDATION INTEGRITY
  // --------------------------------------------------------------------------
  console.log('▶ [TEST SUITE 3] Password Policy & Sanitization Verification');

  const supabaseClientCode = fs.readFileSync(path.join(__dirname, 'public', 'supabaseClient.js'), 'utf8');

  // Verify strong password rules exist
  assert(
    supabaseClientCode.includes('password.length >= 8'),
    'Client SDK strictly enforces minimum 8 characters.'
  );
  assert(
    supabaseClientCode.includes('/[A-Z]/') && supabaseClientCode.includes('/[a-z]/'),
    'Client SDK strictly enforces uppercase (A-Z) and lowercase (a-z) letters.'
  );
  assert(
    supabaseClientCode.includes('/[0-9]/') && supabaseClientCode.includes('/[^A-Za-z0-9]/'),
    'Client SDK strictly enforces numbers (0-9) and special characters (!@#$%^&*).'
  );
  assert(
    supabaseClientCode.includes("safeRole = role === 'business_owner' ? 'business_owner' : 'registered_user'"),
    'Role Tampering Prevention: Signups are restricted to registered_user or business_owner; admin promotion is blocked.'
  );

  console.log('');

  // --------------------------------------------------------------------------
  // TEST SUITE 4: DATABASE ROW LEVEL SECURITY & POLICY MIGRATION AUDIT
  // --------------------------------------------------------------------------
  console.log('▶ [TEST SUITE 4] PostgreSQL Schema, RLS & Storage Policy Audit');

  const migrationDir = path.join(__dirname, 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationDir);

  assert(migrationFiles.length >= 4, `Found ${migrationFiles.length} production Supabase migrations.`);

  const m1 = fs.readFileSync(path.join(migrationDir, '20261108000001_create_schemas_and_rate_limiting.sql'), 'utf8');
  assert(
    m1.includes('CREATE SCHEMA IF NOT EXISTS private;') && m1.includes('REVOKE ALL ON SCHEMA private FROM PUBLIC'),
    'Migration 01 isolates private security schema and revokes public privileges.'
  );
  assert(
    m1.includes('CREATE OR REPLACE FUNCTION private.check_login_rate_limit'),
    'Migration 01 implements atomic database-backed check_login_rate_limit function.'
  );

  const m2 = fs.readFileSync(path.join(migrationDir, '20261108000002_create_application_tables.sql'), 'utf8');
  assert(
    m2.includes('CREATE TABLE IF NOT EXISTS public.profiles') &&
    m2.includes('CREATE TABLE IF NOT EXISTS public.businesses') &&
    m2.includes('CREATE TABLE IF NOT EXISTS public.heritage_listings') &&
    m2.includes('CREATE TABLE IF NOT EXISTS public.community_contributions'),
    'Migration 02 creates profiles, businesses, heritage listings, and community contributions.'
  );

  const m3 = fs.readFileSync(path.join(migrationDir, '20261108000003_enable_rls_and_policies.sql'), 'utf8');
  assert(
    m3.includes('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;') &&
    m3.includes('ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;') &&
    m3.includes('ALTER TABLE public.heritage_listings ENABLE ROW LEVEL SECURITY;'),
    'Migration 03 enables Row Level Security (RLS) on all exposed application tables.'
  );
  assert(
    m3.includes('CREATE OR REPLACE FUNCTION public.is_admin()') &&
    m3.includes('SET search_path = public, auth, pg_temp'),
    'Migration 03 creates is_admin() security definer function with safe search_path.'
  );
  assert(
    m3.includes('CREATE TRIGGER trg_protect_profile_role') &&
    m3.includes('CREATE TRIGGER trg_protect_business_verification'),
    'Migration 03 creates tamper-proof triggers preventing self-promotion to admin and unauthorized business verification.'
  );

  const m4 = fs.readFileSync(path.join(migrationDir, '20261108000004_storage_buckets_and_policies.sql'), 'utf8');
  assert(
    m4.includes('heritage-media') && m4.includes('business-documents') && m4.includes('user-uploads'),
    'Migration 04 configures public, private, and authenticated storage buckets.'
  );

  console.log('');

  // --------------------------------------------------------------------------
  // TEST SUITE 5: PUBLIC CONFIGURATION ENDPOINT INTEGRITY
  // --------------------------------------------------------------------------
  console.log('▶ [TEST SUITE 5] /api/config Safe Public Exposure Verification');

  const configRes = await request('/api/config', 'GET');
  assert(configRes.status === 200, 'GET /api/config returns HTTP 200 OK.');
  assert(
    configRes.body.supabaseUrl === 'https://bnlhqkcyqymsvtqblwkv.supabase.co',
    'GET /api/config returns correct Supabase project URL.'
  );
  assert(
    configRes.body.serviceRoleKey === undefined && configRes.body.databasePassword === undefined,
    'GET /api/config NEVER exposes backend serviceRoleKey or database passwords.'
  );

  console.log('\n================================================================');
  console.log(`🎯 AUDIT COMPLETE: ${passedTests} / ${totalTests} Security Assertions PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSecuritySuite().catch((err) => {
  console.error('Security test runner error:', err);
  process.exit(1);
});
