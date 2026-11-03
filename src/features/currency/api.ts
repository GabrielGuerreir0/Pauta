import { getLocales } from 'expo-localization';
import { z } from 'zod';

import {
  chooseQuote,
  frankfurterChange,
  previousWeekday,
  type MoneyQuote,
  type QuoteAttempt,
} from '@/features/currency/quote';
import { cacheKeys, readCache, writeCache } from '@/services/cache';
import { HttpError, request } from '@/services/http';
import { usePreferences } from '@/services/preferences';

const awesomeEntry = z.object({
  bid: z.string(),
  high: z.string(),
  low: z.string(),
  pctChange: z.string(),
  varBid: z.string(),
  create_date: z.string(),
});

const frankfurterSchema = z.object({
  date: z.string(),
  rates: z.record(z.string(), z.number()),
});

const currenciesSchema = z.record(z.string(), z.string());

export const quoteSchema = z.object({
  currency: z.string(),
  rate: z.number(),
  high: z.number().nullable(),
  low: z.number().nullable(),
  changeValue: z.number().nullable(),
  changePercent: z.number().nullable(),
  updatedAt: z.string(),
  source: z.enum(['awesome', 'frankfurter', 'cache']),
});

export function deviceCurrency(): string {
  const manual = usePreferences.getState();
  if (manual.currencyMode === 'manual' && manual.currencyCode) {
    return manual.currencyCode;
  }
  return getLocales()[0]?.currencyCode ?? 'BRL';
}

export function deviceLocale(): string {
  return getLocales()[0]?.languageTag ?? 'pt-BR';
}

function numberFrom(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function loadAwesome(currency: string): Promise<QuoteAttempt> {
  try {
    const token = process.env.EXPO_PUBLIC_AWESOME_API_TOKEN;
    const base = `https://economia.awesomeapi.com.br/json/last/USD-${currency}`;
    const url = token ? `${base}?token=${encodeURIComponent(token)}` : base;
    const payload = await request(url, z.record(z.string(), awesomeEntry));
    const entry = Object.values(payload)[0];
    if (!entry) {
      return { ok: false };
    }
    const rate = numberFrom(entry.bid);
    const high = numberFrom(entry.high);
    const low = numberFrom(entry.low);
    const changeValue = numberFrom(entry.varBid);
    const changePercent = numberFrom(entry.pctChange);
    if (
      rate === null ||
      high === null ||
      low === null ||
      changeValue === null ||
      changePercent === null
    ) {
      return { ok: false };
    }
    const updated = new Date(entry.create_date.replace(' ', 'T'));
    return {
      ok: true,
      quote: {
        currency,
        rate,
        high,
        low,
        changeValue,
        changePercent,
        updatedAt: Number.isNaN(updated.getTime())
          ? new Date().toISOString()
          : updated.toISOString(),
        source: 'awesome',
      },
    };
  } catch (error) {
    if (error instanceof HttpError) {
      return { ok: false };
    }
    return { ok: false };
  }
}

async function loadFrankfurter(currency: string): Promise<QuoteAttempt> {
  try {
    const latest = await request(
      `https://api.frankfurter.dev/v1/latest?base=USD&symbols=${currency}`,
      frankfurterSchema,
    );
    const rate = latest.rates[currency];
    if (rate === undefined) {
      return { ok: false };
    }
    let changeValue: number | null = null;
    let changePercent: number | null = null;
    try {
      const day = previousWeekday(latest.date);
      const previous = await request(
        `https://api.frankfurter.dev/v1/${day}?base=USD&symbols=${currency}`,
        frankfurterSchema,
      );
      const previousRate = previous.rates[currency];
      if (previousRate !== undefined) {
        const change = frankfurterChange(rate, previousRate);
        changeValue = change.changeValue;
        changePercent = change.changePercent;
      }
    } catch {
      changeValue = null;
      changePercent = null;
    }
    return {
      ok: true,
      quote: {
        currency,
        rate,
        high: null,
        low: null,
        changeValue,
        changePercent,
        updatedAt: new Date().toISOString(),
        source: 'frankfurter',
      },
    };
  } catch {
    return { ok: false };
  }
}

export async function loadQuote(
  currency: string,
): Promise<{ quote: MoneyQuote | null; kind: 'live' | 'cache' | 'usd' | 'missing' }> {
  if (currency === 'USD') {
    return { quote: null, kind: 'usd' };
  }
  const cached = await readCache(cacheKeys.quote(currency), quoteSchema);
  const [awesome, frankfurter] = await Promise.all([
    loadAwesome(currency),
    loadFrankfurter(currency),
  ]);
  const chosen = chooseQuote({
    currency,
    awesome,
    frankfurter,
    cache: cached?.data ?? null,
  });
  if (chosen.quote && chosen.kind === 'live') {
    await writeCache(cacheKeys.quote(currency), chosen.quote);
  }
  return chosen;
}

export async function listCurrencies(): Promise<{ code: string; name: string }[]> {
  const payload = await request('https://api.frankfurter.dev/v1/currencies', currenciesSchema);
  return Object.entries(payload)
    .map(([code, name]) => ({ code, name }))
    .sort((left, right) => left.code.localeCompare(right.code));
}
