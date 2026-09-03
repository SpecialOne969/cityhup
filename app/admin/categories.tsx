import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Platform, Switch, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';
import { Category } from '../../constants/categories';
import { uploadImages } from '../../lib/uploadImage';
import ImageUploader from '../../components/ImageUploader';

const SETUP_SQL = `-- Run this once in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'grid-outline',
  color TEXT NOT NULL DEFAULT '#008751',
  section TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "read_subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "manage_categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "manage_subcategories" ON subcategories FOR ALL TO authenticated USING (true) WITH CHECK (true);`;

const COLOR_SWATCHES = [
  '#008751','#1565C0','#E65100','#37474F','#6A1B9A','#AD1457','#C62828','#880E4F',
  '#0277BD','#2E7D32','#4527A0','#00695C','#1B5E20','#F57F17','#BF360C','#B71C1C',
  '#1A237E','#263238','#546E7A','#5D4037','#4E342E','#33691E','#311B92','#006064',
  '#F9A825','#BF360C','#880E4F','#004D40',
];

const ICON_OPTIONS = [
  'home','flash','car','business','phone-portrait','musical-notes','shirt','cut',
  'airplane','restaurant','construct','navigate','school','cart','bag','bed',
  'map','medkit','flask','car-sport','settings','boat','briefcase','cash',
  'hammer','leaf','tv','sunny','laptop','cube','flame','calculator',
  'key','grid','layers','storefront','diamond','ribbon',
];

type SectionTab = 'services' | 'goods';

