import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';
import { COUNTRIES, STATES, LGAS } from '../../constants/locations';
import { isValidEmail, isValidPhone, isStrongPassword } from '../../lib/security';
import { uploadImage } from '../../lib/uploadImage';
import ImageUploader from '../../components/ImageUploader';
import type { MeansOfId } from '../../types';

const STEP_LABELS = ['Personal Info', 'Location & ID', 'Bank Details', 'Password'];

const ID_TYPES: { label: string; value: MeansOfId }[] = [
  { label: 'NIN',                 value: 'NIN' },
  { label: "Driver's License",    value: 'DriversLicense' },
  { label: "Voter's Card",        value: 'VotersCard' },
  { label: 'International Passport', value: 'InternationalPassport' },
  { label: 'Artisan Union ID',    value: 'ArtisanUnionID' },
];

export default function AgentRegisterScreen() {
  const router = useRouter();
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  const registerAgent = useAppStore(s => s.registerAgent);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Step 0 — Personal
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');

  // Step 1 — Location & ID
  const [country, setCountry]             = useState('Nigeria');
  const [state, setState]                 = useState('');
  const [lga, setLga]                     = useState('');
  const [city, setCity]                   = useState('');
  const [address, setAddress]             = useState('');
  const [nearestLandmark, setNearestLandmark] = useState('');
  const [idType, setIdType]               = useState<MeansOfId | ''>('');
  const [idNumber, setIdNumber]           = useState('');
  const [idDocImage, setIdDocImage]       = useState<string[]>([]);
  const [uploadingId, setUploadingId]     = useState(false);

  // Step 2 — Bank
  const [bankName, setBankName]           = useState('');
  const [accountName, setAccountName]     = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Step 3 — Password
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [referredBy, setReferredBy] = useState(ref ?? '');

  const stateList = STATES[country] ?? [];
  const lgaList   = LGAS[state] ?? [];

  function validateStep(): boolean {
    setError('');
    if (step === 0) {
      if (!fullName.trim()) { setError('Full name is required.'); return false; }
      if (!email.trim() || !isValidEmail(email)) { setError('Enter a valid email address.'); return false; }
      if (!phone.trim() || !isValidPhone(phone)) { setError('Enter a valid phone number.'); return false; }
    }
    if (step === 1) {
      if (!state) { setError('Select your state.'); return false; }
      if (!city.trim()) { setError('Enter your city.'); return false; }
      if (!address.trim()) { setError('Enter your address.'); return false; }
      if (!nearestLandmark.trim()) { setError('Enter your nearest landmark.'); return false; }
      if (!idType) { setError('Select a means of identification.'); return false; }
      if (!idNumber.trim()) { setError('Enter your ID document number.'); return false; }
      if (idDocImage.length === 0) { setError('Upload a photo of your ID document.'); return false; }
    }
    if (step === 2) {
      if (!bankName.trim()) { setError('Bank name is required.'); return false; }
      if (!accountName.trim()) { setError('Account name is required.'); return false; }
      if (!accountNumber.trim()) { setError('Account number is required.'); return false; }
    }
    if (step === 3) {
      const pw = isStrongPassword(password);
      if (!pw.ok) { setError(pw.reason); return false; }
      if (password !== confirmPw) { setError('Passwords do not match.'); return false; }
    }
    return true;
  }

  function nextStep() {
    if (validateStep()) setStep(s => s + 1);
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    setLoading(true);
    try {
      let uploadedIdImage: string | undefined;
      if (idDocImage.length > 0 && !idDocImage[0].startsWith('http')) {
        setUploadingId(true);
        uploadedIdImage = await uploadImage(idDocImage[0], 'client-docs', '');
        setUploadingId(false);
      } else if (idDocImage.length > 0) {
        uploadedIdImage = idDocImage[0];
      }

      await registerAgent({
        fullName, email, phone,
        state, lga, city,
        address: address.trim(),
        nearestLandmark: nearestLandmark.trim(),
        idType: idType || undefined,
        idNumber: idNumber.trim(),
        idImage: uploadedIdImage,
        bankName: bankName.trim(),
        accountName, accountNumber,
        referredBy: referredBy.trim() || undefined,
        password,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? 'Registration failed. Try again.');
    } finally {
      setLoading(false);
      setUploadingId(false);
    }
  }

  if (success) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
        </View>
        <Text style={styles.successTitle}>Application Submitted!</Text>
        <Text style={styles.successText}>
          Your agent application has been received. Our team will review and approve your account shortly.
          You'll be able to log in once approved.
        </Text>
        <TouchableOpacity style={styles.successBtn} onPress={() => router.replace('/agent/login' as any)}>
          <Text style={styles.successBtnText}>Go to Agent Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a City Hup Agent</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Commission info banner */}
      <View style={styles.commissionBanner}>
        <Ionicons name="trending-up" size={16} color={Colors.success} />
        <Text style={styles.commissionText}>
          Commission: <Text style={styles.commissionBold}>25% – 35%</Text> per client as per CHL Terms & Conditions.
          Exceeding your monthly target earns a <Text style={styles.commissionBold}>bonus</Text>.
        </Text>
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {STEP_LABELS.map((label, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepCircle, i <= step && styles.stepCircleActive]}>
              {i < step
                ? <Ionicons name="checkmark" size={14} color={Colors.white} />
                : <Text style={[styles.stepNum, i === step && styles.stepNumActive]}>{i + 1}</Text>}
            </View>
            {i < STEP_LABELS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}
          </View>
        ))}
      </View>
      <Text style={styles.stepLabel}>{STEP_LABELS[step]}</Text>

      <View style={styles.card}>
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={15} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Step 0: Personal */}
        {step === 0 && (
          <>
            <Field label="Full Name *">
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName}
                placeholder="e.g. John Doe" placeholderTextColor={Colors.textMuted} />
            </Field>
            <Field label="Email Address *">
              <TextInput style={styles.input} value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none"
                placeholder="agent@email.com" placeholderTextColor={Colors.textMuted} />
            </Field>
            <Field label="Phone Number *">
              <TextInput style={styles.input} value={phone} onChangeText={setPhone}
                keyboardType="phone-pad" placeholder="08012345678" placeholderTextColor={Colors.textMuted} />
            </Field>
          </>
        )}

        {/* Step 1: Location & ID */}
        {step === 1 && (
          <>
            <Field label="Country">
              <View style={styles.chipRow}>
                {COUNTRIES.map(c => (
                  <TouchableOpacity
                    key={c} style={[styles.chip, country === c && styles.chipActive]}
                    onPress={() => { setCountry(c); setState(''); setLga(''); }}
                  >
                    <Text style={[styles.chipText, country === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            <Field label="State *">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {stateList.map(s => (
                  <TouchableOpacity
                    key={s} style={[styles.chip, state === s && styles.chipActive]}
                    onPress={() => { setState(s); setLga(''); }}
                  >
                    <Text style={[styles.chipText, state === s && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Field>
            {lgaList.length > 0 && (
              <Field label="LGA">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {lgaList.map(l => (
                    <TouchableOpacity
                      key={l} style={[styles.chip, lga === l && styles.chipActive]}
                      onPress={() => setLga(l)}
                    >
                      <Text style={[styles.chipText, lga === l && styles.chipTextActive]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Field>
            )}
            <Field label="City *">
              <TextInput style={styles.input} value={city} onChangeText={setCity}
                placeholder="e.g. Port Harcourt" placeholderTextColor={Colors.textMuted} />
            </Field>
            <Field label="Address *">
              <TextInput style={[styles.input, { height: 72, textAlignVertical: 'top' }]}
                value={address} onChangeText={setAddress} multiline
                placeholder="House/flat number, street name" placeholderTextColor={Colors.textMuted} />
            </Field>
            <Field label="Nearest Landmark *">
              <TextInput style={styles.input} value={nearestLandmark} onChangeText={setNearestLandmark}
                placeholder="e.g. Opposite Total Filling Station" placeholderTextColor={Colors.textMuted} />
            </Field>

            {/* Means of Identification */}
            <Field label="Means of Identification *">
              <View style={styles.chipRow}>
                {ID_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.chip, idType === t.value && styles.chipActive]}
                    onPress={() => setIdType(t.value)}
                  >
                    <Text style={[styles.chipText, idType === t.value && styles.chipTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            {idType ? (
              <>
                <Field label="ID Number *">
                  <TextInput style={styles.input} value={idNumber} onChangeText={setIdNumber}
                    autoCapitalize="characters"
                    placeholder="Enter document number" placeholderTextColor={Colors.textMuted} />
                </Field>
                <Field label="Photo of ID Document *">
                  <ImageUploader
                    images={idDocImage}
                    onChange={setIdDocImage}
                    maxImages={1}
                    uploading={uploadingId}
                    note="Take a clear photo of your ID document."
                  />
                </Field>
              </>
            ) : (
              <Text style={styles.hint}>Select an ID type above to enter the number and upload a photo.</Text>
            )}
          </>
        )}

        {/* Step 2: Bank */}
        {step === 2 && (
          <>
            <Text style={styles.bankNote}>Enter your bank account details for commission payouts.</Text>
            <Field label="Bank Name *">
              <TextInput style={styles.input} value={bankName} onChangeText={setBankName}
                placeholder="e.g. First Bank, GTBank, Access Bank" placeholderTextColor={Colors.textMuted} />
            </Field>
            <Field label="Account Name *">
              <TextInput style={styles.input} value={accountName} onChangeText={setAccountName}
                placeholder="As it appears on your bank account" placeholderTextColor={Colors.textMuted} />
            </Field>
            <Field label="Account Number *">
              <TextInput style={styles.input} value={accountNumber} onChangeText={setAccountNumber}
                keyboardType="numeric" maxLength={10} placeholder="10-digit account number"
                placeholderTextColor={Colors.textMuted} />
            </Field>
          </>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <>
            <Field label="Create Password *">
              <View style={styles.pwRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password} onChangeText={setPassword}
                  secureTextEntry={!showPw}
                  placeholder="Min 8 chars, letters + numbers" placeholderTextColor={Colors.textMuted}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
                  <Ionicons name={showPw ? 'eye-off' : 'eye'} size={20} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </Field>
            <Field label="Confirm Password *">
              <TextInput style={styles.input} value={confirmPw} onChangeText={setConfirmPw}
                secureTextEntry={!showPw} placeholder="Repeat password"
                placeholderTextColor={Colors.textMuted} />
            </Field>
            <Field label="Referral Code (optional)">
              <TextInput style={styles.input} value={referredBy} onChangeText={setReferredBy}
                autoCapitalize="characters" placeholder="e.g. AGT-RVS-123456"
                placeholderTextColor={Colors.textMuted} />
              <Text style={styles.hint}>If another agent referred you, enter their code here.</Text>
            </Field>

            <View style={styles.withdrawalNote}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.info} />
              <Text style={styles.withdrawalNoteText}>
                Withdrawal eligibility: after registering <Text style={{ fontWeight: '700' }}>5 clients</Text>.
                All withdrawals are processed on application.
              </Text>
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.actionRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(s => s - 1)}>
              <Text style={styles.backStepText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < STEP_LABELS.length - 1 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, loading && { opacity: 0.6 }]}
              onPress={handleSubmit} disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={Colors.white} />
                : <><Text style={styles.nextBtnText}>Submit Application</Text><Ionicons name="checkmark" size={16} color={Colors.white} /></>}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/agent/login' as any)}>
        <Text style={styles.loginLinkText}>Already registered? <Text style={styles.loginLinkBold}>Sign In</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  content: { padding: 20, paddingTop: Platform.OS === 'ios' ? 54 : 30, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark },

  commissionBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.successLight, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.success, marginBottom: 14,
  },
  commissionText: { flex: 1, fontSize: 13, color: Colors.textDark, lineHeight: 18 },
  commissionBold: { fontWeight: '800', color: Colors.success },

  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border,
  },
  stepCircleActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepNum: { fontSize: 12, color: Colors.textMedium, fontWeight: '700' },
  stepNumActive: { color: Colors.white },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.borderLight, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: Colors.primary },
  stepLabel: { fontSize: 12, color: Colors.textMedium, fontWeight: '600', marginBottom: 14, textAlign: 'center' },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.borderLight, marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 8, padding: 10, marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.danger },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMedium, marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 13, paddingVertical: 12, fontSize: 14,
    color: Colors.textDark, backgroundColor: Colors.bgLight,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.borderLight, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: Colors.textMedium },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  bankNote: {
    fontSize: 13, color: Colors.textMedium, marginBottom: 14,
    backgroundColor: Colors.infoLight, padding: 10, borderRadius: 8,
  },
  pwRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 12, top: 12 },
  hint: { fontSize: 11, color: Colors.textLight, marginTop: 4, fontStyle: 'italic' },
  withdrawalNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.infoLight, borderRadius: 8, padding: 10, marginTop: 10,
  },
  withdrawalNoteText: { flex: 1, fontSize: 12, color: Colors.info, lineHeight: 17 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  backStepBtn: {
    paddingHorizontal: 20, paddingVertical: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  backStepText: { color: Colors.textMedium, fontWeight: '700' },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 13,
  },
  nextBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginLinkText: { fontSize: 13, color: Colors.textMedium },
  loginLinkBold: { color: Colors.primary, fontWeight: '700' },
  successScreen: {
    flex: 1, backgroundColor: Colors.bgLight,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  successIcon: { marginBottom: 20 },
  successTitle: { fontSize: 22, fontWeight: '900', color: Colors.textDark, marginBottom: 12 },
  successText: { fontSize: 14, color: Colors.textMedium, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  successBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  successBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
});
