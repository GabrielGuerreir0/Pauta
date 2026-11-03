import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/shared/theme';

type ListItemProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  highlighted?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
};

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  highlighted = false,
  onPress,
  accessibilityLabel,
}: ListItemProps) {
  const theme = useTheme();
  const content = (
    <View
      style={{
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radii.button,
        backgroundColor: highlighted ? theme.colors.background : 'transparent',
      }}
    >
      {leading}
      <View style={{ flex: 1 }}>
        <Text allowFontScaling style={{ color: theme.colors.text, ...theme.typography.body }}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            allowFontScaling
            style={{ color: theme.colors.textMuted, ...theme.typography.caption }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );

  if (!onPress) {
    return <View accessibilityLabel={accessibilityLabel}>{content}</View>;
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress}>
      {content}
    </Pressable>
  );
}
