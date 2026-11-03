import * as Location from 'expo-location';
import { z } from 'zod';

import { cacheKeys, readCache, writeCache } from '@/services/cache';
import { reverseCityName } from '@/services/geo';
import { usePreferences } from '@/services/preferences';

const placeSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  label: z.string(),
});

export type SavedPlace = z.infer<typeof placeSchema>;

export async function readSavedPlace(): Promise<SavedPlace | null> {
  const cached = await readCache(cacheKeys.place, placeSchema);
  return cached?.data ?? null;
}

export async function savePlace(place: SavedPlace): Promise<void> {
  await writeCache(cacheKeys.place, place);
}

async function labelFor(latitude: number, longitude: number): Promise<string> {
  const results = await Location.reverseGeocodeAsync({ latitude, longitude });
  const first = results[0];
  const local = first?.city || first?.subregion || first?.district || first?.name || null;
  if (local) {
    return local;
  }
  return (await reverseCityName(latitude, longitude)) ?? 'Local atual';
}

export async function locateWithGps(): Promise<SavedPlace> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.status !== 'granted') {
    const asked = await Location.requestForegroundPermissionsAsync();
    if (asked.status !== 'granted') {
      throw new Error('location-denied');
    }
  }
  const position = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('location-timeout')), 12000);
    }),
  ]);
  const place = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    label: await labelFor(position.coords.latitude, position.coords.longitude),
  };
  await savePlace(place);
  if (usePreferences.getState().locationMode !== 'gps') {
    usePreferences.getState().setLocationMode('gps');
  }
  return place;
}
