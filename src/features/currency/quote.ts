export type QuoteSource = 'awesome' | 'frankfurter' | 'cache';

export type MoneyQuote = {
  currency: string;
  rate: number;
  high: number | null;
  low: number | null;
  changeValue: number | null;
  changePercent: number | null;
  updatedAt: string;
  source: QuoteSource;
};

export type QuoteAttempt = { ok: true; quote: MoneyQuote } | { ok: false };

export function previousWeekday(isoDate: string): string {
  const [yearText, monthText, dayText] = isoDate.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  do {
    date.setUTCDate(date.getUTCDate() - 1);
  } while (date.getUTCDay() === 0 || date.getUTCDay() === 6);
  return date.toISOString().slice(0, 10);
}

export function frankfurterChange(
  latest: number,
  previous: number,
): { changeValue: number; changePercent: number } {
  const changeValue = latest - previous;
  const changePercent = previous === 0 ? 0 : (changeValue / previous) * 100;
  return { changeValue, changePercent };
}

export function chooseQuote(input: {
  currency: string;
  awesome: QuoteAttempt | null;
  frankfurter: QuoteAttempt | null;
  cache: MoneyQuote | null;
}): { quote: MoneyQuote | null; kind: 'live' | 'cache' | 'usd' | 'missing' } {
  if (input.currency === 'USD') {
    return { quote: null, kind: 'usd' };
  }
  if (input.awesome?.ok) {
    return { quote: input.awesome.quote, kind: 'live' };
  }
  if (input.frankfurter?.ok) {
    return { quote: input.frankfurter.quote, kind: 'live' };
  }
  if (input.cache) {
    return { quote: { ...input.cache, source: 'cache' }, kind: 'cache' };
  }
  return { quote: null, kind: 'missing' };
}
