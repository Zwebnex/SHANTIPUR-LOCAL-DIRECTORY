-- ==============================================================================
-- SHANTIPUR LOCAL DIRECTORY — MIGRATION 01: SCHEMAS & RATE LIMITING
-- Project ID: bnlhqkcyqymsvtqblwkv
-- Description: Creates isolated private security schema, rate limit storage,
--              and atomic functions enforcing 5 failed attempts / 50 seconds.
-- ==============================================================================

-- 1. Create Private Security Schema (Isolated from PostgREST Data API)
CREATE SCHEMA IF NOT EXISTS private;

-- Restrict schema access completely from public application roles
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role, postgres;

-- 2. Create Login Attempts Table in Private Schema
CREATE TABLE IF NOT EXISTS private.login_attempts (
    id BIGSERIAL PRIMARY KEY,
    ip_address TEXT NOT NULL,
    email_hash TEXT NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning-fast rolling window queries and cleanup
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_window 
    ON private.login_attempts (ip_address, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_window 
    ON private.login_attempts (email_hash, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_cleanup 
    ON private.login_attempts (attempted_at);

-- Completely revoke table access from application roles
REVOKE ALL ON TABLE private.login_attempts FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE private.login_attempts TO service_role, postgres;

-- 3. Atomic Rate Limit Evaluation Function
-- Evaluates whether the request is allowed or blocked under the rolling 50s window
CREATE OR REPLACE FUNCTION private.check_login_rate_limit(
    p_ip TEXT,
    p_email_hash TEXT
)
RETURNS TABLE (
    is_allowed BOOLEAN,
    attempt_count INTEGER,
    retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
DECLARE
    v_window_interval INTERVAL := INTERVAL '50 seconds';
    v_max_attempts CONSTANT INTEGER := 5;
    v_window_start TIMESTAMPTZ;
    v_count INTEGER;
    v_oldest_attempt_in_window TIMESTAMPTZ;
    v_retry_seconds INTEGER := 0;
BEGIN
    v_window_start := timezone('utc'::text, now()) - v_window_interval;

    -- Count failed attempts inside the rolling 50-second window
    -- Matching either by IP or by Email Hash to prevent distributed brute force or IP switching
    SELECT 
        COUNT(*),
        MIN(attempted_at)
    INTO 
        v_count,
        v_oldest_attempt_in_window
    FROM private.login_attempts
    WHERE attempted_at >= v_window_start
      AND (ip_address = p_ip OR (p_email_hash <> '' AND email_hash = p_email_hash));

    IF v_count >= v_max_attempts THEN
        -- Calculate how many seconds until the oldest attempt in the window expires
        v_retry_seconds := GREATEST(1, CEIL(EXTRACT(EPOCH FROM ((v_oldest_attempt_in_window + v_window_interval) - timezone('utc'::text, now()))))::INTEGER);
        RETURN QUERY SELECT FALSE, v_count, v_retry_seconds;
    ELSE
        RETURN QUERY SELECT TRUE, v_count, 0;
    END IF;
END;
$$;

-- 4. Record Failed Login Attempt
CREATE OR REPLACE FUNCTION private.record_failed_login(
    p_ip TEXT,
    p_email_hash TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
BEGIN
    INSERT INTO private.login_attempts (ip_address, email_hash, attempted_at)
    VALUES (p_ip, COALESCE(p_email_hash, ''), timezone('utc'::text, now()));

    -- Opportunistic cleanup of attempts older than 15 minutes to keep table lean
    IF (random() < 0.05) THEN
        DELETE FROM private.login_attempts 
        WHERE attempted_at < timezone('utc'::text, now()) - INTERVAL '15 minutes';
    END IF;
END;
$$;

-- 5. Clear Failed Attempts Upon Successful Authentication
CREATE OR REPLACE FUNCTION private.clear_login_attempts(
    p_ip TEXT,
    p_email_hash TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
BEGIN
    DELETE FROM private.login_attempts
    WHERE (ip_address = p_ip OR (p_email_hash <> '' AND email_hash = p_email_hash))
      AND attempted_at >= timezone('utc'::text, now()) - INTERVAL '50 seconds';
END;
$$;

-- Revoke execute on private functions from public
REVOKE EXECUTE ON FUNCTION private.check_login_rate_limit(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private.record_failed_login(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private.clear_login_attempts(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.check_login_rate_limit(TEXT, TEXT) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION private.record_failed_login(TEXT, TEXT) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION private.clear_login_attempts(TEXT, TEXT) TO service_role, postgres;

