/**
 * Shantipur Local Directory — Production Supabase Authentication & Client SDK
 * Project ID: bnlhqkcyqymsvtqblwkv
 * Supabase URL: https://bnlhqkcyqymsvtqblwkv.supabase.co
 * Strict Directives:
 * - NO mock authentication or local simulation fallbacks.
 * - Strict verification of VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
 * - Real API calls to Supabase Auth (auth/v1/signup, auth/v1/token, auth/v1/recover).
 */

(function (window) {
  'use strict';

  const EXPECTED_PROJECT_ID = 'bnlhqkcyqymsvtqblwkv';
  const EXPECTED_SUPABASE_URL = 'https://bnlhqkcyqymsvtqblwkv.supabase.co';

  let supabaseClient = null;
  let clientConfig = {
    supabaseUrl: EXPECTED_SUPABASE_URL,
    supabaseAnonKey: '',
    rateLimitWindowSeconds: 50,
    maxAllowedFailedAttempts: 5,
  };

  let currentUser = null;
  let currentProfile = null;
  let isConfigured = false;
  let configErrorMessage = '';
  const authStateListeners = [];

  // Strong Password Policy Validator
  // Rule: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  function validatePasswordStrength(password) {
    if (!password || typeof password !== 'string') {
      return { isValid: false, message: 'Password is required.' };
    }
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!minLength) return { isValid: false, message: 'Password must be at least 8 characters long.' };
    if (!hasUpper) return { isValid: false, message: 'Password must include at least one uppercase letter (A-Z).' };
    if (!hasLower) return { isValid: false, message: 'Password must include at least one lowercase letter (a-z).' };
    if (!hasNumber) return { isValid: false, message: 'Password must include at least one number (0-9).' };
    if (!hasSpecial) return { isValid: false, message: 'Password must include at least one special character (!@#$%^&*).' };

    return { isValid: true, message: 'Strong password.' };
  }

  // Initialize Supabase Client Instance
  async function init() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const remoteConfig = await res.json();
        clientConfig = { ...clientConfig, ...remoteConfig };
      }
    } catch (e) {
      console.warn('Could not fetch /api/config:', e);
    }

    const { supabaseUrl, supabaseAnonKey } = clientConfig;

    // 1. Validate Target Project URL
    if (supabaseUrl !== EXPECTED_SUPABASE_URL) {
      isConfigured = false;
      configErrorMessage = `Mismatched Supabase project URL: expected ${EXPECTED_SUPABASE_URL}, received ${supabaseUrl}`;
      console.error(configErrorMessage);
      renderConfigBanner();
      return;
    }

    // 2. Validate Publishable / Anon Key
    const isValidKey = supabaseAnonKey && 
                       typeof supabaseAnonKey === 'string' && 
                       supabaseAnonKey.trim().length > 20 && 
                       !supabaseAnonKey.startsWith('YOUR_') &&
                       supabaseAnonKey !== 'YOUR_SUPABASE_PUBLISHABLE_KEY';

    if (!isValidKey) {
      isConfigured = false;
      configErrorMessage = 'Supabase Project Key Required: VITE_SUPABASE_PUBLISHABLE_KEY is missing or placeholder. Please set your real public anon key in .env.local.';
      console.warn(configErrorMessage);
      renderConfigBanner();
      return;
    }

    // 3. Initialize Official Supabase JS Client Instance
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage,
          },
        });

        isConfigured = true;
        configErrorMessage = '';
        removeConfigBanner();

        // Listen for Real Supabase Auth State Changes
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
          if (session && session.user) {
            currentUser = session.user;
            await fetchProfile(session.user.id);
          } else {
            currentUser = null;
            currentProfile = null;
          }
          notifyListeners(event, session);
        });

        // Restore existing authenticated session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) {
          console.warn('Session restoration error:', sessionError.message);
        }
        if (session && session.user) {
          currentUser = session.user;
          await fetchProfile(session.user.id);
          notifyListeners('INITIAL_SESSION', session);
        }
      } catch (err) {
        isConfigured = false;
        configErrorMessage = `Supabase initialization failed: ${err.message}`;
        console.error(configErrorMessage);
        renderConfigBanner();
      }
    } else {
      isConfigured = false;
      configErrorMessage = 'Supabase JS library (@supabase/supabase-js) is not loaded on window.';
      console.error(configErrorMessage);
      renderConfigBanner();
    }

    checkRecoveryHash();
  }

  function renderConfigBanner() {
    let banner = document.getElementById('supabase-config-warning-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'supabase-config-warning-banner';
      banner.className = 'bg-amber-50 border-b border-amber-300 text-amber-900 text-xs px-4 py-2.5 text-center font-medium flex items-center justify-center gap-2 relative z-50';
      banner.innerHTML = `
        <svg class="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <span><strong>Supabase Connection Action Required:</strong> Add your real <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> from Project Settings > API into <code>.env.local</code> to enable live authentication for <strong>${EXPECTED_PROJECT_ID}</strong>.</span>
      `;
      document.body.prepend(banner);
    }
  }

  function removeConfigBanner() {
    const banner = document.getElementById('supabase-config-warning-banner');
    if (banner) banner.remove();
  }

  function checkRecoveryHash() {
    const hash = window.location.hash;
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
      if (window.openAuthModal) {
        window.openAuthModal('reset');
      }
    }
  }

  async function fetchProfile(userId) {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        currentProfile = data;
      }
    } catch (err) {
      console.warn('Error fetching user profile:', err);
    }
    return currentProfile;
  }

  function notifyListeners(event, session) {
    authStateListeners.forEach((fn) => {
      try {
        fn(event, session, currentUser, currentProfile);
      } catch (e) {
        console.error('Auth listener error:', e);
      }
    });
  }

  // REAL SUPABASE SIGNUP (NO MOCK FALLBACK)
  async function signUp({ email, password, fullName, phone, role = 'registered_user' }) {
    if (!isConfigured || !supabaseClient) {
      return {
        success: false,
        error: 'Supabase is not connected. Please provide VITE_SUPABASE_PUBLISHABLE_KEY in .env.local to enable live signups.',
      };
    }

    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return { success: false, error: strength.message };
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }

    // Role Enforcement: Force to registered_user or business_owner (Admin can NEVER be self-selected)
    const safeRole = role === 'business_owner' ? 'business_owner' : 'registered_user';

    try {
      console.log(`📡 Dispatching REAL Supabase Auth signup to: ${EXPECTED_SUPABASE_URL}/auth/v1/signup`);

      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone ? phone.trim() : null,
            role: safeRole,
          },
          emailRedirectTo: window.location.origin + '/#login',
        },
      });

      if (error) {
        console.error('❌ Supabase Auth signup error:', error);
        let errorMsg = error.message;
        if (errorMsg.toLowerCase().includes('rate limit') || error.status === 429 || error.code === 'over_email_send_rate_limit') {
          errorMsg = 'Supabase Email Rate Limit Reached (Free tier allows max 3-4 verification emails/hour). To bypass this immediately: In your Supabase Dashboard → Authentication → Providers → Email, turn OFF "Confirm email" and click Save.';
        }
        return { success: false, error: errorMsg };
      }

      // Check if user already exists in Supabase Auth (Supabase returns empty identities array for existing users)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please sign in or use password recovery.',
        };
      }

      const isEmailConfirmed = !!data.user?.confirmed_at || !!data.session;

      return {
        success: true,
        user: data.user,
        requiresEmailConfirmation: !isEmailConfirmed,
        message: isEmailConfirmed
          ? 'Account successfully registered and confirmed! You are now signed in.'
          : `Registration successful! A verification link has been sent to ${email}. Please check your inbox and verify your email before signing in.`,
      };
    } catch (err) {
      console.error('❌ Supabase signup network exception:', err);
      return {
        success: false,
        error: `Supabase network error: ${err.message || 'Unable to connect to authentication server.'}`,
      };
    }
  }

  // REAL SUPABASE SIGNIN (ROUTED VIA 5-IN-50S RATE-LIMITING GATEWAY)
  async function signIn({ email, password }) {
    if (!isConfigured) {
      return {
        success: false,
        error: 'Supabase is not connected. Please set VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.',
      };
    }

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    try {
      // 1. Call server-side gateway to enforce 5 failed attempts / 50s rule
      const response = await fetch('/api/auth/login-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.status === 429) {
        return {
          success: false,
          error: data.error || 'Too many unsuccessful login attempts. Please try again after the cooldown.',
          retryAfterSeconds: data.retryAfterSeconds || 50,
          isRateLimited: true,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Email or password is incorrect.',
        };
      }

      // 2. Synchronize Session to Supabase Client
      if (supabaseClient && data.session?.access_token) {
        await supabaseClient.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        const { data: { user } } = await supabaseClient.auth.getUser();
        currentUser = user;
        if (user) await fetchProfile(user.id);
      } else {
        currentUser = data.user;
        currentProfile = { full_name: email.split('@')[0], role: data.user?.role || 'registered_user' };
      }

      notifyListeners('SIGNED_IN', data.session);
      return { success: true, user: currentUser, profile: currentProfile };
    } catch (err) {
      return {
        success: false,
        error: 'Network error connecting to login gateway. Please check your connection.',
      };
    }
  }

  // REAL PASSWORD RECOVERY (NO MOCK)
  async function resetPasswordForEmail(email) {
    if (!isConfigured || !supabaseClient) {
      return {
        success: false,
        error: 'Supabase is not connected. Please configure VITE_SUPABASE_PUBLISHABLE_KEY.',
      };
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + '/#reset',
      });

      if (error) {
        console.warn('Supabase resetPassword error:', error.message);
      }

      // Generic success notice to prevent email enumeration
      return {
        success: true,
        message: 'If an account exists with this email, a secure password reset link has been dispatched.',
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // REAL PASSWORD UPDATE (NO MOCK)
  async function updatePassword(newPassword) {
    if (!isConfigured || !supabaseClient) {
      return { success: false, error: 'Supabase is not connected.' };
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return { success: false, error: strength.message };
    }

    try {
      const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, message: 'Password updated successfully! You may now sign in with your new password.' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // REAL SIGNOUT
  async function signOut() {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    currentUser = null;
    currentProfile = null;
    notifyListeners('SIGNED_OUT', null);
    return { success: true };
  }

  // Expose API on window
  window.ShantipurAuth = {
    init,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    validatePasswordStrength,
    getUser: () => currentUser,
    getProfile: () => currentProfile,
    getRole: () => currentProfile?.role || currentUser?.role || 'visitor',
    isAdmin: () => (currentProfile?.role === 'admin' || currentUser?.role === 'admin'),
    isBusinessOwner: () => (currentProfile?.role === 'business_owner' || currentUser?.role === 'business_owner'),
    isConfigured: () => isConfigured,
    getConfigError: () => configErrorMessage,
    onAuthStateChange: (fn) => authStateListeners.push(fn),
    getConfig: () => ({ ...clientConfig }),
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
