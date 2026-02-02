export type {
  ScoringInput,
  ScoringOutput,
  ScoreBreakdown,
  IdentityScoreInput,
  IdentityScoreOutput,
} from './types';

export { calculateIdentityScore, getScoreExplanation } from './calculator';

export {
  aggregateResults,
  getTopRisksByRole,
  getTopRisksByArea,
  getRecentlyExposed,
} from './aggregator';
export type { AggregatedStats, RoleStats, AreaStats } from './aggregator';
