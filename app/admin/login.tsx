import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';

export default function AdminLoginScreen() {
  const router = useRouter();
  const login = useAppStore(s => s.login);
  const currentAdmin = useAppStore(s => s.currentAdmin);

  const [adminCode, setAdminCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [currentAdmin]);

  function handleLogin() {
    if (!adminCode || !password) {
      Alert.alert('Required', 'Please enter your admin code and password');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const ok = login(adminCode.trim().toUpperCase(), password);
      if (ok) {
        router.replace('/admin/dashboard');
      } else {
        Alert.alert('Login Failed', 'Invalid admin code or account inactive. Contact City Hup HQ.');
      }
    }, 800);
  }

  return (
    <View style={styles.root}>
      {/* Top */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Admin Portal</Text>
      </View>

      <View style={styles.body}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.logoText}>CITY<Text style={{ color: Colors.accent }}>HUP</Text></Text>
          <Text style={styles.logoSub}>Administrator Portal</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Login</Text>
          <Text style={styles.cardSub}>Enter your assigned admin code to access the admin panel.</Text>

          <Text style={styles.label}>Admin Code</Text>
          <TextInput
            style={styles.input}
            value={adminCode}
            onChangeText={setAdminCode}
            placeholder="e.g. ADM-PH-001"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.pwRow}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.pwEye}>
              <Ionicons name={showPw ? 'eye-off' : 'eye'} size={18} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.loginBtn, loading && styles.loginBtnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading
              ? <Text style={styles.loginBtnText}>Verifying…</Text>
              : <>
                  <Ionicons name="log-in" size={18} color={Colors.white} />
                  <Text style={styles.loginBtnText}>Login</Text>
                </>
            }
          </TouchableOpacity>

          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.textLight} />
            <Text style={styles.hintText}>
              Admin codes are issued by City Hup Ltd HQ. Use ADM-PH-001 for demo.
            </Text>
          </View>
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
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: { fontSize: 28, fontWeight: '900', color: Colors.primaryDark, letterSpacing: 2 },
  logoSub: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: Colors.bgCard, borderRadius: 16,
    padding: 24, borderWidth: 1, borderColor: Colors.border,
    elevation: 3, shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  cardSub: { fontSize: 13, color: Colors.textLight, marginBottom: 20, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textDark,
    backgroundColor: Colors.bgLight, marginBottom: 14,
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
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  hint: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 14 },
  hintText: { flex: 1, fontSize: 12, color: Colors.textLight, lineHeight: 17 },
});
