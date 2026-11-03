export type DailySummaryInput = {
  tempMin: number | null;
  tempMax: number | null;
  rainPercent: number | null;
  rateLabel: string | null;
  appointmentCount: number | null;
};

export function buildDailySummary(input: DailySummaryInput): string {
  const weather: string[] = [];
  if (input.tempMin !== null && input.tempMax !== null) {
    weather.push(`${Math.round(input.tempMin)}°–${Math.round(input.tempMax)}°`);
  }
  if (input.rainPercent !== null) {
    weather.push(`chuva ${Math.round(input.rainPercent)}%`);
  }

  const chunks = [weather.length > 0 ? `Hoje: ${weather.join(', ')}` : 'Hoje'];
  if (input.rateLabel) {
    chunks.push(`US$ 1 = ${input.rateLabel}`);
  }
  if (input.appointmentCount !== null) {
    chunks.push(
      input.appointmentCount === 1 ? '1 compromisso' : `${input.appointmentCount} compromissos`,
    );
  }
  return chunks.join(' · ');
}
