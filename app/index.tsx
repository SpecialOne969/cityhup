import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Linking, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { CATEGORIES, SERVICE_CATEGORIES, GOODS_CATEGORIES } from '../constants/categories';
import { useAppStore } from '../store/useAppStore';
import Header from '../components/Header';
import AdBanner from '../components/AdBanner';
import ListingCard from '../components/ListingCard';
import ChatBox from '../components/ChatBox';

const FOREST_GREEN = '#008751';
const COUNTRY_CONFIG = [
  { name: 'Nigeria',        flag: '🇳🇬', capital: 'Abuja',    currency: 'NGN ₦',   desc: "West Africa's largest economy" },
  { name: 'Ghana',          flag: '🇬🇭', capital: 'Accra',    currency: 'GHS ₵',   desc: 'Gateway to West Africa' },
  { name: 'Benin Republic', flag: '🇧🇯', capital: 'Cotonou',  currency: 'XOF CFA', desc: 'Heart of West African culture' },
  { name: 'Liberia',        flag: '🇱🇷', capital: 'Monrovia', currency: 'LRD $',   desc: "Africa's oldest republic" },
];

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const clients = useAppStore(s => s.clients);
  const approvedClients = clients.filter(c => c.status === 'approved');
  const [infoVisible, setInfoVisible] = useState(false);

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('ch_info_seen')) {
      setInfoVisible(true);
    }
  }, []);

  function dismissInfo() {
    if (typeof localStorage !== 'undefined') localStorage.setItem('ch_info_seen', '1');
    setInfoVisible(false);
  }

  const featuredListings = approvedClients.slice(0, 4);

  function countForCountry(country: string) {
    return approvedClients.filter(c => c.country === country).length;
  }

  return (
    <View style={styles.root}>
      <Header />

      {/* Important Information Modal */}
      <Modal visible={infoVisible} transparent animationType="fade" onRequestClose={dismissInfo}>
        <View style={styles.modalOverlay}>
          <View style={styles.infoModal}>
            <View style={styles.infoModalHeader}>
              <Ionicons name="information-circle" size={28} color={FOREST_GREEN} />
              <Text style={styles.infoModalTitle}>Important Information</Text>
            </View>
            <ScrollView style={styles.infoModalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.infoItem}>
                <Text style={styles.infoLabel}>🟢 Free to Search:</Text>
                {' '}Browsing and contacting service providers on CityHup is completely free for everyone.
              </Text>
              <Text style={styles.infoItem}>
                <Text style={styles.infoLabel}>✅ Verified Listings:</Text>
                {' '}All business listings are manually verified by City Hup agents before going live.
              </Text>
              <Text style={styles.infoItem}>
                <Text style={styles.infoLabel}>📍 West Africa Coverage:</Text>
                {' '}We currently serve Nigeria, Ghana, Benin Republic, and Liberia with more countries coming soon.
              </Text>
              <Text style={styles.infoItem}>
                <Text style={styles.infoLabel}>🏢 List Your Business:</Text>
                {' '}Businesses can register by tapping "List Business" in the top menu. Listing requires a one-time fee.
              </Text>
              <Text style={styles.infoItem}>
                <Text style={styles.infoLabel}>⚠️ Disclaimer:</Text>
                {' '}CityHup is a directory platform. We do not guarantee the quality of listed providers. Always verify before making payments.
              </Text>
              <Text style={styles.infoItem}>
                <Text style={styles.infoLabel}>📞 Support:</Text>
                {' '}Contact us via WhatsApp or visit any CityHup agent office near you.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.infoModalBtn} onPress={dismissInfo}>
              <Text style={styles.infoModalBtnText}>I Understand — Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Locate Service Providers &</Text>
          <Text style={styles.heroTitle2}>Essential Goods in Your Neighborhood</Text>
          <Text style={styles.heroSub}>West Africa's trusted local directory — find professional skill workers / artisans, stores, goods, schools, properties & more.</Text>
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
                  style={styles.countryCard}
                  onPress={() => router.push({ pathname: '/search', params: { country: country.name } })}
                  activeOpacity={0.85}
                >
                  <View style={styles.countryFlagBox}>
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
                    <View style={styles.countryCountBadge}>
                      <Text style={styles.countryCountNum}>{count}</Text>
                      <Text style={styles.countryCountLabel}>listings</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={FOREST_GREEN} style={{ marginTop: 8 }} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Service Providers Section */}
        <View style={[styles.section, styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Providers</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/search', params: { section: 'services' } } as any)}>
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
            <TouchableOpacity onPress={() => router.push({ pathname: '/search', params: { section: 'goods' } } as any)}>
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
    borderColor: FOREST_GREEN,
    overflow: 'hidden',
  },
  countryFlagBox: {
    width: 72,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#E8F5E9',
  },
  countryFlag: { fontSize: 36, lineHeight: 42 },
  countryInfo: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, gap: 2 },
  countryName: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
  countryCapital: { fontSize: 11, color: Colors.textLight, marginTop: 1 },
  countryCurrency: { fontSize: 11, color: FOREST_GREEN, fontWeight: '700' },
  countryDesc: { fontSize: 11, color: Colors.textLight, marginTop: 3, lineHeight: 15 },
  countryRight: { alignItems: 'center', paddingRight: 12, paddingVertical: 12 },
  countryCountBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    minWidth: 52,
    backgroundColor: FOREST_GREEN,
  },
  countryCountNum: { fontSize: 17, fontWeight: '900', color: Colors.white },
  countryCountLabel: { fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: '600', textTransform: 'uppercase' },

  // Info modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoModal: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    overflow: 'hidden',
    borderTopWidth: 4,
    borderTopColor: FOREST_GREEN,
    maxHeight: '85%',
  },
  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoModalTitle: { fontSize: 17, fontWeight: '800', color: Colors.textDark },
  infoModalBody: { padding: 20, maxHeight: 360 },
  infoItem: { fontSize: 13, color: Colors.textMedium, lineHeight: 20, marginBottom: 14 },
  infoLabel: { fontWeight: '700', color: Colors.textDark },
  infoModalBtn: {
    backgroundColor: FOREST_GREEN,
    margin: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  infoModalBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },

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
