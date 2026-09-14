import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { verifyFirstChekoutPayment, getPendingFCPayment, clearFCPayment } from '../../lib/firstchekout';

export default function PaymentCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ref?: string; paymentReference?: string; accessCode?: string }>();

  const [status, setStatus]     = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [amountNGN, setAmountNGN] = useState(0);
  const [txRef, setTxRef]       = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    verify();
  }, []);

  async function verify() {
    try {
      // Resolve the accessCode (transactionRef) to query FirstChekOut.
      // Priority: URL param → sessionStorage saved before redirect.
      const pending = getPendingFCPayment();
      const accessCode =
        params.accessCode ??
        params.ref ??
        pending?.accessCode ??
        '';

      if (!accessCode) {
        setStatus('failed');
        setError('No payment reference found. If you completed payment, contact support with your transaction details.');
        return;
      }

      const result = await verifyFirstChekoutPayment(accessCode);
      clearFCPayment();

      setTxRef(result.transactionReference ?? accessCode);
      setAmountNGN(result.amountNGN ?? 0);

      if (result.status === 'SUCCESS') {
        setStatus('success');
      } else if (result.status === 'PENDING') {
        // Payment initiated but not yet confirmed — treat as processing
        setStatus('success'); // show as success; admin will confirm
        setAmountNGN(0);
      } else {
        setStatus('failed');
        setError('Payment was not completed. Please try again or use a different payment method.');
      }
    } catch (e: any) {
      clearFCPayment();
      setStatus('failed');
      setError(e.message ?? 'Could not verify payment. Please contact support.');
    }
  }

  return (
    <View style={styles.root}>
      {status === 'verifying' && (
        <>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.title}>Verifying payment…</Text>
          <Text style={styles.sub}>Please wait, do not close this page.</Text>
        </>
      )}

      {status === 'success' && (
        <>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
          </View>
          <Text style={styles.title}>Payment Received!</Text>
          {amountNGN > 0 && (
            <Text style={styles.amount}>₦{amountNGN.toLocaleString()} confirmed</Text>
          )}
          {txRef ? <Text style={styles.refText}>Ref: {txRef}</Text> : null}
          <Text style={styles.sub}>
            Your registration has been submitted and is pending admin approval.{'\n'}
            You will be contacted once approved.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/' as any)}>
            <Text style={styles.btnText}>Back to Home</Text>
          </TouchableOpacity>
        </>
      )}

      {status === 'failed' && (
        <>
          <View style={styles.iconWrap}>
            <Ionicons name="close-circle" size={72} color={Colors.danger} />
          </View>
          <Text style={styles.title}>Payment Not Confirmed</Text>
          <Text style={styles.sub}>{error || 'Something went wrong. Please try again.'}</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.danger }]} onPress={() => router.back()}>
            <Text style={styles.btnText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/' as any)}>
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: Colors.bgLight, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  iconWrap: { marginBottom: 8 },
  title:    { fontSize: 22, fontWeight: '800', color: Colors.textDark, textAlign: 'center' },
  amount:   { fontSize: 28, fontWeight: '900', color: Colors.success },
  refText:  { fontSize: 12, color: Colors.textMuted, fontFamily: 'monospace' },
  sub:      { fontSize: 14, color: Colors.textMedium, textAlign: 'center', lineHeight: 22, marginTop: 4 },
  btn:      { marginTop: 16, backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  btnText:  { color: Colors.white, fontWeight: '800', fontSize: 15 },
  homeBtn:  { marginTop: 10, paddingVertical: 10 },
  homeBtnText: { color: Colors.textMedium, fontSize: 14 },
});
