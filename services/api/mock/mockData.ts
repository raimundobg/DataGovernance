import { v4 as uuidv4 } from 'uuid';
import {
  Project,
  Identity,
  CheckResult,
  Recommendation,
  BreachInfo,
} from '../types';
import {
  Role,
  CriticalityLevel,
  getRiskLevel,
  ROLES,
  CRITICALITY_LEVELS,
  Audience,
} from '@/config/constants';

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return function() {
    hash = Math.imul(hash ^ (hash >>> 15), hash | 1);
    hash ^= hash + Math.imul(hash ^ (hash >>> 7), hash | 61);
    return ((hash ^ (hash >>> 14)) >>> 0) / 4294967296;
  };
}

const breachSources = [
  'LinkedIn (2021)',
  'Adobe (2013)',
  'Dropbox (2016)',
  'Collection #1 (2019)',
  'Canva (2019)',
  'MyFitnessPal (2018)',
  'Zynga (2019)',
  'Dubsmash (2018)',
  'Twitter (2022)',
  'Facebook (2019)',
];

const dataTypes = [
  ['email', 'password', 'name'],
  ['email', 'password', 'phone'],
  ['email', 'hashed_password'],
  ['email', 'name', 'address'],
  ['email', 'password', 'ip_address'],
];

const areas = [
  'Engineering',
  'Finance',
  'Human Resources',
  'Marketing',
  'Sales',
  'Operations',
  'Legal',
  'Customer Support',
  'Executive',
  'IT',
];

const firstNames = [
  'James', 'Maria', 'Carlos', 'Sarah', 'Miguel', 'Emma', 'David', 'Sofia',
  'John', 'Ana', 'Robert', 'Laura', 'William', 'Isabella', 'Michael', 'Carmen',
];

const lastNames = [
  'Smith', 'Garcia', 'Johnson', 'Martinez', 'Williams', 'Rodriguez', 'Brown', 'Lopez',
  'Jones', 'Hernandez', 'Davis', 'Gonzalez', 'Miller', 'Wilson', 'Moore', 'Taylor',
];

