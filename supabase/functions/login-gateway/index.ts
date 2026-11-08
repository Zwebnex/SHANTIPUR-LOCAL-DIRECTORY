// ==============================================================================
// SHANTIPUR LOCAL DIRECTORY — SUPABASE EDGE FUNCTION: LOGIN GATEWAY
// Path: supabase/functions/login-gateway/index.ts
// Mandatory Security Requirement: Maximum 5 failed login attempts in 50 seconds.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper: Compute SHA-256 hash of email for privacy-preserving rate limiting
async function hashEmail(email: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(email.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { email, password, captchaToken } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email or password is incorrect." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine Client IP securely from headers
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "127.0.0.1";

    const emailHash = await hashEmail(email);

    // Initialize Supabase Admin Client using server-side environment secrets
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Edge Function environment");
      return new Response(
        JSON.stringify({ error: "Internal authentication service error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Check Rate Limit via private atomic stored procedure
    // Rule: Max 5 failed attempts within rolling 50-second window
    const { data: limitData, error: limitError } = await supabaseAdmin.rpc(
      "check_login_rate_limit",
      { p_ip: clientIp, p_email_hash: emailHash }
    );

    if (limitError) {
      console.error("Rate limit check error:", limitError);
      // Fail closed or log
    }

    const status = limitData && limitData[0];
    if (status && status.is_allowed === false) {
      const retryAfter = status.retry_after_seconds || 50;
      return new Response(
        JSON.stringify({
          error: "Too many unsuccessful login attempts. Please try again after the cooldown.",
          retryAfterSeconds: retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    // 2. Perform Authentication against Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !authData.session) {
      // 3. Record Failed Attempt Atomically
      await supabaseAdmin.rpc("record_failed_login", {
        p_ip: clientIp,
        p_email_hash: emailHash,
      });

      // Always return generic error message — zero email enumeration
      return new Response(
        JSON.stringify({ error: "Email or password is incorrect." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. On Successful Authentication, Clear Failed Attempt State
    await supabaseAdmin.rpc("clear_login_attempts", {
      p_ip: clientIp,
      p_email_hash: emailHash,
    });

    // 5. Return Authentic Session to Client
    return new Response(
      JSON.stringify({
        session: authData.session,
        user: authData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Login gateway exception:", err);
    return new Response(
      JSON.stringify({ error: "Authentication request could not be processed." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

