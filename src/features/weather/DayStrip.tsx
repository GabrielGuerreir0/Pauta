import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Text, View } from 'react-native';

import type { WeatherSnapshot } from '@/features/weather/model';
import { WeatherGlyph } from '@/features/weather/WeatherGlyph';
import { formatTemperature } from '@/shared/format';
import { strings } from '@/shared/i18n';
import { Card } from '@/shared/ui/Card';
import { useTheme } from '@/shared/theme';

type DayStripProps = {
  days: WeatherSnapshot['days'];
  unit: WeatherSnapshot['unit'];
};

export function DayStrip({ days, unit }: DayStripProps) {
  const theme = useTheme();
  const floor = Math.min(...days.map((day) => day.min));
  const ceil = Math.max(...days.map((day) => day.max));
  const span = Math.max(ceil - floor, 1);

  return (
    <Card>
      <Text
        allowFontScaling
        style={{
          color: theme.colors.text,
          marginBottom: theme.spacing.sm,
          ...theme.typography.body,
        }}
      >
        {strings.today.nextDays}
      </Text>
      {days.map((day) => {
        const left = ((day.min - floor) / span) * 100;
        const width = Math.max(((day.max - day.min) / span) * 100, 8);
        return (
          <View
            key={day.date}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.xs,
            }}
          >
            <Text
              allowFontScaling
              style={{ width: 44, color: theme.colors.text, ...theme.typography.caption }}
            >
              {format(parseISO(day.date), 'EEE', { locale: ptBR })}
            </Text>
            <WeatherGlyph icon={day.icon} color={theme.colors.text} size={20} />
            <View
              style={{
                flex: 1,
                height: 8,
                borderRadius: theme.radii.chip,
                backgroundColor: theme.colors.border,
              }}
            >
              <View
                style={{
                  marginLeft: `${left}%`,
                  width: `${width}%`,
                  height: 8,
                  borderRadius: theme.radii.chip,
                  backgroundColor: theme.colors.primary,
                }}
              />
            </View>
            <Text
              allowFontScaling
              style={{
                color: theme.colors.textMuted,
                ...theme.typography.caption,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatTemperature(day.min, unit)}–{formatTemperature(day.max, unit)} ·{' '}
              {Math.round(day.rainChance)}%
            </Text>
          </View>
        );
      })}
    </Card>
  );
}
