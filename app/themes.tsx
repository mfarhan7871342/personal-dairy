import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSettingsStore } from '@/store/settingsStore';

const ILLUSTRATIONS = [
  { id: 'lavender', emoji: '💜', label: 'Lavender', bg: ['#6C63FF', '#A78BFA'], desc: 'Classic & elegant' },
  { id: 'midnight', emoji: '🌌', label: 'Midnight', bg: ['#1A0533', '#4C1D95'], desc: 'Dark & mysterious' },
  { id: 'galaxy', emoji: '✨', label: 'Galaxy', bg: ['#0F0620', '#7C3AED'], desc: 'Cosmic vibes' },
  { id: 'ocean', emoji: '🌊', label: 'Ocean', bg: ['#0369A1', '#38BDF8'], desc: 'Calm & focused' },
  { id: 'forest', emoji: '🌿', label: 'Forest', bg: ['#064E3B', '#10B981'], desc: 'Fresh & natural' },
  { id: 'sunset', emoji: '🌅', label: 'Sunset', bg: ['#9A3412', '#FB923C'], desc: 'Warm & energetic' },
  { id: 'rose', emoji: '🌸', label: 'Rose', bg: ['#9D174D', '#F472B6'], desc: 'Bold & romantic' },
  { id: 'moon', emoji: '🌙', label: 'Moon', bg: ['#1E1B4B', '#818CF8'], desc: 'Dreamy & soft' },
  { id: 'peach', emoji: '🍑', label: 'Peach', bg: ['#C2410C', '#FCA5A5'], desc: 'Sweet & playful' },
];

const COLORS_THEMES = [
  { id: 'white', label: 'Clean White', color: '#F8F7FF', accent: '#7C3AED' },
  { id: 'parchment', label: 'Parchment', color: '#FDF8EE', accent: '#92400E' },
  { id: 'mint', label: 'Mint', color: '#F0FDF4', accent: '#16A34A' },
  { id: 'blush', label: 'Blush', color: '#FFF1F2', accent: '#E11D48' },
  { id: 'sky', label: 'Sky', color: '#F0F9FF', accent: '#0284C7' },
  { id: 'lavenderLight', label: 'Lavender', color: '#FAF5FF', accent: '#7C3AED' },
];

export default function ThemesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettingsStore();
  const topPad = (Platform.OS === 'web' ? 67 : insets.top) ?? 0;
  const bottomPad = insets.bottom ?? 0;
  const [tab, setTab] = useState<'illustrations' | 'colors'>('illustrations');

  const handleSelect = (id: string) => {
    updateSettings({ themeId: id });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="color-wand" size={20} color="#fff" />
          <Text style={styles.headerTitle}>Themes</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.doneBtn}>
          <Ionicons name="checkmark" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, { borderBottomColor: tab === 'illustrations' ? colors.primary : 'transparent', borderBottomWidth: 2.5 }]}
          onPress={() => setTab('illustrations')}
        >
          <View style={styles.tabContent}>
            <Ionicons 
              name={tab === 'illustrations' ? "images" : "images-outline"} 
              size={18} 
              color={tab === 'illustrations' ? colors.primary : colors.mutedForeground} 
            />
            <Text style={[styles.tabText, { color: tab === 'illustrations' ? colors.primary : colors.mutedForeground }]}>
              Illustrations
            </Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.tabSep, { backgroundColor: colors.border }]} />
        <TouchableOpacity
          style={[styles.tab, { borderBottomColor: tab === 'colors' ? colors.primary : 'transparent', borderBottomWidth: 2.5 }]}
          onPress={() => setTab('colors')}
        >
          <View style={styles.tabContent}>
            <Ionicons 
              name={tab === 'colors' ? "color-palette" : "color-palette-outline"} 
              size={18} 
              color={tab === 'colors' ? colors.primary : colors.mutedForeground} 
            />
            <Text style={[styles.tabText, { color: tab === 'colors' ? colors.primary : colors.mutedForeground }]}>
              Colors
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: Platform.OS === 'web' ? 34 : bottomPad + 20 }}
      >
        {tab === 'illustrations' ? (
          <View style={styles.grid}>
            {ILLUSTRATIONS.map((theme) => {
              const selected = settings.themeId === theme.id;
              return (
                <TouchableOpacity
                  key={theme.id}
                  onPress={() => handleSelect(theme.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.illustCard,
                    { borderWidth: selected ? 3 : 0, borderColor: '#fff' },
                  ]}
                >
                  <View style={[styles.illustBg, { backgroundColor: theme.bg[0] }]}>
                    <View style={[styles.illustGradient, { backgroundColor: theme.bg[1] }]} />
                    <Text style={styles.illustEmoji}>{theme.emoji}</Text>
                    {selected && (
                      <View style={styles.selectedCheck}>
                        <Ionicons name="checkmark-circle" size={28} color="#fff" />
                      </View>
                    )}
                  </View>
                  <View style={styles.illustFooter}>
                    <Text style={[styles.illustLabel, { color: colors.foreground }]}>{theme.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.colorsGrid}>
            {COLORS_THEMES.map((theme) => {
              const selected = settings.themeId === theme.id;
              return (
                <TouchableOpacity
                  key={theme.id}
                  onPress={() => handleSelect(theme.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.colorCard,
                    {
                      backgroundColor: theme.color,
                      borderWidth: selected ? 3 : 1.5,
                      borderColor: selected ? theme.accent : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.colorCircle, { backgroundColor: theme.accent }]} />
                  <Text style={[styles.colorLabel, { color: theme.accent }]}>{theme.label}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={20} color={theme.accent} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingBottom: 16, gap: 12,
  },
  headerTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  doneBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, alignItems: 'center' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: { fontSize: 14, fontWeight: '700' },
  tabSep: { width: 1, height: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  illustCard: { width: '31%', borderRadius: 16, overflow: 'hidden' },
  illustBg: { height: 140, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  illustGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, top: '40%', opacity: 0.6 },
  illustEmoji: { fontSize: 44 },
  selectedCheck: { position: 'absolute', top: 8, right: 8 },
  illustFooter: { paddingVertical: 8, paddingHorizontal: 6 },
  illustLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  colorsGrid: { gap: 10 },
  colorCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, gap: 12 },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  colorLabel: { flex: 1, fontSize: 15, fontWeight: '700' },
});
