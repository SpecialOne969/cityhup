import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function PaymentCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    // Paystack uses inline popup — payment completes on the register page.
    // This page is a fallback; redirect home after a short delay.
    const t = setTimeout(() => router.replace('/' as any), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.title}>Redirecting…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.bgLight, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 16, color: Colors.textMedium },
});
