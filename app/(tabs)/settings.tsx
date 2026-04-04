import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Switch, TextInput, Alert, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSettingsStore, LockType } from '@/store/settingsStore';
import { useEntryStore } from '@/store/entryStore';
import { useStreakStore } from '@/store/streakStore';

function SettingRow({
  icon, label, value, onPress, children, danger,
}: { icon: string; label: string; value?: string; onPress?: () => void; children?: React.ReactNode; danger?: boolean }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.row, { borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !children}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? colors.error + '15' : colors.primary + '15' }]}>
        <Ionicons name={icon as any} size={18} color={danger ? colors.error : colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? colors.error : colors.foreground }]}>{label}</Text>
      <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value && <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>}
        {children}
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
  const [editingPin, setEditingPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleLockType = (type: LockType) => {
    if (type === 'pin' && !settings.pin) {
      setEditingPin(true);
      return;
    }
    updateSettings({ lockType: type });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const savePin = () => {
    if (pinInput.length !== 4 || !/^\d+$/.test(pinInput)) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }
    updateSettings({ pin: pinInput, lockType: 'pin' });
    setEditingPin(false);
    setPinInput('');
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all your journal entries and reset your streak. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Everything', style: 'destructive',
        onPress: () => { clearEntries(); resetStreak(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); },
      },
    ]);
  };

  const handleLock = () => {
    if (settings.lockType === 'none') return;
    lock();
    router.replace('/lock');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 }}>
        <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <TextInput
            value={settings.userName}
            onChangeText={(t) => updateSettings({ userName: t })}
            placeholder="Your name"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.nameInput}
          />
        </View>

        <Section title="SECURITY">
          <SettingRow icon="lock-closed" label="Lock App" value={settings.lockType === 'none' ? 'Off' : settings.lockType} onPress={handleLock} />
          <SettingRow icon="keypad" label="PIN Lock" onPress={() => handleLockType('pin')}>
            <Switch
              value={settings.lockType === 'pin'}
              onValueChange={(v) => handleLockType(v ? 'pin' : 'none')}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          <SettingRow icon="finger-print" label="Biometrics" onPress={() => handleLockType('biometrics')}>
            <Switch
              value={settings.lockType === 'biometrics'}
              onValueChange={(v) => handleLockType(v ? 'biometrics' : 'none')}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
        </Section>

        {editingPin && (
          <View style={[styles.pinEdit, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.pinLabel, { color: colors.foreground }]}>Enter new 4-digit PIN</Text>
            <TextInput
              value={pinInput}
              onChangeText={(t) => setPinInput(t.replace(/\D/g, '').substring(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              style={[styles.pinInput, { color: colors.foreground, borderColor: colors.primary, backgroundColor: colors.muted }]}
              placeholder="••••"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.pinActions}>
              <TouchableOpacity onPress={() => setEditingPin(false)} style={[styles.pinBtn, { backgroundColor: colors.muted }]}>
                <Text style={[styles.pinBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={savePin} style={[styles.pinBtn, { backgroundColor: colors.primary }]}>
                <Text style={[styles.pinBtnText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Section title="APPEARANCE">
          <SettingRow icon="color-palette" label="Themes" onPress={() => router.push('/themes')} value={settings.themeId} />
          <SettingRow icon="text" label="Font Size" value={settings.fontSize}>
            <View style={styles.fontRow}>
              {(['small', 'medium', 'large'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => updateSettings({ fontSize: s })}
                  style={[styles.fontBtn, { backgroundColor: settings.fontSize === s ? colors.primary : colors.muted }]}
                >
                  <Text style={{ color: settings.fontSize === s ? '#fff' : colors.mutedForeground, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingRow>
        </Section>

        <Section title="AI">
          <SettingRow icon="key" label="Claude API Key" onPress={() => router.push('/ai')}>
            <Text style={{ color: settings.aiApiKey ? colors.success : colors.mutedForeground, fontSize: 12 }}>
              {settings.aiApiKey ? 'Set' : 'Not set'}
            </Text>
          </SettingRow>
        </Section>

        <Section title="DATA">
          <SettingRow icon="trash" label="Clear All Data" onPress={handleClearData} danger />
        </Section>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>Roz — Daily Journal v1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  profileCard: { marginHorizontal: 16, marginBottom: 20, borderRadius: 20, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  nameInput: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff' },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginHorizontal: 20, marginBottom: 6 },
  sectionCard: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, gap: 12 },
  rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 13 },
  pinEdit: { marginHorizontal: 16, marginBottom: 8, borderRadius: 16, padding: 20, borderWidth: 1, gap: 12 },
  pinLabel: { fontSize: 14, fontWeight: '600' },
  pinInput: { fontSize: 24, textAlign: 'center', letterSpacing: 12, borderRadius: 12, padding: 16, borderWidth: 2 },
  pinActions: { flexDirection: 'row', gap: 10 },
  pinBtn: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  pinBtnText: { fontWeight: '700', fontSize: 14 },
  fontRow: { flexDirection: 'row', gap: 6 },
  fontBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 20, marginBottom: 8 },
});
