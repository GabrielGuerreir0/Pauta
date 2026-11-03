export type WeatherIcon =
  'clear' | 'partly' | 'cloud' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunder';

export type WeatherMoodName = 'sun' | 'cloud' | 'rain' | 'night';

type WmoEntry = {
  label: string;
  icon: WeatherIcon;
  wet: boolean;
};

const catalog: Record<number, WmoEntry> = {
  0: { label: 'Céu limpo', icon: 'clear', wet: false },
  1: { label: 'Quase limpo', icon: 'partly', wet: false },
  2: { label: 'Parcialmente nublado', icon: 'partly', wet: false },
  3: { label: 'Nublado', icon: 'cloud', wet: false },
  45: { label: 'Neblina', icon: 'fog', wet: false },
  48: { label: 'Neblina', icon: 'fog', wet: false },
  51: { label: 'Garoa', icon: 'drizzle', wet: true },
  53: { label: 'Garoa', icon: 'drizzle', wet: true },
  55: { label: 'Garoa forte', icon: 'drizzle', wet: true },
  56: { label: 'Garoa congelante', icon: 'drizzle', wet: true },
  57: { label: 'Garoa congelante', icon: 'drizzle', wet: true },
  61: { label: 'Chuva', icon: 'rain', wet: true },
  63: { label: 'Chuva', icon: 'rain', wet: true },
  65: { label: 'Chuva forte', icon: 'rain', wet: true },
  66: { label: 'Chuva congelante', icon: 'rain', wet: true },
  67: { label: 'Chuva congelante', icon: 'rain', wet: true },
  71: { label: 'Neve', icon: 'snow', wet: true },
  73: { label: 'Neve', icon: 'snow', wet: true },
  75: { label: 'Neve forte', icon: 'snow', wet: true },
  77: { label: 'Grãos de neve', icon: 'snow', wet: true },
  80: { label: 'Pancadas de chuva', icon: 'rain', wet: true },
  81: { label: 'Pancadas de chuva', icon: 'rain', wet: true },
  82: { label: 'Pancadas fortes', icon: 'rain', wet: true },
  85: { label: 'Pancadas de neve', icon: 'snow', wet: true },
  86: { label: 'Pancadas de neve', icon: 'snow', wet: true },
  95: { label: 'Trovoada', icon: 'thunder', wet: true },
  96: { label: 'Trovoada com granizo', icon: 'thunder', wet: true },
  99: { label: 'Trovoada com granizo', icon: 'thunder', wet: true },
};

const unknown: WmoEntry = { label: 'Condição desconhecida', icon: 'cloud', wet: false };

export function mapWmo(
  code: number,
  isDay: boolean,
): { label: string; icon: WeatherIcon; mood: WeatherMoodName } {
  const entry = catalog[code] ?? unknown;
  if (!isDay && !entry.wet) {
    return { label: entry.label, icon: entry.icon, mood: 'night' };
  }
  if (entry.wet) {
    return { label: entry.label, icon: entry.icon, mood: 'rain' };
  }
  if (entry.icon === 'clear') {
    return { label: entry.label, icon: entry.icon, mood: 'sun' };
  }
  return { label: entry.label, icon: entry.icon, mood: 'cloud' };
}
