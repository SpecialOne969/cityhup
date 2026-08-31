import React, { useState, useRef } from 'react';
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
import ImageUploader from '../../components/ImageUploader';
import { uploadImages, uploadImage } from '../../lib/uploadImage';
import { supabase } from '../../lib/supabase';

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
  const uploadFolder = useRef(`reg-${Date.now()}-${Math.random().toString(36).slice(2)}`).current;

  // Image/document states — local URIs until submit
  const [businessPictures, setBusinessPictures] = useState<string[]>([]);
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [idDocImage, setIdDocImage] = useState<string[]>([]);
  const [paymentProof, setPaymentProof] = useState<string[]>([]);

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

  // Property listings — multiple entries
  const [propertyListings, setPropertyListings] = useState<Array<{
    type: string; minPrice: string; maxPrice: string; unit: string;
  }>>([]);
  const [newPropType, setNewPropType] = useState('');
  const [newPropMin, setNewPropMin] = useState('');
  const [newPropMax, setNewPropMax] = useState('');
  const [newPropUnit, setNewPropUnit] = useState('per year');

  // Shelf items
  const [shelfItems, setShelfItems] = useState<Array<{ name: string; price: string; description: string; isOffer: boolean }>>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemOffer, setNewItemOffer] = useState(false);

  // Client portal login setup (optional)
  const [clientPassword, setClientPassword] = useState('');
  const [clientPasswordConfirm, setClientPasswordConfirm] = useState('');

  const PROPERTY_CAT_IDS = ['house-building', 'property-agent', 'real-estate', 'rental'];
  const isPropertyClient = selectedCats.some(c => PROPERTY_CAT_IDS.includes(c));

  function addShelfItem() {
    if (!newItemName.trim() || !newItemPrice.trim()) return;
    setShelfItems(prev => [...prev, {
      name: newItemName.trim(),
      price: newItemPrice.trim(),
      description: newItemDesc.trim(),
      isOffer: newItemOffer,
    }]);
    setNewItemName(''); setNewItemPrice(''); setNewItemDesc(''); setNewItemOffer(false);
  }

  function addPropertyListing() {
    if (!newPropType.trim() || !newPropMin.trim()) return;
    setPropertyListings(prev => [...prev, {
      type: newPropType.trim(),
      minPrice: newPropMin.trim(),
      maxPrice: newPropMax.trim(),
      unit: newPropUnit,
    }]);
    setNewPropType(''); setNewPropMin(''); setNewPropMax(''); setNewPropUnit('per year');
  }

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
        Alert.alert('Required fields', 'Please fill all required fields marked with *');
        return false;
      }
      // Phone number validation — 7 to 15 digits, optional leading +
      const cleanPhone = phone.replace(/[\s\-()]/g, '');
      if (!/^\+?\d{7,15}$/.test(cleanPhone)) {
        Alert.alert('Invalid phone', 'Please enter a valid phone number (7–15 digits).');
        return false;
      }
      if (clientType === 'corporate' && !cacNumber.trim()) {
        Alert.alert('CAC required', 'CAC Registration Number is required for corporate clients.');
        return false;
      }
    }
    if (step === 2) {
      if (!director.trim()) {
        Alert.alert('Required', 'Director / Person of Responsibility is required.');
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
        Alert.alert('Agent Code required', 'Enter your assigned City Hup agent code to submit');
        return false;
      }
      if (clientPassword && clientPassword !== clientPasswordConfirm) {
        Alert.alert('Password mismatch', 'Client portal passwords do not match');
        return false;
      }
      if (clientPassword && clientPassword.length < 6) {
        Alert.alert('Password too short', 'Password must be at least 6 characters');
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

  const [submitStatus, setSubmitStatus] = useState('');

  async function handleSubmit() {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      setSubmitStatus('Uploading photos…');
      const uploadedPictures = await uploadImages(businessPictures, 'client-pictures', uploadFolder);
      const uploadedProfileImgs = await uploadImages(profileImages, 'client-docs', `${uploadFolder}/profile`);
      const uploadedPortfolioImgs = await uploadImages(portfolioImages, 'client-docs', `${uploadFolder}/portfolio`);

      let uploadedIdImage: string | undefined;
      if (idDocImage.length > 0 && !idDocImage[0].startsWith('http')) {
        const ext = (idDocImage[0].split('.').pop() ?? 'jpg').split('?')[0];
        uploadedIdImage = await uploadImage(idDocImage[0], 'client-docs', `${uploadFolder}/id.${ext}`);
      } else if (idDocImage.length > 0) {
        uploadedIdImage = idDocImage[0];
      }

      let uploadedPaymentProof: string | undefined;
      if (paymentProof.length > 0 && !paymentProof[0].startsWith('http')) {
        const ext = (paymentProof[0].split('.').pop() ?? 'jpg').split('?')[0];
        uploadedPaymentProof = await uploadImage(paymentProof[0], 'client-docs', `${uploadFolder}/payment.${ext}`);
      } else if (paymentProof.length > 0) {
        uploadedPaymentProof = paymentProof[0];
      }

      setSubmitStatus('Saving registration…');
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
        infoImages: [...uploadedProfileImgs, ...uploadedPortfolioImgs],
        websiteLink,
        referral,
        director,
        identification: meansOfId
          ? { type: meansOfId as MeansOfId, number: meansOfIdNum, image: uploadedIdImage }
          : undefined,
        pictures: uploadedPictures,
        paymentBand,
        duration,
        paymentMethod,
        acceptedTerms,
        registeredBy: agentCode,
        categories: selectedCats,
        shelfItems: [
          ...shelfItems.map((item, i) => ({
            id: `item-${Date.now()}-${i}`,
            name: item.name,
            price: Number(item.price),
            description: item.description || undefined,
            isOffer: item.isOffer,
          })),
          ...propertyListings.map((p, i) => ({
            id: `prop-${Date.now()}-${i}`,
            name: p.type,
            price: Number(p.minPrice),
            description: `₦${Number(p.minPrice).toLocaleString()}${p.maxPrice ? ' – ₦' + Number(p.maxPrice).toLocaleString() : ''} ${p.unit}`,
            isOffer: false,
          })),
        ],
        priceMin: propertyListings.length > 0 ? Number(propertyListings[0].minPrice) : undefined,
        priceMax: propertyListings.length > 0
          ? Math.max(...propertyListings.map(p => Number(p.maxPrice || p.minPrice)))
          : undefined,
        priceUnit: propertyListings[0]?.unit || undefined,
      });

      // Set up client portal login if password was provided
      if (clientPassword && email) {
        try {
          await supabase.auth.signUp({ email, password: clientPassword });
        } catch { /* non-fatal */ }
      }
      Alert.alert(
        'Registration Submitted',
        'The client registration has been submitted for admin approval. The client will become visible once approved.',
        [{ text: 'OK', onPress: () => router.push('/') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not submit registration. Check your internet connection and try again.');
    } finally {
      setSubmitting(false);
      setSubmitStatus('');
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
                <FieldRow label="CAC Registration Number" required>
                  <Input value={cacNumber} onChangeText={setCacNumber} placeholder="RC-XXXXXXX" />
                </FieldRow>
              )}
              <FieldRow label="Profile / About" required>
                <Input value={profile} onChangeText={setProfile} placeholder="Brief description of the business…" multiline numberOfLines={4} />
                <Text style={styles.fieldSubNote}>You may also attach supporting images or documents below:</Text>
                <ImageUploader
                  images={profileImages}
                  onChange={setProfileImages}
                  maxImages={3}
                  uploading={submitting}
                  note="Optional: attach photos or scanned documents (PDF not yet supported — screenshots accepted)."
                />
              </FieldRow>
              <FieldRow label="Additional Info / Portfolio">
                <Input value={info} onChangeText={setInfo} placeholder="Additional competence, notable works, contracts executed…" multiline numberOfLines={4} />
                <Text style={styles.fieldSubNote}>You may also attach portfolio images or work samples:</Text>
                <ImageUploader
                  images={portfolioImages}
                  onChange={setPortfolioImages}
                  maxImages={5}
                  uploading={submitting}
                  note="Optional: attach photos of past projects, completed works, or certifications."
                />
              </FieldRow>

              <FieldRow label="Business Photos">
                <ImageUploader
                  images={businessPictures}
                  onChange={setBusinessPictures}
                  maxImages={5}
                  uploading={submitting}
                  note="Add up to 5 photos of the business premises, products, or work samples. Photos only — videos and PDFs are not currently supported."
                />
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
              <FieldRow label="Director / Person of Responsibility" required>
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

              {meansOfId && (
                <FieldRow label="ID Document Photo">
                  <ImageUploader
                    images={idDocImage}
                    onChange={setIdDocImage}
                    maxImages={1}
                    uploading={submitting}
                    note="Take a clear photo of the ID document."
                  />
                </FieldRow>
              )}
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

              {/* Shelf / Price List */}
              <View style={styles.priceBand}>
                <Text style={styles.priceBandTitle}>
                  <Ionicons name="pricetag-outline" size={14} color={Colors.primary} /> Products / Price List (optional)
                </Text>
                <Text style={styles.priceBandSub}>Add specific items, services, or prices the client offers.</Text>
                <View style={styles.shelfInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    value={newItemName}
                    onChangeText={setNewItemName}
                    placeholder="Item / service name"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={newItemPrice}
                    onChangeText={setNewItemPrice}
                    placeholder="Price (₦)"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
                <TextInput
                  style={[styles.input, { marginBottom: 8 }]}
                  value={newItemDesc}
                  onChangeText={setNewItemDesc}
                  placeholder="Short description (optional)"
                  placeholderTextColor={Colors.textMuted}
                />
                <View style={styles.shelfOfferRow}>
                  <TouchableOpacity style={styles.offerToggle} onPress={() => setNewItemOffer(v => !v)}>
                    <Ionicons name={newItemOffer ? 'checkbox' : 'square-outline'} size={18} color={Colors.primary} />
                    <Text style={styles.offerToggleText}>Mark as Special Offer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addItemBtn} onPress={addShelfItem}>
                    <Ionicons name="add" size={16} color={Colors.white} />
                    <Text style={styles.addItemBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
                {shelfItems.map((item, i) => (
                  <View key={i} style={styles.shelfItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.shelfItemName}>{item.name} {item.isOffer ? '🔥' : ''}</Text>
                      {item.description ? <Text style={styles.shelfItemDesc}>{item.description}</Text> : null}
                    </View>
                    <Text style={styles.shelfItemPrice}>₦{Number(item.price).toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => setShelfItems(prev => prev.filter((_, j) => j !== i))}>
                      <Ionicons name="close-circle-outline" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {isPropertyClient && (
                <View style={styles.priceBand}>
                  <Text style={styles.priceBandTitle}>
                    <Ionicons name="home-outline" size={14} color={Colors.primary} /> Property / Rental Listings
                  </Text>
                  <Text style={styles.priceBandSub}>Add each property type with its price range. You can add multiple listings.</Text>
                  <Input value={newPropType} onChangeText={setNewPropType} placeholder="Property type (e.g. 3 Bedroom Duplex, Shop, Land)" />
                  <View style={styles.priceRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>Min Price (₦)</Text>
                      <Input value={newPropMin} onChangeText={setNewPropMin} placeholder="e.g. 500000" keyboardType="numeric" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>Max Price (₦)</Text>
                      <Input value={newPropMax} onChangeText={setNewPropMax} placeholder="e.g. 5000000" keyboardType="numeric" />
                    </View>
                  </View>
                  <SelectPicker
                    options={[
                      { label: 'Per Year', value: 'per year' },
                      { label: 'Per Month', value: 'per month' },
                      { label: 'Per Property', value: 'per property' },
                      { label: 'Per Room', value: 'per room' },
                      { label: 'Outright Sale', value: 'outright' },
                    ]}
                    value={newPropUnit}
                    onChange={setNewPropUnit}
                    placeholder="Select price period"
                  />
                  <TouchableOpacity style={[styles.addItemBtn, { marginTop: 8, alignSelf: 'flex-end' }]} onPress={addPropertyListing}>
                    <Ionicons name="add" size={16} color={Colors.white} />
                    <Text style={styles.addItemBtnText}>Add Property</Text>
                  </TouchableOpacity>
                  {propertyListings.map((p, i) => (
                    <View key={i} style={styles.shelfItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.shelfItemName}>{p.type}</Text>
                        <Text style={styles.shelfItemDesc}>
                          ₦{Number(p.minPrice).toLocaleString()}{p.maxPrice ? ' – ₦' + Number(p.maxPrice).toLocaleString() : ''} {p.unit}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setPropertyListings(prev => prev.filter((_, j) => j !== i))}>
                        <Ionicons name="close-circle-outline" size={20} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
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

              <FieldRow label="Payment Proof / Receipt">
                <ImageUploader
                  images={paymentProof}
                  onChange={setPaymentProof}
                  maxImages={1}
                  uploading={submitting}
                  note="Upload a screenshot or photo of the payment receipt (optional at registration)."
                />
              </FieldRow>

              <View style={styles.payNote}>
                <Ionicons name="lock-closed-outline" size={16} color={Colors.primary} />
                <Text style={[styles.payNoteText, { color: Colors.primary }]}>
                  Client Portal Login (optional) — Set up a password so the client can log into CityHup and manage their listing.
                </Text>
              </View>
              <FieldRow label="Client Portal Password">
                <Input value={clientPassword} onChangeText={setClientPassword} placeholder="Leave blank to skip" />
              </FieldRow>
              {clientPassword ? (
                <FieldRow label="Confirm Password">
                  <Input value={clientPasswordConfirm} onChangeText={setClientPasswordConfirm} placeholder="Repeat password" />
                </FieldRow>
              ) : null}

              <FieldRow label="Agent / Staff Code" required>
                <Input value={agentCode} onChangeText={setAgentCode} placeholder="Enter your assigned agent code" />
                <Text style={styles.fieldSubNote}>This is your unique CityHup agent ID assigned to you by City Hup Ltd. Contact your supervisor if you do not have one.</Text>
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
              <Text style={styles.submitBtnText}>{submitting ? (submitStatus || 'Submitting…') : 'Submit Registration'}</Text>
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

  shelfInputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  shelfOfferRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  offerToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  offerToggleText: { fontSize: 12, color: Colors.textMedium },
  addItemBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  addItemBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  shelfItemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  shelfItemName: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  shelfItemDesc: { fontSize: 11, color: Colors.textLight },
  shelfItemPrice: { fontSize: 13, fontWeight: '700', color: Colors.primary },

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
  fieldSubNote: { fontSize: 11, color: Colors.textLight, marginTop: 4, lineHeight: 16, fontStyle: 'italic' },
});
