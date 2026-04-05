import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { DiaryEntry } from '@/store/entryStore';
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from '@/constants/colors';

interface EntryCardProps {
  entry: DiaryEntry;
  onPress: () => void;
  onDelete?: () => void;
}

export function EntryCard({ entry, onPress }: EntryCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const moodColor = MOOD_COLORS[entry.mood] ?? colors.secondary;
  const moodEmoji = MOOD_EMOJIS[entry.mood] ?? '📝';
  const moodLabel = MOOD_LABELS[entry.mood] ?? entry.mood;

  const date = new Date(entry.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const preview = entry.body.replace(/\n/g, ' ').substring(0, 120);

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
          <View style={[styles.cardHeader, { backgroundColor: colors.primary + '12' }]}>
            <View style={styles.headerLeft}>
              <Text style={styles.moodEmoji}>{moodEmoji}</Text>
              <View>
                <Text style={[styles.dateText, { color: colors.foreground }]}>{dateStr}</Text>
                <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{timeStr}</Text>
              </View>
            </View>
            <View style={[styles.moodTag, { backgroundColor: moodColor + '22' }]}>
              <Text style={[styles.moodTagText, { color: moodColor }]}>{moodLabel}</Text>
            </View>
          </View>

          <View style={styles.body}>
            {entry.title ? (
              <Text style={[styles.title, { color: colors.primary }]} numberOfLines={1}>
                {entry.title}
              </Text>
            ) : null}
            {preview ? (
              <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={3}>
                {preview}
              </Text>
            ) : null}
          </View>

          {entry.photos.length > 0 && (
            <View style={styles.photosRow}>
              {entry.photos.slice(0, 2).map((uri, i) => (
                <Image key={i} source={{ uri }} style={[styles.thumb, { borderColor: colors.border }]} resizeMode="cover" />
              ))}
            </View>
          )}

          <View style={styles.footer}>
            {entry.isFavorite && <Text style={{ fontSize: 12 }}>❤️</Text>}
            {entry.voiceUri && <Text style={{ fontSize: 12 }}>🎤</Text>}
            {entry.photos.length > 0 && <Text style={{ fontSize: 12 }}>📷</Text>}
          </View>

          <View style={[styles.accent, { backgroundColor: moodColor }]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  moodEmoji: { fontSize: 28 },
  dateText: { fontSize: 13, fontWeight: '700' },
  timeText: { fontSize: 11, marginTop: 1 },
  moodTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  moodTagText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  body: { paddingHorizontal: 14, paddingVertical: 10 },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 4, fontStyle: 'italic' },
  preview: { fontSize: 13, lineHeight: 19 },
  photosRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingBottom: 10 },
  thumb: { width: 72, height: 72, borderRadius: 10, borderWidth: 1 },
  footer: { flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingBottom: 10 },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
});
