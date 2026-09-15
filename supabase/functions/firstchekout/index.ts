// Supabase Edge Function — FirstChekOut (First Bank) integration
// Deploy: npx supabase functions deploy firstchekout
//
// Env vars to set in Supabase Dashboard → Edge Functions → Secrets:
//   FIRSTCHEKOUT_PUBLIC_KEY  — public/API key from merchant dashboard
//   FIRSTCHEKOUT_SECRET_KEY  — secret key from merchant dashboard
//   FIRSTCHEKOUT_MERCHANT_ID — (optional) merchant ID shown in account profile;
//                              defaults to PUBLIC_KEY if not set

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const PUBLIC_KEY    = Deno.env.get('FIRSTCHEKOUT_PUBLIC_KEY')    ?? '';
const SECRET_KEY    = Deno.env.get('FIRSTCHEKOUT_SECRET_KEY')    ?? '';
const MERCHANT_ID   = Deno.env.get('FIRSTCHEKOUT_MERCHANT_ID')   ?? PUBLIC_KEY;
// OAuth credentials — separate from API keys (found in merchant dashboard → Developer/OAuth settings)
const CLIENT_ID     = Deno.env.get('FIRSTCHEKOUT_CLIENT_ID')     ?? PUBLIC_KEY;
const CLIENT_SECRET = Deno.env.get('FIRSTCHEKOUT_CLIENT_SECRET') ?? SECRET_KEY;

const IDENTITY_URL = 'https://www.firstchekout.com/identityserver';
const API_URL      = 'https://www.firstchekout.com/apigateway';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Token cache (reused within the same function instance, ~10 min TTL) ──────
let cachedToken  = '';
let tokenExpires = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpires - 30_000) return cachedToken;

  const body = new URLSearchParams({
    client_Id: CLIENT_ID,
    client_Secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
  });

  const res = await fetch(`${IDENTITY_URL}/api/v2/Authenticate/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token fetch failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.isSuccess || !data.value?.access_token) {
    throw new Error(`Auth failed: ${data.error ?? JSON.stringify(data)}`);
  }

  cachedToken  = data.value.access_token as string;
  tokenExpires = Date.now() + (data.value.expires_in as number) * 1000;
  return cachedToken;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const { action } = body;

    // ── Initiate transaction ───────────────────────────────────────────────
    if (action === 'initiate') {
      const { amount, payerEmail, payerName, paymentReference, callbackUrl } = body;
      if (!amount || !payerEmail || !payerName || !paymentReference) {
        return json({ error: 'amount, payerEmail, payerName, and paymentReference are required.' }, 400);
      }

      const token = await getAccessToken();

      const res = await fetch(`${API_URL}/api/v1/transactions/initiate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Amount: amount,
          PayerEmail: payerEmail,
          PayerName: payerName,
          Purpose: 'CityHup Client Registration',
          PublicKey: PUBLIC_KEY,
          PaymentReference: paymentReference,
          CallbackUrl: callbackUrl ?? 'https://cityhup.com/payment/callback',
        }),
      });

      const data = await res.json();
      if (data.status !== 'OK' || !data.data?.accessCode) {
        return json({ error: data.message ?? 'Transaction initiation failed.' }, 400);
      }

      return json({ accessCode: data.data.accessCode as string, paymentReference });
    }

    // ── Verify transaction ─────────────────────────────────────────────────
    if (action === 'verify') {
      const { transactionRef } = body;
      if (!transactionRef) return json({ error: 'transactionRef is required.' }, 400);

      const token = await getAccessToken();

      const res = await fetch(
        `${API_URL}/api/v1/transactions/referenceId/${encodeURIComponent(transactionRef)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Merchant-Id': MERCHANT_ID,
            'Secret-Key': SECRET_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (res.status === 404) return json({ error: 'Transaction not found.' }, 404);

      const data = await res.json();
      if (data.status !== 'OK' || !data.data) {
        return json({ error: data.message ?? 'Verification failed.' }, 400);
      }

      const tx = data.data;
      return json({
        status:               tx.status,                // 'PENDING' | 'SUCCESS' | 'FAILED'
        transactionReference: tx.transactionReference,
        paymentReference:     tx.paymentReference,
        amountNGN:            tx.amount,                // already in naira
        createdAt:            tx.createdAt,
      });
    }

    return json({ error: `Unknown action: ${action}` }, 400);

  } catch (err: any) {
    return json({ error: err.message ?? 'Internal server error.' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
