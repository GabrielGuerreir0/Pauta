import { format, parseISO } from 'date-fns';
import Constants from 'expo-constants';
import { ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppointments } from '@/features/agenda/useAppointments';
import { CurrencySection } from '@/features/currency/CurrencySection';
import { deviceLocale } from '@/features/currency/api';
import { formatRate } from '@/shared/format';
import { useQuote } from '@/features/currency/useQuote';
import { SummarySection } from '@/features/notifications/SummarySection';
import { buildDailySummary } from '@/features/notifications/summary';
import { AppearanceSection } from '@/features/settings/AppearanceSection';
import { LocationSection } from '@/features/settings/LocationSection';
import { useWeather } from '@/features/weather/useWeather';
import { strings } from '@/shared/i18n';
import { Card } from '@/shared/ui/Card';
import { useTheme } from '@/shared/theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const weather = useWeather();
  const quote = useQuote();
  const agenda = useAppointments();
  const snapshot = weather.query.data?.snapshot;
  const rate = quote.query.data?.quote;
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayCount = agenda.items.filter(
    (item) => format(parseISO(item.startsAt), 'yyyy-MM-dd') === todayKey,
  ).length;
  const body = buildDailySummary({
    tempMin: snapshot?.today.min ?? null,
    tempMax: snapshot?.today.max ?? null,
    rainPercent: snapshot?.today.rainChance ?? null,
    rateLabel: rate ? formatRate(rate.rate, rate.currency, deviceLocale()) : null,
    appointmentCount: todayCount,
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: insets.bottom + theme.spacing.xxl,
        gap: theme.spacing.md,
      }}
    >
      <Text
        accessibilityRole="header"
        allowFontScaling
        style={{ color: theme.colors.text, ...theme.typography.title }}
      >
        {strings.settings.title}
      </Text>
      <LocationSection />
      <CurrencySection />
      <SummarySection body={body} />
      <AppearanceSection />
      <Card>
        <Text
          accessibilityRole="header"
          allowFontScaling
          style={{ color: theme.colors.text, ...theme.typography.title }}
        >
          {strings.settings.about}
        </Text>
        <Text
          allowFontScaling
          style={{
            color: theme.colors.textMuted,
            marginTop: theme.spacing.xs,
            ...theme.typography.body,
          }}
        >
          {strings.settings.aboutBody}
        </Text>
        <Text
          allowFontScaling
          style={{
            color: theme.colors.textMuted,
            marginTop: theme.spacing.xs,
            ...theme.typography.caption,
          }}
        >
          Pauta {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </Card>
    </ScrollView>
  );
}
