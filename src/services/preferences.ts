import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AppearancePreference } from '@/shared/theme';

export type LocationMode = 'gps' | 'manual';
export type CurrencyMode = 'auto' | 'manual';

type PreferencesState = {
  appearance: AppearancePreference;
  locationMode: LocationMode;
  manualLabel: string;
  manualLatitude: number | null;
  manualLongitude: number | null;
  currencyMode: CurrencyMode;
  currencyCode: string | null;
  dailySummaryEnabled: boolean;
  dailySummaryHour: number;
  dailySummaryMinute: number;
  setAppearance: (appearance: AppearancePreference) => void;
  setLocationMode: (locationMode: LocationMode) => void;
  setManualPlace: (place: { label: string; latitude: number; longitude: number }) => void;
  setCurrencyMode: (currencyMode: CurrencyMode) => void;
  setCurrencyCode: (currencyCode: string | null) => void;
  setDailySummary: (enabled: boolean, hour?: number, minute?: number) => void;
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      appearance: 'system',
      locationMode: 'gps',
      manualLabel: '',
      manualLatitude: null,
      manualLongitude: null,
      currencyMode: 'auto',
      currencyCode: null,
      dailySummaryEnabled: false,
      dailySummaryHour: 8,
      dailySummaryMinute: 0,
      setAppearance: (appearance) => set({ appearance }),
      setLocationMode: (locationMode) => set({ locationMode }),
      setManualPlace: ({ label, latitude, longitude }) =>
        set({
          locationMode: 'manual',
          manualLabel: label,
          manualLatitude: latitude,
          manualLongitude: longitude,
        }),
      setCurrencyMode: (currencyMode) => set({ currencyMode }),
      setCurrencyCode: (currencyCode) => set({ currencyMode: 'manual', currencyCode }),
      setDailySummary: (enabled, hour, minute) =>
        set((state) => ({
          dailySummaryEnabled: enabled,
          dailySummaryHour: hour ?? state.dailySummaryHour,
          dailySummaryMinute: minute ?? state.dailySummaryMinute,
        })),
    }),
    {
      name: 'pauta.preferences',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        appearance: state.appearance,
        locationMode: state.locationMode,
        manualLabel: state.manualLabel,
        manualLatitude: state.manualLatitude,
        manualLongitude: state.manualLongitude,
        currencyMode: state.currencyMode,
        currencyCode: state.currencyCode,
        dailySummaryEnabled: state.dailySummaryEnabled,
        dailySummaryHour: state.dailySummaryHour,
        dailySummaryMinute: state.dailySummaryMinute,
      }),
    },
  ),
);
