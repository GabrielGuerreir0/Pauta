import { describe, expect, it } from '@jest/globals';

import { buildDailySummary } from '@/features/notifications/summary';

describe('buildDailySummary', () => {
  it('monta o resumo do dia', () => {
    expect(
      buildDailySummary({
        tempMin: 24,
        tempMax: 31,
        rainPercent: 60,
        rateLabel: 'R$ 5,42',
        appointmentCount: 3,
      }),
    ).toBe('Hoje: 24°–31°, chuva 60% · US$ 1 = R$ 5,42 · 3 compromissos');
  });
});
