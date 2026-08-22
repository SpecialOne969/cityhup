import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

export default function ClientLoginScreen() {
  const router = useRouter();
  const clientLogin = useAppStore(s => s.clientLogin);
  const setupClientLogin = useAppStore(s => s.setupClientLogin);

  const [mode, setMode] = useState<'login' | 'setup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Enter your email and password');
      return;
    }
    setLoading(true);
    const ok = await clientLogin(email.trim().toLowerCase(), password);
    setLoading(false);
    if (ok) {
      router.replace('/client-dashboard');
    } else {
      Alert.alert('Login Failed', 'Email or password is incorrect. If you have not set up your portal login yet, tap "First-time Setup" below.');
    }
  }

  async function handleSetup() {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Enter your registered business email and choose a password');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = await setupClientLogin(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result === 'ok') {
      router.replace('/client-dashboard');
    } else if (result === 'no_listing') {
      Alert.alert(
        'No Listing Found',
        'No business listing was found for this email address. Please check the email you registered with, or contact City Hup support.'
      );
    } else {
      Alert.alert('Setup Failed', 'This email may already have a portal account. Try logging in instead, or contact support.');
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={Colors.primary} />
      </TouchableOpacity>

      <View style={styles.logoRow}>
        <Text style={styles.logoText}>CITY<Text style={{ color: Colors.gold }}>HUP</Text></Text>
        <Text style={styles.logoSub}>Business Portal</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === 'login' && styles.tabActive]}
          onPress={() => setMode('login')}
        >
          <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'setup' && styles.tabActive]}
          onPress={() => setMode('setup')}
        >
          <Text style={[styles.tabText, mode === 'setup' && styles.tabTextActive]}>First-time Setup</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {mode === 'login' ? (
          <>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Log in to manage your CityHup listing</Text>
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>Set up your portal login</Text>
            <Text style={styles.cardSub}>Use the email address registered with your business listing</Text>
          </>
        )}

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Business Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@business.email"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'setup' ? 'Choose a password (min 6 chars)' : 'Enter your password'}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />
        </View>

        {mode === 'setup' && (
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={mode === 'login' ? handleLogin : handleSetup}
          disabled={loading}
        >
          <Ionicons name={mode === 'login' ? 'log-in-outline' : 'person-add-outline'} size={18} color={Colors.white} />
          <Text style={styles.submitBtnText}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Login to Portal' : 'Create Portal Account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.info} />
          <Text style={styles.hintText}>
            {mode === 'login'
              ? 'Never set up a login? Tap "First-time Setup" above.'
              : 'Your email must match the one used when your business was registered on CityHup.'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  content: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, flexGrow: 1 },
  backBtn: { marginBottom: 20 },
  logoRow: { alignItems: 'center', marginBottom: 28 },
  logoText: { fontSize: 36, fontWeight: '900', color: Colors.primary, letterSpacing: 2 },
  logoSub: { fontSize: 14, color: Colors.textMedium, marginTop: 2 },
  tabs: {
    flexDirection: 'row', backgroundColor: Colors.borderLight,
    borderRadius: 10, padding: 3, marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: 14, color: Colors.textMedium, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: 14,
    padding: 20, borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  cardSub: { fontSize: 13, color: Colors.textMedium, marginBottom: 20, lineHeight: 18 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textDark,
    backgroundColor: Colors.bgLight,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15,
    marginTop: 6,
  },
  submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  hintBox: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: Colors.infoLight, borderRadius: 8, padding: 10, marginTop: 14,
  },
  hintText: { flex: 1, fontSize: 12, color: Colors.info, lineHeight: 17 },
});
