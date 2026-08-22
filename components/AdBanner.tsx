import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_W = Math.min(SCREEN_W - 32, 400);

const FALLBACK_ADS = [
  { id: 'f1', title: 'Advertise Your Business Here', subtitle: 'Reach thousands of customers in your area', bgColor: Colors.accent, icon: 'megaphone', linkType: 'external' as const },
  { id: 'f2', title: 'New Listings This Week', subtitle: 'Discover fresh service providers near you', bgColor: '#7B1FA2', icon: 'sparkles', linkType: 'external' as const },
  { id: 'f3', title: 'CityHup Premium', subtitle: 'Get your business featured at the top of searches', bgColor: '#0277BD', icon: 'star', linkType: 'external' as const },
];

export default function AdBanner() {
  const router = useRouter();
  const trafficCount = useAppStore(s => s.trafficCount);
  const incrementTraffic = useAppStore.getState().incrementTraffic;
  const ads = useAppStore(s => s.ads);
  const storeAds = ads.filter(a => a.isActive);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayAds = storeAds.length > 0
    ? storeAds.map(a => ({ id: a.id, title: a.title, subtitle: a.subtitle ?? '', bgColor: a.bgColor, icon: a.icon, linkType: a.linkType, linkUrl: a.linkUrl, linkClientId: a.linkClientId }))
    : FALLBACK_ADS;

  useEffect(() => {
    incrementTraffic();
  }, []);

  useEffect(() => {
    if (displayAds.length <= 1) return;
    const interval = setInterval(() => {
      const next = (activeIndex + 1) % displayAds.length;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * BANNER_W, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, displayAds.length]);

  function handleAdPress(ad: typeof displayAds[0]) {
    if (ad.linkType === 'client' && ad.linkClientId) {
      router.push({ pathname: '/listing/[id]', params: { id: ad.linkClientId } });
    } else if (ad.linkType === 'category' && ad.linkUrl) {
      router.push({ pathname: '/browse/[category]', params: { category: ad.linkUrl } });
    } else if (ad.linkType === 'external' && ad.linkUrl) {
      Linking.openURL(ad.linkUrl);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.traffic}>
        <Ionicons name="eye-outline" size={14} color={Colors.textLight} />
        <Text style={styles.trafficText}>Site visits: </Text>
        <Text style={styles.trafficCount}>{trafficCount.toLocaleString()}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_W);
          setActiveIndex(idx);
        }}
        style={styles.carousel}
      >
        {displayAds.map(ad => (
          <TouchableOpacity
            key={ad.id}
            style={[styles.adCard, { width: BANNER_W, backgroundColor: ad.bgColor }]}
            activeOpacity={0.9}
            onPress={() => handleAdPress(ad)}
          >
            <Ionicons name={ad.icon as any} size={32} color="rgba(255,255,255,0.5)" />
            <View style={styles.adText}>
              <Text style={styles.adTitle}>{ad.title}</Text>
              {ad.subtitle ? <Text style={styles.adSub}>{ad.subtitle}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {displayAds.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 12 },
  traffic: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    paddingHorizontal: 16, marginBottom: 8, gap: 3,
  },
  trafficText: { fontSize: 11, color: Colors.textLight },
  trafficCount: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  carousel: {},
  adCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, marginHorizontal: 16, borderRadius: 12, gap: 12, minHeight: 80,
  },
  adText: { flex: 1 },
  adTitle: { color: Colors.white, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  adSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 18 },
});
