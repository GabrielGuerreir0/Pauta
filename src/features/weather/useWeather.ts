import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { loadForecast } from '@/features/weather/api';
import { locateWithGps, readSavedPlace, type SavedPlace } from '@/services/place';
import { usePreferences } from '@/services/preferences';

export function useWeather() {
  const locationMode = usePreferences((state) => state.locationMode);
  const manualLatitude = usePreferences((state) => state.manualLatitude);
  const manualLongitude = usePreferences((state) => state.manualLongitude);
  const manualLabel = usePreferences((state) => state.manualLabel);
  const [place, setPlace] = useState<SavedPlace | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function resolvePlace() {
      if (locationMode === 'manual' && manualLatitude !== null && manualLongitude !== null) {
        if (!cancelled) {
          setPlace({
            latitude: manualLatitude,
            longitude: manualLongitude,
            label: manualLabel || 'Cidade escolhida',
          });
          setBlocked(false);
        }
        return;
      }
      const saved = await readSavedPlace();
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        if (!cancelled) {
          setPlace(saved);
          setBlocked(saved === null);
        }
        return;
      }
      try {
        const located = await locateWithGps();
        if (!cancelled) {
          setPlace(located);
          setBlocked(false);
        }
      } catch {
        if (!cancelled) {
          setPlace(saved);
          setBlocked(saved === null);
        }
      }
    }
    void resolvePlace();
    return () => {
      cancelled = true;
    };
  }, [locationMode, manualLabel, manualLatitude, manualLongitude]);

  const query = useQuery({
    queryKey: ['weather', place?.latitude, place?.longitude, place?.label],
    enabled: place !== null,
    queryFn: () => {
      if (!place) {
        throw new Error('Sem local.');
      }
      return loadForecast(place.latitude, place.longitude, place.label);
    },
  });

  return { place, blocked, query };
}
