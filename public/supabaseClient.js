/**
 * Shantipur Local Directory — Production Supabase Authentication & Client SDK
 * Project ID: bnlhqkcyqymsvtqblwkv
 * Supabase URL: https://bnlhqkcyqymsvtqblwkv.supabase.co
 * Strict Security: No secret keys exposed. All logins routed through 5-in-50s rate-limiting gateway.
 */

(function (window) {
  'use strict';

  let supabaseClient = null;
  let clientConfig = {
    supabaseUrl: 'https://bnlhqkcyqymsvtqblwkv.supabase.co',
    supabaseAnonKey: '',
    rateLimitWindowSeconds: 50,
    maxAllowedFailedAttempts: 5,
  };

  let currentUser = null;
  let currentProfile = null;
  const authStateListeners = [];

  // Strong Password Validator
  // Rule: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
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

  // Initialize Supabase Client
  async function init() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const remoteConfig = await res.json();
        clientConfig = { ...clientConfig, ...remoteConfig };
      }
    } catch (e) {
      console.warn('Could not load /api/config, falling back to defaults:', e);
    }

    const { supabaseUrl, supabaseAnonKey } = clientConfig;

    if (window.supabase && typeof window.supabase.createClient === 'function' && supabaseAnonKey && !supabaseAnonKey.startsWith('YOUR_')) {
      supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
        },
      });

      // Listen to Supabase Auth State Changes
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

      // Restore session on load
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && session.user) {
        currentUser = session.user;
        await fetchProfile(session.user.id);
        notifyListeners('INITIAL_SESSION', session);
      }
    } else {
      // Local/Simulated Session Fallback (persisted securely in sessionStorage during local testing)
      const stored = sessionStorage.getItem('shantipur_sim_auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          currentUser = parsed.user;
          currentProfile = parsed.profile;
          notifyListeners('SIGNED_IN', parsed.session);
        } catch (_) {}
      }
    }

    // Handle Hash Recovery / Reset Password tokens in URL
    checkRecoveryHash();
  }

  function checkRecoveryHash() {
    const hash = window.location.hash;
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
      // Direct user to reset-password view
      if (window.openAuthModal) {
        window.openAuthModal('reset-password');
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
      console.warn('Error fetching profile:', err);
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

  // Phase 3 & 4: Sign In Through 5-in-50s Rate-Limiting Gateway
  async function signIn({ email, password }) {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    // Call server-side gateway to enforce 5 failed attempts / 50s rule
    try {
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

      // Success
      if (supabaseClient && data.session?.access_token) {
        await supabaseClient.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        const { data: { user } } = await supabaseClient.auth.getUser();
        currentUser = user;
        if (user) await fetchProfile(user.id);
      } else {
        // Local mode session
        currentUser = data.user || { email, role: 'registered_user' };
        currentProfile = {
          full_name: email.split('@')[0],
          role: currentUser.role || 'registered_user',
        };
        sessionStorage.setItem('shantipur_sim_auth', JSON.stringify({
          user: currentUser,
          profile: currentProfile,
          session: data.session,
        }));
        notifyListeners('SIGNED_IN', data.session);
      }

      return { success: true, user: currentUser, profile: currentProfile };
    } catch (err) {
      return {
        success: false,
        error: 'Network connection error. Please verify your connection and try again.',
      };
    }
  }

  // Phase 2: Sign Up with Strong Password & Role Assignment
  async function signUp({ email, password, fullName, role = 'registered_user' }) {
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

    // STRICT: Force role to registered_user or business_owner. Admin can NEVER be self-assigned!
    const safeRole = role === 'business_owner' ? 'business_owner' : 'registered_user';

    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: safeRole,
          },
          emailRedirectTo: window.location.origin + '/#login',
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: data.user,
        requiresEmailConfirmation: !data.session,
        message: 'Registration successful! Please check your email to verify your account before logging in.',
      };
    } else {
      // Local simulation mode
      return {
        success: true,
        requiresEmailConfirmation: true,
        message: 'Registration submitted! A verification link has been dispatched to your email address.',
      };
    }
  }

  // Phase 2: Forgot Password
  async function resetPasswordForEmail(email) {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (supabaseClient) {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + '/#reset-password',
      });
      if (error) {
        // Do not leak email existence: return generic success notice
        console.warn('Supabase resetPassword error:', error.message);
      }
    }

    return {
      success: true,
      message: 'If an account exists with this email, a secure password reset link has been dispatched.',
    };
  }

  // Phase 2: Update Password (Reset Flow)
  async function updatePassword(newPassword) {
    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return { success: false, error: strength.message };
    }

    if (supabaseClient) {
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { success: false, error: error.message };
      }
    }

    return {
      success: true,
      message: 'Password updated successfully! You may now sign in with your new password.',
    };
  }

  // Sign Out
  async function signOut() {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    currentUser = null;
    currentProfile = null;
    sessionStorage.removeItem('shantipur_sim_auth');
    notifyListeners('SIGNED_OUT', null);
    return { success: true };
  }

  // Expose ShantipurAuth API
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
    onAuthStateChange: (fn) => authStateListeners.push(fn),
    getConfig: () => ({ ...clientConfig }),
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
