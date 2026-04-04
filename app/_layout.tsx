import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="lock" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="write" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="entry/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="ai" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="themes" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
