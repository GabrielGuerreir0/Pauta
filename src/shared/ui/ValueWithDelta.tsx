import { Text, View } from 'react-native';

import { useTheme } from '@/shared/theme';

type ValueWithDeltaProps = {
  value: string;
  delta: number | null;
  deltaLabel: string;
};

export function ValueWithDelta({ value, delta, deltaLabel }: ValueWithDeltaProps) {
  const theme = useTheme();
  const direction = delta === null || Math.abs(delta) < 0.005 ? 'flat' : delta > 0 ? 'up' : 'down';
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  const color =
    direction === 'up'
      ? theme.colors.up
      : direction === 'down'
        ? theme.colors.down
        : theme.colors.textMuted;
  const spoken =
    direction === 'up'
      ? `alta de ${deltaLabel}`
      : direction === 'down'
        ? `queda de ${deltaLabel}`
        : 'estável';

  return (
    <View accessibilityLabel={`${value}, ${spoken}`}>
      <Text
        allowFontScaling
        style={{
          color: theme.colors.text,
          ...theme.typography.value,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      <Text
        allowFontScaling
        style={{ color, marginTop: theme.spacing.xxs, ...theme.typography.caption }}
      >
        {arrow} {deltaLabel}
      </Text>
    </View>
  );
}
