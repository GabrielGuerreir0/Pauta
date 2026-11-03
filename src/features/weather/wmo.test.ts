import { describe, expect, it } from '@jest/globals';

import { mapWmo } from '@/features/weather/wmo';

describe('mapWmo', () => {
  it('traduz céu limpo de dia e de noite', () => {
    expect(mapWmo(0, true)).toMatchObject({ label: 'Céu limpo', icon: 'clear', mood: 'sun' });
    expect(mapWmo(0, false)).toMatchObject({ label: 'Céu limpo', icon: 'clear', mood: 'night' });
  });

  it('trata chuva e trovoada como tempo úmido', () => {
    expect(mapWmo(61, false)).toMatchObject({ label: 'Chuva', icon: 'rain', mood: 'rain' });
    expect(mapWmo(95, true)).toMatchObject({ label: 'Trovoada', icon: 'thunder', mood: 'rain' });
  });

  it('usa um texto neutro para código desconhecido', () => {
    expect(mapWmo(123, true)).toMatchObject({
      label: 'Condição desconhecida',
      icon: 'cloud',
      mood: 'cloud',
    });
  });
});
