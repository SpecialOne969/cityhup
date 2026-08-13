import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, THEME_META, getTheme, switchTheme, type ThemeKey } from '../constants/colors';

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const active = getTheme();

  if (Platform.OS !== 'web') return null;

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(v => !v)} activeOpacity={0.85}>
        <Ionicons name={open ? 'close' : 'color-palette-outline'} size={22} color="#fff" />
      </TouchableOpacity>

      {open && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Colour Theme</Text>
          <Text style={styles.panelSub}>Tap a theme to preview it</Text>

          {THEME_META.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.row, active === t.id && styles.rowActive]}
              onPress={() => switchTheme(t.id as ThemeKey)}
              activeOpacity={0.8}
            >
              <View style={styles.swatchPair}>
                <View style={[styles.swatch, { backgroundColor: t.preview }]} />
                <View style={[styles.swatchSmall, { backgroundColor: t.accent }]} />
              </View>
              <View style={styles.labelWrap}>
                <Text style={[styles.label, active === t.id && { color: t.preview, fontWeight: '700' }]}>
                  {t.label}
                </Text>
                {active === t.id && (
                  <Text style={[styles.activeTag, { color: t.preview }]}>Active</Text>
                )}
              </View>
              {active === t.id
                ? <Ionicons name="checkmark-circle" size={20} color={t.preview} />
                : <Ionicons name="chevron-forward" size={16} color="#BBBBCC" />
              }
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />
          <Text style={styles.hint}>Page refreshes when you switch</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 999,
  },
  panel: {
    position: 'absolute',
    bottom: 148,
    left: 16,
    width: 210,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    zIndex: 998,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  panelTitle: {
    fontSize: 13, fontWeight: '800', color: Colors.textDark,
    marginBottom: 2, letterSpacing: 0.3,
  },
  panelSub: { fontSize: 11, color: Colors.textLight, marginBottom: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 9, paddingHorizontal: 6,
    borderRadius: 10, marginBottom: 2,
  },
  rowActive: { backgroundColor: Colors.bgLight },
  swatchPair: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  swatch: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)',
  },
  swatchSmall: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)',
    marginLeft: -8, marginTop: 10,
  },
  labelWrap: { flex: 1 },
  label: { fontSize: 13, color: Colors.textDark, fontWeight: '500' },
  activeTag: { fontSize: 10, fontWeight: '700', marginTop: 1 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 8 },
  hint: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
});
