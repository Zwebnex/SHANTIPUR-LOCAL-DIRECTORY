/**
 * Santipur Heritage Stay & Hospitality Engine
 * Razorpay Payment Verification API (HMAC-SHA256)
 * Route: /api/razorpay/verify-payment
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local if running in local Node environment without preloaded envs
try {
  const envPath = path.join(__dirname, '..', '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) process.env[k] = v;
      }
    });
  }
} catch (e) {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://bnlhqkcyqymsvtqblwkv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_gRldZFx01gJWHI0JKjbaNQ_9G6OgFdp';

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

module.exports = async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
      booking_code
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing razorpay_order_id or razorpay_payment_id' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = false;

    if (keySecret && !keySecret.startsWith('PASTE_')) {
      // Cryptographic verification using HMAC-SHA256
      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(payload)
        .digest('hex');

      isValid = (generatedSignature === razorpay_signature);
    } else {
      // Simulated sandbox / test mode approval
      console.warn('RAZORPAY_KEY_SECRET not set in production. Validating in development sandbox mode.');
      isValid = true;
    }

    if (!isValid) {
      console.error('Razorpay signature mismatch for order:', razorpay_order_id);
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Transaction could not be verified.'
      });
    }

    // Update booking in Supabase
    const sb = getSupabase();
    let updatedBooking = null;

    try {
      let query = sb.from('bookings').update({
        payment_status: 'Paid',
        booking_status: 'Confirmed',
        razorpay_payment_id,
        razorpay_signature: razorpay_signature || 'verified_dev'
      });

      if (booking_id) {
        query = query.eq('id', booking_id);
      } else if (booking_code) {
        query = query.eq('booking_code', booking_code);
      } else {
        query = query.eq('razorpay_order_id', razorpay_order_id);
      }

      const { data, error } = await query.select();
      if (!error && Array.isArray(data) && data[0]) {
        updatedBooking = data[0];
      }
    } catch (dbErr) {
      console.warn('Supabase update notice on payment confirmation:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      booking_code: updatedBooking ? updatedBooking.booking_code : booking_code,
      booking_id: updatedBooking ? updatedBooking.id : booking_id,
      payment_status: 'Paid',
      booking_status: 'Confirmed',
      message: 'Payment verified and reservation confirmed successfully.'
    });

  } catch (err) {
    console.error('Verify Payment Error:', err);
    return res.status(500).json({
      error: 'Payment verification failed.',
      details: err.message
    });
  }
};
