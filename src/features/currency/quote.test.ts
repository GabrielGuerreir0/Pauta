import { describe, expect, it } from '@jest/globals';

import {
  chooseQuote,
  frankfurterChange,
  previousWeekday,
  type MoneyQuote,
} from '@/features/currency/quote';

const live = (source: MoneyQuote['source']): MoneyQuote => ({
  currency: 'BRL',
  rate: 5.42,
  high: 5.5,
  low: 5.4,
  changeValue: 0.04,
  changePercent: 0.8,
  updatedAt: '2026-11-03T12:00:00.000Z',
  source,
});

describe('cotação', () => {
  it('volta ao dia útil anterior', () => {
    expect(previousWeekday('2026-11-02')).toBe('2026-10-30');
    expect(previousWeekday('2026-11-09')).toBe('2026-11-06');
  });

  it('calcula a variação do Frankfurter', () => {
    expect(frankfurterChange(5.5, 5)).toEqual({ changeValue: 0.5, changePercent: 10 });
  });

  it('prefere AwesomeAPI, depois Frankfurter e por último o cache', () => {
    const awesome = live('awesome');
    const frankfurter = live('frankfurter');
    const cache = live('cache');
    expect(
      chooseQuote({
        currency: 'BRL',
        awesome: { ok: true, quote: awesome },
        frankfurter: { ok: true, quote: frankfurter },
        cache,
      }).quote?.source,
    ).toBe('awesome');
    expect(
      chooseQuote({
        currency: 'BRL',
        awesome: { ok: false },
        frankfurter: { ok: true, quote: frankfurter },
        cache,
      }).quote?.source,
    ).toBe('frankfurter');
    expect(
      chooseQuote({ currency: 'BRL', awesome: { ok: false }, frankfurter: { ok: false }, cache })
        .kind,
    ).toBe('cache');
    expect(
      chooseQuote({
        currency: 'USD',
        awesome: { ok: true, quote: awesome },
        frankfurter: null,
        cache: null,
      }).kind,
    ).toBe('usd');
    expect(
      chooseQuote({
        currency: 'XYZ',
        awesome: { ok: false },
        frankfurter: { ok: false },
        cache: null,
      }).kind,
    ).toBe('missing');
  });
});
