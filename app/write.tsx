import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
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

const THEMES = [
  { id: 'lavender', label: 'Lavender', color: '#6C63FF' },
  { id: 'ocean', label: 'Ocean', color: '#0984E3' },
  { id: 'forest', label: 'Forest', color: '#00B894' },
  { id: 'sunset', label: 'Sunset', color: '#E17055' },
  { id: 'rose', label: 'Rose', color: '#E84393' },
  { id: 'midnight', label: 'Midnight', color: '#2D3561' },
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
  const [themeId, setThemeId] = useState(settings.themeId ?? 'lavender');
  const [saving, setSaving] = useState(false);

  const bodyRef = useRef<TextInput>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const themeColor = THEMES.find((t) => t.id === themeId)?.color ?? colors.primary;

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo access to attach images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: false,
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

    const now = new Date();
    const hour = now.getHours();
    const dateStr = now.toISOString().split('T')[0];

    addEntry({ title, body, mood, photos, themeId, isFavorite: false, tags: [] });
    updateStreak(dateStr, { photos, hour });

    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 400);
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="close" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Entry</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: themeColor }]}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Mood */}
        <Animated.View entering={FadeInUp.delay(50).springify()}>
          <View style={[styles.moodSection, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>How are you feeling?</Text>
            <MoodPicker selected={mood} onSelect={setMood} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.inputSection}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Give your entry a title..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.titleInput, { color: colors.foreground }]}
            returnKeyType="next"
            onSubmitEditing={() => bodyRef.current?.focus()}
          />
        </Animated.View>

        {/* Body */}
        <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.inputSection}>
          <TextInput
            ref={bodyRef}
            value={body}
            onChangeText={setBody}
            placeholder="What's on your mind today?"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.bodyInput, { color: colors.foreground }]}
            multiline
            textAlignVertical="top"
          />
        </Animated.View>

        {/* Photos */}
        {photos.length > 0 && (
          <Animated.View entering={FadeInUp.springify()} style={styles.photosRow}>
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
          </Animated.View>
        )}

        {/* Theme */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <View style={[styles.themeSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Theme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeRow}>
              {THEMES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => { setThemeId(t.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={[styles.themeBtn, { backgroundColor: t.color, borderWidth: themeId === t.id ? 3 : 0, borderColor: '#fff' }]}
                >
                  {themeId === t.id && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 8 }]}>
        <TouchableOpacity onPress={handleAddPhoto} style={styles.toolBtn}>
          <Ionicons name="image" size={22} color={colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/ai')} style={styles.toolBtn}>
          <Ionicons name="sparkles" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{body.length} chars</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  moodSection: { borderBottomWidth: 1, paddingVertical: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, marginBottom: 8 },
  inputSection: { paddingHorizontal: 20, paddingTop: 16 },
  titleInput: { fontSize: 22, fontWeight: '700', paddingBottom: 8 },
  bodyInput: { fontSize: 16, lineHeight: 26, minHeight: 200 },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
  photoWrap: { position: 'relative' },
  photoThumb: { width: 88, height: 88, borderRadius: 10 },
  removePhoto: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  themeSection: { borderTopWidth: 1, marginTop: 16, paddingTop: 12 },
  themeRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 12 },
  themeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, gap: 4 },
  toolBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  charCount: { fontSize: 12, marginRight: 8 },
});
