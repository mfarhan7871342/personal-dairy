import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useStreakStore, BADGE_DEFS } from '@/store/streakStore';
import { BadgeItem } from '@/components/BadgeItem';

export default function BadgesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { unlockedBadges, currentStreak, longestStreak, totalEntries } = useStreakStore();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Badges</Text>
        <View style={[styles.pill, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.pillText, { color: colors.primary }]}>
            {unlockedBadges.length}/{BADGE_DEFS.length} earned
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 }}>
        <View style={[styles.stats, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{currentStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>current{'\n'}streak</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{longestStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>best{'\n'}streak</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{totalEntries}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>total{'\n'}entries</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Badges</Text>

        <Animated.View entering={FadeInDown.springify()} style={styles.grid}>
          {BADGE_DEFS.map((badge) => (
            <BadgeItem
              key={badge.id}
              id={badge.id}
              label={badge.label}
              desc={badge.desc}
              icon={badge.icon}
              earned={unlockedBadges.includes(badge.id)}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pillText: { fontSize: 12, fontWeight: '700' },
  stats: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 24, borderRadius: 16, padding: 20, borderWidth: 1 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 11, textAlign: 'center', lineHeight: 14 },
  divider: { width: 1, marginHorizontal: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: 20, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between' },
});
