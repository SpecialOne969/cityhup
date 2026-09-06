import { Platform, Linking } from 'react-native';
import { supabase } from './supabase';

export const PAYSTACK_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? 'pk_test_4e8467558df1d69469a67ebaaf9e2dcefa01d257';

// ─── Reference generator ───────────────────────────────────────────────────
export function generateReference(): string {
  return `CH-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

// ─── Types ─────────────────────────────────────────────────────────────────
export interface PaystackPaymentOptions {
  email: string;
  amountNGN: number;       // in Naira — we convert to kobo internally
  reference: string;
  businessName?: string;
  phone?: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

export interface PaystackVerifyResult {
  status: 'success' | 'failed' | 'abandoned';
  reference: string;
  amountNGN: number;
  paidAt: string;
}

// ─── Web: inject Paystack inline script once ──────────────────────────────
let scriptPromise: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { resolve(); return; }
    if ((window as any).PaystackPop) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Paystack checkout script.'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

// ─── Web: open Paystack popup ─────────────────────────────────────────────
async function openWebPopup(opts: PaystackPaymentOptions): Promise<void> {
  await loadPaystackScript();
  const PaystackPop = (window as any).PaystackPop;
  if (!PaystackPop) throw new Error('Paystack script failed to load.');

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: opts.email,
    amount: Math.round(opts.amountNGN * 100),   // kobo
    currency: 'NGN',
    ref: opts.reference,
    metadata: {
      custom_fields: [
        { display_name: 'Business Name', variable_name: 'business_name', value: opts.businessName ?? '' },
        { display_name: 'Phone', variable_name: 'phone', value: opts.phone ?? '' },
      ],
    },
    callback: (response: { reference: string }) => opts.onSuccess(response.reference),
    onClose: opts.onCancel,
  });
  handler.openIframe();
}

// ─── Mobile: initialize via Edge Function, open authorization URL ──────────
async function openMobileCheckout(opts: PaystackPaymentOptions): Promise<void> {
  const { data, error } = await supabase.functions.invoke('paystack', {
    body: {
      action: 'initialize',
      email: opts.email,
      amountKobo: Math.round(opts.amountNGN * 100),
      reference: opts.reference,
      metadata: { business_name: opts.businessName, phone: opts.phone },
      callbackUrl: 'https://cityhup.com/payment/callback',
    },
  });

  if (error || !data?.authorization_url) {
    throw new Error(error?.message ?? 'Could not initialize Paystack payment.');
  }

  await Linking.openURL(data.authorization_url);
  // On mobile we can't intercept the redirect, so we trust the verify call later
  // The registration flow will verify the reference on the callback screen
}

// ─── Main entry point ─────────────────────────────────────────────────────
export async function initiatePaystackPayment(opts: PaystackPaymentOptions): Promise<void> {
  if (Platform.OS === 'web') {
    await openWebPopup(opts);
  } else {
    await openMobileCheckout(opts);
  }
}

// ─── Verify a payment reference via Edge Function ─────────────────────────
export async function verifyPaystackPayment(reference: string): Promise<PaystackVerifyResult> {
  const { data, error } = await supabase.functions.invoke('paystack', {
    body: { action: 'verify', reference },
  });

  if (error || !data) throw new Error(error?.message ?? 'Payment verification failed.');
  return data as PaystackVerifyResult;
}
