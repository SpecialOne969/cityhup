import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { COUNTRIES, STATES, LGAS } from '../constants/locations';
import { CATEGORIES } from '../constants/categories';
import Header from '../components/Header';
import ListingCard from '../components/ListingCard';

type SortOption = 'best' | 'rating' | 'newest' | 'premium';

const SORT_LABELS: Record<SortOption, string> = {
  best: 'Best Match',
  rating: 'Top Rated',
  newest: 'Newest',
  premium: 'Premium First',
};

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: string; country?: string }>();
  const router = useRouter();

  const [query, setQuery] = useState(params.q ?? '');
  const [countryFilter, setCountryFilter] = useState(params.country ?? '');
  const [stateFilter, setStateFilter] = useState('');
  const [lgaFilter, setLgaFilter] = useState('');
  const [catFilter, setCatFilter] = useState(params.category ?? '');
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const { setSearchFilters, runSearch, searchResults, clients } = useAppStore();
  const didMount = useRef(false);

  const executeSearch = useCallback((overrides?: {
    query?: string; country?: string; state?: string; lga?: string; category?: string;
  }) => {
    const q = overrides?.query ?? query;
    const country = overrides?.country ?? countryFilter;
    const state = overrides?.state ?? stateFilter;
    const lga = overrides?.lga ?? lgaFilter;
    const category = overrides?.category ?? catFilter;
    setSearchFilters({ query: q, country, state, lga, category });
    runSearch();
  }, [query, countryFilter, stateFilter, lgaFilter, catFilter]);

  // Initial load / param changes
  useEffect(() => {
    setQuery(params.q ?? '');
    setCatFilter(params.category ?? '');
    setCountryFilter(params.country ?? '');
    setSearchFilters({ query: params.q ?? '', category: params.category ?? '', country: params.country ?? '' });
    runSearch();
  }, [params.q, params.category, params.country]);

  // Auto-run when filters change (after mount)
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    executeSearch();
  }, [countryFilter, stateFilter, lgaFilter, catFilter]);

  const approved = clients.filter(c => c.status === 'approved');
  const hasActiveFilter = query || catFilter || stateFilter || countryFilter || lgaFilter;
  const baseResults = hasActiveFilter ? searchResults : approved;

  const results = [...baseResults].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortBy === 'newest') return new Date(b.registeredAt ?? 0).getTime() - new Date(a.registeredAt ?? 0).getTime();
    if (sortBy === 'premium') return (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0);
    // 'best': premium first, then rating
    if ((b.isPremium ? 1 : 0) !== (a.isPremium ? 1 : 0)) return (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0);
    return (b.rating ?? 0) - (a.rating ?? 0);
  });

  function clearAll() {
    setQuery(''); setCountryFilter(''); setStateFilter(''); setLgaFilter(''); setCatFilter('');
    setSearchFilters({ query: '' }); runSearch();
  }

  const activeCatLabel = CATEGORIES.find(c => c.id === catFilter)?.label;
  const activeFilterChips = [
    countryFilter && { key: 'country', label: countryFilter, clear: () => { setCountryFilter(''); setStateFilter(''); setLgaFilter(''); } },
    stateFilter && { key: 'state', label: stateFilter, clear: () => { setStateFilter(''); setLgaFilter(''); } },
    lgaFilter && { key: 'lga', label: lgaFilter, clear: () => setLgaFilter('') },
    catFilter && activeCatLabel && { key: 'cat', label: activeCatLabel, clear: () => setCatFilter('') },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  return (
    <View style={styles.root}>
      <Header />

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Colors.textLight} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search services, businesses…"
            placeholderTextColor={Colors.textLight}
            returnKeyType="search"
            onSubmitEditing={() => executeSearch()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); executeSearch({ query: '' }); }}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, showFilters && { backgroundColor: Colors.primaryLight }]}
          onPress={() => { setShowFilters(f => !f); setShowSort(false); }}
        >
          <Ionicons name="options-outline" size={19} color={showFilters ? Colors.primary : Colors.textMedium} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, showSort && { backgroundColor: Colors.primaryLight }]}
          onPress={() => { setShowSort(s => !s); setShowFilters(false); }}
        >
          <Ionicons name="swap-vertical-outline" size={19} color={showSort ? Colors.primary : Colors.textMedium} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn} onPress={() => executeSearch()}>
          <Text style={styles.searchBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* Sort options */}
      {showSort && (
        <View style={styles.sortRow}>
          {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.sortChip, sortBy === opt && styles.sortChipActive]}
              onPress={() => { setSortBy(opt); setShowSort(false); }}
            >
              {opt === 'premium' && <Ionicons name="star" size={11} color={sortBy === opt ? Colors.gold : Colors.textMedium} />}
              <Text style={[styles.sortChipText, sortBy === opt && styles.sortChipTextActive]}>
                {SORT_LABELS[opt]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Filters panel */}
      {showFilters && (
        <View style={styles.filters}>
          {/* Country */}
          <Text style={styles.filterLabel}>Country</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {['', ...COUNTRIES].map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.filterChip, countryFilter === c && styles.filterChipActive]}
                onPress={() => { setCountryFilter(c); setStateFilter(''); setLgaFilter(''); }}
              >
                <Text style={[styles.filterChipText, countryFilter === c && styles.filterChipTextActive]}>
                  {c || 'All Countries'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* State */}
          <Text style={styles.filterLabel}>State / Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {(['', ...(countryFilter ? STATES[countryFilter] : Object.values(STATES).flat())]).map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.filterChip, stateFilter === s && styles.filterChipActive]}
                onPress={() => { setStateFilter(s); setLgaFilter(''); }}
              >
                <Text style={[styles.filterChipText, stateFilter === s && styles.filterChipTextActive]}>
                  {s || 'All States'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* LGA (only if a state is selected and it has LGAs) */}
          {stateFilter && LGAS[stateFilter] && (
            <>
              <Text style={styles.filterLabel}>LGA</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
                {['', ...LGAS[stateFilter]].map(l => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.filterChip, lgaFilter === l && styles.filterChipActive]}
                    onPress={() => setLgaFilter(l)}
                  >
                    <Text style={[styles.filterChipText, lgaFilter === l && styles.filterChipTextActive]}>
                      {l || 'All LGAs'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Category */}
          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {[{ id: '', label: 'All Categories' }, ...CATEGORIES].map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.filterChip, catFilter === c.id && styles.filterChipActive]}
                onPress={() => setCatFilter(c.id)}
              >
                <Text style={[styles.filterChipText, catFilter === c.id && styles.filterChipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Active filter chips (visible when filters panel is closed) */}
      {!showFilters && activeFilterChips.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeChipsRow}>
          {activeFilterChips.map(chip => (
            <TouchableOpacity key={chip.key} style={styles.activeChip} onPress={chip.clear}>
              <Text style={styles.activeChipText}>{chip.label}</Text>
              <Ionicons name="close" size={12} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Results header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {results.length} result{results.length !== 1 ? 's' : ''}
          {sortBy !== 'best' && <Text style={styles.sortLabel}> · {SORT_LABELS[sortBy]}</Text>}
        </Text>
        {hasActiveFilter && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
          {hasActiveFilter && (
            <TouchableOpacity style={styles.clearAllBtn} onPress={clearAll}>
              <Text style={styles.clearAllBtnText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={results}
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
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgLight, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 11, fontSize: 14, color: Colors.textDark },
  iconBtn: {
    width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard,
  },
  searchBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  searchBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  sortRow: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    flexWrap: 'wrap',
  },
  sortChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: Colors.borderLight, borderWidth: 1, borderColor: Colors.border,
  },
  sortChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  sortChipText: { fontSize: 12, color: Colors.textMedium, fontWeight: '500' },
  sortChipTextActive: { color: Colors.primary, fontWeight: '700' },

  filters: {
    backgroundColor: Colors.bgCard, paddingHorizontal: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  filterLabel: { fontSize: 11, fontWeight: '700', color: Colors.textLight, marginTop: 10, marginBottom: 5, textTransform: 'uppercase' },
  filterScrollContent: { gap: 6, paddingBottom: 2 },
  filterChip: {
    backgroundColor: Colors.borderLight, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, color: Colors.textMedium, fontWeight: '500' },
  filterChipTextActive: { color: Colors.white, fontWeight: '600' },

  activeChipsRow: { paddingHorizontal: 12, paddingVertical: 7, gap: 6 },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryLight, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.primary,
  },
  activeChipText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  resultsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 9,
  },
  resultsCount: { fontSize: 13, color: Colors.textMedium, fontWeight: '600' },
  sortLabel: { color: Colors.primary },
  clearText: { fontSize: 13, color: Colors.accent, fontWeight: '600' },

  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textMedium, marginTop: 12 },
  emptyText: { fontSize: 14, color: Colors.textLight, marginTop: 6, textAlign: 'center' },
  clearAllBtn: {
    marginTop: 16, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: Colors.primaryLight, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary,
  },
  clearAllBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});
