import { Platform, Linking } from 'react-native';
import { supabase } from './supabase';

// Sandbox checkout base URL.
// NOTE: Verify exact checkout URL format in FirstChekOut merchant docs.
// Change to https://www.firstchekout.com/pay/ for production.
const CHECKOUT_BASE =
  process.env.EXPO_PUBLIC_FIRSTCHEKOUT_ENV === 'live'
    ? 'https://www.firstchekout.com/pay/'
    : 'https://www.firstchekoutdev.com/pay/';

// sessionStorage key used to persist the accessCode across the payment redirect
const SESSION_KEY = 'fc_payment';

export function generatePaymentReference(): string {
  return `CH-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

export interface FirstChekoutInitOptions {
  payerEmail: string;
  payerName: string;
  amountNGN: number;
  paymentReference: string; // pre-generated so it can be stored in the DB before redirect
}

export interface FirstChekoutVerifyResult {
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  transactionReference: string;
  paymentReference: string;
  amountNGN: number;
}

/**
 * Initiate a FirstChekOut payment.
 * Calls the edge function, saves the accessCode to sessionStorage, then
 * redirects the browser to the hosted checkout page.
 * The page will not return from this call on web — the redirect takes over.
 */
export async function initiateFirstChekoutPayment(opts: FirstChekoutInitOptions): Promise<void> {
  const { data, error } = await supabase.functions.invoke('firstchekout', {
    body: {
      action: 'initiate',
      amount: opts.amountNGN,
      payerEmail: opts.payerEmail,
      payerName: opts.payerName,
      paymentReference: opts.paymentReference,
    },
  });

  if (error || !data?.accessCode) {
    throw new Error(error?.message ?? data?.error ?? 'Could not initialize payment. Try again.');
  }

  const accessCode: string = data.accessCode;

  // Persist both references so the callback page can verify without the form
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      accessCode,
      paymentReference: opts.paymentReference,
    }));
  }

  const checkoutUrl = `${CHECKOUT_BASE}${accessCode}`;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.href = checkoutUrl;
  } else {
    await Linking.openURL(checkoutUrl);
  }
}

/**
 * Verify a FirstChekOut transaction by its accessCode (transactionRef).
 * Called from the payment callback screen.
 */
export async function verifyFirstChekoutPayment(transactionRef: string): Promise<FirstChekoutVerifyResult> {
  const { data, error } = await supabase.functions.invoke('firstchekout', {
    body: { action: 'verify', transactionRef },
  });

  if (error || !data) throw new Error(error?.message ?? 'Payment verification failed.');
  if (data.error) throw new Error(data.error);

  return data as FirstChekoutVerifyResult;
}

/** Read the pending payment session saved before the redirect. */
export function getPendingFCPayment(): { accessCode: string; paymentReference: string } | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Clear the pending payment session after verification. */
export function clearFCPayment(): void {
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(SESSION_KEY);
}
