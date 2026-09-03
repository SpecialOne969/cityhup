import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { supabase } from '../../lib/supabase';

export default function AdminResetPasswordScreen() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    // Supabase sends recovery tokens in the URL hash — the JS client handles
    // the exchange automatically via onAuthStateChange when the page loads.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Give a short window for the auto-exchange, then flag if still nothing
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setSessionReady(true);
        } else {
          setSessionError('This reset link is invalid or has expired. Please request a new one.');
        }
      });
    }, 1500);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSetPassword() {
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error: supaErr } = await supabase.auth.updateUser({ password });
      if (supaErr) {
        setError(supaErr.message || 'Failed to update password. Try again.');
      } else {
        setSuccess(true);
        setTimeout(() => router.replace('/admin/login'), 3000);
      }
    } catch {
      setError('Could not connect. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Admin Portal — Reset Password</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="lock-closed" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.logoText}>CITY<Text style={{ color: Colors.accent }}>HUP</Text></Text>
        </View>

        <View style={styles.card}>
          {success ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={52} color={Colors.success} />
              <Text style={styles.successTitle}>Password Updated</Text>
              <Text style={styles.successMsg}>Your password has been changed successfully. Redirecting to login…</Text>
            </View>
          ) : sessionError ? (
            <View style={styles.expiredBox}>
              <Ionicons name="close-circle" size={52} color={Colors.danger} />
              <Text style={styles.expiredTitle}>Link Expired</Text>
              <Text style={styles.expiredMsg}>{sessionError}</Text>
              <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace('/admin/login')}>
                <Text style={styles.loginBtnText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : !sessionReady ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text style={styles.loadingText}>Verifying reset link…</Text>
            </View>
          ) : (
            <>
              <Text style={styles.cardTitle}>Set New Password</Text>
              <Text style={styles.cardSub}>Choose a strong password for your admin account.</Text>

              {!!error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={15} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Text style={styles.label}>New Password</Text>
              <View style={styles.pwRow}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                  value={password}
                  onChangeText={v => { setPassword(v); setError(''); }}
                  placeholder="At least 8 characters"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.pwEye}>
                  <Ionicons name={showPw ? 'eye-off' : 'eye'} size={18} color={Colors.textLight} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={v => { setConfirmPassword(v); setError(''); }}
                placeholder="Repeat new password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPw}
                onSubmitEditing={handleSetPassword}
              />

              {/* Password strength */}
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  {[4, 6, 8, 10].map(min => (
                    <View key={min} style={[styles.strengthBar, { backgroundColor: password.length >= min ? Colors.success : Colors.border }]} />
                  ))}
                  <Text style={styles.strengthLabel}>
                    {password.length < 4 ? 'Too short' : password.length < 6 ? 'Weak' : password.length < 8 ? 'Fair' : 'Strong'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, (loading || !password || !confirmPassword) && styles.submitBtnDisabled]}
                onPress={handleSetPassword}
                disabled={loading || !password || !confirmPassword}
              >
                {loading
                  ? <Text style={styles.submitBtnText}>Updating…</Text>
                  : <><Ionicons name="lock-closed" size={17} color={Colors.white} /><Text style={styles.submitBtnText}>Set New Password</Text></>
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
  topBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingTop: Platform.OS === 'ios' ? 50 : 16, paddingBottom: 14, paddingHorizontal: 16 },
  topTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  body: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoText: { fontSize: 26, fontWeight: '900', color: Colors.primaryDark, letterSpacing: 2 },
  card: { width: '100%', maxWidth: 400, backgroundColor: Colors.bgCard, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: Colors.border, elevation: 3, shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  cardSub: { fontSize: 13, color: Colors.textLight, marginBottom: 20, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textDark, backgroundColor: Colors.bgLight, marginBottom: 14 },
  pwRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.bgLight, marginBottom: 14, overflow: 'hidden' },
  pwEye: { paddingHorizontal: 12 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.danger + '15', borderWidth: 1, borderColor: Colors.danger + '40', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  errorText: { flex: 1, fontSize: 13, color: Colors.danger },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, color: Colors.textLight, marginLeft: 6 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  loadingBox: { alignItems: 'center', gap: 16, paddingVertical: 20 },
  loadingText: { fontSize: 14, color: Colors.textMedium },
  successBox: { alignItems: 'center', gap: 12, paddingVertical: 10 },
  successTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark },
  successMsg: { fontSize: 14, color: Colors.textMedium, lineHeight: 20, textAlign: 'center' },
  expiredBox: { alignItems: 'center', gap: 12, paddingVertical: 10 },
  expiredTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark },
  expiredMsg: { fontSize: 14, color: Colors.textMedium, lineHeight: 20, textAlign: 'center' },
  loginBtn: { marginTop: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  loginBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
});
