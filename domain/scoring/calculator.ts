import {
  getRiskLevel,
  SCORING_WEIGHTS,
  RECENCY_SCORES,
  BREACH_COUNT_SCORES,
  CRITICALITY_WEIGHTS,
  ROLE_WEIGHTS,
  Role,
  CriticalityLevel,
} from '@/config/constants';
import { ScoringInput, ScoringOutput, ScoreBreakdown } from './types';

function calculateBreachCountScore(breachCount: number): number {
  if (breachCount === 0) return BREACH_COUNT_SCORES.none;
  if (breachCount === 1) return BREACH_COUNT_SCORES.one;
  if (breachCount === 2) return BREACH_COUNT_SCORES.two;
  return BREACH_COUNT_SCORES.threeOrMore;
}

function calculateRecencyScore(lastBreachDate?: string): number {
  if (!lastBreachDate) return RECENCY_SCORES.unknown;

  const breachDate = new Date(lastBreachDate);
  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - breachDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince < 30) return RECENCY_SCORES.recent;
  if (daysSince < 90) return RECENCY_SCORES.moderate;
  if (daysSince < 365) return RECENCY_SCORES.old;
  return RECENCY_SCORES.veryOld;
}

function calculateCriticalityScore(criticality: CriticalityLevel): number {
  return CRITICALITY_WEIGHTS[criticality];
}

function calculateRoleScore(role: Role): number {
  return ROLE_WEIGHTS[role] || ROLE_WEIGHTS.other;
}

export function calculateIdentityScore(input: ScoringInput): ScoringOutput {
  if (input.manuallyMarked && input.manuallyMarkedExposed) {
    return {
      score: 100,
      riskLevel: 'critical',
      breakdown: {
        breachCountScore: 100,
        breachCountWeight: SCORING_WEIGHTS.breachCount,
        recencyScore: 100,
        recencyWeight: SCORING_WEIGHTS.recency,
        criticalityScore: 100,
        criticalityWeight: SCORING_WEIGHTS.criticality,
        roleScore: 100,
        roleWeight: SCORING_WEIGHTS.role,
      },
    };
  }

  const breachCountScore = calculateBreachCountScore(input.breachCount);
  const recencyScore = calculateRecencyScore(input.lastBreachDate);
  const criticalityScore = calculateCriticalityScore(input.criticality);
  const roleScore = calculateRoleScore(input.role);

  const weightedScore = Math.round(
    breachCountScore * SCORING_WEIGHTS.breachCount +
    recencyScore * SCORING_WEIGHTS.recency +
    criticalityScore * SCORING_WEIGHTS.criticality +
    roleScore * SCORING_WEIGHTS.role
  );

  const score = Math.min(Math.max(weightedScore, 0), 100);
  const riskLevel = getRiskLevel(score);

  const breakdown: ScoreBreakdown = {
    breachCountScore,
    breachCountWeight: SCORING_WEIGHTS.breachCount,
    recencyScore,
    recencyWeight: SCORING_WEIGHTS.recency,
    criticalityScore,
    criticalityWeight: SCORING_WEIGHTS.criticality,
    roleScore,
    roleWeight: SCORING_WEIGHTS.role,
  };

  return {
    score,
    riskLevel,
    breakdown,
  };
}

export function getScoreExplanation(breakdown: ScoreBreakdown): string[] {
  const explanations: string[] = [];

  if (breakdown.breachCountScore >= 66) {
    explanations.push('Multiple breach exposures detected');
  } else if (breakdown.breachCountScore >= 33) {
    explanations.push('Found in at least one data breach');
  }

  if (breakdown.recencyScore >= 75) {
    explanations.push('Recent breach exposure (within 90 days)');
  }

  if (breakdown.criticalityScore >= 60) {
    explanations.push('High business criticality role');
  }

  if (breakdown.roleScore >= 80) {
    explanations.push('Privileged access role');
  }

  return explanations;
}
