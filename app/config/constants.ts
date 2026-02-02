export const RISK_THRESHOLDS = {
  critical: 80,
  high: 60,
  medium: 40,
  low: 0,
} as const;

export const RISK_COLORS = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'green',
} as const;

export const ROLES = {
  admin: 'admin',
  finance: 'finance',
  clinical: 'clinical',
  support: 'support',
  other: 'other',
} as const;

export const ROLE_WEIGHTS = {
  admin: 100,
  finance: 80,
  clinical: 70,
  support: 40,
  other: 30,
} as const;

export const CRITICALITY_LEVELS = {
  high: 'high',
  medium: 'medium',
  low: 'low',
} as const;

export const CRITICALITY_WEIGHTS = {
  high: 100,
  medium: 60,
  low: 30,
} as const;

export const SCORING_WEIGHTS = {
  breachCount: 0.30,
  recency: 0.25,
  criticality: 0.25,
  role: 0.20,
} as const;

export const RECENCY_SCORES = {
  recent: 100,      // < 30 days
  moderate: 75,     // 30-90 days
  old: 50,          // 90-365 days
  veryOld: 25,      // > 365 days
  unknown: 40,
} as const;

export const BREACH_COUNT_SCORES = {
  none: 0,
  one: 33,
  two: 66,
  threeOrMore: 100,
} as const;

export const AUDIENCES = {
  security: 'security',
  legal: 'legal',
  executive: 'executive',
} as const;

export type RiskLevel = keyof typeof RISK_THRESHOLDS;
export type Role = keyof typeof ROLES;
export type CriticalityLevel = keyof typeof CRITICALITY_LEVELS;
export type Audience = keyof typeof AUDIENCES;

export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.critical) return 'critical';
  if (score >= RISK_THRESHOLDS.high) return 'high';
  if (score >= RISK_THRESHOLDS.medium) return 'medium';
  return 'low';
}
