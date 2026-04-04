import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSettingsStore } from '@/store/settingsStore';
import { authenticateBiometric } from '@/utils/biometric';

const PINS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

function PinDot({ filled }: { filled: boolean }) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(() => {
    if (filled) {
      scale.value = withSequence(withSpring(1.3), withSpring(1));
    }
  }, [filled]);

  return (
    <Animated.View
      style={[
        dotStyle,
        styles.dot,
        { backgroundColor: filled ? colors.primary : 'transparent', borderColor: colors.primary },
      ]}
    />
  );
}

export default function LockScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, unlock } = useSettingsStore();
  const [input, setInput] = useState<string[]>([]);
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    if (settings.lockType === 'biometrics') attemptBiometric();
  }, []);

  const attemptBiometric = async () => {
    const success = await authenticateBiometric('Unlock Roz');
    if (success) handleUnlock();
  };

  const handleUnlock = () => {
    unlock();
    router.replace('/(tabs)');
  };

  const shake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    setInput([]);
  };

  const handlePress = (val: string) => {
    if (val === '' || (input.length >= 4 && val !== 'del')) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (val === 'del') {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    const newInput = [...input, val];
    setInput(newInput);

    if (newInput.length === 4) {
      setTimeout(() => {
        if (newInput.join('') === settings.pin) {
          handleUnlock();
        } else {
          shake();
        }
      }, 150);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 60, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <View style={[styles.iconBg, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="lock-closed" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Roz</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Enter your PIN to continue</Text>
      </View>

      <Animated.View style={[styles.dots, shakeStyle]}>
        {[0, 1, 2, 3].map((i) => (
          <PinDot key={i} filled={i < input.length} />
        ))}
      </Animated.View>

      <View style={styles.pad}>
        {PINS.map((key, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.key, { backgroundColor: key ? colors.card : 'transparent', borderColor: colors.border, borderWidth: key ? 1 : 0 }]}
            onPress={() => handlePress(key)}
            activeOpacity={0.7}
            disabled={!key && key !== '0'}
          >
            {key === 'del' ? (
              <Ionicons name="backspace" size={22} color={colors.foreground} />
            ) : (
              <Text style={[styles.keyText, { color: colors.foreground }]}>{key}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {settings.lockType === 'biometrics' && (
        <TouchableOpacity onPress={attemptBiometric} style={styles.bioBtn}>
          <Ionicons name="finger-print" size={28} color={colors.primary} />
          <Text style={[styles.bioText, { color: colors.primary }]}>Use biometrics</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 48, gap: 8 },
  iconBg: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { fontSize: 15 },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 48 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 300, gap: 16, justifyContent: 'center' },
  key: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 24, fontWeight: '500' },
  bioBtn: { marginTop: 32, alignItems: 'center', gap: 8 },
  bioText: { fontSize: 14, fontWeight: '600' },
});
