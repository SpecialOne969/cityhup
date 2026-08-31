import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { getCategoryById } from '../constants/categories';
import ListingCard from '../components/ListingCard';

export default function CustomerDashboardScreen() {
  const router = useRouter();
  const currentCustomer = useAppStore(s => s.currentCustomer);
  const customers = useAppStore(s => s.currentCustomer);
  const clients = useAppStore(s => s.clients);
  const customerLogout = useAppStore(s => s.customerLogout);

  useEffect(() => {
    if (!currentCustomer) router.replace('/customer-login');
  }, [currentCustomer]);

  if (!currentCustomer) return null;

  const approved = clients.filter(c => c.status === 'approved' && !c.isIndebted);

  const nearbyListings = currentCustomer.state
    ? approved.filter(c => c.state === currentCustomer.state)
    : approved;

  const interestListings = currentCustomer.interestedCategories.length > 0
    ? approved.filter(c => c.categories.some(cat => currentCustomer.interestedCategories.includes(cat)))
    : [];

  async function handleLogout() {
    await customerLogout();
    router.replace('/');
  }

  const firstName = currentCustomer.fullName.split(' ')[0];

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.headerBack}>
          <Ionicons name="home-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Dashboard</Text>
          <Text style={styles.headerSub}>Hi, {firstName}!</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome card */}
        <View style={styles.welcomeCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color={Colors.primary} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeName}>{currentCustomer.fullName}</Text>
            <Text style={styles.welcomeEmail}>{currentCustomer.email}</Text>
            {currentCustomer.state && (
              <View style={styles.locationBadge}>
                <Ionicons name="location-outline" size={12} color={Colors.primary} />
                <Text style={styles.locationText}>{currentCustomer.lga ? `${currentCustomer.lga}, ` : ''}{currentCustomer.state}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{nearbyListings.length}</Text>
            <Text style={styles.statLabel}>Near You</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{interestListings.length}</Text>
            <Text style={styles.statLabel}>Your Interests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{approved.length}</Text>
            <Text style={styles.statLabel}>Total Listings</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/search')}>
            <Ionicons name="search" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Search All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/browse')}>
            <Ionicons name="grid-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Browse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push({ pathname: '/search', params: { state: currentCustomer.state } })}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>My Area</Text>
          </TouchableOpacity>
        </View>

        {/* Interested categories */}
        {currentCustomer.interestedCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Interests</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
              {currentCustomer.interestedCategories.map(catId => {
                const cat = getCategoryById(catId);
                if (!cat) return null;
                return (
                  <TouchableOpacity
                    key={catId}
                    style={[styles.catChip, { borderColor: cat.color }]}
                    onPress={() => router.push({ pathname: '/browse/[category]', params: { category: catId } })}
                  >
                    <View style={[styles.catChipIcon, { backgroundColor: cat.color + '22' }]}>
                      <Ionicons name={cat.icon as any} size={14} color={cat.color} />
                    </View>
                    <Text style={[styles.catChipText, { color: cat.color }]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Nearby listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {currentCustomer.state ? `Providers in ${currentCustomer.state}` : 'All Providers'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {nearbyListings.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No providers found in your area yet.</Text>
              <TouchableOpacity onPress={() => router.push('/search')}>
                <Text style={styles.emptyLink}>Browse all listings →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            nearbyListings.slice(0, 5).map(client => (
              <ListingCard key={client.id} client={client} />
            ))
          )}
        </View>

        {/* Interest-based listings */}
        {interestListings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Based on Your Interests</Text>
            {interestListings.slice(0, 3).map(client => (
              <ListingCard key={client.id} client={client} />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerBack: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  logoutBtn: { padding: 4 },
  scroll: { flex: 1 },

  welcomeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.bgCard, margin: 16, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: Colors.borderLight,
  },
  avatarCircle: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  welcomeText: { flex: 1 },
  welcomeName: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  welcomeEmail: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  locationText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },

  statsRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 4,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 12,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  statNum: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textLight, marginTop: 2, fontWeight: '500' },

  actionsRow: {
    flexDirection: 'row', gap: 10, padding: 16, paddingTop: 12,
  },
  actionBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    backgroundColor: Colors.bgCard, borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  actionText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark, marginBottom: 10 },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: Colors.bgCard,
  },
  catChipIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  catChipText: { fontSize: 12, fontWeight: '600' },

  emptyBox: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: Colors.textMedium, textAlign: 'center' },
  emptyLink: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
});
