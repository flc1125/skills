'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/gtag';

export function GaPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    if (lastTrackedPath.current === path) {
      return;
    }

    trackPageView(path);
    lastTrackedPath.current = path;
  }, [pathname, searchParams]);

  return null;
}
