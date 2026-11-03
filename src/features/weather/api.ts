import { getLocales } from 'expo-localization';

import {
  weatherSnapshotSchema,
  toSnapshot,
  forecastSchema,
  type WeatherSnapshot,
} from '@/features/weather/model';
import { cacheKeys, readCache, writeCache } from '@/services/cache';
import { request } from '@/services/http';

export function temperatureUnit(): 'celsius' | 'fahrenheit' {
  return getLocales()[0]?.temperatureUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
  placeLabel: string,
  unit: 'celsius' | 'fahrenheit',
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m,precipitation',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max',
    timezone: 'auto',
    forecast_days: '4',
  });
  if (unit === 'fahrenheit') {
    params.set('temperature_unit', 'fahrenheit');
  }
  const payload = await request(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    forecastSchema,
  );
  return toSnapshot(payload, placeLabel, unit);
}

export async function loadForecast(
  latitude: number,
  longitude: number,
  placeLabel: string,
): Promise<{ snapshot: WeatherSnapshot; fromCache: boolean }> {
  const unit = temperatureUnit();
  const key = cacheKeys.weather(latitude, longitude, unit);
  try {
    const snapshot = await fetchForecast(latitude, longitude, placeLabel, unit);
    await writeCache(key, snapshot);
    return { snapshot, fromCache: false };
  } catch (error) {
    const cached = await readCache(key, weatherSnapshotSchema);
    if (cached) {
      return { snapshot: { ...cached.data, placeLabel }, fromCache: true };
    }
    throw error;
  }
}
