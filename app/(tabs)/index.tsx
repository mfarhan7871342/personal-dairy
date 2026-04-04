import React, { useCallback, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  RefreshControl, Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useEntryStore } from '@/store/entryStore';
import { useStreakStore } from '@/store/streakStore';
import { EntryCard } from '@/components/EntryCard';
import { StreakBanner } from '@/components/StreakBanner';
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

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 }}
      >
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting}</Text>
            <Text style={[styles.appName, { color: colors.foreground }]}>Roz</Text>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>{dateStr}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/ai')} style={[styles.iconBtn, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/themes')} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
              <Ionicons name="color-palette" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <StreakBanner streak={currentStreak} totalEntries={totalEntries} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 12 }}>
          <QuoteCard key={quoteKey} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Entries</Text>
            {entries.length > 5 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {recent.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(400).springify()} style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="journal" size={44} color={colors.primary + '50'} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your story starts here</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Tap the + button below to write your first entry</Text>
          </Animated.View>
        ) : (
          <View style={styles.list}>
            {recent.map((entry, i) => (
              <Animated.View key={entry.id} entering={FadeInDown.delay(300 + i * 60).springify()}>
                <EntryCard
                  entry={entry}
                  onPress={() => router.push(`/entry/${entry.id}`)}
                />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleWrite} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 16 },
  greeting: { fontSize: 13, fontWeight: '500' },
  appName: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  date: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16 },
  empty: { marginHorizontal: 16, borderRadius: 20, padding: 36, alignItems: 'center', gap: 8, borderWidth: 1 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  fab: { position: 'absolute', right: 20, bottom: Platform.OS === 'web' ? 100 : 80, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
