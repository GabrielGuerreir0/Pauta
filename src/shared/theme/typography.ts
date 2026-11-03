export const typography = {
  display: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 64,
    lineHeight: 72,
  },
  value: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 32,
    lineHeight: 40,
  },
  title: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
  },
  body: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
} as const;

export type Typography = typeof typography;
