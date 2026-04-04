import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { MoodType } from '@/store/entryStore';
import { MOOD_COLORS, MOOD_ICONS, MOOD_LABELS } from '@/constants/colors';

const MOODS: MoodType[] = ['happy', 'excited', 'grateful', 'calm', 'neutral', 'sad', 'anxious', 'angry'];

interface MoodItemProps {
  mood: MoodType;
  selected: boolean;
  onSelect: (mood: MoodType) => void;
}

function MoodItem({ mood, selected, onSelect }: MoodItemProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(1.2, {}, () => { scale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(mood);
  };

  const color = MOOD_COLORS[mood];
  const icon = MOOD_ICONS[mood];

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity style={styles.moodItem} onPress={handlePress} activeOpacity={0.8}>
        <View
          style={[
            styles.moodIcon,
            { backgroundColor: selected ? color : color + '22', borderWidth: selected ? 2 : 0, borderColor: color },
          ]}
        >
          <Ionicons name={icon as any} size={20} color={selected ? '#fff' : color} />
        </View>
        <Text style={[styles.moodLabel, { color: selected ? color : colors.mutedForeground, fontWeight: selected ? '700' : '400' }]}>
          {MOOD_LABELS[mood]}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface MoodPickerProps {
  selected: MoodType;
  onSelect: (mood: MoodType) => void;
}

export function MoodPicker({ selected, onSelect }: MoodPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {MOODS.map((mood) => (
        <MoodItem key={mood} mood={mood} selected={selected === mood} onSelect={onSelect} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  moodItem: { alignItems: 'center', gap: 6, minWidth: 56 },
  moodIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  moodLabel: { fontSize: 10, textAlign: 'center' },
});
