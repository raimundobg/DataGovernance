import { AnalyticsEvent, EventProperties, ANALYTICS_EVENTS } from './events';

interface TrackerConfig {
  enabled: boolean;
  debug: boolean;
}

class AnalyticsTracker {
  private config: TrackerConfig = {
    enabled: true,
    debug: process.env.NODE_ENV === 'development',
  };

  configure(config: Partial<TrackerConfig>) {
    this.config = { ...this.config, ...config };
  }

  trackEvent<E extends AnalyticsEvent>(
    event: E,
    properties: E extends keyof EventProperties ? EventProperties[E] : Record<string, unknown>
  ) {
    if (!this.config.enabled) return;

    const payload = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    if (this.config.debug) {
      console.log('[Analytics]', event, properties);
    }

    // In production, this would send to an analytics service
    // For now, we just log to console in debug mode
    // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(payload) });
  }

  trackPageView(page: string) {
    this.trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page });
  }

  trackNavigation(from: string, to: string) {
    this.trackEvent(ANALYTICS_EVENTS.NAVIGATION, { from, to });
  }

  trackError(error: string, component?: string) {
    this.trackEvent(ANALYTICS_EVENTS.APP_ERROR, { error, component });
  }
}

export const tracker = new AnalyticsTracker();

export function trackEvent<E extends AnalyticsEvent>(
  event: E,
  properties: E extends keyof EventProperties ? EventProperties[E] : Record<string, unknown>
) {
  tracker.trackEvent(event, properties);
}
