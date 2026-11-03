import AsyncStorage from '@react-native-async-storage/async-storage';
import { z, type ZodType } from 'zod';

export const cacheKeys = {
  place: 'pauta.place',
  weather: (latitude: number, longitude: number, unit: string) =>
    `pauta.weather.${latitude.toFixed(2)}.${longitude.toFixed(2)}.${unit}`,
  quote: (currency: string) => `pauta.quote.${currency}`,
};

export async function readCache<T>(
  key: string,
  schema: ZodType<T>,
): Promise<{ savedAt: string; data: T } | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    const json: unknown = JSON.parse(raw);
    const parsed = z.object({ savedAt: z.string(), data: schema }).safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify({ savedAt: new Date().toISOString(), data }));
}
