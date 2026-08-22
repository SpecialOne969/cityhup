import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { SERVICE_CATEGORIES, GOODS_CATEGORIES } from '../../constants/categories';
import { useAppStore } from '../../store/useAppStore';
import Header from '../../components/Header';
import CategoryCard from '../../components/CategoryCard';

export default function BrowseScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'services' | 'goods'>('services');
  const clients = useAppStore(s => s.clients);

  function countForCategory(catId: string) {
    return clients.filter(c => c.status === 'approved' && c.categories.includes(catId)).length;
  }

  const displayCats = tab === 'services' ? SERVICE_CATEGORIES : GOODS_CATEGORIES;

  return (
    <View style={styles.root}>
      <Header />
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>{tab === 'services' ? 'Browse Services' : 'Browse Goods'}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['services', 'goods'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'services' ? 'Browse Services' : 'Browse Goods'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayCats}
        keyExtractor={c => c.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.catRow}
            onPress={() => router.push({ pathname: '/browse/[category]', params: { category: item.id } })}
            activeOpacity={0.8}
          >
            <View style={[styles.catIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={styles.catInfo}>
              <Text style={styles.catLabel}>{item.label}</Text>
              <Text style={styles.catSub}>
                {item.subcategories.length > 0
                  ? `${item.subcategories.length} subcategories`
                  : 'General'}
                {' • '}{countForCategory(item.id)} listed
              </Text>
              <View style={[styles.catSectionTag, { backgroundColor: item.section === 'services' ? Colors.primaryLight : Colors.accentLight }]}>
                <Text style={[styles.catSectionText, { color: item.section === 'services' ? Colors.primary : Colors.accent }]}>
                  {item.section === 'services' ? 'Services' : 'Goods'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backBtn: { padding: 4 },
  pageTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, color: Colors.textMedium, fontWeight: '500' },
  tabTextActive: { color: Colors.white, fontWeight: '700' },
  grid: { padding: 8 },
  catRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    padding: 12,
    margin: 4,
    gap: 10,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catInfo: { flex: 1 },
  catLabel: { fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  catSub: { fontSize: 11, color: Colors.textLight, marginBottom: 4 },
  catSectionTag: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  catSectionText: { fontSize: 9, fontWeight: '700' },
  separator: { height: 0 },
});
