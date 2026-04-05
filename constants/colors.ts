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
