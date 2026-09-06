// Supabase Edge Function — Paystack integration
// Deploy: supabase functions deploy paystack
// Env var needed: PAYSTACK_SECRET_KEY=sk_test_...

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY') ?? '';
const PAYSTACK_BASE   = 'https://api.paystack.co';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const { action } = body;

    // ── Initialize transaction ────────────────────────────────────────────
    if (action === 'initialize') {
      const { email, amountKobo, reference, metadata, callbackUrl } = body;

      if (!email || !amountKobo || !reference) {
        return json({ error: 'email, amountKobo, and reference are required.' }, 400);
      }

      const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amountKobo,
          reference,
          currency: 'NGN',
          callback_url: callbackUrl ?? 'https://cityhup.com/payment/callback',
          metadata: metadata ?? {},
        }),
      });

      const data = await res.json();
      if (!data.status) return json({ error: data.message ?? 'Initialization failed.' }, 400);

      return json({
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
      });
    }

    // ── Verify transaction ────────────────────────────────────────────────
    if (action === 'verify') {
      const { reference } = body;
      if (!reference) return json({ error: 'reference is required.' }, 400);

      const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      });

      const data = await res.json();
      if (!data.status) return json({ error: data.message ?? 'Verification failed.' }, 400);

      const tx = data.data;
      return json({
        status:    tx.status,               // 'success' | 'failed' | 'abandoned'
        reference: tx.reference,
        amountNGN: tx.amount / 100,        // convert kobo → naira
        paidAt:    tx.paid_at,
        channel:   tx.channel,
        currency:  tx.currency,
      });
    }

    // ── Webhook (Paystack → Supabase) ─────────────────────────────────────
    if (action === 'webhook') {
      // Verify Paystack signature
      const signature = req.headers.get('x-paystack-signature') ?? '';
      const rawBody   = JSON.stringify(body);

      const key = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(PAYSTACK_SECRET), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
      );
      const sigBuf  = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
      const sigHex  = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

      if (sigHex !== signature) return json({ error: 'Invalid signature.' }, 401);

      // Handle charge.success event
      if (body.event === 'charge.success') {
        const tx = body.data;
        console.log('Payment confirmed:', tx.reference, 'Amount:', tx.amount / 100, 'NGN');
        // You can update your Supabase DB here if needed
      }

      return json({ received: true });
    }

    return json({ error: `Unknown action: ${action}` }, 400);

  } catch (err: any) {
    return json({ error: err.message ?? 'Internal error.' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
