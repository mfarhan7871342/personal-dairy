import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface StreakBannerProps {
  streak: number;
  totalEntries: number;
}

export function StreakBanner({ streak, totalEntries }: StreakBannerProps) {
  const colors = useColors();
  const flameScale = useSharedValue(1);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      true
    );
  }, []);

  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scale: flameScale.value }] }));

  return (
    <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.streakSection}>
        <Animated.View style={flameStyle}>
          <Ionicons name="flame" size={28} color="#FF6B35" />
        </Animated.View>
        <View style={styles.streakText}>
          <Text style={[styles.streakNum, { color: colors.foreground }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>day streak</Text>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.streakSection}>
        <Ionicons name="book" size={24} color={colors.primary} />
        <View style={styles.streakText}>
          <Text style={[styles.streakNum, { color: colors.foreground }]}>{totalEntries}</Text>
          <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>entries</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  streakSection: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' },
  divider: { width: 1, height: 36, marginHorizontal: 16 },
  streakText: { alignItems: 'flex-start' },
  streakNum: { fontSize: 22, fontWeight: '800' },
  streakLabel: { fontSize: 11, marginTop: -2 },
});
