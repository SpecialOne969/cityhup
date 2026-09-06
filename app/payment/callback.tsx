import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { verifyPaystackPayment } from '../../lib/paystack';

export default function PaymentCallbackScreen() {
  const { reference, trxref } = useLocalSearchParams<{ reference?: string; trxref?: string }>();
  const router = useRouter();
  const ref = reference ?? trxref ?? '';

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [amountNGN, setAmountNGN] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ref) { setStatus('failed'); setError('No payment reference found.'); return; }
    verifyPaystackPayment(ref)
      .then(result => {
        if (result.status === 'success') {
          setAmountNGN(result.amountNGN);
          setStatus('success');
        } else {
          setStatus('failed');
          setError('Payment was not completed.');
        }
      })
      .catch(e => { setStatus('failed'); setError(e.message); });
  }, [ref]);

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
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.amount}>₦{amountNGN.toLocaleString()} received</Text>
          <Text style={styles.refText}>Ref: {ref}</Text>
          <Text style={styles.sub}>Your registration has been submitted and is pending admin approval.</Text>
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
          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.sub}>{error || 'Something went wrong. Please try again.'}</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.danger }]} onPress={() => router.back()}>
            <Text style={styles.btnText}>Go Back</Text>
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
  sub:      { fontSize: 14, color: Colors.textMedium, textAlign: 'center', lineHeight: 20, marginTop: 4 },
  btn:      { marginTop: 16, backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  btnText:  { color: Colors.white, fontWeight: '800', fontSize: 15 },
});
