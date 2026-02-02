import { Role, CriticalityLevel, RiskLevel } from '@/config/constants';
import { BreachInfo } from '@/services/api/types';

export interface ScoringInput {
  breachCount: number;
  lastBreachDate?: string;
  role: Role;
  criticality: CriticalityLevel;
  manuallyMarked?: boolean;
  manuallyMarkedExposed?: boolean;
}

export interface ScoringOutput {
  score: number;
  riskLevel: RiskLevel;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  breachCountScore: number;
  breachCountWeight: number;
  recencyScore: number;
  recencyWeight: number;
  criticalityScore: number;
  criticalityWeight: number;
  roleScore: number;
  roleWeight: number;
}

export interface IdentityScoreInput {
  id: string;
  email: string;
  name: string;
  role: Role;
  area: string;
  criticality: CriticalityLevel;
  breachCount: number;
  breaches: BreachInfo[];
  lastBreachDate?: string;
  isExposed: boolean;
  manuallyMarked: boolean;
}

export interface IdentityScoreOutput {
  identityId: string;
  score: number;
  riskLevel: RiskLevel;
  breakdown: ScoreBreakdown;
}