export function generateMockIdentities(count: number, seed: string = 'default'): Identity[] {
  const random = seededRandom(seed);
  const identities: Identity[] = [];
  const roles = Object.keys(ROLES) as Role[];
  const criticalities = Object.keys(CRITICALITY_LEVELS) as CriticalityLevel[];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(random() * firstNames.length)];
    const lastName = lastNames[Math.floor(random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`;

    identities.push({
      id: uuidv4(),
      email,
      name: `${firstName} ${lastName}`,
      role: roles[Math.floor(random() * roles.length)],
      area: areas[Math.floor(random() * areas.length)],
      criticality: criticalities[Math.floor(random() * criticalities.length)],
      createdAt: new Date().toISOString(),
    });
  }

  return identities;
}

export function generateMockCheckResult(
  identity: Identity,
  seed: string = 'default'
): CheckResult {
  const random = seededRandom(seed + identity.email);

  const breachCount = Math.floor(random() * 5);
  const breaches: BreachInfo[] = [];

  for (let i = 0; i < breachCount; i++) {
    const daysAgo = Math.floor(random() * 1000) + 30;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    breaches.push({
      source: breachSources[Math.floor(random() * breachSources.length)],
      date: date.toISOString().split('T')[0],
      dataTypes: dataTypes[Math.floor(random() * dataTypes.length)],
    });
  }

  const breachCountScore = breachCount === 0 ? 0 : breachCount === 1 ? 33 : breachCount === 2 ? 66 : 100;

  const lastBreachDate = breaches.length > 0
    ? breaches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
    : undefined;

  let recencyScore = 40;
  if (lastBreachDate) {
    const daysSince = Math.floor((Date.now() - new Date(lastBreachDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < 30) recencyScore = 100;
    else if (daysSince < 90) recencyScore = 75;
    else if (daysSince < 365) recencyScore = 50;
    else recencyScore = 25;
  }

  const criticalityScore = identity.criticality === 'high' ? 100 : identity.criticality === 'medium' ? 60 : 30;

  const roleScores: Record<Role, number> = {
    admin: 100,
    finance: 80,
    clinical: 70,
    support: 40,
    other: 30,
  };
  const roleScore = roleScores[identity.role];

  const score = Math.round(
    breachCountScore * 0.30 +
    recencyScore * 0.25 +
    criticalityScore * 0.25 +
    roleScore * 0.20
  );

  return {
    id: uuidv4(),
    identityId: identity.id,
    identity,
    score,
    riskLevel: getRiskLevel(score),
    breachCount,
    breaches,
    lastBreachDate,
    isExposed: breachCount > 0,
    manuallyMarked: false,
    checkedAt: new Date().toISOString(),
  };
}

export function generateMockRecommendations(
  results: CheckResult[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const criticalCount = results.filter(r => r.riskLevel === 'critical').length;
  const highCount = results.filter(r => r.riskLevel === 'high').length;
  const exposedAdmins = results.filter(r => r.identity.role === 'admin' && r.isExposed).length;
  const exposedFinance = results.filter(r => r.identity.role === 'finance' && r.isExposed).length;
  const recentBreaches = results.filter(r => {
    if (!r.lastBreachDate) return false;
    const daysSince = Math.floor((Date.now() - new Date(r.lastBreachDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince < 90;
  }).length;
  const exposedPercent = Math.round((results.filter(r => r.isExposed).length / results.length) * 100);

  // Security recommendations
  if (criticalCount > 0) {
    recommendations.push({
      id: uuidv4(),
      title: 'templates.secCriticalReset.title',
      description: 'templates.secCriticalReset.description',
      audience: 'security',
      severity: 'critical',
      affectedCount: criticalCount,
      suggestedActionKey: 'templates.secCriticalReset.action',
      suggestedDeadlineDays: 1,
      isDone: false,
      complianceRefs: ['ISO 27001:2022', 'Ley 21.719 de Chile'],
    });
  }

  if (exposedAdmins > 0) {
    recommendations.push({
      id: uuidv4(),
      title: 'templates.secAdminAudit.title',
      description: 'templates.secAdminAudit.description',
      audience: 'security',
      severity: 'critical',
      affectedCount: exposedAdmins,
      suggestedActionKey: 'templates.secAdminAudit.action',
      suggestedDeadlineDays: 1,
      isDone: false,
      complianceRefs: ['ISO 27001:2022', 'ISO 27002:2022'],
    });
  }

  if (highCount > 0) {
    recommendations.push({
      id: uuidv4(),
      title: 'templates.secMfaDeployment.title',
      description: 'templates.secMfaDeployment.description',
      audience: 'security',
      severity: 'high',
      affectedCount: highCount,
      suggestedActionKey: 'templates.secMfaDeployment.action',
      suggestedDeadlineDays: 7,
      isDone: false,
      complianceRefs: ['ISO 27001:2022'],
    });
  }

  if (exposedFinance > 0) {
    recommendations.push({
      id: uuidv4(),
      title: 'templates.secFinanceAudit.title',
      description: 'templates.secFinanceAudit.description',
      audience: 'security',
      severity: 'high',
      affectedCount: exposedFinance,
      suggestedActionKey: 'templates.secFinanceAudit.action',
      suggestedDeadlineDays: 3,
      isDone: false,
      complianceRefs: ['ISO 27002:2022'],
    });
  }

  if (recentBreaches > 0) {
    recommendations.push({
      id: uuidv4(),
      title: 'templates.secMonitorRecent.title',
      description: 'templates.secMonitorRecent.description',
      audience: 'security',
      severity: 'high',
      affectedCount: recentBreaches,
      suggestedActionKey: 'templates.secMonitorRecent.action',
      suggestedDeadlineDays: 2,
      isDone: false,
      complianceRefs: ['ISO 27001:2022', 'Ley 21.719 de Chile'],
    });
  }

  // Legal recommendations
  if (recentBreaches > 0) {
    recommendations.push({
      id: uuidv4(),
      title: 'templates.legalBreachAssessment.title',
      description: 'templates.legalBreachAssessment.description',
      audience: 'legal',
      severity: 'high',
      affectedCount: recentBreaches,
      suggestedActionKey: 'templates.legalBreachAssessment.action',
      suggestedDeadlineDays: 3,
      isDone: false,
      complianceRefs: ['Ley 21.719 de Chile'],
    });
  }

  recommendations.push({
    id: uuidv4(),
    title: 'templates.legalDocumentation.title',
    description: 'templates.legalDocumentation.description',
    audience: 'legal',
    severity: 'medium',
    affectedCount: results.filter(r => r.isExposed).length,
    suggestedActionKey: 'templates.legalDocumentation.action',
    suggestedDeadlineDays: 14,
    isDone: false,
    complianceRefs: ['ISO 27001:2022', 'Ley 21.719 de Chile'],
  });

  if (exposedPercent >= 30) {
    recommendations.push({
      id: uuidv4(),
      title: 'templates.legalRegulatoryReview.title',
      description: 'templates.legalRegulatoryReview.description',
      audience: 'legal',
      severity: 'medium',
      affectedCount: results.filter(r => r.isExposed).length,
      suggestedActionKey: 'templates.legalRegulatoryReview.action',
      suggestedDeadlineDays: 7,
      isDone: false,
      complianceRefs: ['Ley 21.719 de Chile'],
    });
  }

  // Executive recommendations
  recommendations.push({
    id: uuidv4(),
    title: 'templates.execRiskSummary.title',
    description: 'templates.execRiskSummary.description',
    audience: 'executive',
    severity: criticalCount > 0 ? 'critical' : highCount > 0 ? 'high' : 'medium',
    affectedCount: results.filter(r => r.isExposed).length,
    suggestedActionKey: 'templates.execRiskSummary.action',
    suggestedDeadlineDays: criticalCount > 0 ? 1 : 7,
    isDone: false,
    complianceRefs: ['ISO 27001:2022', 'Ley 21.719 de Chile'],
  });

  if (exposedPercent >= 40) {
    recommendations.push({
      id: uuidv4(),
      title: 'templates.execBudgetReview.title',
      description: 'templates.execBudgetReview.description',
      audience: 'executive',
      severity: 'high',
      affectedCount: results.filter(r => r.isExposed).length,
      suggestedActionKey: 'templates.execBudgetReview.action',
      suggestedDeadlineDays: 14,
      isDone: false,
      complianceRefs: ['ISO 27001:2022'],
    });
  }

  recommendations.push({
    id: uuidv4(),
    title: 'templates.execTraining.title',
    description: 'templates.execTraining.description',
    audience: 'executive',
    severity: 'low',
    affectedCount: results.length,
    suggestedActionKey: 'templates.execTraining.action',
    suggestedDeadlineDays: 30,
    isDone: false,
    complianceRefs: ['ISO 27002:2022'],
  });

  if (exposedPercent >= 20) {
    recommendations.push({
      id: uuidv4(),
      title: 'templates.execPolicyUpdate.title',
      description: 'templates.execPolicyUpdate.description',
      audience: 'executive',
      severity: 'medium',
      affectedCount: results.filter(r => r.isExposed).length,
      suggestedActionKey: 'templates.execPolicyUpdate.action',
      suggestedDeadlineDays: 30,
      isDone: false,
      complianceRefs: ['ISO 27001:2022', 'ISO 27002:2022'],
    });
  }

  return recommendations;
}

export function generateMockProject(name: string): Project {
  return {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    identityCount: 0,
  };
}
