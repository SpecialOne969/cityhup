import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { CATEGORIES, QUICK_CATEGORIES, SERVICE_CATEGORIES, GOODS_CATEGORIES } from '../constants/categories';
import { useAppStore } from '../store/useAppStore';
import Header from '../components/Header';
import AdBanner from '../components/AdBanner';
import ListingCard from '../components/ListingCard';
import CategoryCard from '../components/CategoryCard';
import ChatBox from '../components/ChatBox';
import ThemeSwitcher from '../components/ThemeSwitcher';

const { width } = Dimensions.get('window');

const COUNTRY_CONFIG = [
  {
    name: 'Nigeria',
    flag: '🇳🇬',
    capital: 'Abuja',
    currency: 'NGN ₦',
    color: '#008751',
    bg: '#E8F5E9',
    desc: 'West Africa\'s largest economy',
  },
  {
    name: 'Ghana',
    flag: '🇬🇭',
    capital: 'Accra',
    currency: 'GHS ₵',
    color: '#006B3F',
    bg: '#FFF8E1',
    desc: 'Gateway to West Africa',
  },
  {
    name: 'Benin Republic',
    flag: '🇧🇯',
    capital: 'Cotonou',
    currency: 'XOF CFA',
    color: '#008751',
    bg: '#FFF3E0',
    desc: 'Birthplace of Voodoo culture',
  },
  {
    name: 'Liberia',
    flag: '🇱🇷',
    capital: 'Monrovia',
    currency: 'LRD $',
    color: '#BF0A30',
    bg: '#FFEBEE',
    desc: 'Africa\'s oldest republic',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const clients = useAppStore(s => s.clients);
  const approvedClients = clients.filter(c => c.status === 'approved');

  const featuredListings = approvedClients.slice(0, 4);

  function countForCategory(catId: string) {
    return clients.filter(c => c.status === 'approved' && c.categories.includes(catId)).length;
  }

  function countForCountry(country: string) {
    return approvedClients.filter(c => c.country === country).length;
  }

  const quickCats = QUICK_CATEGORIES.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean) as typeof CATEGORIES;

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Locate Service Providers &</Text>
          <Text style={styles.heroTitle2}>Essential Goods in Your Neighborhood</Text>
          <Text style={styles.heroSub}>West Africa's trusted local directory — find artisans, stores, schools, properties & more.</Text>
          <View style={styles.heroCtas}>
            <TouchableOpacity style={styles.heroBtnPrimary} onPress={() => router.push('/browse')}>
              <Ionicons name="grid-outline" size={16} color={Colors.white} />
              <Text style={styles.heroBtnPrimaryText}>Browse All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroBtnSecondary} onPress={() => router.push('/search')}>
              <Ionicons name="search-outline" size={16} color={Colors.primary} />
              <Text style={styles.heroBtnSecondaryText}>Search Near Me</Text>
            </TouchableOpacity>
          </View>

          {/* Quick stat chips */}
          <View style={styles.statRow}>
            <TouchableOpacity style={styles.statChip} onPress={() => router.push('/search')}>
              <Ionicons name="people-outline" size={14} color={Colors.primary} />
              <Text style={styles.statText}>{approvedClients.length}+ Providers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statChip} onPress={() => router.push('/browse')}>
              <Ionicons name="grid-outline" size={14} color={Colors.primary} />
              <Text style={styles.statText}>{CATEGORIES.length} Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statChip}
              onPress={() => scrollRef.current?.scrollTo({ y: 600, animated: true })}
            >
              <Text style={styles.statFlag}>🌍</Text>
              <Text style={styles.statText}>4 Countries</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ad Banner + Traffic */}
        <AdBanner />

        {/* Browse by Country */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Country</Text>
            <Text style={styles.countrySubtitle}>West Africa</Text>
          </View>
          <View style={styles.countryGrid}>
            {COUNTRY_CONFIG.map(country => {
              const count = countForCountry(country.name);
              return (
                <TouchableOpacity
                  key={country.name}
                  style={[styles.countryCard, { borderColor: country.color }]}
                  onPress={() => router.push({ pathname: '/search', params: { country: country.name } })}
                  activeOpacity={0.85}
                >
                  <View style={[styles.countryFlagBox, { backgroundColor: country.bg }]}>
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                  </View>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{country.name}</Text>
                    <Text style={styles.countryCapital}>
                      <Ionicons name="location-outline" size={10} color={Colors.textLight} /> {country.capital}
                    </Text>
                    <Text style={styles.countryCurrency}>{country.currency}</Text>
                    <Text style={styles.countryDesc} numberOfLines={2}>{country.desc}</Text>
                  </View>
                  <View style={styles.countryRight}>
                    <View style={[styles.countryCountBadge, { backgroundColor: country.color }]}>
                      <Text style={styles.countryCountNum}>{count}</Text>
                      <Text style={styles.countryCountLabel}>listings</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={country.color} style={{ marginTop: 8 }} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Category Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <TouchableOpacity onPress={() => router.push('/browse')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={quickCats}
            keyExtractor={c => c.id}
            numColumns={4}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={{ flex: 1, maxWidth: '25%' }}>
                <CategoryCard category={item} size="small" count={countForCategory(item.id)} />
              </View>
            )}
            columnWrapperStyle={{ justifyContent: 'flex-start' }}
          />
        </View>

        {/* Service Providers Section */}
        <View style={[styles.section, styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Providers</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/search', params: { section: 'services' } })}>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {SERVICE_CATEGORIES.slice(0, 10).map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={styles.serviceChip}
                onPress={() => router.push({ pathname: '/browse/[category]', params: { category: cat.id } })}
              >
                <View style={[styles.serviceChipIcon, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon as any} size={16} color={Colors.white} />
                </View>
                <Text style={styles.serviceChipLabel} numberOfLines={2}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Goods & Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Goods & Services</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/search', params: { section: 'goods' } })}>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {GOODS_CATEGORIES.slice(0, 10).map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={styles.serviceChip}
                onPress={() => router.push({ pathname: '/browse/[category]', params: { category: cat.id } })}
              >
                <View style={[styles.serviceChipIcon, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon as any} size={16} color={Colors.white} />
                </View>
                <Text style={styles.serviceChipLabel} numberOfLines={2}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Listings */}
        {featuredListings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Listings</Text>
              <TouchableOpacity onPress={() => router.push('/search')}>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            </View>
            {featuredListings.map(client => (
              <ListingCard key={client.id} client={client} />
            ))}
          </View>
        )}

        {/* How it Works */}
        <View style={[styles.section, { backgroundColor: Colors.primaryLight, borderRadius: 12, marginHorizontal: 16 }]}>
          <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 16 }]}>How CityHup Works</Text>
          {[
            { icon: 'search', title: 'Search', desc: 'Find any service provider or goods in your area' },
            { icon: 'call', title: 'Contact', desc: 'Call or message the provider directly' },
            { icon: 'checkmark-circle', title: 'Verified', desc: 'All listings are verified by City Hup agents' },
          ].map((step, i) => (
            <View key={i} style={styles.howStep}>
              <View style={styles.howNum}><Text style={styles.howNumText}>{i + 1}</Text></View>
              <Ionicons name={step.icon as any} size={22} color={Colors.primary} />
              <View style={styles.howText}>
                <Text style={styles.howTitle}>{step.title}</Text>
                <Text style={styles.howDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>CITY<Text style={{ color: Colors.gold }}>HUP</Text></Text>
          <Text style={styles.footerTag}>Your Neighborhood Directory</Text>
          <Text style={styles.footerText}>© 2026 City Hup Ltd. All rights reserved.</Text>
          <Text style={styles.footerText}>Lagos, Lagos State, Nigeria</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/admin/login')}>
              <Text style={styles.footerLink}>Admin Portal</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}>List Your Business</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => router.push('/browse')}>
              <Text style={styles.footerLink}>Browse All</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => router.push('/disclaimer')}>
              <Text style={styles.footerLink}>Disclaimer</Text>
            </TouchableOpacity>
          </View>

          {/* Social Media */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL('https://facebook.com')}>
              <Ionicons name="logo-facebook" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL('https://twitter.com')}>
              <Ionicons name="logo-twitter" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL('https://instagram.com')}>
              <Ionicons name="logo-instagram" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL('https://wa.me/2348000000000')}>
              <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL('https://youtube.com')}>
              <Ionicons name="logo-youtube" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <ChatBox />
      <ThemeSwitcher />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  scroll: { flex: 1 },

  // Hero
  hero: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, lineHeight: 28 },
  heroTitle2: { fontSize: 22, fontWeight: '800', color: Colors.gold, lineHeight: 28, marginBottom: 8 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 20, lineHeight: 19 },
  heroCtas: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  heroBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 13,
  },
  heroBtnPrimaryText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  heroBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 13,
  },
  heroBtnSecondaryText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  statRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  statFlag: { fontSize: 14, lineHeight: 18 },

  // Country section
  countrySubtitle: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic' },
  countryGrid: { gap: 10 },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  countryFlagBox: {
    width: 72,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  countryFlag: { fontSize: 36, lineHeight: 42 },
  countryInfo: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, gap: 2 },
  countryName: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
  countryCapital: { fontSize: 11, color: Colors.textLight, marginTop: 1 },
  countryCurrency: { fontSize: 11, color: Colors.textMedium, fontWeight: '600' },
  countryDesc: { fontSize: 11, color: Colors.textLight, marginTop: 3, lineHeight: 15 },
  countryRight: {
    alignItems: 'center',
    paddingRight: 12,
    paddingVertical: 12,
  },
  countryCountBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    minWidth: 52,
  },
  countryCountNum: { fontSize: 17, fontWeight: '900', color: Colors.white },
  countryCountLabel: { fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: '600', textTransform: 'uppercase' },

  // Sections
  section: { padding: 16, marginBottom: 4 },
  sectionDark: { backgroundColor: Colors.bgLight },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  // Horizontal scroll
  hScroll: { paddingRight: 16, gap: 10 },
  serviceChip: {
    alignItems: 'center',
    width: 90,
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  serviceChipIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  serviceChipLabel: { fontSize: 11, color: Colors.textDark, textAlign: 'center', lineHeight: 14, fontWeight: '500' },

  // How it works
  howStep: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  howNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howNumText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  howText: { flex: 1 },
  howTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  howDesc: { fontSize: 12, color: Colors.textMedium },

  // Footer
  footer: {
    backgroundColor: Colors.primaryDark,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  footerLogo: { fontSize: 24, fontWeight: '900', color: Colors.white, letterSpacing: 2 },
  footerTag: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 12 },
  footerText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  footerLink: { color: Colors.gold, fontSize: 12, fontWeight: '600' },
  footerDot: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: 10, marginTop: 16, justifyContent: 'center' },
  socialBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
});
