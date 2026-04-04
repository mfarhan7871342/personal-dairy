import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText, Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useEntryStore, MoodType } from '@/store/entryStore';
import { MOOD_COLORS, MOOD_ICONS, MOOD_LABELS } from '@/constants/colors';

const MOODS: MoodType[] = ['happy', 'excited', 'grateful', 'calm', 'neutral', 'sad', 'anxious', 'angry'];
const CHART_W = Dimensions.get('window').width - 64;
const CHART_H = 140;

function MoodBarChart({ data }: { data: Record<string, number> }) {
  const colors = useColors();
  const max = Math.max(...Object.values(data), 1);
  const barW = Math.floor(CHART_W / MOODS.length) - 6;

  return (
    <Svg width={CHART_W} height={CHART_H + 32}>
      {MOODS.map((mood, i) => {
        const count = data[mood] ?? 0;
        const barH = Math.max((count / max) * CHART_H, count > 0 ? 4 : 0);
        const x = i * (CHART_W / MOODS.length) + (CHART_W / MOODS.length - barW) / 2;
        const y = CHART_H - barH;
        const color = MOOD_COLORS[mood];
        return (
          <React.Fragment key={mood}>
            <Rect x={x} y={y} width={barW} height={barH} rx={4} fill={color} opacity={0.85} />
            <SvgText x={x + barW / 2} y={CHART_H + 18} fontSize={9} textAnchor="middle" fill={colors.mutedForeground}>
              {mood.substring(0, 4)}
            </SvgText>
            {count > 0 && (
              <SvgText x={x + barW / 2} y={y - 4} fontSize={9} textAnchor="middle" fill={color} fontWeight="700">
                {count}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function MoodScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries } = useEntryStore();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    MOODS.forEach((m) => (counts[m] = 0));
    entries.forEach((e) => { counts[e.mood] = (counts[e.mood] ?? 0) + 1; });
    return counts;
  }, [entries]);

  const topMood = useMemo(() => {
    if (entries.length === 0) return null;
    return MOODS.reduce((a, b) => (stats[a] >= stats[b] ? a : b));
  }, [stats, entries]);

  const last7 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return entries.filter((e) => new Date(e.createdAt) > cutoff).slice(0, 20);
  }, [entries]);

  const weekStats = useMemo(() => {
    const counts: Record<string, number> = {};
    MOODS.forEach((m) => (counts[m] = 0));
    last7.forEach((e) => { counts[e.mood] = (counts[e.mood] ?? 0) + 1; });
    return counts;
  }, [last7]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Mood Tracker</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 }}>
        {entries.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="happy" size={44} color={colors.primary + '50'} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No mood data yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Start journaling to see your mood patterns</Text>
          </View>
        ) : (
          <>
            {topMood && (
              <View style={[styles.insightCard, { backgroundColor: colors.primary, marginHorizontal: 16, marginBottom: 16 }]}>
                <Text style={styles.insightLabel}>Most Common Mood</Text>
                <View style={styles.insightRow}>
                  <Ionicons name={MOOD_ICONS[topMood] as any} size={32} color="#fff" />
                  <Text style={styles.insightMood}>{MOOD_LABELS[topMood]}</Text>
                </View>
                <Text style={styles.insightCount}>{stats[topMood]} entries</Text>
              </View>
            )}

            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.foreground }]}>All Time</Text>
              <MoodBarChart data={stats} />
            </View>

            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.foreground }]}>Last 7 Days</Text>
              <MoodBarChart data={weekStats} />
            </View>

            <View style={styles.gridSection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Breakdown</Text>
              <View style={styles.grid}>
                {MOODS.filter((m) => stats[m] > 0).map((mood) => (
                  <View key={mood} style={[styles.moodStat, { backgroundColor: MOOD_COLORS[mood] + '18', borderColor: MOOD_COLORS[mood] + '40' }]}>
                    <Ionicons name={MOOD_ICONS[mood] as any} size={20} color={MOOD_COLORS[mood]} />
                    <Text style={[styles.moodCount, { color: colors.foreground }]}>{stats[mood]}</Text>
                    <Text style={[styles.moodName, { color: colors.mutedForeground }]}>{MOOD_LABELS[mood]}</Text>
                  </View>
                ))}
              </View>
            </View>

            {last7.length > 0 && (
              <View style={styles.gridSection}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Moods</Text>
                {last7.slice(0, 7).map((entry) => {
                  const color = MOOD_COLORS[entry.mood];
                  return (
                    <View key={entry.id} style={[styles.recentRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <View style={[styles.moodDot, { backgroundColor: color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.recentTitle, { color: colors.foreground }]} numberOfLines={1}>
                          {entry.title || entry.body.substring(0, 30) || 'Untitled'}
                        </Text>
                        <Text style={[styles.recentDate, { color: colors.mutedForeground }]}>
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={[styles.recentMood, { backgroundColor: color + '20' }]}>
                        <Ionicons name={MOOD_ICONS[entry.mood] as any} size={14} color={color} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  empty: { marginHorizontal: 16, marginTop: 40, borderRadius: 20, padding: 40, alignItems: 'center', gap: 8, borderWidth: 1 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  insightCard: { borderRadius: 20, padding: 20, marginBottom: 4 },
  insightLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  insightMood: { color: '#fff', fontSize: 24, fontWeight: '800' },
  insightCount: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  chartCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'center' },
  chartTitle: { fontSize: 14, fontWeight: '700', alignSelf: 'flex-start', marginBottom: 12 },
  gridSection: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodStat: { borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', width: '22%', gap: 4 },
  moodCount: { fontSize: 16, fontWeight: '800' },
  moodName: { fontSize: 9, textAlign: 'center' },
  recentRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, gap: 12 },
  moodDot: { width: 8, height: 8, borderRadius: 4 },
  recentTitle: { fontSize: 13, fontWeight: '600' },
  recentDate: { fontSize: 11 },
  recentMood: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
