import React, { useCallback, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  RefreshControl, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useEntryStore } from '@/store/entryStore';
import { useStreakStore } from '@/store/streakStore';
import { EntryCard } from '@/components/EntryCard';
import { QuoteCard } from '@/components/QuoteCard';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries } = useEntryStore();
  const { currentStreak, totalEntries } = useStreakStore();
  const [refreshing, setRefreshing] = useState(false);
  const [quoteKey, setQuoteKey] = useState(0);

  const recent = entries.slice(0, 10);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setQuoteKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleWrite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/write');
  };

  const topPad = (Platform.OS === 'web' ? 67 : insets.top) ?? 0;
  const bottomPad = insets.bottom ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 100 : bottomPad + 80 }}
      >
        {/* Purple gradient header */}
        <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>{greeting} 👋</Text>
              <Text style={styles.appTitle}>Roz Journal</Text>
              <Text style={styles.dateLabel}>{dateStr}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => router.push('/ai')} style={styles.headerBtn}>
                <Ionicons name="sparkles" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/themes')} style={styles.headerBtn}>
                <Ionicons name="color-palette" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statNum}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📖</Text>
              <Text style={styles.statNum}>{totalEntries}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📅</Text>
              <Text style={styles.statNum}>{new Date().getDate()}</Text>
              <Text style={styles.statLabel}>Day of Month</Text>
            </View>
          </View>
        </View>

        {/* Quote */}
        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>✨ Daily Inspiration</Text>
          <QuoteCard key={quoteKey} />
        </View>

        {/* Recent Entries */}
        <View style={styles.entriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📝 Recent Entries</Text>
            {entries.length > 5 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all →</Text>
              </TouchableOpacity>
            )}
          </View>

          {recent.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.emptyEmoji}>📔</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your story starts here</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Tap the + button to write your first entry
              </Text>
              <TouchableOpacity onPress={handleWrite} style={[styles.startBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.startBtnText}>Write now ✏️</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.list}>
              {recent.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onPress={() => router.push(`/entry/${entry.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={handleWrite}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greetingText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  appTitle: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  dateLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 20 },
  statNum: { fontSize: 22, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginHorizontal: 20, marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '700', marginRight: 20 },
  entriesSection: { marginTop: 8 },
  list: { paddingHorizontal: 16 },
  empty: { marginHorizontal: 16, borderRadius: 20, padding: 36, alignItems: 'center', gap: 10, borderWidth: 1 },
  emptyEmoji: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  startBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  fab: {
    position: 'absolute', right: 20,
    bottom: Platform.OS === 'web' ? 100 : 88,
    width: 62, height: 62, borderRadius: 31,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
});
