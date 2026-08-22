import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Client } from '../types';
import { Colors } from '../constants/colors';
import { CATEGORIES } from '../constants/categories';

interface Props {
  client: Client;
  compact?: boolean;
}

export default function ListingCard({ client, compact = false }: Props) {
  const router = useRouter();

  const primaryCat = CATEGORIES.find(c => c.id === client.categories[0]);

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => router.push({ pathname: '/listing/[id]', params: { id: client.id } })}
      activeOpacity={0.85}
    >
      {/* Header strip */}
      <View style={[styles.strip, { backgroundColor: primaryCat?.color ?? Colors.primary }]}>
        <Ionicons
          name={(primaryCat?.icon ?? 'business') as any}
          size={20}
          color={Colors.white}
        />
        <Text style={styles.stripLabel} numberOfLines={1}>
          {primaryCat?.label ?? 'Service Provider'}
        </Text>
        {client.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={10} color={Colors.primaryDark} />
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        )}
        {client.type === 'corporate' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Corporate</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{client.businessName}</Text>
        <Text style={styles.competence} numberOfLines={compact ? 1 : 2}>
          {client.competence}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textLight} />
          <Text style={styles.locationText} numberOfLines={1}>
            {client.area}, {client.city}, {client.state}
          </Text>
        </View>

        {!compact && (
          <Text style={styles.profile} numberOfLines={3}>{client.profile}</Text>
        )}

        <View style={styles.footer}>
          {client.rating != null && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={Colors.gold} />
              <Text style={styles.ratingText}>{client.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({client.reviewCount})</Text>
            </View>
          )}
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={13} color={Colors.primary} />
            <Text style={styles.phone}>{client.phone}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardCompact: { marginBottom: 8 },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
  },
  stripLabel: { flex: 1, color: Colors.white, fontSize: 12, fontWeight: '600' },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  premiumBadgeText: { color: Colors.primaryDark, fontSize: 10, fontWeight: '800' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '600' },
  body: { padding: 12 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 3 },
  competence: { fontSize: 12, color: Colors.textMedium, marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  locationText: { fontSize: 12, color: Colors.textLight, flex: 1 },
  profile: { fontSize: 13, color: Colors.textMedium, lineHeight: 19, marginBottom: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '700', color: Colors.textDark },
  ratingCount: { fontSize: 11, color: Colors.textLight },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  phone: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
});
