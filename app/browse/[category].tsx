import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getCategoryById } from '../../constants/categories';
import { useAppStore } from '../../store/useAppStore';
import Header from '../../components/Header';
import ListingCard from '../../components/ListingCard';

export default function CategoryListingsScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const [subFilter, setSubFilter] = useState('');

  const cat = getCategoryById(category ?? '');
  const allClients = useAppStore(s => s.clients);
  const approved = allClients.filter(c => c.status === 'approved');

  const listings = approved.filter(c => c.categories.includes(category ?? ''));

  return (
    <View style={styles.root}>
      <Header />

      {/* Category header */}
      <View style={[styles.catHeader, { backgroundColor: cat?.color ?? Colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.catHeaderIcon}>
          <Ionicons name={(cat?.icon ?? 'grid') as any} size={28} color={Colors.white} />
        </View>
        <View style={styles.catHeaderText}>
          <Text style={styles.catName}>{cat?.label ?? 'Category'}</Text>
          <Text style={styles.catCount}>{listings.length} provider{listings.length !== 1 ? 's' : ''} listed</Text>
        </View>
      </View>

      {/* Subcategory filter */}
      {cat && cat.subcategories.length > 0 && (
        <View style={styles.subFilterWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFilterScroll}>
            <TouchableOpacity
              style={[styles.subChip, !subFilter && styles.subChipActive]}
              onPress={() => setSubFilter('')}
            >
              <Text style={[styles.subChipText, !subFilter && styles.subChipTextActive]}>All</Text>
            </TouchableOpacity>
            {cat.subcategories.map(sub => (
              <TouchableOpacity
                key={sub.id}
                style={[styles.subChip, subFilter === sub.id && styles.subChipActive]}
                onPress={() => setSubFilter(sub.id)}
              >
                <Text style={[styles.subChipText, subFilter === sub.id && styles.subChipTextActive]}>
                  {sub.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {listings.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="business-outline" size={52} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptyText}>Be the first to list in this category!</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/register')}>
            <Text style={styles.emptyBtnText}>Register Your Business</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={c => c.id}
          renderItem={({ item }) => <ListingCard client={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  backBtn: { padding: 4 },
  catHeaderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catHeaderText: { flex: 1 },
  catName: { fontSize: 18, fontWeight: '800', color: Colors.white },
  catCount: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  subFilterWrap: {
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subFilterScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 6 },
  subChip: {
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  subChipActive: { backgroundColor: Colors.primary },
  subChipText: { fontSize: 12, color: Colors.textMedium },
  subChipTextActive: { color: Colors.white, fontWeight: '600' },
  list: { padding: 16, paddingBottom: 32 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textMedium, marginTop: 12 },
  emptyText: { fontSize: 14, color: Colors.textLight, marginTop: 6, textAlign: 'center' },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
