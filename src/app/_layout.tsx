import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { usePreferences } from '@/services/preferences';
import { ThemeProvider, useTheme } from '@/shared/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function RootStack() {
  const theme = useTheme();

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
  });
  const appearance = usePreferences((state) => state.appearance);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider appearance={appearance}>
        <RootStack />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
