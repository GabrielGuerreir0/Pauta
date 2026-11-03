import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/shared/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, tone = 'primary', style }: ButtonProps) {
  const theme = useTheme();
  const background =
    tone === 'primary'
      ? theme.colors.primary
      : tone === 'secondary'
        ? theme.colors.surface
        : 'transparent';
  const color = tone === 'primary' ? theme.colors.background : theme.colors.text;
  const borderWidth = tone === 'ghost' ? 0 : 1;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 44,
          minWidth: 44,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.button,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: background,
          borderWidth,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text allowFontScaling style={{ color, ...theme.typography.body }}>
        {label}
      </Text>
    </Pressable>
  );
}
