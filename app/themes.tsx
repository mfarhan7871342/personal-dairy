import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSettingsStore } from '@/store/settingsStore';

const THEMES = [
  { id: 'lavender', label: 'Lavender', color: '#6C63FF', bg: '#F8F7FF', accent: '#A78BFA', desc: 'Classic & elegant' },
  { id: 'ocean', label: 'Ocean', color: '#0984E3', bg: '#EDF6FF', accent: '#74B9FF', desc: 'Calm & focused' },
  { id: 'forest', label: 'Forest', color: '#00B894', bg: '#F0FFF8', accent: '#55EFC4', desc: 'Fresh & natural' },
  { id: 'sunset', label: 'Sunset', color: '#E17055', bg: '#FFF5F2', accent: '#FDCB6E', desc: 'Warm & energetic' },
  { id: 'rose', label: 'Rose', color: '#E84393', bg: '#FFF0F8', accent: '#FD79A8', desc: 'Bold & romantic' },
  { id: 'midnight', label: 'Midnight', color: '#6C5CE7', bg: '#1A1A2E', accent: '#A29BFE', desc: 'Dark & mysterious' },
  { id: 'peach', label: 'Peach', color: '#FF7675', bg: '#FFF5F5', accent: '#FFEAA7', desc: 'Sweet & playful' },
  { id: 'sage', label: 'Sage', color: '#6C8C6C', bg: '#F5F8F5', accent: '#A8D5A2', desc: 'Minimal & peaceful' },
  { id: 'gold', label: 'Gold', color: '#FDCB6E', bg: '#FFFBF0', accent: '#E17055', desc: 'Rich & premium' },
];

export default function ThemesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettingsStore();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleSelect = (id: string) => {
    updateSettings({ themeId: id });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="close" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Themes</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 }}
      >
        {THEMES.map((theme, i) => {
          const selected = settings.themeId === theme.id;
          return (
            <Animated.View key={theme.id} entering={FadeInDown.delay(i * 40).springify()}>
              <TouchableOpacity
                onPress={() => handleSelect(theme.id)}
                style={[
                  styles.themeCard,
                  { backgroundColor: theme.bg, borderColor: selected ? theme.color : 'transparent', borderWidth: selected ? 2 : 1 },
                ]}
                activeOpacity={0.85}
              >
                <View style={styles.palette}>
                  {[theme.color, theme.accent, theme.bg].map((c, j) => (
                    <View key={j} style={[styles.swatch, { backgroundColor: c, borderColor: 'rgba(0,0,0,0.08)' }]} />
                  ))}
                </View>
                <View style={styles.themeInfo}>
                  <Text style={[styles.themeName, { color: theme.color }]}>{theme.label}</Text>
                  <Text style={[styles.themeDesc, { color: '#666' }]}>{theme.desc}</Text>
                </View>
                {selected && (
                  <View style={[styles.check, { backgroundColor: theme.color }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  themeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, gap: 16 },
  palette: { flexDirection: 'row', gap: 4 },
  swatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 1 },
  themeInfo: { flex: 1 },
  themeName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  themeDesc: { fontSize: 12 },
  check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
