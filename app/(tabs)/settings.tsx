import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSettingsStore } from '@/store/settingsStore';
import { useEntryStore } from '@/store/entryStore';
import { useStreakStore } from '@/store/streakStore';

function Row({
  icon, emoji, label, value, onPress, danger, children,
}: { icon: string; emoji?: string; label: string; value?: string; onPress?: () => void; danger?: boolean; children?: React.ReactNode }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? colors.error + '18' : colors.primary + '18' }]}>
        {emoji ? (
          <Text style={{ fontSize: 18 }}>{emoji}</Text>
        ) : (
          <Ionicons name={icon as any} size={18} color={danger ? colors.error : colors.primary} />
        )}
      </View>
      <Text style={[styles.rowLabel, { color: danger ? colors.error : colors.foreground }]}>{label}</Text>
      <View style={styles.rowRight}>
        {children}
        {value && <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>}
        {onPress && <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />}
      </View>
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, lock } = useSettingsStore();
  const { clearAll: clearEntries } = useEntryStore();
  const { resetAll: resetStreak } = useStreakStore();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This permanently deletes all journal entries and resets your streak.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Everything', style: 'destructive',
        onPress: () => { clearEntries(); resetStreak(); },
      },
    ]);
  };

  const handleLock = () => {
    if (settings.lockType === 'none') {
      router.push('/lock-type');
      return;
    }
    lock();
    router.replace('/lock');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 }}>
        {/* Purple profile header */}
        <View style={[styles.profileHeader, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color="#fff" />
            </View>
          </View>
          <TextInput
            value={settings.userName}
            onChangeText={(t) => updateSettings({ userName: t })}
            placeholder="Your name"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.nameInput}
          />
          <Text style={styles.profileSub}>Roz — Daily Journal</Text>
        </View>

        {/* Quick access */}
        <View style={styles.quickRow}>
          <TouchableOpacity 
            onPress={() => router.push(settings.pin ? '/change-pin' : '/lock-type')} 
            style={[styles.quickItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.quickIcon, { backgroundColor: '#7C3AED20' }]}>
              <Ionicons name="lock-closed" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>Password</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/themes')} style={[styles.quickItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.quickIcon, { backgroundColor: '#EC489920' }]}>
              <Ionicons name="color-palette" size={22} color="#EC4899" />
            </View>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>Themes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.quickIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="notifications" size={22} color="#F59E0B" />
            </View>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>Reminders</Text>
          </TouchableOpacity>
        </View>

        <Section title="SECURITY">
          <Row icon="lock-closed" emoji="🔒" label="Lock App" value={settings.lockType === 'none' ? 'Off' : settings.lockType} onPress={handleLock} />
          {settings.pin ? (
            <Row icon="keypad" emoji="🔢" label="Change PIN" value="Update code" onPress={() => router.push('/change-pin')} />
          ) : null}
          <Row icon="options" emoji="⚙️" label="Lock Settings" value="" onPress={() => router.push('/lock-type')} />
        </Section>

        <Section title="APPEARANCE">
          <Row icon="color-palette" emoji="🎨" label="Themes" onPress={() => router.push('/themes')} value={settings.themeId} />
          <Row icon="text" emoji="Aa" label="Font Size">
            <View style={styles.fontRow}>
              {(['small', 'medium', 'large'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => updateSettings({ fontSize: s })}
                  style={[styles.fontBtn, { backgroundColor: settings.fontSize === s ? colors.primary : colors.muted }]}
                >
                  <Text style={{ color: settings.fontSize === s ? '#fff' : colors.mutedForeground, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Row>
        </Section>

        <Section title="AI COMPANION">
          <Row icon="key" emoji="🤖" label="Claude API Key" onPress={() => router.push('/ai')}>
            <Text style={{ color: settings.aiApiKey ? colors.success : colors.mutedForeground, fontSize: 12 }}>
              {settings.aiApiKey ? '✓ Set' : 'Not set'}
            </Text>
          </Row>
        </Section>

        <Section title="DATA">
          <Row icon="trash" emoji="🗑️" label="Clear All Data" onPress={handleClearData} danger />
        </Section>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>Roz — Daily Journal v1.0 ✨</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, alignItems: 'center', gap: 8 },
  avatarWrap: { marginBottom: 4 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  nameInput: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  profileSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  quickRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  quickItem: { flex: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center', gap: 8, borderWidth: 1 },
  quickIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  section: { marginBottom: 8, marginTop: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginHorizontal: 20, marginBottom: 6 },
  sectionCard: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 13 },
  fontRow: { flexDirection: 'row', gap: 6 },
  fontBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 20, marginBottom: 8 },
});
