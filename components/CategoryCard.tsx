import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../constants/categories';
import { Colors } from '../constants/colors';

interface Props {
  category: Category;
  size?: 'small' | 'medium' | 'large';
  count?: number;
}

export default function CategoryCard({ category, size = 'medium', count }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.card, styles[size]]}
      onPress={() => router.push({ pathname: '/browse/[category]', params: { category: category.id } })}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrap, { backgroundColor: category.color + '22' }]}>
        <Ionicons name={category.icon as any} size={size === 'large' ? 28 : size === 'small' ? 18 : 22} color={category.color} />
      </View>
      <Text style={[styles.label, size === 'small' && styles.labelSmall]} numberOfLines={2}>
        {category.label}
      </Text>
      {count != null && (
        <Text style={styles.count}>{count} listed</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    margin: 4,
  },
  small: { minWidth: 80, maxWidth: 100, padding: 8 },
  medium: { minWidth: 100, maxWidth: 130, padding: 12 },
  large: { minWidth: 130, maxWidth: 160, padding: 16 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textDark, textAlign: 'center', lineHeight: 16 },
  labelSmall: { fontSize: 10 },
  count: { fontSize: 10, color: Colors.textLight, marginTop: 3 },
});
