import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { listCurrencies } from '@/features/currency/api';
import { usePreferences } from '@/services/preferences';
import { strings } from '@/shared/i18n';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { useTheme } from '@/shared/theme';

export function CurrencySection() {
  const theme = useTheme();
  const mode = usePreferences((state) => state.currencyMode);
  const code = usePreferences((state) => state.currencyCode);
  const setCurrencyMode = usePreferences((state) => state.setCurrencyMode);
  const setCurrencyCode = usePreferences((state) => state.setCurrencyCode);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    listCurrencies()
      .then(setOptions)
      .catch(() => setOptions([]));
  }, []);

  const visible = options
    .filter((item) => {
      const needle = query.trim().toLowerCase();
      if (!needle) {
        return false;
      }
      return item.code.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle);
    })
    .slice(0, 8);

  return (
    <Card>
      <Text
        accessibilityRole="header"
        allowFontScaling
        style={{ color: theme.colors.text, ...theme.typography.title }}
      >
        {strings.settings.currency}
      </Text>
      <Text
        allowFontScaling
        style={{
          color: theme.colors.textMuted,
          marginVertical: theme.spacing.xs,
          ...theme.typography.body,
        }}
      >
        {strings.settings.currencyHelp}
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
        <Chip
          label={strings.settings.automatic}
          selected={mode === 'auto'}
          onPress={() => setCurrencyMode('auto')}
        />
        <Chip
          label={code ?? strings.settings.searchCurrency}
          selected={mode === 'manual'}
          onPress={() => setCurrencyMode('manual')}
        />
      </View>
      <TextInput
        accessibilityLabel={strings.settings.searchCurrency}
        value={query}
        onChangeText={setQuery}
        placeholder={strings.settings.searchCurrency}
        placeholderTextColor={theme.colors.textMuted}
        autoCapitalize="characters"
        style={{
          minHeight: 44,
          marginTop: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.button,
          paddingHorizontal: theme.spacing.sm,
          color: theme.colors.text,
          ...theme.typography.body,
        }}
      />
      {visible.map((item) => (
        <Pressable
          key={item.code}
          accessibilityRole="button"
          accessibilityLabel={`${item.code} ${item.name}`}
          onPress={() => setCurrencyCode(item.code)}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text allowFontScaling style={{ color: theme.colors.text, ...theme.typography.body }}>
            {item.code} · {item.name}
          </Text>
        </Pressable>
      ))}
    </Card>
  );
}
