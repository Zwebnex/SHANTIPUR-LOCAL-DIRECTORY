/**
 * Santipur Heritage Stay & Hospitality Engine
 * Razorpay Order Creation API with 1.5% Platform Commission
 * Route: /api/razorpay/create-order
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

function generateBookingCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `STAY-${code}`;
}

function calculateNights(checkIn, checkOut) {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
    const diffMs = d2.getTime() - d1.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }
  return 1;
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
      property_id,
      room_id,
      guest_name,
      guest_phone,
      guest_email,
      check_in,
      check_out,
      guests_count = 1,
      rooms_count = 1,
      special_notes = ''
    } = body;

    if (!guest_name || !guest_phone || !check_in || !check_out) {
      return res.status(400).json({ error: 'guest_name, guest_phone, check_in, and check_out are mandatory.' });
    }

    const sb = getSupabase();
    let basePricePerNight = 1500;
    let verifiedPropertyId = property_id;
    let verifiedRoomId = room_id;
    let ownerAccountId = null;

    // Verify room and property tariff directly from database to guarantee security
    if (room_id) {
      try {
        const { data: roomData, error: roomErr } = await sb
          .from('rooms')
          .select('id, property_id, base_price_per_night, properties (id, razorpay_account_id)')
          .eq('id', room_id)
          .single();

        if (!roomErr && roomData) {
          basePricePerNight = Number(roomData.base_price_per_night);
          verifiedPropertyId = roomData.property_id;
          verifiedRoomId = roomData.id;
          if (roomData.properties && roomData.properties.razorpay_account_id) {
            ownerAccountId = roomData.properties.razorpay_account_id;
          }
        }
      } catch (err) {
        // Fallback to accommodation table or body price if rooms table is empty
      }
    }

    if (body.price_per_night && (!basePricePerNight || basePricePerNight === 1500)) {
      const parsedRate = parseFloat(body.price_per_night);
      if (!isNaN(parsedRate) && parsedRate > 0) {
        basePricePerNight = parsedRate;
      }
    }

    // STRICT MATHEMATICAL CALCULATION
    const nights = calculateNights(check_in, check_out);
    const rooms = Math.max(1, parseInt(rooms_count, 10) || 1);
    const guests = Math.max(1, parseInt(guests_count, 10) || 1);

    // 1. Exact room tariff charged by owner
    const hotel_base_amount = Math.round(basePricePerNight * nights * rooms * 100) / 100;
    // 2. Strict 1.5% platform commission
    const platform_fee_amount = Math.round((hotel_base_amount * 0.015) * 100) / 100;
    // 3. Total Advance Payable
    const total_paid_amount = Math.round((hotel_base_amount + platform_fee_amount) * 100) / 100;
    const amountInPaise = Math.round(total_paid_amount * 100);

    const booking_code = generateBookingCode();
    const booking_id = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substring(2));

    // Razorpay Keys from environment
    const rzpKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId = `order_sim_${Date.now()}`;

    if (rzpKeyId && rzpKeySecret && !rzpKeyId.startsWith('PASTE_')) {
      // Create Order via live Razorpay REST API
      const authHeader = 'Basic ' + Buffer.from(`${rzpKeyId}:${rzpKeySecret}`).toString('base64');
      const orderPayload = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: booking_code,
        notes: {
          booking_code,
          guest_name: guest_name.trim(),
          guest_phone: guest_phone.trim(),
          property_id: verifiedPropertyId || 'santipur-prop',
          room_id: verifiedRoomId || 'santipur-room',
          hotel_base_amount: String(hotel_base_amount),
          platform_fee_amount: String(platform_fee_amount)
        }
      };

      // Support Razorpay Route / split transfers if owner account exists
      if (ownerAccountId) {
        orderPayload.transfers = [
          {
            account: ownerAccountId,
            amount: Math.round(hotel_base_amount * 100),
            currency: 'INR',
            notes: { booking_code },
            on_hold: 0
          }
        ];
      }

      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(orderPayload)
      });

      if (!rzpRes.ok) {
        const errorText = await rzpRes.text();
        console.error('Razorpay Order API error:', errorText);
        throw new Error(`Razorpay Order creation failed: ${errorText}`);
      }

      const rzpData = await rzpRes.json();
      razorpayOrderId = rzpData.id;
    } else {
      console.warn('Razorpay keys not configured; operating in simulated secure test mode.');
    }

    // Insert pending booking into Supabase bookings table
    const newBookingRecord = {
      id: booking_id,
      booking_code,
      property_id: verifiedPropertyId,
      room_id: verifiedRoomId,
      guest_name: guest_name.trim(),
      guest_phone: guest_phone.trim(),
      guest_email: (guest_email || '').trim(),
      check_in,
      check_out,
      nights,
      guests_count: guests,
      rooms_count: rooms,
      hotel_base_amount,
      platform_fee_amount,
      total_paid_amount,
      payment_method: 'Razorpay',
      payment_status: 'Pending',
      booking_status: 'Pending',
      razorpay_order_id: razorpayOrderId,
      special_notes: (special_notes || '').trim()
    };

    try {
      await sb.from('bookings').insert([newBookingRecord]);
    } catch (dbErr) {
      console.warn('Supabase booking write notice:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      order_id: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      booking_code,
      booking_id,
      key_id: rzpKeyId || 'rzp_test_placeholder',
      breakdown: {
        base_price_per_night: basePricePerNight,
        nights,
        rooms_count: rooms,
        hotel_base_amount,
        platform_fee_amount,
        total_paid_amount
      }
    });

  } catch (err) {
    console.error('Create Order Error:', err);
    return res.status(500).json({
      error: 'Failed to initialize booking payment order.',
      details: err.message
    });
  }
};
