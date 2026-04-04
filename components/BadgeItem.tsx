import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface BadgeItemProps {
  id: string;
  label: string;
  desc: string;
  icon: string;
  earned: boolean;
}

export function BadgeItem({ label, desc, icon, earned }: BadgeItemProps) {
  const colors = useColors();
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (earned) scale.value = withSpring(1, { damping: 8 });
    else scale.value = 1;
  }, [earned]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={[styles.container, { opacity: earned ? 1 : 0.45 }]}>
      <Animated.View
        style={[
          animStyle,
          styles.iconWrap,
          { backgroundColor: earned ? colors.primary + '20' : colors.muted, borderColor: earned ? colors.primary : colors.border },
        ]}
      >
        <Ionicons name={icon as any} size={28} color={earned ? colors.primary : colors.mutedForeground} />
        {!earned && (
          <View style={[styles.lock, { backgroundColor: colors.muted }]}>
            <Ionicons name="lock-closed" size={10} color={colors.mutedForeground} />
          </View>
        )}
      </Animated.View>
      <Text style={[styles.label, { color: colors.foreground }]} numberOfLines={1}>{label}</Text>
      <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '30%', alignItems: 'center', marginBottom: 20, padding: 4 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 8 },
  lock: { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginBottom: 2 },
  desc: { fontSize: 10, textAlign: 'center', lineHeight: 14 },
});
