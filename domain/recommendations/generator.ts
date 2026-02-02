import { v4 as uuidv4 } from 'uuid';
import { CheckResult } from '@/services/api/types';
import { RiskLevel } from '@/config/constants';
import {
  Recommendation,
  RecommendationTemplate,
  RecommendationContext,
  RecommendationCondition,
} from './types';
import { allTemplates } from './templates';

function buildContext(results: CheckResult[]): RecommendationContext {
  const exposedResults = results.filter(r => r.isExposed);

  const bySeverity: Record<RiskLevel, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const byRole: Record<string, { count: number; exposedCount: number }> = {};

  for (const result of results) {
    bySeverity[result.riskLevel]++;

    const role = result.identity.role;
    if (!byRole[role]) {
      byRole[role] = { count: 0, exposedCount: 0 };
    }
    byRole[role].count++;
    if (result.isExposed) {
      byRole[role].exposedCount++;
    }
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  const recentBreachCount = results.filter(r => {
    if (!r.lastBreachDate) return false;
    return new Date(r.lastBreachDate) >= cutoffDate;
  }).length;

  return {
    totalIdentities: results.length,
    exposedCount: exposedResults.length,
    bySeverity,
    byRole,
    recentBreachCount,
  };
}

function evaluateCondition(
  condition: RecommendationCondition,
  context: RecommendationContext
): { matches: boolean; count: number } {
  switch (condition.type) {
    case 'minCount': {
      const count = context.bySeverity[condition.severity];
      return { matches: count >= condition.threshold, count };
    }

    case 'roleExposed': {
      const roleStats = context.byRole[condition.role];
      if (!roleStats) return { matches: false, count: 0 };
      return {
        matches: roleStats.exposedCount >= condition.threshold,
        count: roleStats.exposedCount,
      };
    }

    case 'recentBreaches': {
      return {
        matches: context.recentBreachCount >= condition.threshold,
        count: context.recentBreachCount,
      };
    }

    case 'exposedPercent': {
      const percent = context.totalIdentities > 0
        ? (context.exposedCount / context.totalIdentities) * 100
        : 0;
      return { matches: percent >= condition.threshold, count: context.exposedCount };
    }

    case 'always': {
      return { matches: true, count: context.exposedCount };
    }

    default:
      return { matches: false, count: 0 };
  }
}

function formatDescription(
  template: string,
  context: RecommendationContext,
  count: number
): string {
  const percent = context.totalIdentities > 0
    ? Math.round((context.exposedCount / context.totalIdentities) * 100)
    : 0;

  return template
    .replace('{count}', String(count))
    .replace('{percent}', String(percent))
    .replace('{criticalCount}', String(context.bySeverity.critical));
}

function generateFromTemplate(
  template: RecommendationTemplate,
  context: RecommendationContext
): Recommendation | null {
  const { matches, count } = evaluateCondition(template.condition, context);

  if (!matches) return null;

  return {
    id: uuidv4(),
    title: template.titleKey,
    description: formatDescription(template.descriptionKey, context, count),
    audience: template.audience,
    severity: template.severity,
    affectedCount: count,
    suggestedActionKey: template.suggestedActionKey,
    suggestedDeadlineDays: template.suggestedDeadlineDays,
    isDone: false,
    templateId: template.id,
    complianceRefs: template.complianceRefs,
  };
}

export function generateRecommendations(results: CheckResult[]): Recommendation[] {
  if (results.length === 0) return [];

  const context = buildContext(results);
  const recommendations: Recommendation[] = [];

  for (const template of allTemplates) {
    const recommendation = generateFromTemplate(template, context);
    if (recommendation) {
      recommendations.push(recommendation);
    }
  }

  recommendations.sort((a, b) => {
    const severityOrder: Record<RiskLevel, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return recommendations;
}

export function getRecommendationsByAudience(
  recommendations: Recommendation[],
  audience: string
): Recommendation[] {
  return recommendations.filter(r => r.audience === audience);
}

export function getPendingRecommendations(recommendations: Recommendation[]): Recommendation[] {
  return recommendations.filter(r => !r.isDone);
}

export function getCompletedRecommendations(recommendations: Recommendation[]): Recommendation[] {
  return recommendations.filter(r => r.isDone);
}
