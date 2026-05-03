import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, TextInput, FlatList,
  TouchableOpacity, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useEntryStore } from '@/store/entryStore';
import { EntryCard } from '@/components/EntryCard';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/constants/colors';

const MOOD_FILTERS = ['all', 'happy', 'excited', 'grateful', 'calm', 'neutral', 'sad', 'anxious', 'angry'];

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries } = useEntryStore();
  
  const [search, setSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');

  const topPad = (Platform.OS === 'web' ? 67 : insets.top) ?? 0;
  const bottomPad = insets.bottom ?? 0;

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch = 
        e.title.toLowerCase().includes(search.toLowerCase()) || 
        e.body.toLowerCase().includes(search.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesMood = selectedMood === 'all' || e.mood === selectedMood;
      
      return matchesSearch && matchesMood;
    });
  }, [entries, search, selectedMood]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach(e => e.tags.forEach(t => tags.add(t)));
    return Array.from(tags).slice(0, 10);
  }, [entries]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>🔍 Search Memories</Text>
        <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name="search" size={20} color="#fff" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search titles, content, or tags..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
          {MOOD_FILTERS.map((mood) => (
            <TouchableOpacity
              key={mood}
              onPress={() => setSelectedMood(mood)}
              style={[
                styles.moodBtn,
                { 
                  backgroundColor: selectedMood === mood ? colors.primary : colors.card,
                  borderColor: selectedMood === mood ? colors.primary : colors.border
                }
              ]}
            >
              <Text style={[styles.moodBtnText, { color: selectedMood === mood ? '#fff' : colors.foreground }]}>
                {mood === 'all' ? '🌈 All' : `${MOOD_EMOJIS[mood as any]} ${MOOD_LABELS[mood as any]}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {allTags.length > 0 && (
          <View style={styles.tagSection}>
            <Text style={[styles.tagLabel, { color: colors.mutedForeground }]}>POPULAR TAGS</Text>
            <View style={styles.tagRow}>
              {allTags.map(tag => (
                <TouchableOpacity 
                  key={tag} 
                  onPress={() => setSearch(tag)}
                  style={[styles.tag, { backgroundColor: colors.muted, borderColor: colors.border }]}
                >
                  <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntryCard entry={item} onPress={() => router.push(`/entry/${item.id}`)} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 80 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="journal-outline" size={60} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {search || selectedMood !== 'all' ? "No entries match your search" : "No entries yet"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50, borderRadius: 25, gap: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },
  filters: { marginTop: 16, gap: 12 },
  moodScroll: { paddingHorizontal: 16, gap: 8 },
  moodBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  moodBtnText: { fontSize: 13, fontWeight: '700' },
  tagSection: { paddingHorizontal: 20, marginTop: 8 },
  tagLabel: { fontSize: 10, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  tagText: { fontSize: 12, fontWeight: '600' },
  list: { padding: 16 },
  empty: { marginTop: 100, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, fontWeight: '500' },
});
