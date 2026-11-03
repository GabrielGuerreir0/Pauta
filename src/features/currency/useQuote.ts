import { useQuery } from '@tanstack/react-query';

import { deviceCurrency, loadQuote } from '@/features/currency/api';
import { usePreferences } from '@/services/preferences';

export function useQuote() {
  const currencyMode = usePreferences((state) => state.currencyMode);
  const currencyCode = usePreferences((state) => state.currencyCode);
  const currency = currencyMode === 'manual' && currencyCode ? currencyCode : deviceCurrency();

  const query = useQuery({
    queryKey: ['quote', currency],
    queryFn: () => loadQuote(currency),
  });

  return { currency, query };
}
