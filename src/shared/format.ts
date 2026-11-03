import { strings } from '@/shared/i18n';

export function greetingForHour(hour: number): string {
  if (hour < 12) {
    return strings.greeting.morning;
  }
  if (hour < 18) {
    return strings.greeting.afternoon;
  }
  return strings.greeting.evening;
}

export function formatTemperature(value: number, unit: 'celsius' | 'fahrenheit'): string {
  const rounded = Math.round(value);
  return unit === 'fahrenheit' ? `${rounded}°F` : `${rounded}°`;
}

export function formatRate(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
    signDisplay: 'exceptZero',
  }).format(value);
}

export function formatClock(date: Date, locale: string, hour12: boolean): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  }).format(date);
}

export function formatUpdatedAt(
  iso: string,
  locale: string,
  hour12: boolean,
  now = new Date(),
): string {
  const date = new Date(iso);
  const minutes = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000));
  const clock = formatClock(date, locale, hour12);
  if (Number.isNaN(date.getTime())) {
    return 'agora';
  }
  if (minutes < 1) {
    return `agora · ${clock}`;
  }
  if (minutes < 60) {
    return `há ${minutes} min · ${clock}`;
  }
  return clock;
}
