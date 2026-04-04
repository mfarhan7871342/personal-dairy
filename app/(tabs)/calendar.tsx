import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useEntryStore } from '@/store/entryStore';
import { EntryCard } from '@/components/EntryCard';
import { MOOD_COLORS } from '@/constants/colors';

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries } = useEntryStore();
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    entries.forEach((e) => {
      const date = e.createdAt.split('T')[0];
      const color = MOOD_COLORS[e.mood] ?? colors.primary;
      if (!marks[date]) {
        marks[date] = { dots: [], marked: true };
      }
      if (marks[date].dots.length < 3) {
        marks[date].dots.push({ color });
      }
    });
    if (selected) {
      marks[selected] = {
        ...(marks[selected] || {}),
        selected: true,
        selectedColor: colors.primary,
      };
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
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Calendar</Text>
        <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{monthCount} this month</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 }}>
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
            dayTextColor: colors.foreground,
            textDisabledColor: colors.mutedForeground + '60',
            dotColor: colors.primary,
            selectedDotColor: '#ffffff',
            arrowColor: colors.primary,
            monthTextColor: colors.foreground,
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
          }}
          style={styles.calendar}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {selected === new Date().toISOString().split('T')[0] ? 'Today' : selected}
          </Text>

          {selectedEntries.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="pencil" size={28} color={colors.primary + '60'} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No entries on this day</Text>
              <TouchableOpacity
                onPress={() => router.push('/write')}
                style={[styles.writeBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.writeBtnText}>Write now</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  calendar: { marginHorizontal: 8, marginBottom: 8 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginHorizontal: 20, marginBottom: 12 },
  empty: { marginHorizontal: 16, borderRadius: 16, padding: 28, alignItems: 'center', gap: 10, borderWidth: 1 },
  emptyText: { fontSize: 14 },
  writeBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, marginTop: 4 },
  writeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
