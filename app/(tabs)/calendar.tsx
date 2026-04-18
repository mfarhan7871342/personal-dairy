import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useEntryStore } from '@/store/entryStore';
import { EntryCard } from '@/components/EntryCard';
import { MOOD_COLORS, MOOD_EMOJIS } from '@/constants/colors';

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries } = useEntryStore();
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);
  const topPad = (Platform.OS === 'web' ? 67 : insets.top) ?? 0;
  const bottomPad = insets.bottom ?? 0;

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    entries.forEach((e) => {
      const date = e.createdAt.split('T')[0];
      const color = MOOD_COLORS[e.mood] ?? colors.primary;
      if (!marks[date]) marks[date] = { dots: [], marked: true };
      if (marks[date].dots.length < 3) marks[date].dots.push({ color });
    });
    if (selected) {
      marks[selected] = { ...(marks[selected] || {}), selected: true, selectedColor: colors.primary };
    }
    return marks;
  }, [entries, selected, colors.primary]);

  const selectedEntries = useMemo(
    () => entries.filter((e) => e.createdAt.startsWith(selected)),
    [entries, selected]
  );

  const monthCount = useMemo(() => {
    const month = selected.substring(0, 7);
    return entries.filter((e) => e.createdAt.startsWith(month)).length;
  }, [entries, selected]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={[styles.headerInner, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>📅 Calendar</Text>
          <View style={styles.quickAccess}>
            <TouchableOpacity onPress={() => router.push('/lock-type')} style={styles.quickBtn}>
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.quickLabel}>Password</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/themes')} style={styles.quickBtn}>
              <Ionicons name="color-palette" size={18} color="#fff" />
              <Text style={styles.quickLabel}>Themes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBtn}>
              <Ionicons name="notifications" size={18} color="#fff" />
              <Text style={styles.quickLabel}>Reminders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : bottomPad + 20 }}>
        {/* Calendar */}
        <View style={[styles.calendarWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Calendar
            onDayPress={(day: any) => setSelected(day.dateString)}
            markedDates={markedDates}
            markingType="multi-dot"
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: colors.mutedForeground,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: colors.primary,
              todayBackgroundColor: colors.primary + '20',
              dayTextColor: colors.foreground,
              textDisabledColor: colors.mutedForeground + '50',
              dotColor: colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: colors.primary,
              monthTextColor: colors.foreground,
              textDayFontWeight: '500',
              textMonthFontWeight: '800',
              textDayHeaderFontWeight: '700',
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
            style={styles.calendar}
          />
          <View style={[styles.monthBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.monthBadgeText, { color: colors.primary }]}>
              {monthCount} entries this month
            </Text>
          </View>
        </View>

        {/* Selected day */}
        <View style={styles.section}>
          <View style={styles.dayHeader}>
            <Text style={[styles.dayTitle, { color: colors.foreground }]}>
              {selected === new Date().toISOString().split('T')[0] ? '📝 Today' : `📅 ${selected}`}
            </Text>
          </View>

          {selectedEntries.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.emptyEmoji}>📓</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No entries on this day</Text>
              <TouchableOpacity
                onPress={() => router.push('/write')}
                style={[styles.writeBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.writeBtnText}>Write now ✏️</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {selectedEntries.map((e) => (
                <EntryCard key={e.id} entry={e} onPress={() => router.push(`/entry/${e.id}`)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 4 },
  headerInner: { borderRadius: 20, padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 14 },
  quickAccess: { flexDirection: 'row', gap: 12 },
  quickBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, paddingVertical: 10, alignItems: 'center', gap: 4 },
  quickLabel: { fontSize: 10, fontWeight: '700', color: '#fff' },
  calendarWrap: { marginHorizontal: 16, marginTop: 12, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  calendar: { marginBottom: 4 },
  monthBadge: { marginHorizontal: 16, marginBottom: 14, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, alignSelf: 'center' },
  monthBadgeText: { fontSize: 12, fontWeight: '700' },
  section: { marginTop: 16 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  dayTitle: { fontSize: 18, fontWeight: '800' },
  empty: { marginHorizontal: 16, borderRadius: 20, padding: 32, alignItems: 'center', gap: 12, borderWidth: 1 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 14, fontWeight: '500' },
  writeBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, marginTop: 4 },
  writeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
