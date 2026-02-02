export type {
  Recommendation,
  RecommendationTemplate,
  RecommendationCondition,
  RecommendationContext,
} from './types';

export {
  securityTemplates,
  legalTemplates,
  executiveTemplates,
  allTemplates,
  getTemplatesByAudience,
} from './templates';

export {
  generateRecommendations,
  getRecommendationsByAudience,
  getPendingRecommendations,
  getCompletedRecommendations,
} from './generator';
