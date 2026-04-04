import React, { useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { DiaryEntry } from '@/store/entryStore';
import { MOOD_COLORS, MOOD_ICONS } from '@/constants/colors';

interface EntryCardProps {
  entry: DiaryEntry;
  onPress: () => void;
  onDelete?: () => void;
}

export function EntryCard({ entry, onPress, onDelete }: EntryCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => { scale.value = withSpring(0.97); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  const moodColor = MOOD_COLORS[entry.mood] ?? colors.secondary;
  const moodIcon = MOOD_ICONS[entry.mood] ?? 'ellipse';

  const date = new Date(entry.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const preview = entry.body.replace(/\n/g, ' ').substring(0, 100);

  return (
    <Animated.View style={[animStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <View style={styles.header}>
            <View style={[styles.moodBadge, { backgroundColor: moodColor + '22' }]}>
              <Ionicons name={moodIcon as any} size={14} color={moodColor} />
              <Text style={[styles.moodLabel, { color: moodColor }]}>{entry.mood}</Text>
            </View>
            <View style={styles.meta}>
              {entry.photos.length > 0 && (
                <Ionicons name="image" size={14} color={colors.mutedForeground} style={styles.icon} />
              )}
              {entry.voiceUri && (
                <Ionicons name="mic" size={14} color={colors.mutedForeground} style={styles.icon} />
              )}
              {entry.isFavorite && (
                <Ionicons name="heart" size={14} color={colors.accent} style={styles.icon} />
              )}
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{dateStr}</Text>
            </View>
          </View>

          {entry.title ? (
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
              {entry.title}
            </Text>
          ) : null}

          {preview ? (
            <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={2}>
              {preview}
            </Text>
          ) : null}

          {entry.photos.length > 0 && (
            <Image
              source={{ uri: entry.photos[0] }}
              style={[styles.thumb, { borderColor: colors.border }]}
              resizeMode="cover"
            />
          )}

          <View style={[styles.accent, { backgroundColor: moodColor }]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  moodBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4 },
  moodLabel: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  icon: { marginRight: 2 },
  date: { fontSize: 11 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  preview: { fontSize: 13, lineHeight: 18 },
  thumb: { width: '100%', height: 120, borderRadius: 10, marginTop: 10, borderWidth: 1 },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
});
