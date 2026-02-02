import { RecommendationTemplate } from './types';

// Compliance references for Chile and ISO standards
const COMPLIANCE_REFS = {
  iso27001: 'ISO 27001:2022',
  iso27002: 'ISO 27002:2022',
  chileDataLaw: 'Ley 21.719 de Protección de Datos Personales de Chile',
};

export const securityTemplates: RecommendationTemplate[] = [
  {
    id: 'sec-critical-reset',
    titleKey: 'templates.secCriticalReset.title',
    descriptionKey: 'templates.secCriticalReset.description',
    audience: 'security',
    severity: 'critical',
    suggestedActionKey: 'templates.secCriticalReset.action',
    suggestedDeadlineDays: 1,
    condition: { type: 'minCount', severity: 'critical', threshold: 1 },
    complianceRefs: [COMPLIANCE_REFS.iso27001, COMPLIANCE_REFS.chileDataLaw],
  },
  {
    id: 'sec-admin-audit',
    titleKey: 'templates.secAdminAudit.title',
    descriptionKey: 'templates.secAdminAudit.description',
    audience: 'security',
    severity: 'critical',
    suggestedActionKey: 'templates.secAdminAudit.action',
    suggestedDeadlineDays: 1,
    condition: { type: 'roleExposed', role: 'admin', threshold: 1 },
    complianceRefs: [COMPLIANCE_REFS.iso27001, COMPLIANCE_REFS.iso27002],
  },
  {
    id: 'sec-mfa-deployment',
    titleKey: 'templates.secMfaDeployment.title',
    descriptionKey: 'templates.secMfaDeployment.description',
    audience: 'security',
    severity: 'high',
    suggestedActionKey: 'templates.secMfaDeployment.action',
    suggestedDeadlineDays: 7,
    condition: { type: 'minCount', severity: 'high', threshold: 1 },
    complianceRefs: [COMPLIANCE_REFS.iso27001],
  },
  {
    id: 'sec-finance-audit',
    titleKey: 'templates.secFinanceAudit.title',
    descriptionKey: 'templates.secFinanceAudit.description',
    audience: 'security',
    severity: 'high',
    suggestedActionKey: 'templates.secFinanceAudit.action',
    suggestedDeadlineDays: 3,
    condition: { type: 'roleExposed', role: 'finance', threshold: 1 },
    complianceRefs: [COMPLIANCE_REFS.iso27002],
  },
  {
    id: 'sec-monitor-recent',
    titleKey: 'templates.secMonitorRecent.title',
    descriptionKey: 'templates.secMonitorRecent.description',
    audience: 'security',
    severity: 'high',
    suggestedActionKey: 'templates.secMonitorRecent.action',
    suggestedDeadlineDays: 2,
    condition: { type: 'recentBreaches', dayLimit: 90, threshold: 1 },
    complianceRefs: [COMPLIANCE_REFS.iso27001, COMPLIANCE_REFS.chileDataLaw],
  },
];

export const legalTemplates: RecommendationTemplate[] = [
  {
    id: 'legal-breach-assessment',
    titleKey: 'templates.legalBreachAssessment.title',
    descriptionKey: 'templates.legalBreachAssessment.description',
    audience: 'legal',
    severity: 'high',
    suggestedActionKey: 'templates.legalBreachAssessment.action',
    suggestedDeadlineDays: 3,
    condition: { type: 'recentBreaches', dayLimit: 90, threshold: 1 },
    complianceRefs: [COMPLIANCE_REFS.chileDataLaw],
  },
  {
    id: 'legal-documentation',
    titleKey: 'templates.legalDocumentation.title',
    descriptionKey: 'templates.legalDocumentation.description',
    audience: 'legal',
    severity: 'medium',
    suggestedActionKey: 'templates.legalDocumentation.action',
    suggestedDeadlineDays: 14,
    condition: { type: 'always' },
    complianceRefs: [COMPLIANCE_REFS.iso27001, COMPLIANCE_REFS.chileDataLaw],
  },
  {
    id: 'legal-regulatory-review',
    titleKey: 'templates.legalRegulatoryReview.title',
    descriptionKey: 'templates.legalRegulatoryReview.description',
    audience: 'legal',
    severity: 'medium',
    suggestedActionKey: 'templates.legalRegulatoryReview.action',
    suggestedDeadlineDays: 7,
    condition: { type: 'exposedPercent', threshold: 30 },
    complianceRefs: [COMPLIANCE_REFS.chileDataLaw],
  },
  {
    id: 'legal-vendor-notification',
    titleKey: 'templates.legalVendorNotification.title',
    descriptionKey: 'templates.legalVendorNotification.description',
    audience: 'legal',
    severity: 'high',
    suggestedActionKey: 'templates.legalVendorNotification.action',
    suggestedDeadlineDays: 5,
    condition: { type: 'minCount', severity: 'critical', threshold: 5 },
    complianceRefs: [COMPLIANCE_REFS.chileDataLaw],
  },
];

export const executiveTemplates: RecommendationTemplate[] = [
  {
    id: 'exec-risk-summary',
    titleKey: 'templates.execRiskSummary.title',
    descriptionKey: 'templates.execRiskSummary.description',
    audience: 'executive',
    severity: 'critical',
    suggestedActionKey: 'templates.execRiskSummary.action',
    suggestedDeadlineDays: 1,
    condition: { type: 'minCount', severity: 'critical', threshold: 1 },
    complianceRefs: [COMPLIANCE_REFS.iso27001, COMPLIANCE_REFS.chileDataLaw],
  },
  {
    id: 'exec-budget-review',
    titleKey: 'templates.execBudgetReview.title',
    descriptionKey: 'templates.execBudgetReview.description',
    audience: 'executive',
    severity: 'high',
    suggestedActionKey: 'templates.execBudgetReview.action',
    suggestedDeadlineDays: 14,
    condition: { type: 'exposedPercent', threshold: 40 },
    complianceRefs: [COMPLIANCE_REFS.iso27001],
  },
  {
    id: 'exec-training',
    titleKey: 'templates.execTraining.title',
    descriptionKey: 'templates.execTraining.description',
    audience: 'executive',
    severity: 'low',
    suggestedActionKey: 'templates.execTraining.action',
    suggestedDeadlineDays: 30,
    condition: { type: 'always' },
    complianceRefs: [COMPLIANCE_REFS.iso27002],
  },
  {
    id: 'exec-policy-update',
    titleKey: 'templates.execPolicyUpdate.title',
    descriptionKey: 'templates.execPolicyUpdate.description',
    audience: 'executive',
    severity: 'medium',
    suggestedActionKey: 'templates.execPolicyUpdate.action',
    suggestedDeadlineDays: 30,
    condition: { type: 'exposedPercent', threshold: 20 },
    complianceRefs: [COMPLIANCE_REFS.iso27001, COMPLIANCE_REFS.iso27002],
  },
];

export const allTemplates: RecommendationTemplate[] = [
  ...securityTemplates,
  ...legalTemplates,
  ...executiveTemplates,
];

export function getTemplatesByAudience(audience: string): RecommendationTemplate[] {
  return allTemplates.filter(t => t.audience === audience);
}
