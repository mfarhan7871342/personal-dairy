import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { MoodType } from '@/store/entryStore';
import { MOOD_EMOJIS, MOOD_LABELS, MOOD_COLORS } from '@/constants/colors';

const MOODS: MoodType[] = ['happy', 'excited', 'grateful', 'calm', 'neutral', 'sad', 'anxious', 'angry'];

function MoodItem({ mood, selected, onSelect }: { mood: MoodType; selected: boolean; onSelect: (m: MoodType) => void }) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const color = MOOD_COLORS[mood];

  const handlePress = () => {
    scale.value = withSpring(1.25, {}, () => { scale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(mood);
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity style={styles.moodItem} onPress={handlePress} activeOpacity={0.8}>
        <View style={[
          styles.emojiCircle,
          {
            backgroundColor: selected ? color : color + '25',
            borderWidth: selected ? 2.5 : 0,
            borderColor: color,
            shadowColor: selected ? color : 'transparent',
            shadowOpacity: selected ? 0.5 : 0,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: selected ? 6 : 0,
          },
        ]}>
          <Text style={styles.emoji}>{MOOD_EMOJIS[mood]}</Text>
        </View>
        <Text style={[
          styles.moodLabel,
          { color: selected ? color : colors.mutedForeground, fontWeight: selected ? '700' : '400' },
        ]}>
          {MOOD_LABELS[mood]}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function MoodPicker({ selected, onSelect }: { selected: MoodType; onSelect: (m: MoodType) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {MOODS.map((mood) => (
        <MoodItem key={mood} mood={mood} selected={selected === mood} onSelect={onSelect} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 10, gap: 14 },
  moodItem: { alignItems: 'center', gap: 6, minWidth: 60 },
  emojiCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26 },
  moodLabel: { fontSize: 10, textAlign: 'center' },
});
