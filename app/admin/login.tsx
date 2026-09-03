import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';

type Mode = 'login' | 'forgot';

export default function AdminLoginScreen() {
  const router = useRouter();
  const login = useAppStore(s => s.login);
  const currentAdmin = useAppStore(s => s.currentAdmin);

  const [mode, setMode] = useState<Mode>('login');
  const [adminCode, setAdminCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (currentAdmin) router.replace('/admin/dashboard');
  }, [currentAdmin]);

  async function handleLogin() {
    setError('');
    if (!adminCode.trim() || !password) {
      setError('Please enter your admin code and password.');
      return;
    }
    setLoading(true);
    try {
      const ok = await login(adminCode.trim().toUpperCase(), password);
      if (ok) {
        router.replace('/admin/dashboard');
      } else {
        setError('Invalid admin code or password. Contact City Hup HQ.');
      }
    } catch {
      setError('Could not connect. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setResetError('');
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetError('Enter the email address linked to your admin account.');
      return;
    }
    setResetLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cityhup.com';
      const { error: supaErr } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: `${origin}/admin/reset-password`,
      });
      if (supaErr) {
        setResetError(supaErr.message || 'Failed to send reset email.');
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
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Admin Portal</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.logoText}>CITY<Text style={{ color: Colors.accent }}>HUP</Text></Text>
          <Text style={styles.logoSub}>Administrator Portal</Text>
        </View>

        <View style={styles.card}>
          {mode === 'login' ? (
            <>
              <Text style={styles.cardTitle}>Admin Login</Text>
              <Text style={styles.cardSub}>Enter your assigned admin code to access the admin panel.</Text>

              {/* Error banner */}
              {!!error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={15} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Text style={styles.label}>Admin Code</Text>
              <TextInput
                style={styles.input}
                value={adminCode}
                onChangeText={v => { setAdminCode(v); setError(''); }}
                placeholder="e.g. ADM-PH-001"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.pwRow}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                  value={password}
                  onChangeText={v => { setPassword(v); setError(''); }}
                  placeholder="Enter password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPw}
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.pwEye}>
                  <Ionicons name={showPw ? 'eye-off' : 'eye'} size={18} color={Colors.textLight} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.loginBtn, loading && styles.loginBtnDisabled]} onPress={handleLogin} disabled={loading}>
                {loading
                  ? <Text style={styles.loginBtnText}>Verifying…</Text>
                  : <><Ionicons name="log-in" size={18} color={Colors.white} /><Text style={styles.loginBtnText}>Login</Text></>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotLink} onPress={() => { setMode('forgot'); setError(''); }}>
                <Text style={styles.forgotLinkText}>Forgot Password?</Text>
              </TouchableOpacity>

              <View style={styles.hint}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.textLight} />
                <Text style={styles.hintText}>Admin codes are issued by City Hup Ltd HQ. Use ADM-PH-001 for demo.</Text>
              </View>
            </>
          ) : resetSent ? (
            // Success state
            <View style={styles.successBox}>
              <Ionicons name="mail-open-outline" size={48} color={Colors.success} />
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successMsg}>
                A password reset link has been sent to{' '}
                <Text style={{ fontWeight: '700' }}>{resetEmail}</Text>.
                Click the link in the email to set a new password.
              </Text>
              <TouchableOpacity style={styles.backToLoginBtn} onPress={() => { setMode('login'); setResetSent(false); setResetEmail(''); }}>
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Forgot password form
            <>
              <TouchableOpacity onPress={() => { setMode('login'); setResetError(''); }} style={styles.backRow}>
                <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                <Text style={styles.backRowText}>Back to Login</Text>
              </TouchableOpacity>

              <Text style={styles.cardTitle}>Reset Password</Text>
              <Text style={styles.cardSub}>Enter the email address used when your admin account was created. We'll send a reset link.</Text>

              {!!resetError && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={15} color={Colors.danger} />
                  <Text style={styles.errorText}>{resetError}</Text>
                </View>
              )}

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={resetEmail}
                onChangeText={v => { setResetEmail(v); setResetError(''); }}
                placeholder="admin@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.loginBtn, (resetLoading || !resetEmail.trim()) && styles.loginBtnDisabled]}
                onPress={handleForgotPassword}
                disabled={resetLoading || !resetEmail.trim()}
              >
                {resetLoading
                  ? <Text style={styles.loginBtnText}>Sending…</Text>
                  : <><Ionicons name="send" size={16} color={Colors.white} /><Text style={styles.loginBtnText}>Send Reset Link</Text></>
                }
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  topTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  body: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoText: { fontSize: 28, fontWeight: '900', color: Colors.primaryDark, letterSpacing: 2 },
  logoSub: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  card: { width: '100%', maxWidth: 400, backgroundColor: Colors.bgCard, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: Colors.border, elevation: 3, shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  cardSub: { fontSize: 13, color: Colors.textLight, marginBottom: 20, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textDark, backgroundColor: Colors.bgLight, marginBottom: 14 },
  pwRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.bgLight, marginBottom: 20, overflow: 'hidden' },
  pwEye: { paddingHorizontal: 12 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  forgotLink: { alignSelf: 'center', marginTop: 14, paddingVertical: 4 },
  forgotLinkText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  hint: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 10 },
  hintText: { flex: 1, fontSize: 12, color: Colors.textLight, lineHeight: 17 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.danger + '15', borderWidth: 1, borderColor: Colors.danger + '40', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  errorText: { flex: 1, fontSize: 13, color: Colors.danger, lineHeight: 17 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backRowText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  successBox: { alignItems: 'center', gap: 12, paddingVertical: 10 },
  successTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark },
  successMsg: { fontSize: 14, color: Colors.textMedium, lineHeight: 20, textAlign: 'center' },
  backToLoginBtn: { marginTop: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  backToLoginText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
});
