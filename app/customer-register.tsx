import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { STATES, getLgasByState } from '../constants/locations';
import { CATEGORIES } from '../constants/categories';
import { useAppStore } from '../store/useAppStore';

function SelectPicker({ options, value, onChange, placeholder }: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <View>
      <TouchableOpacity style={styles.picker} onPress={() => setOpen(o => !o)}>
        <Text style={[styles.pickerText, !selected && { color: Colors.textMuted }]}>
          {selected?.label ?? placeholder ?? 'Select…'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textLight} />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropDown}>
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
            {options.map(o => (
              <TouchableOpacity
                key={o.value}
                style={[styles.dropItem, o.value === value && styles.dropItemActive]}
                onPress={() => { onChange(o.value); setOpen(false); }}
              >
                <Text style={[styles.dropItemText, o.value === value && { color: Colors.primary, fontWeight: '700' }]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function CustomerRegisterScreen() {
  const router = useRouter();
  const registerCustomer = useAppStore(s => s.registerCustomer);
  const currentCustomer = useAppStore(s => s.currentCustomer);

  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const lgaOptions = getLgasByState(state).map(l => ({ label: l, value: l }));
  const nigeriaStates = (STATES['Nigeria'] ?? []).map(s => ({ label: s, value: s }));

  function toggleCat(id: string) {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  async function handleRegister() {
    setErrorMsg('');
    if (!fullName.trim()) { setErrorMsg('Please enter your full name.'); return; }
    if (!email.trim()) { setErrorMsg('Please enter your email address.'); return; }
    if (!password || password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    if (password !== confirmPw) { setErrorMsg('Passwords do not match.'); return; }

    setSubmitting(true);
    try {
      const ok = await registerCustomer({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        state: state || undefined,
        lga: lga || undefined,
        interestedCategories: selectedCats,
        password,
      });
      if (ok) {
        router.replace('/customer-dashboard' as any);
      } else {
        setErrorMsg('This email may already be registered. Try signing in instead.');
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Could not create account. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join CityHup</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.heroWrap}>
          <View style={styles.heroIcon}>
            <Ionicons name="people" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Find Services Near You</Text>
          <Text style={styles.heroSub}>Create a free account to get personalized service provider recommendations in your area.</Text>
        </View>

        {/* Tab toggle */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'register' && styles.tabBtnActive]}
            onPress={() => setTab('register')}
          >
            <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'login' && styles.tabBtnActive]}
            onPress={() => router.replace('/customer-login')}
          >
            <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {/* Personal Details */}
          <Text style={styles.sectionLabel}>Personal Details</Text>

          <Text style={styles.label}>Full Name <Text style={{ color: Colors.danger }}>*</Text></Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your full name" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Email Address <Text style={{ color: Colors.danger }}>*</Text></Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="080XXXXXXXX" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />

          {/* Location */}
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Your Location</Text>
          <Text style={styles.label}>State</Text>
          <SelectPicker options={nigeriaStates} value={state} onChange={v => { setState(v); setLga(''); }} placeholder="Select your state" />

          {state ? (
            <>
              <Text style={[styles.label, { marginTop: 12 }]}>LGA</Text>
              <SelectPicker options={lgaOptions} value={lga} onChange={setLga} placeholder="Select your LGA" />
            </>
          ) : null}

          {/* Interests */}
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>What are you looking for?</Text>
          <Text style={styles.labelSub}>Select services you're interested in (optional)</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.slice(0, 16).map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, selectedCats.includes(cat.id) && { backgroundColor: cat.color, borderColor: cat.color }]}
                onPress={() => toggleCat(cat.id)}
              >
                <Ionicons name={cat.icon as any} size={13} color={selectedCats.includes(cat.id) ? Colors.white : cat.color} />
                <Text style={[styles.catChipText, selectedCats.includes(cat.id) && { color: Colors.white }]} numberOfLines={1}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Password */}
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Set Password</Text>
          <Text style={styles.label}>Password <Text style={{ color: Colors.danger }}>*</Text></Text>
          <View style={styles.pwRow}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
              value={password} onChangeText={setPassword}
              placeholder="Min. 6 characters"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.pwEye}>
              <Ionicons name={showPw ? 'eye-off' : 'eye'} size={18} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Confirm Password <Text style={{ color: Colors.danger }}>*</Text></Text>
          <TextInput style={styles.input} value={confirmPw} onChangeText={setConfirmPw} placeholder="Re-enter password" placeholderTextColor={Colors.textMuted} secureTextEntry={!showPw} />

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={submitting}
          >
            <Ionicons name="person-add" size={18} color={Colors.white} />
            <Text style={styles.submitBtnText}>{submitting ? 'Creating Account…' : 'Create Free Account'}</Text>
          </TouchableOpacity>

          <Text style={styles.termsNote}>
            By registering you agree to CityHup's Terms & Conditions.{' '}
            <Text style={{ color: Colors.primary }} onPress={() => router.push('/disclaimer')}>Read here</Text>
          </Text>
        </View>

        <View style={styles.altRow}>
          <Text style={styles.altText}>Are you a service provider?</Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.altLink}>List Your Business →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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

  heroWrap: { alignItems: 'center', padding: 24, paddingBottom: 8 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, textAlign: 'center', marginBottom: 8 },
  heroSub: { fontSize: 13, color: Colors.textMedium, textAlign: 'center', lineHeight: 20 },

  tabRow: {
    flexDirection: 'row', marginHorizontal: 16, marginVertical: 12,
    backgroundColor: Colors.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textMedium },
  tabTextActive: { color: Colors.white },

  card: {
    backgroundColor: Colors.bgCard, margin: 16, marginTop: 0,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', color: Colors.primary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 6,
  },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 5 },
  labelSub: { fontSize: 11, color: Colors.textLight, marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 14,
    color: Colors.textDark, backgroundColor: Colors.bgLight, marginBottom: 12,
  },
  picker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, backgroundColor: Colors.bgLight, marginBottom: 0,
  },
  pickerText: { fontSize: 14, color: Colors.textDark, flex: 1 },
  dropDown: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    backgroundColor: Colors.bgCard, marginTop: 2, zIndex: 100,
  },
  dropItem: { paddingHorizontal: 12, paddingVertical: 10 },
  dropItemActive: { backgroundColor: Colors.primaryLight },
  dropItemText: { fontSize: 14, color: Colors.textDark },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Colors.bgLight,
  },
  catChipText: { fontSize: 11, color: Colors.textDark, fontWeight: '500', maxWidth: 80 },

  pwRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    backgroundColor: Colors.bgLight, marginBottom: 0, overflow: 'hidden',
  },
  pwEye: { paddingHorizontal: 12 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 10,
    padding: 12, marginTop: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.danger, lineHeight: 18 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 15, marginTop: 12,
  },
  submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  termsNote: { fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 12, lineHeight: 18 },

  altRow: { alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 8 },
  altText: { fontSize: 13, color: Colors.textMedium },
  altLink: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
});
