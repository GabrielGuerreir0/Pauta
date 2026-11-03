export const palette = {
  light: {
    background: '#F6F5F2',
    surface: '#FFFFFF',
    text: '#1A1D23',
    textMuted: '#3E4C59',
    border: '#E4E2DC',
    primary: '#243056',
    danger: '#9B2C1F',
    up: '#146C43',
    down: '#9B2C1F',
  },
  dark: {
    background: '#101318',
    surface: '#1A1F27',
    text: '#F4F6F8',
    textMuted: '#C5D0DA',
    border: '#2C3440',
    primary: '#C5D0DA',
    danger: '#F3B7B0',
    up: '#8FD4AE',
    down: '#F3B7B0',
  },
} as const;

export const weatherMoods = {
  sun: { gradient: ['#FFF4E4', '#F6C48A'], text: '#1A1D23', muted: '#3E4C59' },
  cloud: { gradient: ['#F4F6F8', '#D5DDE6'], text: '#1A1D23', muted: '#3E4C59' },
  rain: { gradient: ['#E7EEF3', '#A9BCCB'], text: '#10202C', muted: '#243240' },
  night: { gradient: ['#1B2440', '#2E3D6E'], text: '#F4F6F8', muted: '#C5D0DA' },
} as const;

export type ColorSchemeName = keyof typeof palette;
export type ThemeColors = {
  [Key in keyof (typeof palette)['light']]: string;
};
export type WeatherMood = keyof typeof weatherMoods;
