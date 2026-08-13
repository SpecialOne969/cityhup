import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

export default function CustomerLoginScreen() {
  const router = useRouter();
  const customerLogin = useAppStore(s => s.customerLogin);
  const currentCustomer = useAppStore(s => s.currentCustomer);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentCustomer) router.replace('/customer-dashboard');
  }, [currentCustomer]);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const ok = await customerLogin(email.trim().toLowerCase(), password);
      if (ok) {
        router.replace('/customer-dashboard');
      } else {
        Alert.alert('Login Failed', 'Email or password is incorrect. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="person-circle-outline" size={44} color={Colors.primary} />
          </View>
          <Text style={styles.logoText}>CITY<Text style={{ color: Colors.accent }}>HUP</Text></Text>
          <Text style={styles.logoSub}>Welcome back</Text>
        </View>

        {/* Tab row */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={styles.tabBtn} onPress={() => router.replace('/customer-register')}>
            <Text style={styles.tabText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]}>
            <Text style={styles.tabTextActive}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Sign In</Text>
          <Text style={styles.cardSub}>Sign in to access your personalized service directory.</Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email} onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address" autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.pwRow}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
              value={password} onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.pwEye}>
              <Ionicons name={showPw ? 'eye-off' : 'eye'} size={18} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.6 }]}
            onPress={handleLogin} disabled={loading}
          >
            <Ionicons name="log-in" size={18} color={Colors.white} />
            <Text style={styles.loginBtnText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.altSection}>
          <Text style={styles.altText}>Are you a service provider?</Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.altLink}>List Your Business →</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity onPress={() => router.push('/admin/login')}>
            <Text style={styles.adminLink}>Admin Portal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  scroll: { flex: 1 },
  body: { padding: 24, alignItems: 'center' },

  logoWrap: { alignItems: 'center', marginBottom: 20 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  logoText: { fontSize: 26, fontWeight: '900', color: Colors.primaryDark, letterSpacing: 2 },
  logoSub: { fontSize: 12, color: Colors.textLight, marginTop: 2 },

  tabRow: {
    flexDirection: 'row', width: '100%', maxWidth: 400,
    backgroundColor: Colors.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', marginBottom: 16,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textMedium },
  tabTextActive: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: Colors.bgCard, borderRadius: 16,
    padding: 24, borderWidth: 1, borderColor: Colors.border,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  cardSub: { fontSize: 13, color: Colors.textLight, marginBottom: 20, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: Colors.textDark, backgroundColor: Colors.bgLight, marginBottom: 14,
  },
  pwRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    backgroundColor: Colors.bgLight, marginBottom: 20, overflow: 'hidden',
  },
  pwEye: { paddingHorizontal: 12 },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15,
  },
  loginBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },

  altSection: { alignItems: 'center', marginTop: 20, gap: 8 },
  altText: { fontSize: 13, color: Colors.textMedium },
  altLink: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  divider: { height: 1, width: 120, backgroundColor: Colors.borderLight, marginVertical: 4 },
  adminLink: { fontSize: 12, color: Colors.textLight },
});
