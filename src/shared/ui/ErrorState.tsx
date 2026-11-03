import { Text, View } from 'react-native';

import { Button } from '@/shared/ui/Button';
import { useTheme } from '@/shared/theme';

type ErrorStateProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorState({ message, actionLabel, onAction }: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View accessibilityRole="alert" style={{ gap: theme.spacing.sm }}>
      <Text allowFontScaling style={{ color: theme.colors.text, ...theme.typography.body }}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} tone="secondary" />
      ) : null}
    </View>
  );
}
