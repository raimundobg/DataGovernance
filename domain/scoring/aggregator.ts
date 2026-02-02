import { Role, RiskLevel, getRiskLevel } from '@/config/constants';
import { CheckResult } from '@/services/api/types';

export interface AggregatedStats {
  globalScore: number;
  globalRiskLevel: RiskLevel;
  totalIdentities: number;
  exposedCount: number;
  exposedPercent: number;
  bySeverity: Record<RiskLevel, number>;
  byRole: Record<Role, RoleStats>;
  byArea: Record<string, AreaStats>;
  top20: CheckResult[];
}

export interface RoleStats {
  count: number;
  exposedCount: number;
  avgScore: number;
  maxScore: number;
}

export interface AreaStats {
  count: number;
  exposedCount: number;
  avgScore: number;
  maxScore: number;
}

export function aggregateResults(results: CheckResult[]): AggregatedStats {
  if (results.length === 0) {
    return {
      globalScore: 0,
      globalRiskLevel: 'low',
      totalIdentities: 0,
      exposedCount: 0,
      exposedPercent: 0,
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
      byRole: {} as Record<Role, RoleStats>,
      byArea: {},
      top20: [],
    };
  }

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const globalScore = Math.round(totalScore / results.length);
  const globalRiskLevel = getRiskLevel(globalScore);

  const exposedResults = results.filter(r => r.isExposed);
  const exposedCount = exposedResults.length;
  const exposedPercent = Math.round((exposedCount / results.length) * 100);

  const bySeverity: Record<RiskLevel, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const byRole: Record<string, RoleStats> = {};
  const byArea: Record<string, AreaStats> = {};

  for (const result of results) {
    bySeverity[result.riskLevel]++;

    const role = result.identity.role;
    if (!byRole[role]) {
      byRole[role] = { count: 0, exposedCount: 0, avgScore: 0, maxScore: 0 };
    }
    byRole[role].count++;
    byRole[role].avgScore += result.score;
    byRole[role].maxScore = Math.max(byRole[role].maxScore, result.score);
    if (result.isExposed) byRole[role].exposedCount++;

    const area = result.identity.area;
    if (!byArea[area]) {
      byArea[area] = { count: 0, exposedCount: 0, avgScore: 0, maxScore: 0 };
    }
    byArea[area].count++;
    byArea[area].avgScore += result.score;
    byArea[area].maxScore = Math.max(byArea[area].maxScore, result.score);
    if (result.isExposed) byArea[area].exposedCount++;
  }

  for (const role of Object.keys(byRole)) {
    byRole[role].avgScore = Math.round(byRole[role].avgScore / byRole[role].count);
  }

  for (const area of Object.keys(byArea)) {
    byArea[area].avgScore = Math.round(byArea[area].avgScore / byArea[area].count);
  }

  const sortedByScore = [...results].sort((a, b) => b.score - a.score);
  const top20 = sortedByScore.slice(0, 20);

  return {
    globalScore,
    globalRiskLevel,
    totalIdentities: results.length,
    exposedCount,
    exposedPercent,
    bySeverity,
    byRole: byRole as Record<Role, RoleStats>,
    byArea,
    top20,
  };
}

export function getTopRisksByRole(results: CheckResult[], role: Role, limit: number = 10): CheckResult[] {
  return results
    .filter(r => r.identity.role === role)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getTopRisksByArea(results: CheckResult[], area: string, limit: number = 10): CheckResult[] {
  return results
    .filter(r => r.identity.area === area)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getRecentlyExposed(results: CheckResult[], dayLimit: number = 90): CheckResult[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - dayLimit);

  return results
    .filter(r => {
      if (!r.lastBreachDate) return false;
      return new Date(r.lastBreachDate) >= cutoffDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.lastBreachDate || 0);
      const dateB = new Date(b.lastBreachDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
}
