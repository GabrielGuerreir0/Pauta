import type { ViewStyle } from 'react-native';

export const shadows: Record<'light' | 'dark', ViewStyle> = {
  light: {
    shadowColor: '#1A1D23',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  dark: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};
