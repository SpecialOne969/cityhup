import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { COUNTRIES, STATES, getLgasByState } from '../../constants/locations';
import { PAYMENT_BANDS, DURATIONS, PAYMENT_METHODS, MEANS_OF_ID, NATURE_OF_BIZ_OPTIONS } from '../../constants/subscriptions';
import { CATEGORIES } from '../../constants/categories';
import { useAppStore } from '../../store/useAppStore';
import { ClientType, PaymentMethod, MeansOfId } from '../../types';

const STEPS = ['Client Type', 'Location', 'Business Info', 'Extra Details', 'Payment & Submit'];

function FieldRow({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}{required && <Text style={{ color: Colors.danger }}> *</Text>}</Text>
      {children}
    </View>
  );
}

function Input({ value, onChangeText, placeholder, keyboardType, multiline, numberOfLines }: any) {
  return (
    <TextInput
      style={[styles.input, multiline && { height: (numberOfLines ?? 3) * 22, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
  );
}

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
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {options.map(o => (
              <TouchableOpacity
                key={o.value}
                style={[styles.dropItem, o.value === value && styles.dropItemActive]}
                onPress={() => { onChange(o.value); setOpen(false); }}
              >
                <Text style={[styles.dropItemText, o.value === value && styles.dropItemTextActive]}>
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

export default function RegisterScreen() {
  const router = useRouter();
  const addClient = useAppStore(s => s.addClient);

  const [step, setStep] = useState(0);

  // Field 1
  const [clientType, setClientType] = useState<ClientType>('individual');
  const [natureOfBiz, setNatureOfBiz] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [town, setTown] = useState('');

  // Field 2
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [busStop, setBusStop] = useState('');
  const [landmark, setLandmark] = useState('');
  const [competence, setCompetence] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [profile, setProfile] = useState('');
  const [info, setInfo] = useState('');

  // Field 3
  const [websiteLink, setWebsiteLink] = useState('');
  const [referral, setReferral] = useState('');
  const [director, setDirector] = useState('');
  const [meansOfId, setMeansOfId] = useState<MeansOfId | ''>('');
  const [meansOfIdNum, setMeansOfIdNum] = useState('');

  // Categories
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  // Property / Rental pricing
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceUnit, setPriceUnit] = useState('');

  const PROPERTY_CAT_IDS = ['house-building', 'property-agent', 'real-estate', 'rental'];
  const isPropertyClient = selectedCats.some(c => PROPERTY_CAT_IDS.includes(c));

  // Payment
  const [paymentBand, setPaymentBand] = useState(2000);
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Agent code
  const [agentCode, setAgentCode] = useState('');

  function toggleCat(id: string) {
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!natureOfBiz || !country || !state || !lga || !city) {
        Alert.alert('Required fields', 'Please fill all required fields (Nature of Biz, Country, State, LGA, City)');
        return false;
      }
    }
    if (step === 1) {
      if (!businessName || !address || !email || !phone || !busStop || !landmark || !competence || !profile) {
        Alert.alert('Required fields', 'Please fill all required fields');
        return false;
      }
    }
    if (step === 3) {
      if (selectedCats.length === 0) {
        Alert.alert('Category required', 'Please select at least one category');
        return false;
      }
    }
    if (step === 4) {
      if (!acceptedTerms) {
        Alert.alert('Terms required', 'You must accept the Terms & Conditions');
        return false;
      }
      if (!agentCode) {
        Alert.alert('Agent Code required', 'Enter your assigned agent code to submit');
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (!validateStep()) return;
    setStep(s => s + 1);
  }

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await addClient({
        type: clientType,
        natureOfBiz,
        country,
        state,
        lga,
        city,
        area,
        town,
        businessName,
        address,
        email,
        phone,
        nearestBusStop: busStop,
        nearestLandmark: landmark,
        competence,
        cacNumber,
        profile,
        info,
        infoImages: [],
        websiteLink,
        shelfItems: [],
        referral,
        director,
        identification: meansOfId ? { type: meansOfId as MeansOfId, number: meansOfIdNum } : undefined,
        pictures: [],
        paymentBand,
        duration,
        paymentMethod,
        acceptedTerms,
        registeredBy: agentCode,
        categories: selectedCats,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        priceUnit: priceUnit || undefined,
      });
      Alert.alert(
        'Registration Submitted',
        'The client registration has been submitted for admin approval. The client will become visible once approved.',
        [{ text: 'OK', onPress: () => router.push('/') }]
      );
    } catch {
      Alert.alert('Error', 'Could not submit registration. Check your internet connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const lgaOptions = getLgasByState(state).map(l => ({ label: l, value: l }));

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Client Registration</Text>
          <Text style={styles.headerSub}>Step {step + 1} of {STEPS.length}: {STEPS[step]}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>

          {/* STEP 0: Client Type + Location (Field 1) */}
          {step === 0 && (
            <>
              <Text style={styles.stepNote}>FIELD 1 — Client Type & Location</Text>

              <FieldRow label="Client Type" required>
                <View style={styles.typeRow}>
                  {(['corporate', 'individual'] as ClientType[]).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeBtn, clientType === t && styles.typeBtnActive]}
                      onPress={() => setClientType(t)}
                    >
                      <Ionicons
                        name={t === 'corporate' ? 'business' : 'person'}
                        size={16}
                        color={clientType === t ? Colors.white : Colors.textMedium}
                      />
                      <Text style={[styles.typeBtnText, clientType === t && styles.typeBtnTextActive]}>
                        {t === 'corporate' ? 'Corporate (Registered Business)' : 'Individual (Unregistered)'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </FieldRow>

              <FieldRow label="Nature of Business" required>
                <SelectPicker
                  options={NATURE_OF_BIZ_OPTIONS.map(n => ({ label: n, value: n }))}
                  value={natureOfBiz}
                  onChange={setNatureOfBiz}
                  placeholder="Select nature of business"
                />
              </FieldRow>

              <FieldRow label="Country" required>
                <SelectPicker
                  options={COUNTRIES.map(c => ({ label: c, value: c }))}
                  value={country}
                  onChange={setCountry}
                  placeholder="Select country"
                />
              </FieldRow>

              <FieldRow label="State" required>
                <SelectPicker
                  options={(STATES[country] ?? []).map(s => ({ label: s, value: s }))}
                  value={state}
                  onChange={v => { setState(v); setLga(''); }}
                  placeholder="Select state"
                />
              </FieldRow>

              <FieldRow label="LGA" required>
                <SelectPicker
                  options={lgaOptions}
                  value={lga}
                  onChange={setLga}
                  placeholder={state ? 'Select LGA' : 'Select state first'}
                />
              </FieldRow>

              <FieldRow label="City" required>
                <Input value={city} onChangeText={setCity} placeholder="Enter city" />
              </FieldRow>

              <FieldRow label="Area">
                <Input value={area} onChangeText={setArea} placeholder="Enter area" />
              </FieldRow>

              <FieldRow label="Town">
                <Input value={town} onChangeText={setTown} placeholder="Enter town" />
              </FieldRow>
            </>
          )}

          {/* STEP 1: Business Details (Field 2) */}
          {step === 1 && (
            <>
              <Text style={styles.stepNote}>FIELD 2 — Business Details</Text>
              <Text style={styles.stepInfo}>
                Note: Client Code will be automatically generated upon submission.
              </Text>

              <FieldRow label="Business Name" required>
                <Input value={businessName} onChangeText={setBusinessName} placeholder="Enter business name" />
              </FieldRow>
              <FieldRow label="Address" required>
                <Input value={address} onChangeText={setAddress} placeholder="Full address" multiline numberOfLines={2} />
              </FieldRow>
              <FieldRow label="Email Address" required>
                <Input value={email} onChangeText={setEmail} placeholder="business@email.com" keyboardType="email-address" />
              </FieldRow>
              <FieldRow label="Phone Number" required>
                <Input value={phone} onChangeText={setPhone} placeholder="080XXXXXXXX" keyboardType="phone-pad" />
              </FieldRow>
              <FieldRow label="Nearest Bus Stop" required>
                <Input value={busStop} onChangeText={setBusStop} placeholder="Nearest bus stop" />
              </FieldRow>
              <FieldRow label="Nearest Landmark" required>
                <Input value={landmark} onChangeText={setLandmark} placeholder="Notable landmark near location" />
              </FieldRow>
              <FieldRow label="Competence / Specialization" required>
                <Input value={competence} onChangeText={setCompetence} placeholder="What you do best…" multiline numberOfLines={2} />
              </FieldRow>
              {clientType === 'corporate' && (
                <FieldRow label="CAC Registration Number">
                  <Input value={cacNumber} onChangeText={setCacNumber} placeholder="RC-XXXXXXX" />
                </FieldRow>
              )}
              <FieldRow label="Profile / About" required>
                <Input value={profile} onChangeText={setProfile} placeholder="Brief description of the business…" multiline numberOfLines={4} />
              </FieldRow>
              <FieldRow label="Additional Info / Portfolio">
                <Input value={info} onChangeText={setInfo} placeholder="Additional competence, notable works, contracts executed…" multiline numberOfLines={4} />
              </FieldRow>
            </>
          )}

          {/* STEP 2: Extra details (Field 3) */}
          {step === 2 && (
            <>
              <Text style={styles.stepNote}>FIELD 3 — Additional Details</Text>

              <FieldRow label="Website Link">
                <Input value={websiteLink} onChangeText={setWebsiteLink} placeholder="https://www.yourbusiness.com" keyboardType="url" />
              </FieldRow>
              <FieldRow label="Referral / Guarantor">
                <Input value={referral} onChangeText={setReferral} placeholder="Who referred this client?" />
              </FieldRow>
              <FieldRow label="Director / Person of Responsibility">
                <Input value={director} onChangeText={setDirector} placeholder="Full name of director or responsible person" />
              </FieldRow>
              <FieldRow label="Means of Identification">
                <SelectPicker
                  options={MEANS_OF_ID.map(m => ({ label: m.label, value: m.value }))}
                  value={meansOfId}
                  onChange={v => setMeansOfId(v as MeansOfId)}
                  placeholder="Select ID type"
                />
              </FieldRow>
              {meansOfId && (
                <FieldRow label={`${MEANS_OF_ID.find(m => m.value === meansOfId)?.label} Number`}>
                  <Input value={meansOfIdNum} onChangeText={setMeansOfIdNum} placeholder="Enter ID number" />
                </FieldRow>
              )}

              <Text style={styles.sectionNote}>Photo Upload (Coming soon — physical copies to be handed to agent)</Text>
            </>
          )}

          {/* STEP 3: Categories */}
          {step === 3 && (
            <>
              <Text style={styles.stepNote}>Select Business Categories</Text>
              <Text style={styles.stepInfo}>Select all categories that apply to this business.</Text>

              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCheck, selectedCats.includes(cat.id) && styles.catCheckActive]}
                  onPress={() => toggleCat(cat.id)}
                >
                  <View style={[styles.catCheckIcon, { backgroundColor: cat.color + '22' }]}>
                    <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                  </View>
                  <Text style={[styles.catCheckText, selectedCats.includes(cat.id) && styles.catCheckTextActive]}>
                    {cat.label}
                  </Text>
                  <Ionicons
                    name={selectedCats.includes(cat.id) ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={selectedCats.includes(cat.id) ? Colors.primary : Colors.border}
                  />
                </TouchableOpacity>
              ))}

              {isPropertyClient && (
                <View style={styles.priceBand}>
                  <Text style={styles.priceBandTitle}>
                    <Ionicons name="home-outline" size={14} color={Colors.primary} /> Property / Rental Pricing
                  </Text>
                  <Text style={styles.priceBandSub}>Enter the price range this provider offers (optional but recommended)</Text>
                  <View style={styles.priceRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>Min Price (₦)</Text>
                      <Input value={priceMin} onChangeText={setPriceMin} placeholder="e.g. 500000" keyboardType="numeric" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>Max Price (₦)</Text>
                      <Input value={priceMax} onChangeText={setPriceMax} placeholder="e.g. 5000000" keyboardType="numeric" />
                    </View>
                  </View>
                  <Text style={styles.fieldLabel}>Price Unit / Period</Text>
                  <SelectPicker
                    options={[
                      { label: 'Per Year', value: 'per year' },
                      { label: 'Per Month', value: 'per month' },
                      { label: 'Per Property', value: 'per property' },
                      { label: 'Per Room', value: 'per room' },
                      { label: 'Outright Sale', value: 'outright' },
                    ]}
                    value={priceUnit}
                    onChange={setPriceUnit}
                    placeholder="Select price period"
                  />
                </View>
              )}
            </>
          )}

          {/* STEP 4: Payment & Submit */}
          {step === 4 && (
            <>
              <Text style={styles.stepNote}>Subscription & Payment</Text>

              <FieldRow label="Payment Band (Annual / Monthly)">
                <SelectPicker
                  options={PAYMENT_BANDS.map(p => ({ label: p.label, value: String(p.value) }))}
                  value={String(paymentBand)}
                  onChange={v => setPaymentBand(Number(v))}
                  placeholder="Select payment band"
                />
              </FieldRow>

              <FieldRow label="Duration">
                <SelectPicker
                  options={DURATIONS.map(d => ({ label: d.label, value: String(d.value) }))}
                  value={String(duration)}
                  onChange={v => setDuration(Number(v))}
                  placeholder="Select duration"
                />
              </FieldRow>

              <FieldRow label="Payment Method">
                <SelectPicker
                  options={PAYMENT_METHODS.map(p => ({ label: p.label, value: p.value }))}
                  value={paymentMethod}
                  onChange={v => setPaymentMethod(v as PaymentMethod)}
                />
              </FieldRow>

              <View style={styles.payNote}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
                <Text style={styles.payNoteText}>
                  All payments are done via online transfer. The client must include their special City Hup ID number in the payment description.
                </Text>
              </View>

              <FieldRow label="Agent / Staff Code" required>
                <Input value={agentCode} onChangeText={setAgentCode} placeholder="Enter your assigned agent code" />
              </FieldRow>

              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAcceptedTerms(v => !v)}
              >
                <Ionicons
                  name={acceptedTerms ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={acceptedTerms ? Colors.primary : Colors.border}
                />
                <Text style={styles.termsText}>
                  I confirm that this client has read and accepted the Terms & Conditions of City Hup Ltd.
                </Text>
              </TouchableOpacity>

              <View style={styles.submitNote}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.warning} />
                <Text style={styles.submitNoteText}>
                  After submission, this registration will go to an Administrator for approval. The client will only become visible on the platform once approved.
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.navBtns}>
          {step > 0 && (
            <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(s => s - 1)}>
              <Ionicons name="arrow-back" size={16} color={Colors.primary} />
              <Text style={styles.prevBtnText}>Previous</Text>
            </TouchableOpacity>
          )}
          {step < STEPS.length - 1 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
              <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit Registration'}</Text>
            </TouchableOpacity>
          )}
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
    backgroundColor: Colors.primary, paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16,
  },
  headerBack: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  progressBar: { height: 4, backgroundColor: Colors.borderLight },
  progressFill: { height: 4, backgroundColor: Colors.accent },

  scroll: { flex: 1 },
  formCard: {
    backgroundColor: Colors.bgCard, margin: 16,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  stepNote: { fontSize: 13, fontWeight: '800', color: Colors.primary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  stepInfo: { fontSize: 12, color: Colors.textLight, marginBottom: 14, lineHeight: 17 },
  sectionNote: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic', marginTop: 8 },

  fieldRow: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 9,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: Colors.textDark,
    backgroundColor: Colors.bgLight,
  },
  picker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border, borderRadius: 9,
    paddingHorizontal: 12, paddingVertical: 11, backgroundColor: Colors.bgLight,
  },
  pickerText: { fontSize: 14, color: Colors.textDark, flex: 1 },
  dropDown: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 9,
    backgroundColor: Colors.bgCard, marginTop: 2, zIndex: 100,
  },
  dropItem: { paddingHorizontal: 12, paddingVertical: 10 },
  dropItemActive: { backgroundColor: Colors.primaryLight },
  dropItemText: { fontSize: 14, color: Colors.textDark },
  dropItemTextActive: { color: Colors.primary, fontWeight: '700' },

  typeRow: { gap: 8 },
  typeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.bgLight,
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeBtnText: { fontSize: 13, color: Colors.textMedium, flex: 1 },
  typeBtnTextActive: { color: Colors.white, fontWeight: '700' },

  catCheck: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  catCheckActive: { backgroundColor: Colors.primaryLight, borderRadius: 8, marginHorizontal: -4, paddingHorizontal: 8 },
  catCheckIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  catCheckText: { flex: 1, fontSize: 13, color: Colors.textDark },
  catCheckTextActive: { color: Colors.primary, fontWeight: '600' },

  priceBand: {
    marginTop: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  priceBandTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 3 },
  priceBandSub: { fontSize: 11, color: Colors.textMedium, marginBottom: 10 },
  priceRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },

  payNote: {
    flexDirection: 'row', gap: 8, backgroundColor: Colors.infoLight,
    borderRadius: 8, padding: 10, marginBottom: 14,
  },
  payNoteText: { flex: 1, fontSize: 12, color: Colors.info, lineHeight: 17 },

  termsRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginTop: 4, marginBottom: 14, padding: 10,
    backgroundColor: Colors.bgLight, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  termsText: { flex: 1, fontSize: 13, color: Colors.textMedium, lineHeight: 19 },

  submitNote: {
    flexDirection: 'row', gap: 8, backgroundColor: Colors.warningLight,
    borderRadius: 8, padding: 10, marginBottom: 4,
  },
  submitNoteText: { flex: 1, fontSize: 12, color: Colors.warning, lineHeight: 17 },

  navBtns: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, marginTop: 8, gap: 12,
  },
  prevBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 13,
  },
  prevBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14,
  },
  nextBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  submitBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 14,
  },
  submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
});