export default function AdminCategoriesScreen() {
  const router = useRouter();
  const currentAdmin = useAppStore(s => s.currentAdmin);
  const categories   = useAppStore(s => s.categories);
  const loadCategories       = useAppStore(s => s.loadCategories);
  const seedCategoriesIfEmpty = useAppStore(s => s.seedCategoriesIfEmpty);
  const adminCreateCategory  = useAppStore(s => s.adminCreateCategory);
  const adminUpdateCategory  = useAppStore(s => s.adminUpdateCategory);
  const adminDeleteCategory  = useAppStore(s => s.adminDeleteCategory);
  const adminAddSubcategory  = useAppStore(s => s.adminAddSubcategory);
  const adminUpdateSubcategory = useAppStore(s => s.adminUpdateSubcategory);
  const adminDeleteSubcategory = useAppStore(s => s.adminDeleteSubcategory);

  const [tab, setTab] = useState<SectionTab>('services');
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showSQL, setShowSQL] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Add category form
  const [showAdd, setShowAdd] = useState(false);
  const [addLabel, setAddLabel] = useState('');
  const [addIcon, setAddIcon] = useState('grid-outline');
  const [addColor, setAddColor] = useState(Colors.primary);
  const [addSection, setAddSection] = useState<SectionTab>('services');
  const [addImages, setAddImages] = useState<string[]>([]);
  const [addSaving, setAddSaving] = useState(false);

  // Expanded category
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Edit category inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  // Subcategory add
  const [addSubFor, setAddSubFor] = useState<string | null>(null);
  const [newSubLabel, setNewSubLabel] = useState('');
  // Subcategory edit
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [editSubLabel, setEditSubLabel] = useState('');
  const [subSaving, setSubSaving] = useState(false);

  useEffect(() => {
    if (!currentAdmin) { router.replace('/admin/login'); return; }
    init();
  }, []);

  async function init() {
    setLoading(true);
    await loadCategories();
    setLoading(false);
    // If still empty after load, tables may not exist
    const store = useAppStore.getState();
    if (!store.categoriesLoaded) setNeedsSetup(true);
  }

  async function handleSetup() {
    setLoading(true);
    await seedCategoriesIfEmpty();
    setLoading(false);
    setNeedsSetup(false);
  }

  async function handleAddCategory() {
    if (!addLabel.trim()) return;
    setAddSaving(true);
    let imageUrl: string | undefined;
    if (addImages.length > 0 && !addImages[0].startsWith('http')) {
      const urls = await uploadImages(addImages, 'category-images');
      imageUrl = urls[0];
    } else if (addImages.length > 0) {
      imageUrl = addImages[0];
    }
    await adminCreateCategory({ label: addLabel.trim(), icon: addIcon, color: addColor, section: addSection, imageUrl });
    setAddLabel(''); setAddIcon('grid-outline'); setAddColor(Colors.primary); setAddImages([]);
    setShowAdd(false); setAddSaving(false);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditIcon(cat.icon);
    setEditColor(cat.color);
    setEditImages(cat.imageUrl ? [cat.imageUrl] : []);
  }

  async function handleSaveEdit(id: string) {
    setEditSaving(true);
    let imageUrl: string | undefined;
    if (editImages.length > 0 && !editImages[0].startsWith('http')) {
      const urls = await uploadImages(editImages, 'category-images');
      imageUrl = urls[0];
    } else {
      imageUrl = editImages[0];
    }
    await adminUpdateCategory(id, { label: editLabel.trim(), icon: editIcon, color: editColor, imageUrl });
    setEditingId(null); setEditSaving(false);
  }

  async function handleDelete(id: string) {
    await adminDeleteCategory(id);
    if (expandedId === id) setExpandedId(null);
    if (editingId === id) setEditingId(null);
  }

  async function handleAddSub(categoryId: string) {
    if (!newSubLabel.trim()) return;
    setSubSaving(true);
    await adminAddSubcategory(categoryId, newSubLabel.trim());
    setNewSubLabel(''); setAddSubFor(null); setSubSaving(false);
  }

  async function handleSaveSubEdit(categoryId: string, subId: string) {
    if (!editSubLabel.trim()) return;
    setSubSaving(true);
    await adminUpdateSubcategory(categoryId, subId, editSubLabel.trim());
    setEditSubId(null); setSubSaving(false);
  }

  function copySQL() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(SETUP_SQL);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    }
  }

  if (!currentAdmin) return null;

  const displayCats = categories.filter(c => c.section === tab && c.isActive !== false);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category Management</Text>
        <TouchableOpacity onPress={() => setShowSQL(v => !v)} style={styles.headerBtn}>
          <Ionicons name="code-slash" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* SQL Setup Panel */}
      {showSQL && (
        <View style={styles.sqlPanel}>
          <Text style={styles.sqlTitle}>Database Setup SQL</Text>
          <Text style={styles.sqlNote}>Run this once in your Supabase SQL Editor to enable live category management.</Text>
          <ScrollView style={styles.sqlScroll} horizontal={false}>
            <Text style={styles.sqlCode}>{SETUP_SQL}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.copyBtn} onPress={copySQL}>
            <Ionicons name={sqlCopied ? 'checkmark' : 'copy-outline'} size={16} color={Colors.white} />
            <Text style={styles.copyBtnText}>{sqlCopied ? 'Copied!' : 'Copy SQL'}</Text>
          </TouchableOpacity>
          {needsSetup && (
            <TouchableOpacity style={[styles.copyBtn, { backgroundColor: Colors.success, marginTop: 8 }]} onPress={handleSetup} disabled={loading}>
              <Ionicons name="cloud-upload-outline" size={16} color={Colors.white} />
              <Text style={styles.copyBtnText}>{loading ? 'Seeding…' : 'Seed from current categories'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Section tabs */}
      <View style={styles.tabs}>
        {(['services', 'goods'] as SectionTab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'services' ? 'Service Providers' : 'Goods & Services'}
            </Text>
            <Text style={[styles.tabCount, tab === t && { color: Colors.primary }]}>
              {categories.filter(c => c.section === t && c.isActive !== false).length}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Add category button */}
        {!showAdd ? (
          <TouchableOpacity style={styles.addCatBtn} onPress={() => { setShowAdd(true); setAddSection(tab); }}>
            <Ionicons name="add-circle" size={20} color={Colors.primary} />
            <Text style={styles.addCatBtnText}>Add New Category</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>New Category</Text>
            <Text style={styles.fieldLabel}>Category Name *</Text>
            <TextInput style={styles.input} value={addLabel} onChangeText={setAddLabel} placeholder="e.g. Landscaping" placeholderTextColor={Colors.textMuted} />

            <Text style={styles.fieldLabel}>Section *</Text>
            <View style={styles.sectionToggle}>
              {(['services', 'goods'] as SectionTab[]).map(s => (
                <TouchableOpacity key={s} style={[styles.sectionBtn, addSection === s && styles.sectionBtnActive]} onPress={() => setAddSection(s)}>
                  <Text style={[styles.sectionBtnText, addSection === s && { color: Colors.white }]}>
                    {s === 'services' ? 'Service Provider' : 'Goods & Services'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Icon Name (Ionicons)</Text>
            <TextInput style={styles.input} value={addIcon} onChangeText={setAddIcon} placeholder="e.g. home, car, flash" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {ICON_OPTIONS.map(ico => (
                <TouchableOpacity key={ico} onPress={() => setAddIcon(ico + '-outline')} style={[styles.iconChip, addIcon === ico + '-outline' && { backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]}>
                  <Ionicons name={(ico + '-outline') as any} size={22} color={addIcon === ico + '-outline' ? Colors.primary : Colors.textMedium} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.iconPreview}>
              <Ionicons name={addIcon as any} size={28} color={addColor} />
              <Text style={[styles.iconPreviewLabel, { color: addColor }]}>{addLabel || 'Preview'}</Text>
            </View>

            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.swatches}>
              {COLOR_SWATCHES.map(col => (
                <TouchableOpacity key={col} onPress={() => setAddColor(col)}
                  style={[styles.swatch, { backgroundColor: col }, addColor === col && styles.swatchSelected]} />
              ))}
            </View>

            <Text style={styles.fieldLabel}>Category Image (optional)</Text>
            <ImageUploader images={addImages} onChange={setAddImages} maxImages={1} />

            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddCategory} disabled={addSaving || !addLabel.trim()}>
                <Text style={styles.saveBtnText}>{addSaving ? 'Saving…' : 'Add Category'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading */}
        {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} />}

        {/* Category list */}
        {!loading && displayCats.map(cat => (
          <View key={cat.id} style={styles.catCard}>
            {editingId === cat.id ? (
              // ── Inline edit form ──
              <View style={styles.addForm}>
                <Text style={styles.formTitle}>Edit Category</Text>
                <TextInput style={styles.input} value={editLabel} onChangeText={setEditLabel} placeholder="Category name" placeholderTextColor={Colors.textMuted} />

                <Text style={styles.fieldLabel}>Icon Name (Ionicons)</Text>
                <TextInput style={styles.input} value={editIcon} onChangeText={setEditIcon} autoCapitalize="none" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {ICON_OPTIONS.map(ico => (
                    <TouchableOpacity key={ico} onPress={() => setEditIcon(ico + '-outline')} style={[styles.iconChip, editIcon === ico + '-outline' && { backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]}>
                      <Ionicons name={(ico + '-outline') as any} size={22} color={editIcon === ico + '-outline' ? Colors.primary : Colors.textMedium} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.iconPreview}>
                  <Ionicons name={editIcon as any} size={28} color={editColor} />
                  <Text style={[styles.iconPreviewLabel, { color: editColor }]}>{editLabel || 'Preview'}</Text>
                </View>

                <Text style={styles.fieldLabel}>Color</Text>
                <View style={styles.swatches}>
                  {COLOR_SWATCHES.map(col => (
                    <TouchableOpacity key={col} onPress={() => setEditColor(col)}
                      style={[styles.swatch, { backgroundColor: col }, editColor === col && styles.swatchSelected]} />
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Category Image</Text>
                <ImageUploader images={editImages} onChange={setEditImages} maxImages={1} />

                <View style={styles.formBtns}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingId(null)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveEdit(cat.id)} disabled={editSaving}>
                    <Text style={styles.saveBtnText}>{editSaving ? 'Saving…' : 'Save Changes'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // ── Category row ──
              <>
                <View style={styles.catRow}>
                  <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                  <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <Text style={styles.subCount}>{cat.subcategories.length} sub</Text>
                  <TouchableOpacity onPress={() => startEdit(cat)} style={styles.rowIconBtn}>
                    <Ionicons name="pencil-outline" size={17} color={Colors.info} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(cat.id)} style={styles.rowIconBtn}>
                    <Ionicons name="trash-outline" size={17} color={Colors.danger} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setExpandedId(expandedId === cat.id ? null : cat.id)} style={styles.rowIconBtn}>
                    <Ionicons name={expandedId === cat.id ? 'chevron-up' : 'chevron-down'} size={17} color={Colors.textMedium} />
                  </TouchableOpacity>
                </View>

                {/* Active toggle */}
                <View style={styles.activeRow}>
                  <Text style={styles.activeLabel}>Visible on platform</Text>
                  <Switch
                    value={cat.isActive !== false}
                    onValueChange={v => adminUpdateCategory(cat.id, { isActive: v })}
                    trackColor={{ true: Colors.success, false: Colors.border }}
                    thumbColor={Colors.white}
                  />
                </View>

                {/* Subcategories */}
                {expandedId === cat.id && (
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Subcategories</Text>
                    {cat.subcategories.map(sub => (
                      <View key={sub.id} style={styles.subRow}>
                        {editSubId === sub.id ? (
                          <>
                            <TextInput
                              style={[styles.subInput, { flex: 1 }]}
                              value={editSubLabel}
                              onChangeText={setEditSubLabel}
                              autoFocus
                            />
                            <TouchableOpacity onPress={() => handleSaveSubEdit(cat.id, sub.id)} disabled={subSaving} style={styles.subSaveBtn}>
                              <Ionicons name="checkmark" size={16} color={Colors.white} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setEditSubId(null)} style={styles.subCancelBtn}>
                              <Ionicons name="close" size={16} color={Colors.textMedium} />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <View style={styles.subDot} />
                            <Text style={styles.subLabel}>{sub.label}</Text>
                            <TouchableOpacity onPress={() => { setEditSubId(sub.id); setEditSubLabel(sub.label); }} style={styles.rowIconBtn}>
                              <Ionicons name="pencil-outline" size={14} color={Colors.info} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => adminDeleteSubcategory(cat.id, sub.id)} style={styles.rowIconBtn}>
                              <Ionicons name="trash-outline" size={14} color={Colors.danger} />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    ))}

                    {/* Add subcategory */}
                    {addSubFor === cat.id ? (
                      <View style={styles.addSubRow}>
                        <TextInput
                          style={[styles.subInput, { flex: 1 }]}
                          value={newSubLabel}
                          onChangeText={setNewSubLabel}
                          placeholder="New subcategory name…"
                          placeholderTextColor={Colors.textMuted}
                          autoFocus
                        />
                        <TouchableOpacity onPress={() => handleAddSub(cat.id)} disabled={subSaving || !newSubLabel.trim()} style={styles.subSaveBtn}>
                          <Ionicons name="add" size={16} color={Colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setAddSubFor(null); setNewSubLabel(''); }} style={styles.subCancelBtn}>
                          <Ionicons name="close" size={16} color={Colors.textMedium} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.addSubBtn} onPress={() => setAddSubFor(cat.id)}>
                        <Ionicons name="add" size={14} color={Colors.primary} />
                        <Text style={styles.addSubBtnText}>Add Subcategory</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        ))}

        {!loading && displayCats.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="layers-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No {tab} categories yet.</Text>
            <Text style={styles.emptyNote}>Tap "Add New Category" to create one, or run the setup SQL to seed from defaults.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bgLight },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16,
  },
  headerBtn:   { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.white },

  sqlPanel: { backgroundColor: Colors.primaryDark, padding: 16, margin: 12, borderRadius: 12 },
  sqlTitle: { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  sqlNote:  { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 10, lineHeight: 17 },
  sqlScroll:{ maxHeight: 180, backgroundColor: '#0a1a0e', borderRadius: 8, padding: 10, marginBottom: 10 },
  sqlCode:  { fontSize: 11, color: '#90EE90', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  copyBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start' },
  copyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },

  tabs:       { flexDirection: 'row', backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab:        { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2 },
  tabActive:  { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText:    { fontSize: 13, color: Colors.textMedium, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  tabCount:   { fontSize: 11, color: Colors.textMuted },

  addCatBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, backgroundColor: Colors.primaryLight, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: Colors.primary + '40', borderStyle: 'dashed' },
  addCatBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  addForm: { backgroundColor: Colors.bgCard, margin: 12, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border, elevation: 2, shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4 },
  formTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textDark, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.textDark, backgroundColor: Colors.bgLight, marginBottom: 12 },

  sectionToggle: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  sectionBtn: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  sectionBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sectionBtnText: { fontSize: 12, color: Colors.textMedium, fontWeight: '600' },

  iconChip: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 6, backgroundColor: Colors.bgLight },
  iconPreview: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, padding: 10, backgroundColor: Colors.bgLight, borderRadius: 8 },
  iconPreviewLabel: { fontSize: 15, fontWeight: '700' },

  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  swatch:   { width: 28, height: 28, borderRadius: 14 },
  swatchSelected: { borderWidth: 3, borderColor: Colors.textDark },

  formBtns:   { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn:  { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: Colors.textMedium, fontWeight: '600', fontSize: 14 },
  saveBtn:    { flex: 1, backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  catCard: { backgroundColor: Colors.bgCard, marginHorizontal: 12, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  catRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  catLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textDark },
  subCount: { fontSize: 11, color: Colors.textMuted },
  rowIconBtn: { padding: 4 },

  activeRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 10 },
  activeLabel: { fontSize: 12, color: Colors.textLight },

  subSection:      { backgroundColor: Colors.bgLight, padding: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  subSectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textLight, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  subRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5 },
  subDot:  { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.textMuted },
  subLabel: { flex: 1, fontSize: 13, color: Colors.textMedium },
  subInput: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, color: Colors.textDark, backgroundColor: Colors.bgCard },
  subSaveBtn:   { backgroundColor: Colors.success, borderRadius: 6, padding: 6 },
  subCancelBtn: { backgroundColor: Colors.borderLight, borderRadius: 6, padding: 6 },
  addSubRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  addSubBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  addSubBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  empty:     { alignItems: 'center', padding: 40, gap: 10 },
  emptyText: { fontSize: 16, color: Colors.textMedium, fontWeight: '600' },
  emptyNote: { fontSize: 13, color: Colors.textLight, textAlign: 'center', lineHeight: 18 },
});
