'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { Currency } from '@/lib/types';
import { BASE_CURRENCIES } from '@/lib/validations/employee';

export function useCurrency() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currency = useMemo<Currency>(() => {
    const raw = searchParams.get('currency')?.toUpperCase() as Currency;
    if (raw && (BASE_CURRENCIES as readonly string[]).includes(raw)) {
      return raw;
    }
    return 'USD';
  }, [searchParams]);

  const setCurrency = useCallback(
    (newCurrency: Currency) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newCurrency === 'USD') {
        params.delete('currency');
      } else {
        params.set('currency', newCurrency);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return {
    currency,
    setCurrency,
    currencies: BASE_CURRENCIES,
  };
}
