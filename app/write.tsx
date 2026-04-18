import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useEntryStore, MoodType } from '@/store/entryStore';
import { useStreakStore } from '@/store/streakStore';
import { useSettingsStore } from '@/store/settingsStore';
import { MoodPicker } from '@/components/MoodPicker';
import { MOOD_EMOJIS } from '@/constants/colors';

const ENTRY_COLORS = [
  { id: 'purple', color: '#7C3AED' },
  { id: 'ocean', color: '#0EA5E9' },
  { id: 'forest', color: '#10B981' },
  { id: 'sunset', color: '#F97316' },
  { id: 'rose', color: '#EC4899' },
  { id: 'dark', color: '#1E1B4B' },
];

export default function WriteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addEntry } = useEntryStore();
  const { updateStreak } = useStreakStore();
  const { settings } = useSettingsStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<MoodType>('neutral');
  const [photos, setPhotos] = useState<string[]>([]);
  const [colorId, setColorId] = useState('purple');
  const [saving, setSaving] = useState(false);

  const bodyRef = useRef<TextInput>(null);
  const activeColor = ENTRY_COLORS.find((c) => c.id === colorId)?.color ?? '#7C3AED';

  const now = new Date();
  const headerDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const headerDay = now.toLocaleDateString('en-US', { weekday: 'short' });
  const headerTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const topPad = (Platform.OS === 'web' ? 67 : insets.top) ?? 0;
  const bottomPad = insets.bottom ?? 0;

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo access to attach images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.75,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    if (!body.trim() && !title.trim()) {
      Alert.alert('Empty entry', 'Write something before saving.');
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const dateStr = now.toISOString().split('T')[0];
    addEntry({ title, body, mood, photos, themeId: colorId, isFavorite: false, tags: [] });
    updateStreak(dateStr, { photos, hour: now.getHours() });
    setTimeout(() => { setSaving(false); router.back(); }, 400);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Diary-style header with active color */}
      <View style={[styles.diaryHeader, { backgroundColor: activeColor, paddingTop: topPad + 8 }]}>
        {/* Spiral binding dots */}
        <View style={styles.spiralRow}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={styles.spiralDot} />
          ))}
        </View>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerMeta}>
            <Text style={styles.headerDate}>{headerDate}</Text>
            <Text style={styles.headerDay}>{headerDay} · {headerTime}</Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { opacity: saving ? 0.7 : 1 }]}
            disabled={saving}
          >
            <Ionicons name="checkmark" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Mood emoji + title preview */}
        <View style={styles.moodRow}>
          <Text style={styles.moodEmojiBig}>{MOOD_EMOJIS[mood]}</Text>
          <Text style={styles.titlePreview} numberOfLines={1}>
            {title || 'Dear diary...'}
          </Text>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Mood picker */}
        <View style={[styles.moodSection, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>How are you feeling?</Text>
          <MoodPicker selected={mood} onSelect={setMood} />
        </View>

        {/* Title */}
        <View style={styles.paperSection}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Beautiful day..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.titleInput, { color: activeColor }]}
            returnKeyType="next"
            onSubmitEditing={() => bodyRef.current?.focus()}
          />
        </View>

        {/* Body with lined paper */}
        <View style={styles.paperSection}>
          <TextInput
            ref={bodyRef}
            value={body}
            onChangeText={setBody}
            placeholder={"Dear diary,\n\nToday was a beautiful day..."}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.bodyInput, { color: colors.foreground }]}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Photos */}
        {photos.length > 0 && (
          <View style={styles.photosRow}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoWrap}>
                <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                <TouchableOpacity
                  style={[styles.removePhoto, { backgroundColor: colors.error }]}
                  onPress={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                >
                  <Ionicons name="close" size={10} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Entry color picker */}
        <View style={[styles.colorSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Entry color</Text>
          <View style={styles.colorRow}>
            {ENTRY_COLORS.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => { setColorId(c.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[
                  styles.colorBtn,
                  { backgroundColor: c.color, borderWidth: colorId === c.id ? 3 : 1.5, borderColor: colorId === c.id ? c.color : 'rgba(0,0,0,0.1)' },
                ]}
              >
                {colorId === c.id && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Platform.OS === 'web' ? 34 : bottomPad + 8 }]}>
        <TouchableOpacity onPress={handleAddPhoto} style={styles.toolBtn}>
          <Ionicons name="image-outline" size={24} color={colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/ai')} style={styles.toolBtn}>
          <Ionicons name="sparkles" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{body.length} chars</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  diaryHeader: { paddingBottom: 20 },
  spiralRow: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginBottom: 10, marginTop: 4 },
  spiralDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.4)', borderWidth: 2, borderColor: 'rgba(0,0,0,0.2)' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerMeta: { flex: 1, alignItems: 'center' },
  headerDate: { fontSize: 13, fontWeight: '700', color: '#fff' },
  headerDay: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  saveBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  moodRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, marginTop: 14 },
  moodEmojiBig: { fontSize: 32 },
  titlePreview: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff', fontStyle: 'italic' },
  moodSection: { borderBottomWidth: 1, paddingBottom: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, marginTop: 14, marginBottom: 4 },
  paperSection: { paddingHorizontal: 20, paddingTop: 12 },
  titleInput: { fontSize: 22, fontWeight: '800', paddingBottom: 8, fontStyle: 'italic' },
  bodyInput: { fontSize: 15, lineHeight: 26, minHeight: 220 },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  photoWrap: { position: 'relative' },
  photoThumb: { width: 90, height: 90, borderRadius: 12 },
  removePhoto: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  colorSection: { borderTopWidth: 1, marginTop: 16, paddingTop: 12 },
  colorRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, paddingBottom: 12 },
  colorBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, gap: 4 },
  toolBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  charCount: { fontSize: 12, marginRight: 8 },
});
