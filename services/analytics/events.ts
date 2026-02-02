export const ANALYTICS_EVENTS = {
  APP_STARTED: 'app_started',
  APP_ERROR: 'app_error',

  PROJECT_CREATED: 'project_created',
  PROJECT_LOADED: 'project_loaded',

  IMPORT_STARTED: 'import_started',
  IMPORT_COMPLETED: 'import_completed',
  IMPORT_FAILED: 'import_failed',

  CHECK_STARTED: 'check_started',
  CHECK_COMPLETED: 'check_completed',
  CHECK_FAILED: 'check_failed',

  RESULTS_VIEWED: 'results_viewed',
  RESULT_SORTED: 'result_sorted',
  RESULT_FILTERED: 'result_filtered',

  IDENTITY_MARKED_EXPOSED: 'identity_marked_exposed',

  RECOMMENDATIONS_VIEWED: 'recommendations_viewed',
  RECOMMENDATION_MARKED_DONE: 'recommendation_marked_done',
  AUDIENCE_CHANGED: 'audience_changed',

  EVIDENCE_VIEWED: 'evidence_viewed',
  EVIDENCE_EXPORTED: 'evidence_exported',
  INTEGRITY_VERIFIED: 'integrity_verified',

  LANGUAGE_CHANGED: 'language_changed',
  THEME_CHANGED: 'theme_changed',

  PAGE_VIEW: 'page_view',
  NAVIGATION: 'navigation',
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

export interface EventProperties {
  [ANALYTICS_EVENTS.APP_STARTED]: { locale: string };
  [ANALYTICS_EVENTS.APP_ERROR]: { error: string; component?: string };

  [ANALYTICS_EVENTS.PROJECT_CREATED]: { projectId: string };
  [ANALYTICS_EVENTS.PROJECT_LOADED]: { projectId: string; identityCount: number };

  [ANALYTICS_EVENTS.IMPORT_STARTED]: { projectId: string };
  [ANALYTICS_EVENTS.IMPORT_COMPLETED]: { projectId: string; count: number; duplicates: number };
  [ANALYTICS_EVENTS.IMPORT_FAILED]: { projectId: string; error: string };

  [ANALYTICS_EVENTS.CHECK_STARTED]: { projectId: string; identityCount: number };
  [ANALYTICS_EVENTS.CHECK_COMPLETED]: { projectId: string; checkId: string; duration: number };
  [ANALYTICS_EVENTS.CHECK_FAILED]: { projectId: string; error: string };

  [ANALYTICS_EVENTS.RESULTS_VIEWED]: { projectId: string; resultCount: number };
  [ANALYTICS_EVENTS.RESULT_SORTED]: { field: string; direction: 'asc' | 'desc' };
  [ANALYTICS_EVENTS.RESULT_FILTERED]: { filterType: string; value: string };

  [ANALYTICS_EVENTS.IDENTITY_MARKED_EXPOSED]: { identityId: string; exposed: boolean };

  [ANALYTICS_EVENTS.RECOMMENDATIONS_VIEWED]: { projectId: string; audience: string };
  [ANALYTICS_EVENTS.RECOMMENDATION_MARKED_DONE]: { recommendationId: string };
  [ANALYTICS_EVENTS.AUDIENCE_CHANGED]: { from: string; to: string };

  [ANALYTICS_EVENTS.EVIDENCE_VIEWED]: { projectId: string; eventCount: number };
  [ANALYTICS_EVENTS.EVIDENCE_EXPORTED]: { projectId: string; format: 'json' | 'pdf' };
  [ANALYTICS_EVENTS.INTEGRITY_VERIFIED]: { projectId: string; valid: boolean };

  [ANALYTICS_EVENTS.LANGUAGE_CHANGED]: { from: string; to: string };
  [ANALYTICS_EVENTS.THEME_CHANGED]: { theme: 'light' | 'dark' };

  [ANALYTICS_EVENTS.PAGE_VIEW]: { page: string };
  [ANALYTICS_EVENTS.NAVIGATION]: { from: string; to: string };
}
