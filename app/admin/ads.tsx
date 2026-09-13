import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Switch, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';
import { Ad } from '../../types';
import { STATES } from '../../constants/locations';
import ImageUploader from '../../components/ImageUploader';
import { uploadImage } from '../../lib/uploadImage';

const NIGERIA_STATES = STATES['Nigeria'];
const AD_COLORS = [
  { label: 'Green',  value: Colors.primary },
  { label: 'Orange', value: Colors.accent },
  { label: 'Purple', value: '#7B1FA2' },
  { label: 'Blue',   value: '#0277BD' },
  { label: 'Dark',   value: Colors.primaryDark },
  { label: 'Gold',   value: '#B8860B' },
];
const AD_ICONS = ['megaphone', 'star', 'sparkles', 'storefront', 'home', 'car', 'restaurant', 'school', 'briefcase', 'hammer'];

type FormMode = 'create' | 'edit';

export default function AdsScreen() {
  const router = useRouter();
  const currentAdmin = useAppStore(s => s.currentAdmin);
  const ads          = useAppStore(s => s.ads);
  const createAd     = useAppStore(s => s.createAd);
  const updateAd     = useAppStore(s => s.updateAd);
  const toggleAd     = useAppStore(s => s.toggleAd);
  const deleteAd     = useAppStore(s => s.deleteAd);

  const [formMode, setFormMode]       = useState<FormMode>('create');
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form fields
  const [title, setTitle]             = useState('');
  const [subtitle, setSubtitle]       = useState('');
  const [bgColor, setBgColor]         = useState(Colors.primary);
  const [icon, setIcon]               = useState('megaphone');
  const [adImage, setAdImage]         = useState<string[]>([]);
  const [linkType, setLinkType]       = useState<'external' | 'client' | 'category'>('external');
  const [linkUrl, setLinkUrl]         = useState('');
  const [linkClientId, setLinkClientId] = useState('');
  const [targetState, setTargetState] = useState('');
  const [priority, setPriority]       = useState('0');
  const [isActive, setIsActive]       = useState(true);

  if (!currentAdmin) { router.replace('/admin/login'); return null; }

  function resetForm() {
    setTitle(''); setSubtitle(''); setBgColor(Colors.primary); setIcon('megaphone');
    setAdImage([]); setLinkType('external'); setLinkUrl(''); setLinkClientId('');
    setTargetState(''); setPriority('0'); setIsActive(true);
    setFormError(''); setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setFormMode('create');
    setShowForm(true);
  }

  function openEdit(ad: Ad) {
    setFormMode('edit');
    setEditingId(ad.id);
    setTitle(ad.title);
    setSubtitle(ad.subtitle ?? '');
    setBgColor(ad.bgColor);
    setIcon(ad.icon);
    setAdImage(ad.imageUrl ? [ad.imageUrl] : []);
    setLinkType(ad.linkType);
    setLinkUrl(ad.linkUrl ?? '');
    setLinkClientId(ad.linkClientId ?? '');
    setTargetState(ad.targetState ?? '');
    setPriority(String(ad.priority ?? 0));
    setIsActive(ad.isActive);
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  async function resolveImage(): Promise<string | undefined> {
    if (adImage.length === 0) return undefined;
    if (adImage[0].startsWith('http')) return adImage[0]; // unchanged existing URL
    const ext = (adImage[0].split('.').pop() ?? 'jpg').split('?')[0];
    return uploadImage(adImage[0], 'ad-images', `ad-${Date.now()}.${ext}`);
  }

  async function handleSave() {
    setFormError('');
    if (!title.trim()) { setFormError('Ad title is required.'); return; }
    setSaving(true);
    try {
      const imageUrl = await resolveImage();
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        imageUrl,
        bgColor,
        icon,
        linkType,
        linkUrl: linkType === 'client' ? undefined : (linkUrl.trim() || undefined),
        linkClientId: linkType === 'client' ? (linkClientId.trim() || undefined) : undefined,
        targetState: targetState || undefined,
        isActive,
        priority: Number(priority) || 0,
      };

      if (formMode === 'edit' && editingId) {
        await updateAd(editingId, payload);
        setFormSuccess('Ad updated successfully.');
      } else {
        await createAd(payload);
        setFormSuccess('Ad created and is now live.');
      }
      setTimeout(() => setFormSuccess(''), 3000);
      closeForm();
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to save ad.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteAd(id);
    setDeleteConfirm(null);
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Ads</Text>
        <TouchableOpacity style={styles.addBtn} onPress={showForm ? closeForm : openCreate}>
          <Ionicons name={showForm ? 'close' : 'add'} size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {formSuccess ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.successText}>{formSuccess}</Text>
          </View>
        ) : null}

        {/* Create / Edit form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {formMode === 'edit' ? 'Edit Advertisement' : 'New Advertisement'}
            </Text>

            <FieldRow label="Ad Title *">
              <TextInput style={styles.input} value={title} onChangeText={setTitle}
                placeholder="e.g. Get Your Business Listed Today" placeholderTextColor={Colors.textMuted} />
            </FieldRow>

            <FieldRow label="Subtitle">
              <TextInput style={styles.input} value={subtitle} onChangeText={setSubtitle}
                placeholder="Short tagline or description" placeholderTextColor={Colors.textMuted} />
            </FieldRow>

            <FieldRow label="Ad Image (optional)">
              <ImageUploader
                images={adImage}
                onChange={setAdImage}
                maxImages={1}
                uploading={saving}
                note="Upload a banner image. Recommended: wide/landscape photo."
              />
            </FieldRow>

            <FieldRow label="Background Color">
              <View style={styles.colorRow}>
                {AD_COLORS.map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.colorSwatch, { backgroundColor: c.value }, bgColor === c.value && styles.colorSwatchActive]}
                    onPress={() => setBgColor(c.value)}
                  >
                    {bgColor === c.value && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                  </TouchableOpacity>
                ))}
              </View>
            </FieldRow>

            <FieldRow label="Icon">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
                {AD_ICONS.map(ic => (
                  <TouchableOpacity
                    key={ic}
                    style={[styles.iconBtn, icon === ic && styles.iconBtnActive]}
                    onPress={() => setIcon(ic)}
                  >
                    <Ionicons name={ic as any} size={20} color={icon === ic ? Colors.white : Colors.textMedium} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </FieldRow>

            <FieldRow label="Link Type">
              <View style={styles.linkTypeRow}>
                {(['external', 'client', 'category'] as const).map(lt => (
                  <TouchableOpacity
                    key={lt}
                    style={[styles.linkTypeBtn, linkType === lt && styles.linkTypeBtnActive]}
                    onPress={() => setLinkType(lt)}
                  >
                    <Text style={[styles.linkTypeBtnText, linkType === lt && styles.linkTypeBtnTextActive]}>
                      {lt === 'external' ? 'URL' : lt === 'client' ? 'Client Page' : 'Category'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FieldRow>

            {linkType === 'client' ? (
              <FieldRow label="Client ID">
                <TextInput style={styles.input} value={linkClientId} onChangeText={setLinkClientId}
                  placeholder="Paste client ID" placeholderTextColor={Colors.textMuted} />
              </FieldRow>
            ) : (
              <FieldRow label={linkType === 'category' ? 'Category ID' : 'URL'}>
                <TextInput style={styles.input} value={linkUrl} onChangeText={setLinkUrl}
                  placeholder={linkType === 'category' ? 'e.g. automobile' : 'https://...'}
                  placeholderTextColor={Colors.textMuted} />
              </FieldRow>
            )}

            <FieldRow label="Target State (blank = all states)">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                <TouchableOpacity
                  style={[styles.stateChip, !targetState && styles.stateChipActive]}
                  onPress={() => setTargetState('')}
                >
                  <Text style={[styles.stateChipText, !targetState && styles.stateChipTextActive]}>All</Text>
                </TouchableOpacity>
                {NIGERIA_STATES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.stateChip, targetState === s && styles.stateChipActive]}
                    onPress={() => setTargetState(targetState === s ? '' : s)}
                  >
                    <Text style={[styles.stateChipText, targetState === s && styles.stateChipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </FieldRow>

            <FieldRow label="Priority (higher = shown first)">
              <TextInput style={styles.input} value={priority} onChangeText={setPriority}
                keyboardType="numeric" placeholder="0" placeholderTextColor={Colors.textMuted} />
            </FieldRow>

            {formMode === 'edit' && (
              <FieldRow label="Active">
                <View style={styles.switchRow}>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    trackColor={{ true: Colors.success, false: Colors.border }}
                    thumbColor={Colors.white}
                  />
                  <Text style={styles.switchLabel}>{isActive ? 'Live' : 'Hidden'}</Text>
                </View>
              </FieldRow>
            )}

            {/* Live preview */}
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={[styles.preview, { backgroundColor: bgColor }]}>
              {adImage.length > 0 ? (
                <Image source={{ uri: adImage[0] }} style={styles.previewImg} resizeMode="cover" />
              ) : null}
              <View style={styles.previewOverlay}>
                <Ionicons name={icon as any} size={28} color="rgba(255,255,255,0.5)" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewTitle}>{title || 'Ad Title'}</Text>
                  {subtitle ? <Text style={styles.previewSub}>{subtitle}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
              </View>
            </View>

            {formError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={15} color={Colors.danger} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving…' : formMode === 'edit' ? 'Update Ad' : 'Create Ad'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* List */}
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>{ads.length} Ad{ads.length !== 1 ? 's' : ''}</Text>
        </View>

        {ads.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="megaphone-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No ads yet. Tap + to create one.</Text>
          </View>
        )}

        {ads.map(ad => (
          <View key={ad.id}>
            {/* Delete confirmation inline */}
            {deleteConfirm === ad.id ? (
              <View style={styles.deleteConfirmRow}>
                <Text style={styles.deleteConfirmText}>Delete "{ad.title}"?</Text>
                <TouchableOpacity style={styles.confirmYes} onPress={() => handleDelete(ad.id)}>
                  <Text style={styles.confirmYesText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmNo} onPress={() => setDeleteConfirm(null)}>
                  <Text style={styles.confirmNoText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.adRow}>
              {ad.imageUrl ? (
                <Image source={{ uri: ad.imageUrl }} style={styles.adThumb} resizeMode="cover" />
              ) : (
                <View style={[styles.adColorDot, { backgroundColor: ad.bgColor }]}>
                  <Ionicons name={ad.icon as any} size={16} color={Colors.white} />
                </View>
              )}

              <View style={styles.adInfo}>
                <Text style={styles.adTitle}>{ad.title}</Text>
                <Text style={styles.adMeta}>
                  {ad.targetState ? `📍 ${ad.targetState}` : '🌍 All'} · P:{ad.priority}
                  {ad.imageUrl ? ' · 🖼' : ''}
                </Text>
              </View>

              <Switch
                value={ad.isActive}
                onValueChange={v => toggleAd(ad.id, v)}
                trackColor={{ true: Colors.success, false: Colors.border }}
                thumbColor={Colors.white}
              />

              <TouchableOpacity style={styles.iconAction} onPress={() => openEdit(ad)}>
                <Ionicons name="create-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconAction} onPress={() => setDeleteConfirm(ad.id)}>
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.white },
  addBtn: { padding: 4 },
  scroll: { flex: 1 },

  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.successLight, borderRadius: 8,
    margin: 12, padding: 12,
  },
  successText: { flex: 1, fontSize: 13, color: Colors.success, fontWeight: '600' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 8,
    padding: 10, marginBottom: 10,
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.danger },

  formCard: {
    backgroundColor: Colors.bgCard, margin: 12,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.borderLight,
  },
  formTitle: { fontSize: 15, fontWeight: '800', color: Colors.primary, marginBottom: 14 },
  fieldRow: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMedium, marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 9,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: Colors.textDark,
    backgroundColor: Colors.bgLight,
  },
  colorRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  colorSwatch: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  colorSwatchActive: { borderColor: Colors.textDark },
  iconRow: { gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgLight, borderWidth: 1, borderColor: Colors.border,
  },
  iconBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  linkTypeRow: { flexDirection: 'row', gap: 8 },
  linkTypeBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.borderLight, borderWidth: 1, borderColor: Colors.border,
  },
  linkTypeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  linkTypeBtnText: { fontSize: 13, color: Colors.textMedium, fontWeight: '500' },
  linkTypeBtnTextActive: { color: Colors.white, fontWeight: '700' },
  stateChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    backgroundColor: Colors.borderLight, borderWidth: 1, borderColor: Colors.border,
  },
  stateChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stateChipText: { fontSize: 12, color: Colors.textMedium },
  stateChipTextActive: { color: Colors.white, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchLabel: { fontSize: 13, color: Colors.textMedium, fontWeight: '500' },

  previewLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMedium, marginBottom: 6 },
  preview: { borderRadius: 10, marginBottom: 14, overflow: 'hidden', minHeight: 80 },
  previewImg: { ...StyleSheet.absoluteFillObject, opacity: 0.55 },
  previewOverlay: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  previewTitle: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  previewSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },

  formActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  cancelBtnText: { color: Colors.textMedium, fontWeight: '700', fontSize: 14 },
  saveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 13,
  },
  saveBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },

  listHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  listHeaderText: { fontSize: 13, fontWeight: '700', color: Colors.textMedium },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },

  adRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, marginHorizontal: 12, marginBottom: 4,
    borderRadius: 10, padding: 12, gap: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  adColorDot: {
    width: 40, height: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  adThumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: Colors.borderLight },
  adInfo: { flex: 1 },
  adTitle: { fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  adMeta: { fontSize: 11, color: Colors.textLight },
  iconAction: { padding: 6 },

  deleteConfirmRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, marginHorizontal: 12,
    borderRadius: 10, padding: 10, marginBottom: 2,
    borderWidth: 1, borderColor: Colors.danger + '40',
  },
  deleteConfirmText: { flex: 1, fontSize: 12, color: Colors.danger, fontWeight: '600' },
  confirmYes: {
    backgroundColor: Colors.danger, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  confirmYesText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  confirmNo: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  confirmNoText: { color: Colors.textMedium, fontSize: 12 },
});
