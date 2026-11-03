import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { searchCities, type CityHit } from '@/services/geo';
import { locateWithGps } from '@/services/place';
import { usePreferences } from '@/services/preferences';
import { strings } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { useTheme } from '@/shared/theme';

export function LocationSection() {
  const theme = useTheme();
  const setManualPlace = usePreferences((state) => state.setManualPlace);
  const manualLabel = usePreferences((state) => state.manualLabel);
  const locationMode = usePreferences((state) => state.locationMode);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<CityHit[]>([]);
  const [message, setMessage] = useState(locationMode === 'manual' ? manualLabel : '');

  async function enableGps() {
    try {
      const place = await locateWithGps();
      setMessage(place.label);
    } catch {
      setMessage(strings.settings.permissionDenied);
    }
  }

  async function search() {
    setHits(await searchCities(query));
  }

  return (
    <Card>
      <Text
        accessibilityRole="header"
        allowFontScaling
        style={{ color: theme.colors.text, ...theme.typography.title }}
      >
        {strings.settings.location}
      </Text>
      <Text
        allowFontScaling
        style={{
          color: theme.colors.textMuted,
          marginVertical: theme.spacing.xs,
          ...theme.typography.body,
        }}
      >
        {strings.settings.locationHelp}
      </Text>
      {message ? (
        <Text
          allowFontScaling
          style={{
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            ...theme.typography.caption,
          }}
        >
          {message}
        </Text>
      ) : null}
      <Button label={strings.settings.gps} onPress={() => void enableGps()} />
      <TextInput
        accessibilityLabel={strings.settings.searchCity}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => void search()}
        placeholder={strings.settings.searchPlaceholder}
        placeholderTextColor={theme.colors.textMuted}
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
      <View style={{ marginTop: theme.spacing.xs }}>
        {hits.map((hit) => (
          <Pressable
            key={`${hit.latitude}-${hit.longitude}`}
            accessibilityRole="button"
            accessibilityLabel={hit.label}
            onPress={() => {
              setManualPlace(hit);
              setMessage(hit.label);
              setHits([]);
            }}
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text allowFontScaling style={{ color: theme.colors.text, ...theme.typography.body }}>
              {hit.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
