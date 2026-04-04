export const COLORS = {
  light: {
    primary: '#6C63FF',
    primaryLight: '#EDE9FE',
    primaryDark: '#5A52D5',
    background: '#F8F7FF',
    card: '#FFFFFF',
    foreground: '#1A1A2E',
    mutedForeground: '#6B7280',
    muted: '#F3F0FF',
    border: '#E5E0FF',
    accent: '#FF6B9D',
    success: '#4CAF82',
    warning: '#FF9F43',
    error: '#FF5252',
    secondary: '#A78BFA',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E0FF',
    shadow: '#6C63FF',
    radius: 16,
  },
  dark: {
    primary: '#8B81FF',
    primaryLight: '#2D2B4E',
    primaryDark: '#6C63FF',
    background: '#0F0E17',
    card: '#1C1B29',
    foreground: '#E8E8F0',
    mutedForeground: '#9B8FCC',
    muted: '#252336',
    border: '#2D2B4E',
    accent: '#FF6B9D',
    success: '#4CAF82',
    warning: '#FF9F43',
    error: '#FF5252',
    secondary: '#A78BFA',
    tabBar: '#1C1B29',
    tabBarBorder: '#2D2B4E',
    shadow: '#000000',
    radius: 16,
  },
};

export type ColorScheme = typeof COLORS.light;

export const MOOD_COLORS: Record<string, string> = {
  happy: '#FFD93D',
  sad: '#74B9FF',
  anxious: '#A29BFE',
  excited: '#FFA502',
  calm: '#00CEC9',
  angry: '#FF4757',
  grateful: '#FF6B9D',
  neutral: '#B2BEC3',
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
