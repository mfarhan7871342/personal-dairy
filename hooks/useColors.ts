import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { getThemeColors, ColorScheme } from '@/constants/colors';

export function useColors(): ColorScheme {
  const scheme = useColorScheme() ?? 'light';
  const { settings } = useSettingsStore();
  return getThemeColors(scheme, settings.themeId);
}
