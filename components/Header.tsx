import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      router.push({ pathname: '/search', params: { q: query.trim() } });
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>CITY</Text>
            <Text style={styles.logoAccent}>HUP</Text>
          </View>
          <Text style={styles.tagline}>Your Neighborhood Directory</Text>
        </TouchableOpacity>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, goods, providers…"
            placeholderTextColor={Colors.textLight}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity style={styles.adminBtn} onPress={() => router.push('/admin/login')}>
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.white} />
            <Text style={styles.adminBtnText}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/register')}>
            <Ionicons name="person-add-outline" size={16} color={Colors.accent} />
            <Text style={styles.registerBtnText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nav bar */}
      <View style={styles.navBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/browse')}>
            <Text style={styles.navText}>Browse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push({ pathname: '/search', params: { category: 'property-agent' } })}>
            <Text style={styles.navText}>Properties</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push({ pathname: '/search', params: { category: 'job-vacancy' } })}>
            <Text style={styles.navText}>Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push({ pathname: '/search', params: { category: 'super-store' } })}>
            <Text style={styles.navText}>Stores</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push({ pathname: '/search', params: { category: 'event-entertainment' } })}>
            <Text style={styles.navText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push({ pathname: '/search', params: { category: 'automobile' } })}>
            <Text style={styles.navText}>Automobiles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/browse')}>
            <Text style={styles.navText}>All Categories</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.primary,
    ...Platform.select({
      web: { position: 'sticky' as any, top: 0, zIndex: 100 },
    }),
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    flexWrap: 'wrap',
  },
  logoWrap: { alignItems: 'flex-start', minWidth: 100 },
  logoBox: { flexDirection: 'row', alignItems: 'baseline' },
  logoText: { fontSize: 22, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  logoAccent: { fontSize: 22, fontWeight: '900', color: Colors.gold, letterSpacing: 1 },
  tagline: { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    minWidth: 200,
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.textDark,
  },
  searchBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActions: { flexDirection: 'row', gap: 8 },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  adminBtnText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  registerBtnText: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  navBar: { backgroundColor: Colors.primaryDark },
  navScroll: { paddingHorizontal: 12 },
  navItem: { paddingHorizontal: 14, paddingVertical: 10 },
  navText: { color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: '500' },
});
