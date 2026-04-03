type GtagValue = string | number | boolean | null | undefined;

type GtagParams = Record<string, GtagValue>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params: GtagParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, params);
}

export function trackPageView(path: string) {
  trackEvent('page_view', {
    page_path: path,
    page_location: typeof window === 'undefined' ? path : window.location.href,
    page_title: typeof document === 'undefined' ? undefined : document.title,
  });
}
