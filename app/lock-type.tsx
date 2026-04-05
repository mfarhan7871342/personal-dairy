import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, Alert, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSettingsStore, LockType } from '@/store/settingsStore';

const LOCK_OPTIONS: { id: LockType; label: string; icon: string; emoji: string; desc: string }[] = [
  { id: 'none', label: 'No Lock', icon: 'lock-open', emoji: '🔓', desc: 'Anyone can open your diary' },
  { id: 'pin', label: '1234 Pin', icon: 'keypad', emoji: '🔢', desc: 'Secure 4-digit PIN code' },
  { id: 'biometrics', label: 'Biometrics', icon: 'finger-print', emoji: '👆', desc: 'Fingerprint or Face ID' },
];

export default function LockTypeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettingsStore();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const handleSelect = (type: LockType) => {
    if (type === 'pin' && !settings.pin) {
      setShowPinSetup(true);
      return;
    }
    updateSettings({ lockType: type });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const savePin = () => {
    if (pinInput.length !== 4 || !/^\d+$/.test(pinInput)) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }
    updateSettings({ pin: pinInput, lockType: 'pin' });
    setShowPinSetup(false);
    setPinInput('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Lock Type</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 }}>
        {/* Lock icon */}
        <View style={styles.lockIconWrap}>
          <View style={[styles.lockIconBg, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="lock-closed" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.lockSubtitle, { color: colors.mutedForeground }]}>
            Keep your secrets safe
          </Text>
        </View>

        {/* Options */}
        <View style={[styles.optionsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {LOCK_OPTIONS.map((opt, idx) => {
            const isActive = settings.lockType === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionRow,
                  {
                    borderBottomColor: idx < LOCK_OPTIONS.length - 1 ? colors.border : 'transparent',
                    borderBottomWidth: idx < LOCK_OPTIONS.length - 1 ? 1 : 0,
                    backgroundColor: isActive ? colors.primary + '10' : 'transparent',
                  },
                ]}
                onPress={() => handleSelect(opt.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: isActive ? colors.primary : colors.muted }]}>
                  <Ionicons name={opt.icon as any} size={20} color={isActive ? '#fff' : colors.mutedForeground} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, { color: colors.foreground }]}>{opt.label}</Text>
                  <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
                </View>
                <View style={[
                  styles.radio,
                  { borderColor: isActive ? colors.primary : colors.border, backgroundColor: isActive ? colors.primary : 'transparent' },
                ]}>
                  {isActive && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* PIN setup */}
        {showPinSetup && (
          <View style={[styles.pinSetup, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Text style={[styles.pinTitle, { color: colors.foreground }]}>Set a 4-digit PIN</Text>
            <TextInput
              value={pinInput}
              onChangeText={(t) => setPinInput(t.replace(/\D/g, '').substring(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              style={[styles.pinInput, { color: colors.foreground, borderColor: colors.primary, backgroundColor: colors.muted }]}
              placeholder="• • • •"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.pinBtns}>
              <TouchableOpacity onPress={() => { setShowPinSetup(false); setPinInput(''); }} style={[styles.pinBtn, { backgroundColor: colors.muted }]}>
                <Text style={[styles.pinBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={savePin} style={[styles.pinBtn, { backgroundColor: colors.primary }]}>
                <Text style={[styles.pinBtnText, { color: '#fff' }]}>Save PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>
          🔐 Set the option to recover your password in Settings
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'center' },
  lockIconWrap: { alignItems: 'center', paddingVertical: 28, gap: 10 },
  lockIconBg: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  lockSubtitle: { fontSize: 14, fontWeight: '500' },
  optionsList: { marginHorizontal: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 14 },
  optionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  optionDesc: { fontSize: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pinSetup: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 20, borderWidth: 2, gap: 14 },
  pinTitle: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  pinInput: { fontSize: 28, textAlign: 'center', letterSpacing: 14, borderRadius: 14, padding: 14, borderWidth: 2 },
  pinBtns: { flexDirection: 'row', gap: 10 },
  pinBtn: { flex: 1, borderRadius: 12, padding: 13, alignItems: 'center' },
  pinBtnText: { fontWeight: '700', fontSize: 14 },
  footerNote: { textAlign: 'center', fontSize: 12, marginTop: 20, paddingHorizontal: 20 },
});
