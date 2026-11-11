/**
 * Shantipur Local Directory — Portal Authentication & Security Client
 */

(function (window) {
  'use strict';

  let supabaseClient = null;
  let clientConfig = {
    supabaseUrl: 'https://bnlhqkcyqymsvtqblwkv.supabase.co',
    supabaseAnonKey: 'sb_publishable_gRldZFx01gJWHI0JKjbaNQ_9G6OgFdp',
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

  // Initialize Client Instance Silently
  async function init() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const remoteConfig = await res.json();
        clientConfig = { ...clientConfig, ...remoteConfig };
      }
    } catch (e) {
      // Silent failover
    }

    const { supabaseUrl, supabaseAnonKey } = clientConfig;

    const isValidKey = supabaseAnonKey && 
                       typeof supabaseAnonKey === 'string' && 
                       supabaseAnonKey.trim().length > 20 && 
                       !supabaseAnonKey.startsWith('YOUR_');

    if (!supabaseUrl || !isValidKey) {
      isConfigured = false;
      return;
    }

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

        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (session && session.user) {
          currentUser = session.user;
          await fetchProfile(session.user.id);
          notifyListeners('INITIAL_SESSION', session);
        }
      } catch (err) {
        isConfigured = false;
      }
    } else {
      isConfigured = false;
    }

    checkRecoveryHash();
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
      // Silent error handling
    }
    return currentProfile;
  }

  function notifyListeners(event, session) {
    authStateListeners.forEach((fn) => {
      try {
        fn(event, session, currentUser, currentProfile);
      } catch (e) {
        // Listener safety
      }
    });
  }

  // Account Registration
  async function signUp({ email, password, fullName, phone, role = 'registered_user' }) {
    if (!isConfigured || !supabaseClient) {
      return {
        success: false,
        error: 'Registration is temporarily offline. Please try again shortly.',
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

    const safeRole = role === 'business_owner' ? 'business_owner' : 'registered_user';

    try {
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
        let errorMsg = error.message;
        if (errorMsg.toLowerCase().includes('rate limit') || error.status === 429) {
          errorMsg = 'Too many requests. Please wait a few moments and try again.';
        }
        return { success: false, error: errorMsg };
      }

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
      return {
        success: false,
        error: 'Unable to connect to authentication server. Please check your network connection.',
      };
    }
  }

  // Account Sign-In
  async function signIn({ email, password }) {
    if (!isConfigured) {
      return {
        success: false,
        error: 'Sign-in is temporarily offline. Please try again shortly.',
      };
    }

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

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
          error: data.error || 'Too many unsuccessful login attempts. Please try again after cooldown.',
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
        error: 'Network error connecting to login service. Please check your connection.',
      };
    }
  }

  // Password Recovery
  async function resetPasswordForEmail(email) {
    if (!isConfigured || !supabaseClient) {
      return {
        success: false,
        error: 'Password reset service is temporarily offline.',
      };
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + '/#reset',
      });

      return {
        success: true,
        message: 'If an account exists with this email, a secure password reset link has been dispatched.',
      };
    } catch (err) {
      return { success: false, error: 'Unable to process password reset request.' };
    }
  }

  // Password Update
  async function updatePassword(newPassword) {
    if (!isConfigured || !supabaseClient) {
      return { success: false, error: 'Service is temporarily offline.' };
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
      return { success: false, error: 'Unable to update password.' };
    }
  }

  // Sign Out
  async function signOut() {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    currentUser = null;
    currentProfile = null;
    notifyListeners('SIGNED_OUT', null);
    return { success: true };
  }

  // Expose Clean API on window
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
    onAuthStateChange: (fn) => authStateListeners.push(fn),
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
