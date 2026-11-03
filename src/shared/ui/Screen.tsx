import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/theme';

type ScreenProps = {
  title: string;
  message: string;
};

export function Screen({ title, message }: ScreenProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={title}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.xxl,
        },
      ]}
    >
      <Text
        accessibilityRole="header"
        allowFontScaling
        style={{ color: theme.colors.text, ...theme.typography.title }}
      >
        {title}
      </Text>
      <Text
        allowFontScaling
        style={{
          color: theme.colors.textMuted,
          marginTop: theme.spacing.xs,
          ...theme.typography.body,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
