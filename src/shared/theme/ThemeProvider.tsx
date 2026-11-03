import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { palette, type ColorSchemeName, type ThemeColors } from '@/shared/theme/colors';
import { radii, type Radii } from '@/shared/theme/radii';
import { shadows } from '@/shared/theme/shadows';
import { spacing, type Spacing } from '@/shared/theme/spacing';
import { typography, type Typography } from '@/shared/theme/typography';

export type AppearancePreference = 'system' | ColorSchemeName;

export type Theme = {
  mode: ColorSchemeName;
  colors: ThemeColors;
  spacing: Spacing;
  typography: Typography;
  radii: Radii;
  shadow: (typeof shadows)['light'];
};

const ThemeContext = createContext<Theme | null>(null);

type ThemeProviderProps = {
  appearance: AppearancePreference;
  children: ReactNode;
};

export function ThemeProvider({ appearance, children }: ThemeProviderProps) {
  const system = useColorScheme();
  const mode: ColorSchemeName =
    appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;

  const theme = useMemo<Theme>(
    () => ({
      mode,
      colors: palette[mode],
      spacing,
      typography,
      radii,
      shadow: shadows[mode],
    }),
    [mode],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme deve ficar dentro de ThemeProvider.');
  }
  return theme;
}
