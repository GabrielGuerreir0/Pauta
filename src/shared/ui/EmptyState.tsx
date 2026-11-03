import { Text, View } from 'react-native';

import { useTheme } from '@/shared/theme';

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View accessibilityLabel={`${title}. ${message}`} style={{ paddingVertical: theme.spacing.lg }}>
      <Text allowFontScaling style={{ color: theme.colors.text, ...theme.typography.body }}>
        {title}
      </Text>
      <Text
        allowFontScaling
        style={{
          color: theme.colors.textMuted,
          marginTop: theme.spacing.xxs,
          ...theme.typography.caption,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
