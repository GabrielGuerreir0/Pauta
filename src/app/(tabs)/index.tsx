import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TodayList } from '@/features/agenda/TodayList';
import { useAppointments } from '@/features/agenda/useAppointments';
import { deviceLocale } from '@/features/currency/api';
import { QuoteCard } from '@/features/currency/QuoteCard';
import { useQuote } from '@/features/currency/useQuote';
import { buildDailySummary } from '@/features/notifications/summary';
import { DayStrip } from '@/features/weather/DayStrip';
import { useWeather } from '@/features/weather/useWeather';
import { WeatherCard } from '@/features/weather/WeatherCard';
import { formatRate, formatUpdatedAt, greetingForHour } from '@/shared/format';
import { strings } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useTheme } from '@/shared/theme';
import { locateWithGps } from '@/services/place';

export default function TodayScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const weather = useWeather();
  const quote = useQuote();
  const agenda = useAppointments();
  const client = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const locale = deviceLocale();
  const hour12 = getCalendars()[0]?.uses24hourClock === false;
  const now = new Date();
  const todayKey = format(now, 'yyyy-MM-dd');
  const todayItems = agenda.items.filter(
    (item) => format(parseISO(item.startsAt), 'yyyy-MM-dd') === todayKey,
  );
  const snapshot = weather.query.data?.snapshot;
  const quoteResult = quote.query.data;

  async function refresh() {
    setRefreshing(true);
    await Promise.all([
      weather.query.refetch(),
      quote.query.refetch(),
      agenda.reload(),
      client.invalidateQueries(),
    ]);
    setRefreshing(false);
  }

  async function enableGps() {
    await locateWithGps();
    await weather.query.refetch();
  }

  const summary = buildDailySummary({
    tempMin: snapshot?.today.min ?? null,
    tempMax: snapshot?.today.max ?? null,
    rainPercent: snapshot?.today.rainChance ?? null,
    rateLabel: quoteResult?.quote
      ? formatRate(quoteResult.quote.rate, quoteResult.quote.currency, locale)
      : null,
    appointmentCount: todayItems.length,
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void refresh()}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View>
        <Text
          accessibilityRole="header"
          allowFontScaling
          style={{ color: theme.colors.text, ...theme.typography.title }}
        >
          {greetingForHour(now.getHours())}
        </Text>
        <Text allowFontScaling style={{ color: theme.colors.textMuted, ...theme.typography.body }}>
          {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </Text>
        <Text
          accessibilityRole="button"
          allowFontScaling
          onPress={() => router.push('/(tabs)/settings')}
          style={{
            color: theme.colors.primary,
            marginTop: theme.spacing.xxs,
            minHeight: 44,
            ...theme.typography.body,
          }}
        >
          {weather.place?.label ?? strings.today.chooseCity}
        </Text>
      </View>

      {weather.blocked && !snapshot ? (
        <Card>
          <ErrorState
            message={strings.today.locationNeeded}
            actionLabel={strings.today.allowLocation}
            onAction={() => void enableGps()}
          />
          <Button
            label={strings.today.chooseCity}
            onPress={() => router.push('/(tabs)/settings')}
            tone="ghost"
          />
        </Card>
      ) : null}

      {weather.query.isLoading ? <Skeleton height={280} /> : null}
      {snapshot ? (
        <>
          {weather.query.data?.fromCache ? (
            <Text
              allowFontScaling
              style={{ color: theme.colors.textMuted, ...theme.typography.caption }}
            >
              {strings.today.offline} {formatUpdatedAt(snapshot.updatedAt, locale, hour12)}
            </Text>
          ) : null}
          <WeatherCard snapshot={snapshot} hour12={hour12} locale={locale} />
          {snapshot.days.length > 0 ? <DayStrip days={snapshot.days} unit={snapshot.unit} /> : null}
        </>
      ) : null}
      {weather.query.isError && !snapshot ? (
        <Card>
          <ErrorState
            message={strings.today.offline}
            actionLabel={strings.today.retry}
            onAction={() => void weather.query.refetch()}
          />
        </Card>
      ) : null}

      {quote.query.isLoading ? <Skeleton height={120} /> : null}
      {quoteResult?.kind === 'usd' ? (
        <Card>
          <ErrorState
            message={strings.today.dollarUsd}
            actionLabel={strings.today.chooseCurrency}
            onAction={() => router.push('/(tabs)/settings')}
          />
        </Card>
      ) : null}
      {quoteResult?.quote ? (
        <QuoteCard quote={quoteResult.quote} locale={locale} hour12={hour12} />
      ) : null}
      {quoteResult?.kind === 'missing' ? (
        <Card>
          <ErrorState
            message={strings.today.quoteMissing}
            actionLabel={strings.today.chooseCurrency}
            onAction={() => router.push('/(tabs)/settings')}
          />
        </Card>
      ) : null}
      {quoteResult?.kind === 'cache' ? (
        <Text
          allowFontScaling
          style={{ color: theme.colors.textMuted, ...theme.typography.caption }}
        >
          {strings.today.offline}
        </Text>
      ) : null}

      <TodayList items={todayItems} hour12={hour12} onToggle={(item) => void agenda.toggle(item)} />
      <Text allowFontScaling style={{ color: theme.colors.textMuted, ...theme.typography.caption }}>
        {summary}
      </Text>
    </ScrollView>
  );
}
