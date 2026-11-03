import { Text, View } from 'react-native';

import { usePreferences } from '@/services/preferences';
import { strings } from '@/shared/i18n';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { useTheme, type AppearancePreference } from '@/shared/theme';

const options: { id: AppearancePreference; label: string }[] = [
  { id: 'system', label: strings.settings.system },
  { id: 'light', label: strings.settings.light },
  { id: 'dark', label: strings.settings.dark },
];

export function AppearanceSection() {
  const theme = useTheme();
  const appearance = usePreferences((state) => state.appearance);
  const setAppearance = usePreferences((state) => state.setAppearance);

  return (
    <Card>
      <Text
        accessibilityRole="header"
        allowFontScaling
        style={{ color: theme.colors.text, ...theme.typography.title }}
      >
        {strings.settings.appearance}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.sm,
        }}
      >
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={appearance === option.id}
            onPress={() => setAppearance(option.id)}
          />
        ))}
      </View>
    </Card>
  );
}
