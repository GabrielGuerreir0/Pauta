import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/shared/theme';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export function Card({ children, style, padded = true }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.card,
          padding: padded ? theme.spacing.lg : 0,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.colors.border,
        },
        theme.shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}
