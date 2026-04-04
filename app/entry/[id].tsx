import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Alert, Image, Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useEntryStore } from '@/store/entryStore';
import { MOOD_COLORS, MOOD_ICONS, MOOD_LABELS } from '@/constants/colors';

export default function EntryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntry, deleteEntry, toggleFavorite } = useEntryStore();

  const entry = getEntry(id as string);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 16, alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="document" size={44} color={colors.mutedForeground} />
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Entry not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const moodColor = MOOD_COLORS[entry.mood] ?? colors.primary;
  const moodIcon = MOOD_ICONS[entry.mood] ?? 'ellipse';

  const date = new Date(entry.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'This entry will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          deleteEntry(entry.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  };

  const handleFavorite = () => {
    toggleFavorite(entry.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleFavorite} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name={entry.isFavorite ? 'heart' : 'heart-outline'} size={20} color={entry.isFavorite ? colors.accent : colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 }}>
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.meta}>
          <View style={[styles.moodPill, { backgroundColor: moodColor + '20', borderColor: moodColor + '40' }]}>
            <Ionicons name={moodIcon as any} size={16} color={moodColor} />
            <Text style={[styles.moodText, { color: moodColor }]}>{MOOD_LABELS[entry.mood]}</Text>
          </View>
          <View style={styles.dateWrap}>
            <Text style={[styles.dateStr, { color: colors.foreground }]}>{dateStr}</Text>
            <Text style={[styles.timeStr, { color: colors.mutedForeground }]}>{timeStr}</Text>
          </View>
        </Animated.View>

        {entry.title ? (
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.titleWrap}>
            <Text style={[styles.entryTitle, { color: colors.foreground }]}>{entry.title}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.bodyWrap}>
          <Text style={[styles.entryBody, { color: colors.foreground }]}>{entry.body}</Text>
        </Animated.View>

        {entry.photos.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.photosSection}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
              {entry.photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={[styles.photo, { borderColor: colors.border }]} resizeMode="cover" />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(250).springify()} style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{entry.body.split(/\s+/).filter(Boolean).length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>words</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{entry.body.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>characters</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{entry.photos.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>photos</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  meta: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  moodPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  moodText: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  dateWrap: { gap: 2 },
  dateStr: { fontSize: 15, fontWeight: '600' },
  timeStr: { fontSize: 12 },
  titleWrap: { paddingHorizontal: 20, paddingTop: 20 },
  entryTitle: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  bodyWrap: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  entryBody: { fontSize: 17, lineHeight: 28 },
  photosSection: { paddingHorizontal: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  photosRow: { gap: 10 },
  photo: { width: 160, height: 120, borderRadius: 12, borderWidth: 1 },
  statsRow: { marginHorizontal: 16, borderRadius: 16, padding: 20, flexDirection: 'row', borderWidth: 1, marginBottom: 16 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1 },
  notFound: { fontSize: 15, marginTop: 12 },
  backBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
});
