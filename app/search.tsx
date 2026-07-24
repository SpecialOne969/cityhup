import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { STATES, LGAS } from '../constants/locations';
import { CATEGORIES } from '../constants/categories';
import Header from '../components/Header';
import ListingCard from '../components/ListingCard';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: string; section?: string }>();
  const router = useRouter();

  const [query, setQuery] = useState(params.q ?? '');
  const [stateFilter, setStateFilter] = useState('');
  const [lgaFilter, setLgaFilter] = useState('');
  const [catFilter, setCatFilter] = useState(params.category ?? '');
  const [showFilters, setShowFilters] = useState(false);

  const { setSearchFilters, runSearch, searchResults, clients } = useAppStore();

  useEffect(() => {
    setSearchFilters({
      query: params.q ?? '',
      category: params.category ?? '',
    });
    runSearch();
  }, [params.q, params.category]);

  function handleSearch() {
    setSearchFilters({ query, state: stateFilter, lga: lgaFilter, category: catFilter });
    runSearch();
  }

  const approved = clients.filter(c => c.status === 'approved');
  const results = searchResults.length || query || catFilter || stateFilter ? searchResults : approved;

  return (
    <View style={styles.root}>
      <Header />
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={Colors.textLight} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search services, businesses…"
          placeholderTextColor={Colors.textLight}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={() => setShowFilters(f => !f)}>
          <Ionicons name="options-outline" size={20} color={showFilters ? Colors.primary : Colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filters}>
          <Text style={styles.filterLabel}>State</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['', ...STATES.Nigeria].map(s => (
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

          {stateFilter && LGAS[stateFilter] && (
            <>
              <Text style={styles.filterLabel}>LGA</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
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

          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {[{ id: '', label: 'All' }, ...CATEGORIES].map(c => (
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

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
        {(query || catFilter || stateFilter) && (
          <TouchableOpacity onPress={() => {
            setQuery(''); setStateFilter(''); setLgaFilter(''); setCatFilter('');
            setSearchFilters({ query: '' }); runSearch();
          }}>
            <Text style={styles.clearText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.textDark },
  searchBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  searchBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  filters: { backgroundColor: Colors.bgCard, paddingHorizontal: 12, paddingBottom: 8 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: Colors.textMedium, marginTop: 8, marginBottom: 4 },
  filterScroll: { marginBottom: 4 },
  filterChip: {
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 6,
  },
  filterChipActive: { backgroundColor: Colors.primary },
  filterChipText: { fontSize: 12, color: Colors.textMedium },
  filterChipTextActive: { color: Colors.white, fontWeight: '600' },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCount: { fontSize: 13, color: Colors.textMedium, fontWeight: '600' },
  clearText: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textMedium, marginTop: 12 },
  emptyText: { fontSize: 14, color: Colors.textLight, marginTop: 6, textAlign: 'center' },
});
