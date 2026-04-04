import { useColorScheme } from 'react-native';
import { COLORS, ColorScheme } from '@/constants/colors';

export function useColors(): ColorScheme {
  const scheme = useColorScheme() ?? 'light';
  return COLORS[scheme];
}
