import { z } from 'zod';

import { mapWmo, type WeatherIcon, type WeatherMoodName } from '@/features/weather/wmo';

const iconSchema = z.enum([
  'clear',
  'partly',
  'cloud',
  'fog',
  'drizzle',
  'rain',
  'snow',
  'thunder',
]);

export const weatherSnapshotSchema = z.object({
  placeLabel: z.string(),
  unit: z.enum(['celsius', 'fahrenheit']),
  updatedAt: z.string(),
  current: z.object({
    temperature: z.number(),
    apparent: z.number(),
    humidity: z.number(),
    isDay: z.boolean(),
    wind: z.number(),
    precipitation: z.number(),
    rainChance: z.number(),
    label: z.string(),
    icon: iconSchema,
    mood: z.enum(['sun', 'cloud', 'rain', 'night']),
  }),
  today: z.object({
    max: z.number(),
    min: z.number(),
    sunrise: z.string(),
    sunset: z.string(),
    uv: z.number(),
    rainChance: z.number(),
  }),
  hours: z.array(
    z.object({
      time: z.string(),
      temperature: z.number(),
      rainChance: z.number(),
      isDay: z.boolean(),
      label: z.string(),
      icon: iconSchema,
    }),
  ),
  days: z.array(
    z.object({
      date: z.string(),
      max: z.number(),
      min: z.number(),
      rainChance: z.number(),
      label: z.string(),
      icon: iconSchema,
    }),
  ),
});

export type WeatherSnapshot = z.infer<typeof weatherSnapshotSchema>;

const forecastSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    apparent_temperature: z.number(),
    relative_humidity_2m: z.number(),
    is_day: z.number(),
    weather_code: z.number(),
    wind_speed_10m: z.number(),
    precipitation: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    precipitation_probability: z.array(z.number()),
    weather_code: z.array(z.number()),
  }),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_probability_max: z.array(z.number()),
    sunrise: z.array(z.string()),
    sunset: z.array(z.string()),
    uv_index_max: z.array(z.number()),
  }),
});

export type ForecastPayload = z.infer<typeof forecastSchema>;
export { forecastSchema };

type DayMark = { date: string; sunrise: string; sunset: string };

function at<T>(items: readonly T[], index: number): T | undefined {
  return items[index];
}

function hourIsDay(time: string, days: DayMark[]): boolean {
  const day = days.find((item) => time.startsWith(item.date));
  if (!day) {
    return true;
  }
  return time >= day.sunrise && time < day.sunset;
}

export function toSnapshot(
  payload: ForecastPayload,
  placeLabel: string,
  unit: 'celsius' | 'fahrenheit',
  now = new Date(),
): WeatherSnapshot {
  const days: DayMark[] = [];
  for (let index = 0; index < payload.daily.time.length; index += 1) {
    const date = at(payload.daily.time, index);
    const sunrise = at(payload.daily.sunrise, index);
    const sunset = at(payload.daily.sunset, index);
    if (date && sunrise && sunset) {
      days.push({ date, sunrise, sunset });
    }
  }

  const hours = [];
  for (let index = 0; index < payload.hourly.time.length; index += 1) {
    const time = at(payload.hourly.time, index);
    const temperature = at(payload.hourly.temperature_2m, index);
    const rainChance = at(payload.hourly.precipitation_probability, index);
    const code = at(payload.hourly.weather_code, index);
    if (
      time === undefined ||
      temperature === undefined ||
      rainChance === undefined ||
      code === undefined
    ) {
      continue;
    }
    if (new Date(time).getTime() < now.getTime() - 60 * 60 * 1000) {
      continue;
    }
    const isDay = hourIsDay(time, days);
    const mapped = mapWmo(code, isDay);
    hours.push({
      time,
      temperature,
      rainChance,
      isDay,
      label: mapped.label,
      icon: mapped.icon,
    });
    if (hours.length === 24) {
      break;
    }
  }

  const upcoming = [];
  for (let index = 1; index < payload.daily.time.length && upcoming.length < 3; index += 1) {
    const date = at(payload.daily.time, index);
    const code = at(payload.daily.weather_code, index);
    const max = at(payload.daily.temperature_2m_max, index);
    const min = at(payload.daily.temperature_2m_min, index);
    const rainChance = at(payload.daily.precipitation_probability_max, index);
    if (
      date === undefined ||
      code === undefined ||
      max === undefined ||
      min === undefined ||
      rainChance === undefined
    ) {
      continue;
    }
    const mapped = mapWmo(code, true);
    upcoming.push({ date, max, min, rainChance, label: mapped.label, icon: mapped.icon });
  }

  const currentMapped = mapWmo(payload.current.weather_code, payload.current.is_day === 1);
  const currentHour = hours[0];

  return {
    placeLabel,
    unit,
    updatedAt: now.toISOString(),
    current: {
      temperature: payload.current.temperature_2m,
      apparent: payload.current.apparent_temperature,
      humidity: payload.current.relative_humidity_2m,
      isDay: payload.current.is_day === 1,
      wind: payload.current.wind_speed_10m,
      precipitation: payload.current.precipitation,
      rainChance:
        currentHour?.rainChance ?? at(payload.daily.precipitation_probability_max, 0) ?? 0,
      label: currentMapped.label,
      icon: currentMapped.icon,
      mood: currentMapped.mood,
    },
    today: {
      max: at(payload.daily.temperature_2m_max, 0) ?? payload.current.temperature_2m,
      min: at(payload.daily.temperature_2m_min, 0) ?? payload.current.temperature_2m,
      sunrise: at(payload.daily.sunrise, 0) ?? '',
      sunset: at(payload.daily.sunset, 0) ?? '',
      uv: at(payload.daily.uv_index_max, 0) ?? 0,
      rainChance: at(payload.daily.precipitation_probability_max, 0) ?? 0,
    },
    hours,
    days: upcoming,
  };
}

export type { WeatherIcon, WeatherMoodName };
