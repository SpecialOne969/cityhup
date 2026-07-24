import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_W = Math.min(SCREEN_W - 32, 400);

const MOCK_ADS = [
  { id: 1, title: 'Advertise Your Business Here', subtitle: 'Reach thousands of customers in your area', color: Colors.accent, icon: 'megaphone' },
  { id: 2, title: 'New Listings This Week', subtitle: 'Discover fresh service providers near you', color: '#7B1FA2', icon: 'sparkles' },
  { id: 3, title: 'CityHup Premium', subtitle: 'Get your business featured at the top of searches', color: '#0277BD', icon: 'star' },
];

export default function AdBanner() {
  const trafficCount = useAppStore(s => s.trafficCount);
  const incrementTraffic = useAppStore.getState().incrementTraffic;
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    incrementTraffic();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (activeIndex + 1) % MOCK_ADS.length;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * BANNER_W, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <View style={styles.wrapper}>
      {/* Traffic counter */}
      <View style={styles.traffic}>
        <Ionicons name="eye-outline" size={14} color={Colors.textLight} />
        <Text style={styles.trafficText}>Site visits: </Text>
        <Text style={styles.trafficCount}>{trafficCount.toLocaleString()}</Text>
      </View>

      {/* Ad carousel */}
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
        {MOCK_ADS.map(ad => (
          <TouchableOpacity
            key={ad.id}
            style={[styles.adCard, { width: BANNER_W, backgroundColor: ad.color }]}
            activeOpacity={0.9}
          >
            <Ionicons name={ad.icon as any} size={32} color="rgba(255,255,255,0.5)" />
            <View style={styles.adText}>
              <Text style={styles.adTitle}>{ad.title}</Text>
              <Text style={styles.adSub}>{ad.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {MOCK_ADS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 12 },
  traffic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 3,
  },
  trafficText: { fontSize: 11, color: Colors.textLight },
  trafficCount: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  carousel: {},
  adCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    minHeight: 80,
  },
  adText: { flex: 1 },
  adTitle: { color: Colors.white, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  adSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 18 },
});
