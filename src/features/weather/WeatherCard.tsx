import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';

import type { WeatherSnapshot } from '@/features/weather/model';
import { WeatherGlyph } from '@/features/weather/WeatherGlyph';
import { formatClock, formatTemperature } from '@/shared/format';
import { strings } from '@/shared/i18n';
import { useTheme, weatherMoods } from '@/shared/theme';

type WeatherCardProps = {
  snapshot: WeatherSnapshot;
  hour12: boolean;
  locale: string;
};

export function WeatherCard({ snapshot, hour12, locale }: WeatherCardProps) {
  const theme = useTheme();
  const mood = weatherMoods[snapshot.current.mood];
  const unit = snapshot.unit;
  const sunrise = snapshot.today.sunrise
    ? formatClock(new Date(snapshot.today.sunrise), locale, hour12)
    : '—';
  const sunset = snapshot.today.sunset
    ? formatClock(new Date(snapshot.today.sunset), locale, hour12)
    : '—';

  return (
    <LinearGradient
      colors={[mood.gradient[0], mood.gradient[1]]}
      style={{ borderRadius: theme.radii.card, padding: theme.spacing.lg }}
    >
      <View
        accessibilityLabel={`${strings.today.weatherNow}: ${formatTemperature(snapshot.current.temperature, unit)}, ${snapshot.current.label}`}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Text
            allowFontScaling
            style={{ color: mood.text, ...theme.typography.display, fontVariant: ['tabular-nums'] }}
          >
            {formatTemperature(snapshot.current.temperature, unit)}
          </Text>
          <WeatherGlyph
            icon={snapshot.current.icon}
            isDay={snapshot.current.isDay}
            color={mood.text}
            size={40}
          />
        </View>
        <Text allowFontScaling style={{ color: mood.text, ...theme.typography.title }}>
          {snapshot.current.label}
        </Text>
        <Text
          allowFontScaling
          style={{ color: mood.muted, marginTop: theme.spacing.xxs, ...theme.typography.body }}
        >
          {strings.today.feelsLike} {formatTemperature(snapshot.current.apparent, unit)} ·{' '}
          {strings.today.max} {formatTemperature(snapshot.today.max, unit)} · {strings.today.min}{' '}
          {formatTemperature(snapshot.today.min, unit)}
        </Text>
        <Text
          allowFontScaling
          style={{ color: mood.muted, marginTop: theme.spacing.xs, ...theme.typography.caption }}
        >
          {strings.today.wind} {Math.round(snapshot.current.wind)} km/h · {strings.today.humidity}{' '}
          {Math.round(snapshot.current.humidity)}% · {strings.today.rain}{' '}
          {Math.round(snapshot.current.rainChance)}% · {strings.today.uv}{' '}
          {snapshot.today.uv.toFixed(0)} · {strings.today.sunrise} {sunrise} ·{' '}
          {strings.today.sunset} {sunset}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: theme.spacing.md }}
      >
        {snapshot.hours.map((hour) => (
          <View
            key={hour.time}
            style={{ width: 64, alignItems: 'center', marginRight: theme.spacing.xs }}
          >
            <Text allowFontScaling style={{ color: mood.muted, ...theme.typography.caption }}>
              {formatClock(new Date(hour.time), locale, hour12)}
            </Text>
            <WeatherGlyph icon={hour.icon} isDay={hour.isDay} color={mood.text} size={22} />
            <Text
              allowFontScaling
              style={{
                color: mood.text,
                ...theme.typography.caption,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatTemperature(hour.temperature, unit)}
            </Text>
            <Text allowFontScaling style={{ color: mood.muted, ...theme.typography.caption }}>
              {Math.round(hour.rainChance)}%
            </Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
