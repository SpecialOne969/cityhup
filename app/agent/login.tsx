import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';

export default function AgentLoginScreen() {
  const router = useRouter();
  const agentLogin = useAppStore(s => s.agentLogin);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
    setLoading(true);
    try {
      const result = await agentLogin(email.trim(), password);
      if (result === 'ok') {
        router.replace('/agent/dashboard' as any);
      } else if (result === 'pending') {
        setError('Your account is pending approval. You will be notified once approved.');
      } else if (result === 'suspended') {
        setError('Your account has been suspended. Contact support.');
      } else {
        setError('Incorrect email or password.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.logoBox}>
        <View style={styles.logoCircle}>
          <Ionicons name="briefcase" size={36} color={Colors.white} />
        </View>
        <Text style={styles.appName}>CityHup</Text>
        <Text style={styles.tagline}>Agent Portal</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Agent Sign In</Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={15} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
          placeholder="agent@email.com" placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.pwRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password} onChangeText={setPassword}
            secureTextEntry={!showPw}
            placeholder="Your password" placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
            <Ionicons name={showPw ? 'eye-off' : 'eye'} size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && { opacity: 0.6 }]}
          onPress={handleLogin} disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.loginBtnText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity onPress={() => router.push('/agent/register' as any)}>
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Become an Agent</Text></Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/')}>
        <Ionicons name="arrow-back" size={16} color={Colors.textLight} />
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  content: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, alignItems: 'center' },
  logoBox: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  appName: { fontSize: 26, fontWeight: '900', color: Colors.primary },
  tagline: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  card: {
    width: '100%', maxWidth: 420, backgroundColor: Colors.bgCard,
    borderRadius: 16, padding: 24, borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.textDark, marginBottom: 16 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 8, padding: 10, marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.danger },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textMedium, marginBottom: 5, marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 13, paddingVertical: 12, fontSize: 14,
    color: Colors.textDark, backgroundColor: Colors.bgLight,
  },
  pwRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  eyeBtn: { position: 'absolute', right: 12, top: 12 },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 20,
  },
  loginBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 16 },
  linkText: { textAlign: 'center', fontSize: 13, color: Colors.textMedium },
  linkBold: { color: Colors.primary, fontWeight: '700' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20,
  },
  backText: { fontSize: 13, color: Colors.textLight },
});
