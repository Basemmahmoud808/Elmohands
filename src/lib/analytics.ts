'use client';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '';

declare global {
  interface Window {
    gtag?: (command: string, targetOrAction: string, configOrParams?: Record<string, unknown>) => void;
    fbq?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

// Track Pageview
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
  if (typeof window !== 'undefined' && window.fbq && META_PIXEL_ID) {
    window.fbq('track', 'PageView');
  }
};

// Track Custom Event
export const trackEvent = (action: string, category: string, label: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', action, { category, label, value });
  }
};
