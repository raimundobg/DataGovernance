import { RiskLevel, Audience } from '@/config/constants';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  audience: Audience;
  severity: RiskLevel;
  affectedCount: number;
  suggestedActionKey: string;
  suggestedDeadlineDays: number;
  isDone: boolean;
  doneAt?: string;
  templateId?: string;
  complianceRefs?: string[];
}

export interface RecommendationTemplate {
  id: string;
  titleKey: string;
  descriptionKey: string;
  audience: Audience;
  severity: RiskLevel;
  suggestedActionKey: string;
  suggestedDeadlineDays: number;
  condition: RecommendationCondition;
  complianceRefs?: string[];
}

export type RecommendationCondition =
  | { type: 'minCount'; severity: RiskLevel; threshold: number }
  | { type: 'roleExposed'; role: string; threshold: number }
  | { type: 'recentBreaches'; dayLimit: number; threshold: number }
  | { type: 'always' }
  | { type: 'exposedPercent'; threshold: number };

export interface RecommendationContext {
  totalIdentities: number;
  exposedCount: number;
  bySeverity: Record<RiskLevel, number>;
  byRole: Record<string, { count: number; exposedCount: number }>;
  recentBreachCount: number;
}
