export const COLORS = {
  light: {
    primary: '#7C3AED',
    primaryLight: '#EDE9FE',
    primaryDark: '#5B21B6',
    background: '#F5F3FF',
    card: '#FFFFFF',
    foreground: '#1A0533',
    mutedForeground: '#7C6FA0',
    muted: '#F0EBFF',
    border: '#E5DEFF',
    accent: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    secondary: '#A78BFA',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5DEFF',
    shadow: '#7C3AED',
    radius: 16,
  },
  dark: {
    primary: '#A78BFA',
    primaryLight: '#2D1B69',
    primaryDark: '#7C3AED',
    background: '#0F0620',
    card: '#1C0F38',
    foreground: '#F0EBFF',
    mutedForeground: '#9B82CC',
    muted: '#2D1B69',
    border: '#3B1F7A',
    accent: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    secondary: '#C4B5FD',
    tabBar: '#1C0F38',
    tabBarBorder: '#3B1F7A',
    shadow: '#000000',
    radius: 16,
  },
};

export type ColorScheme = typeof COLORS.light;

export const THEMES: Record<string, Partial<ColorScheme>> = {
  lavender: { primary: '#7C3AED', secondary: '#A78BFA' },
  midnight: { primary: '#4C1D95', secondary: '#1E1B4B', background: '#0F0620' },
  galaxy: { primary: '#7C3AED', secondary: '#0F0620' },
  ocean: { primary: '#0369A1', secondary: '#38BDF8' },
  forest: { primary: '#059669', secondary: '#10B981' },
  sunset: { primary: '#EA580C', secondary: '#FB923C' },
  rose: { primary: '#BE185D', secondary: '#F472B6' },
  moon: { primary: '#4F46E5', secondary: '#818CF8' },
  peach: { primary: '#C2410C', secondary: '#FCA5A5' },
  // Colors themes
  white: { primary: '#7C3AED', background: '#F8F7FF' },
  parchment: { primary: '#92400E', background: '#FDF8EE' },
  mint: { primary: '#16A34A', background: '#F0FDF4' },
  blush: { primary: '#E11D48', background: '#FFF1F2' },
  sky: { primary: '#0284C7', background: '#F0F9FF' },
  lavenderLight: { primary: '#7C3AED', background: '#FAF5FF' },
};

export function getThemeColors(scheme: 'light' | 'dark', themeId: string): ColorScheme {
  const base = COLORS[scheme];
  const themeOverride = THEMES[themeId] || {};
  return { ...base, ...themeOverride };
}

export const MOOD_COLORS: Record<string, string> = {
  happy: '#FFD93D',
  sad: '#74B9FF',
  anxious: '#A29BFE',
  excited: '#FF9500',
  calm: '#34D399',
  angry: '#FF4757',
  grateful: '#FF6B9D',
  neutral: '#B2BEC3',
};

export const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊',
  excited: '😄',
  grateful: '💗',
  calm: '🌿',
  neutral: '😐',
  sad: '😢',
  anxious: '😰',
  angry: '😡',
};

export const MOOD_ICONS: Record<string, string> = {
  happy: 'sunny',
  sad: 'rainy',
  anxious: 'thunderstorm',
  excited: 'flash',
  calm: 'leaf',
  angry: 'flame',
  grateful: 'heart',
  neutral: 'remove-circle',
};

export const MOOD_LABELS: Record<string, string> = {
  happy: 'Happy',
  sad: 'Sad',
  anxious: 'Anxious',
  excited: 'Excited',
  calm: 'Calm',
  angry: 'Angry',
  grateful: 'Grateful',
  neutral: 'Neutral',
};
