export interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

export const trackPageView = (url: string) => {
  // Google Analytics
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }

  // Plausible
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible("pageview", { u: url });
  }

  // Umami
  if (typeof window !== "undefined" && (window as any).umami) {
    (window as any).umami.track(url);
  }

  // Debug Console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] PageView: ${url}`);
  }
};

export const trackEvent = ({ action, category, label, value, properties }: AnalyticsEvent) => {
  // Google Analytics
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...properties,
    });
  }

  // Plausible
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible(action, { props: properties });
  }

  // Umami
  if (typeof window !== "undefined" && (window as any).umami) {
    (window as any).umami.track(action, properties);
  }

  // Debug Console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] Event: ${action}`, { category, label, value, properties });
  }
};
