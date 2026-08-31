import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { getCategoryById } from '../constants/categories';
import ImageUploader from '../components/ImageUploader';
import { uploadImages } from '../lib/uploadImage';

const STATUS_CONFIG = {
  pending:  { color: Colors.warning,  bg: Colors.warningLight,  icon: 'time-outline',           label: 'Pending Review' },
  approved: { color: Colors.success,  bg: Colors.successLight,  icon: 'checkmark-circle',       label: 'Active & Live' },
  rejected: { color: Colors.danger,   bg: Colors.dangerLight,   icon: 'close-circle',           label: 'Rejected' },
  suspended:{ color: Colors.danger,   bg: Colors.dangerLight,   icon: 'ban',                    label: 'Suspended' },
} as const;

export default function ClientDashboard() {
  const router = useRouter();
  const currentClient = useAppStore(s => s.currentClient);
  const clientLogout = useAppStore(s => s.clientLogout);
  const updateClientProfile = useAppStore(s => s.updateClientProfile);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [phone, setPhone] = useState(currentClient?.phone ?? '');
  const [address, setAddress] = useState(currentClient?.address ?? '');
  const [competence, setCompetence] = useState(currentClient?.competence ?? '');
  const [profile, setProfile] = useState(currentClient?.profile ?? '');
  const [info, setInfo] = useState(currentClient?.info ?? '');
  const [websiteLink, setWebsiteLink] = useState(currentClient?.websiteLink ?? '');
  const [pictures, setPictures] = useState<string[]>(currentClient?.pictures ?? []);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Shelf item editing
  const [shelfItems, setShelfItems] = useState(currentClient?.shelfItems ?? []);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemOffer, setNewItemOffer] = useState(false);

  useEffect(() => {
    if (!currentClient) {
      router.replace('/client-login' as any);
    }
  }, [currentClient]);

  if (!currentClient) return null;

  const status = STATUS_CONFIG[currentClient.status];

  async function handleLogout() {
    await clientLogout();
    router.replace('/');
  }

  async function handleSave() {
    setSaving(true);
    try {
      let uploadedPictures = pictures;
      const newPics = pictures.filter(p => !p.startsWith('http'));
      if (newPics.length > 0) {
        setUploadingPhotos(true);
        const uploaded = await uploadImages(newPics, 'client-pictures', `client-${currentClient!.id}`);
        uploadedPictures = [...pictures.filter(p => p.startsWith('http')), ...uploaded];
        setUploadingPhotos(false);
      }

      await updateClientProfile(currentClient!.id, {
        phone,
        address,
        competence,
        profile,
        info,
        websiteLink: websiteLink || undefined,
        pictures: uploadedPictures,
        shelfItems,
      });
      setEditMode(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save changes');
    } finally {
      setSaving(false);
      setUploadingPhotos(false);
    }
  }

  function addShelfItem() {
    if (!newItemName.trim() || !newItemPrice.trim()) return;
    setShelfItems(prev => [...prev, {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      price: Number(newItemPrice),
      description: newItemDesc.trim() || undefined,
      isOffer: newItemOffer,
    }]);
    setNewItemName(''); setNewItemPrice(''); setNewItemDesc(''); setNewItemOffer(false);
  }

  const cats = currentClient.categories.map(id => getCategoryById(id)).filter(Boolean);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.headerBack}>
          <Ionicons name="home-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{currentClient.businessName}</Text>
          <Text style={styles.headerSub}>{currentClient.clientCode}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Status card */}
        <View style={[styles.statusCard, { backgroundColor: status.bg, borderColor: status.color }]}>
          <Ionicons name={status.icon as any} size={24} color={status.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusLabel, { color: status.color }]}>Listing Status: {status.label}</Text>
            {currentClient.status === 'pending' && (
              <Text style={styles.statusNote}>Your listing is under admin review. You will go live once approved.</Text>
            )}
            {currentClient.status === 'rejected' && (
              <Text style={styles.statusNote}>Reason: {currentClient.rejectedReason ?? 'Contact City Hup support'}</Text>
            )}
            {currentClient.status === 'suspended' && (
              <Text style={styles.statusNote}>Reason: {currentClient.suspendedReason ?? 'Contact City Hup support'}</Text>
            )}
          </View>
          {currentClient.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={12} color={Colors.primaryDark} />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>

        {/* View listing button (if approved) */}
        {currentClient.status === 'approved' && (
          <TouchableOpacity style={styles.viewListingBtn} onPress={() => router.push({ pathname: '/listing/[id]', params: { id: currentClient.id } })}>
            <Ionicons name="eye-outline" size={16} color={Colors.primary} />
            <Text style={styles.viewListingText}>View My Public Listing</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Categories</Text>
          <View style={styles.catRow}>
            {cats.map(cat => cat && (
              <View key={cat.id} style={[styles.catChip, { borderColor: cat.color }]}>
                <Ionicons name={cat.icon as any} size={12} color={cat.color} />
                <Text style={[styles.catChipText, { color: cat.color }]}>{cat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Edit / Save controls */}
        <View style={styles.editBar}>
          <Text style={styles.editBarTitle}>Business Profile</Text>
          {!editMode ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
              <Ionicons name="create-outline" size={16} color={Colors.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditMode(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? (uploadingPhotos ? 'Uploading…' : 'Saving…') : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.profileCard}>
          <Field label="Phone" value={phone} onChange={setPhone} editable={editMode} />
          <Field label="Address" value={address} onChange={setAddress} editable={editMode} multiline />
          <Field label="Competence / What You Do" value={competence} onChange={setCompetence} editable={editMode} multiline />
          <Field label="About / Profile" value={profile} onChange={setProfile} editable={editMode} multiline />
          <Field label="Additional Info" value={info} onChange={setInfo} editable={editMode} multiline />
          <Field label="Website" value={websiteLink} onChange={setWebsiteLink} editable={editMode} />
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Photos</Text>
          {editMode ? (
            <ImageUploader
              images={pictures}
              onChange={setPictures}
              maxImages={5}
              uploading={uploadingPhotos}
              note="Add or remove business photos."
            />
          ) : (
            pictures.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {pictures.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.photo} resizeMode="cover" />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyNote}>No photos yet. Tap Edit to add some.</Text>
            )
          )}
        </View>

        {/* Shelf Items / Price List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products / Price List</Text>
          {editMode && (
            <View style={styles.shelfAddRow}>
              <TextInput
                style={[styles.shelfInput, { flex: 2 }]}
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Item name"
                placeholderTextColor={Colors.textMuted}
              />
              <TextInput
                style={[styles.shelfInput, { flex: 1 }]}
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                placeholder="Price (₦)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.shelfAddBtn} onPress={addShelfItem}>
                <Ionicons name="add" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}
          {shelfItems.length === 0 && (
            <Text style={styles.emptyNote}>No items listed. {editMode ? 'Add one above.' : 'Tap Edit to add.'}</Text>
          )}
          {shelfItems.map((item, i) => (
            <View key={item.id} style={styles.shelfItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.shelfItemName}>{item.name} {item.isOffer ? '🔥' : ''}</Text>
                {item.description ? <Text style={styles.shelfItemDesc}>{item.description}</Text> : null}
              </View>
              <Text style={styles.shelfItemPrice}>₦{item.price.toLocaleString()}</Text>
              {editMode && (
                <TouchableOpacity onPress={() => setShelfItems(prev => prev.filter((_, j) => j !== i))}>
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Location (read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.readonlyValue}>{currentClient.address}</Text>
          <Text style={styles.readonlyNote}>{currentClient.area}, {currentClient.city}, {currentClient.lga}, {currentClient.state}, {currentClient.country}</Text>
          <Text style={[styles.readonlyNote, { color: Colors.info, marginTop: 6 }]}>
            To update your location, contact City Hup support or visit a CityHup agent.
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChange, editable, multiline }: {
  label: string; value: string; onChange: (v: string) => void; editable: boolean; multiline?: boolean;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {editable ? (
        <TextInput
          style={[fieldStyles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={Colors.textMuted}
        />
      ) : (
        <Text style={fieldStyles.value}>{value || '—'}</Text>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '600', color: Colors.textLight, marginBottom: 3, textTransform: 'uppercase' },
  value: { fontSize: 14, color: Colors.textDark, lineHeight: 20 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 9, fontSize: 14, color: Colors.textDark,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16,
  },
  headerBack: { padding: 4 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  scroll: { flex: 1 },

  statusCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    margin: 12, borderRadius: 12, padding: 14, borderWidth: 1.5,
  },
  statusLabel: { fontSize: 14, fontWeight: '700' },
  statusNote: { fontSize: 12, color: Colors.textMedium, marginTop: 3, lineHeight: 17 },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.gold, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  premiumBadgeText: { color: Colors.primaryDark, fontSize: 10, fontWeight: '800' },

  viewListingBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryLight, marginHorizontal: 12, marginBottom: 4,
    borderRadius: 10, padding: 12,
  },
  viewListingText: { flex: 1, fontSize: 14, color: Colors.primary, fontWeight: '600' },

  section: {
    backgroundColor: Colors.bgCard, margin: 12, marginBottom: 0,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.borderLight,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 10 },

  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4,
  },
  catChipText: { fontSize: 11, fontWeight: '600' },

  editBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, marginTop: 8,
  },
  editBarTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  editActions: { flexDirection: 'row', gap: 8 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { color: Colors.textMedium, fontSize: 13 },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: Colors.primary },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },

  profileCard: {
    backgroundColor: Colors.bgCard, marginHorizontal: 12, marginBottom: 0,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.borderLight,
  },

  photo: { width: 130, height: 100, borderRadius: 10, backgroundColor: Colors.borderLight },

  shelfAddRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  shelfInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 9, fontSize: 13, color: Colors.textDark,
  },
  shelfAddBtn: {
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center',
  },
  shelfItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  shelfItemName: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  shelfItemDesc: { fontSize: 11, color: Colors.textLight, marginTop: 1 },
  shelfItemPrice: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  emptyNote: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  readonlyValue: { fontSize: 14, color: Colors.textDark, marginBottom: 3 },
  readonlyNote: { fontSize: 12, color: Colors.textLight },
});
