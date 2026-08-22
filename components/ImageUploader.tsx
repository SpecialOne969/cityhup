import React from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { pickImages } from '../lib/uploadImage';

interface Props {
  images: string[];
  onChange: (imgs: string[]) => void;
  maxImages?: number;
  label?: string;
  note?: string;
  uploading?: boolean;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 5,
  label,
  note,
  uploading = false,
}: Props) {
  async function handlePick() {
    try {
      const uris = await pickImages(maxImages > 1);
      if (uris.length === 0) return;
      const merged = [...images, ...uris].slice(0, maxImages);
      onChange(merged);
    } catch (e: any) {
      // permission denied — silent on web
    }
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  const canAdd = images.length < maxImages && !uploading;

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      {note && <Text style={styles.note}>{note}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {images.map((uri, i) => (
          <View key={i} style={styles.thumb}>
            <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
            {uploading ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color={Colors.white} />
              </View>
            ) : (
              <TouchableOpacity style={styles.removeBtn} onPress={() => remove(i)}>
                <Ionicons name="close-circle" size={20} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {canAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={handlePick}>
            <Ionicons name="camera-outline" size={26} color={Colors.primary} />
            <Text style={styles.addBtnText}>
              {maxImages === 1 ? 'Choose Photo' : 'Add Photo'}
            </Text>
            {maxImages > 1 && (
              <Text style={styles.addBtnCount}>{images.length}/{maxImages}</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 4 },
  note: { fontSize: 11, color: Colors.textLight, marginBottom: 8, lineHeight: 16 },
  row: { gap: 8, paddingBottom: 4 },
  thumb: { width: 90, height: 90, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumbImg: { width: 90, height: 90, borderRadius: 10 },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  addBtn: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    gap: 4,
  },
  addBtnText: { fontSize: 11, color: Colors.primary, fontWeight: '600', textAlign: 'center' },
  addBtnCount: { fontSize: 10, color: Colors.textLight },
});
