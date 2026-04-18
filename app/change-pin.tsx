import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Alert } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSettingsStore } from '@/store/settingsStore';

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

type Step = 'current' | 'new' | 'confirm';

export default function ChangePinScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettingsStore();

  const [step, setStep] = useState<Step>(settings.pin ? 'current' : 'new');
  const [input, setInput] = useState<string[]>([]);
  const [newPin, setNewPin] = useState<string>('');

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const topPad = (Platform.OS === 'web' ? 67 : insets.top) ?? 0;
  const bottomPad = insets.bottom ?? 0;

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

  const handleNextStep = (val: string[]) => {
    const pin = val.join('');

    if (step === 'current') {
      if (pin === settings.pin) {
        setStep('new');
        setInput([]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        shake();
      }
    } else if (step === 'new') {
      setNewPin(pin);
      setStep('confirm');
      setInput([]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (step === 'confirm') {
      if (pin === newPin) {
        updateSettings({ pin: pin, lockType: 'pin' });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Your PIN has been updated successfully.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        shake();
        Alert.alert('Error', 'PINs do not match. Please try again.');
        setStep('new');
        setNewPin('');
      }
    }
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
        handleNextStep(newInput);
      }, 150);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'current': return 'Enter Current PIN';
      case 'new': return 'Enter New PIN';
      case 'confirm': return 'Confirm New PIN';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'current': return 'Please verify your identity';
      case 'new': return 'Create a new 4-digit security code';
      case 'confirm': return 'Repeat the new PIN to confirm';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 40, paddingBottom: bottomPad + 20 }]}>
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={[styles.backBtn, { top: topPad + 10 }]}
      >
        <Ionicons name="chevron-back" size={28} color={colors.foreground} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={[styles.iconBg, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="keypad" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{getStepTitle()}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{getStepSubtitle()}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  backBtn: { position: 'absolute', left: 20, zIndex: 10, padding: 8 },
  header: { alignItems: 'center', marginBottom: 40, gap: 8 },
  iconBg: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 14, opacity: 0.8 },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 48 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, gap: 14, justifyContent: 'center' },
  key: { width: 75, height: 75, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 22, fontWeight: '600' },
});
