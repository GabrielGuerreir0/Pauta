import { z } from 'zod';

import { request } from '@/services/http';
import { logger } from '@/shared/logger';

const geocodingSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        admin1: z.string().optional(),
        country: z.string().optional(),
      }),
    )
    .optional(),
});

const nominatimSchema = z.object({
  display_name: z.string().optional(),
  address: z
    .object({
      city: z.string().optional(),
      town: z.string().optional(),
      village: z.string().optional(),
      municipality: z.string().optional(),
      state: z.string().optional(),
    })
    .optional(),
});

export type CityHit = {
  label: string;
  latitude: number;
  longitude: number;
};

const USER_AGENT = 'Pauta/1.0 (app pessoal de agenda)';
let lastNominatimAt = 0;

export async function searchCities(text: string): Promise<CityHit[]> {
  const query = text.trim();
  if (query.length < 2) {
    return [];
  }
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt`;
  const payload = await request(url, geocodingSchema);
  return (payload.results ?? []).map((item) => ({
    label: [item.name, item.admin1, item.country].filter(Boolean).join(', '),
    latitude: item.latitude,
    longitude: item.longitude,
  }));
}

export async function reverseCityName(latitude: number, longitude: number): Promise<string | null> {
  const wait = 1000 - (Date.now() - lastNominatimAt);
  if (wait > 0) {
    await new Promise((resolve) => {
      setTimeout(resolve, wait);
    });
  }
  lastNominatimAt = Date.now();
  const roundedLat = latitude.toFixed(2);
  const roundedLon = longitude.toFixed(2);
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${roundedLat}&lon=${roundedLon}&format=jsonv2&accept-language=pt-BR`;
  try {
    const payload = await request(url, nominatimSchema, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'pt-BR',
      },
    });
    const address = payload.address;
    return (
      address?.city ??
      address?.town ??
      address?.village ??
      address?.municipality ??
      address?.state ??
      payload.display_name ??
      null
    );
  } catch (error) {
    logger.warn('Falha no Nominatim.', error);
    return null;
  }
}
