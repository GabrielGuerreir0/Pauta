import { Pressable, Text } from 'react-native';

import { useTheme } from '@/shared/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function Chip({ label, selected = false, onPress }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        minHeight: 44,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radii.chip,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
      }}
    >
      <Text
        allowFontScaling
        style={{
          color: selected ? theme.colors.background : theme.colors.text,
          ...theme.typography.caption,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
