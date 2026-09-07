import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, ScrollView, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';

type Mode = 'login' | 'setup' | 'forgot';

export default function ClientLoginScreen() {
  const router = useRouter();
  const clientLogin = useAppStore(s => s.clientLogin);
  const setupClientLogin = useAppStore(s => s.setupClientLogin);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setResetError('');
    setResetSent(false);
  }

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    const ok = await clientLogin(email.trim().toLowerCase(), password);
    setLoading(false);
    if (ok) {
      router.replace('/client-dashboard' as any);
    } else {
      setError('Email or password is incorrect. If you have not set up your portal login yet, tap "First-time Setup" below.');
    }
  }

  async function handleSetup() {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your registered business email and choose a password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const result = await setupClientLogin(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result === 'ok') {
      router.replace('/client-dashboard' as any);
    } else if (result === 'no_listing') {
      setError('No business listing found for this email. Check the email you registered with, or contact City Hup support.');
    } else {
      setError('This email may already have a portal account. Try logging in instead, or contact support.');
    }
  }

  async function handleForgotPassword() {
    setResetError('');
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetError('Enter a valid email address.');
      return;
    }
    setResetLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cityhup.com';
      const { error: supaErr } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim().toLowerCase(),
        { redirectTo: `${origin}/client-reset-password` }
      );
      if (supaErr) {
        setResetError(supaErr.message || 'Failed to send reset email. Try again.');
      } else {
        setResetSent(true);
      }
    } catch {
      setResetError('Could not send email. Check your internet connection.');
    } finally {
      setResetLoading(false);
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

      {/* Tab row — only show for login/setup */}
      {mode !== 'forgot' && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && styles.tabActive]}
            onPress={() => switchMode('login')}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'setup' && styles.tabActive]}
            onPress={() => switchMode('setup')}
          >
            <Text style={[styles.tabText, mode === 'setup' && styles.tabTextActive]}>First-time Setup</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>

        {/* ── FORGOT PASSWORD ─────────────────────────────────────────── */}
        {mode === 'forgot' ? (
          resetSent ? (
            <View style={styles.successBox}>
              <Ionicons name="mail-open-outline" size={48} color={Colors.success} />
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successMsg}>
                A password reset link has been sent to{' '}
                <Text style={{ fontWeight: '700' }}>{resetEmail}</Text>.{'\n'}
                Click the link to set a new password.
              </Text>
              <TouchableOpacity style={styles.submitBtn} onPress={() => switchMode('login')}>
                <Text style={styles.submitBtnText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.backRow} onPress={() => switchMode('login')}>
                <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                <Text style={styles.backRowText}>Back to Login</Text>
              </TouchableOpacity>

              <Text style={styles.cardTitle}>Reset Password</Text>
              <Text style={styles.cardSub}>
                Enter the email address used when your business was registered. We'll send a reset link.
              </Text>

              {!!resetError && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={15} color={Colors.danger} />
                  <Text style={styles.errorText}>{resetError}</Text>
                </View>
              )}

              <Text style={styles.label}>Business Email</Text>
              <TextInput
                style={styles.input}
                value={resetEmail}
                onChangeText={v => { setResetEmail(v); setResetError(''); }}
                placeholder="your@business.email"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.submitBtn, (resetLoading || !resetEmail.trim()) && { opacity: 0.6 }]}
                onPress={handleForgotPassword}
                disabled={resetLoading || !resetEmail.trim()}
              >
                {resetLoading
                  ? <Text style={styles.submitBtnText}>Sending…</Text>
                  : <><Ionicons name="send" size={16} color={Colors.white} /><Text style={styles.submitBtnText}>Send Reset Link</Text></>
                }
              </TouchableOpacity>
            </>
          )

        /* ── LOGIN ──────────────────────────────────────────────────── */
        ) : mode === 'login' ? (
          <>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Log in to manage your CityHup listing</Text>

            {!!error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={15} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Business Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={v => { setEmail(v); setError(''); }}
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
                onChangeText={v => { setPassword(v); setError(''); }}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Ionicons name="log-in-outline" size={18} color={Colors.white} />
              <Text style={styles.submitBtnText}>{loading ? 'Please wait…' : 'Login to Portal'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotLink} onPress={() => switchMode('forgot')}>
              <Text style={styles.forgotLinkText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.info} />
              <Text style={styles.hintText}>Never set up a login? Tap "First-time Setup" above.</Text>
            </View>
          </>

        /* ── FIRST-TIME SETUP ───────────────────────────────────────── */
        ) : (
          <>
            <Text style={styles.cardTitle}>Set up your portal login</Text>
            <Text style={styles.cardSub}>Use the email address registered with your business listing</Text>

            {!!error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={15} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Business Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={v => { setEmail(v); setError(''); }}
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
                onChangeText={v => { setPassword(v); setError(''); }}
                placeholder="Choose a password (min 6 chars)"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={v => { setConfirmPassword(v); setError(''); }}
                placeholder="Repeat password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleSetup}
              disabled={loading}
            >
              <Ionicons name="person-add-outline" size={18} color={Colors.white} />
              <Text style={styles.submitBtnText}>{loading ? 'Please wait…' : 'Create Portal Account'}</Text>
            </TouchableOpacity>

            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.info} />
              <Text style={styles.hintText}>
                Your email must match the one used when your business was registered on CityHup.
              </Text>
            </View>
          </>
        )}
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
  forgotLink: { alignSelf: 'center', marginTop: 14, paddingVertical: 4 },
  forgotLinkText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  hintBox: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: Colors.infoLight, borderRadius: 8, padding: 10, marginTop: 14,
  },
  hintText: { flex: 1, fontSize: 12, color: Colors.info, lineHeight: 17 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.danger, lineHeight: 17 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backRowText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  successBox: { alignItems: 'center', gap: 14, paddingVertical: 10 },
  successTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark },
  successMsg: { fontSize: 14, color: Colors.textMedium, lineHeight: 20, textAlign: 'center' },
});
