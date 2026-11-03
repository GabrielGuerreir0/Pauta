import { Text, View } from 'react-native';

import type { MoneyQuote } from '@/features/currency/quote';
import { formatPercent, formatRate, formatUpdatedAt } from '@/shared/format';
import { strings } from '@/shared/i18n';
import { Card } from '@/shared/ui/Card';
import { ValueWithDelta } from '@/shared/ui/ValueWithDelta';
import { useTheme } from '@/shared/theme';

type QuoteCardProps = {
  quote: MoneyQuote;
  locale: string;
  hour12: boolean;
};

export function QuoteCard({ quote, locale, hour12 }: QuoteCardProps) {
  const theme = useTheme();
  const value = `US$ 1 = ${formatRate(quote.rate, quote.currency, locale)}`;
  const deltaLabel =
    quote.changePercent === null
      ? 'sem variação do dia'
      : formatPercent(quote.changePercent, locale) + '%';
  const source =
    quote.source === 'awesome'
      ? strings.sources.awesome
      : quote.source === 'frankfurter'
        ? strings.sources.frankfurter
        : strings.sources.cache;
  const range =
    quote.high !== null && quote.low !== null
      ? ` · ${formatRate(quote.low, quote.currency, locale)}–${formatRate(quote.high, quote.currency, locale)}`
      : '';

  return (
    <Card>
      <ValueWithDelta value={value} delta={quote.changePercent} deltaLabel={deltaLabel} />
      <View style={{ marginTop: theme.spacing.xs }}>
        <Text
          allowFontScaling
          style={{ color: theme.colors.textMuted, ...theme.typography.caption }}
        >
          {formatUpdatedAt(quote.updatedAt, locale, hour12)} · {source}
          {range}
        </Text>
      </View>
    </Card>
  );
}
