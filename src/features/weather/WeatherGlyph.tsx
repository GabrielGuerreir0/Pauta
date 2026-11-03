import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Moon,
  Snowflake,
  Sun,
} from 'lucide-react-native';

import type { WeatherIcon } from '@/features/weather/wmo';

type WeatherGlyphProps = {
  icon: WeatherIcon;
  isDay?: boolean;
  color: string;
  size?: number;
};

export function WeatherGlyph({ icon, isDay = true, color, size = 28 }: WeatherGlyphProps) {
  if (!isDay && icon === 'clear') {
    return <Moon color={color} size={size} />;
  }
  if (!isDay && icon === 'partly') {
    return <CloudSun color={color} size={size} />;
  }
  if (icon === 'clear') {
    return <Sun color={color} size={size} />;
  }
  if (icon === 'partly') {
    return <CloudSun color={color} size={size} />;
  }
  if (icon === 'fog') {
    return <CloudFog color={color} size={size} />;
  }
  if (icon === 'drizzle') {
    return <CloudDrizzle color={color} size={size} />;
  }
  if (icon === 'rain') {
    return <CloudRain color={color} size={size} />;
  }
  if (icon === 'snow') {
    return <Snowflake color={color} size={size} />;
  }
  if (icon === 'thunder') {
    return <CloudLightning color={color} size={size} />;
  }
  return <Cloud color={color} size={size} />;
}
