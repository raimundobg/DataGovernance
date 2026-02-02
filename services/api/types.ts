import { Role, CriticalityLevel, RiskLevel, Audience } from '@/config/constants';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
  requestId: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  identityCount: number;
  lastCheckId?: string;
  lastCheckAt?: string;
}

export interface Identity {
  id: string;
  email: string;
  name: string;
  role: Role;
  area: string;
  criticality: CriticalityLevel;
  createdAt: string;
}

export interface BreachInfo {
  source: string;
  date: string;
  dataTypes: string[];
}

export interface CheckResult {
  id: string;
  identityId: string;
  identity: Identity;
  score: number;
  riskLevel: RiskLevel;
  breachCount: number;
  breaches: BreachInfo[];
  lastBreachDate?: string;
  isExposed: boolean;
  manuallyMarked: boolean;
  checkedAt: string;
}

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

export interface CheckStatus {
  checkId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalIdentities: number;
  processedIdentities: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface ImportResult {
  count: number;
  hash: string;
  duplicatesRemoved: number;
  invalidRows: number;
}

export interface ScoreBreakdown {
  byRole: Record<Role, { count: number; avgScore: number }>;
  byArea: Record<string, { count: number; avgScore: number }>;
  bySeverity: Record<RiskLevel, number>;
}
