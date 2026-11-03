import { describe, expect, it } from '@jest/globals';

import { formatRate } from '@/shared/format';

describe('formatRate', () => {
  it('formata real brasileiro', () => {
    const formatted = formatRate(5.42, 'BRL', 'pt-BR').replace(/\u00a0/g, ' ');
    expect(formatted).toBe('R$ 5,42');
  });
});
