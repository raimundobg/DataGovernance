import { v4 as uuidv4 } from 'uuid';
import SHA256 from 'crypto-js/sha256';
import {
  ApiResponse,
  Project,
  Identity,
  CheckResult,
  CheckStatus,
  Recommendation,
  ImportResult,
  ScoreBreakdown,
} from '../types';
import {
  generateMockProject,
  generateMockCheckResult,
  generateMockRecommendations,
} from './mockData';
import { Role, RiskLevel, CriticalityLevel, ROLES, CRITICALITY_LEVELS } from '@/config/constants';

interface MockState {
  projects: Map<string, Project>;
  identities: Map<string, Identity[]>;
  results: Map<string, CheckResult[]>;
  recommendations: Map<string, Recommendation[]>;
  checks: Map<string, CheckStatus>;
}

const state: MockState = {
  projects: new Map(),
  identities: new Map(),
  results: new Map(),
  recommendations: new Map(),
  checks: new Map(),
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createResponse<T>(data: T, meta?: { total?: number }): ApiResponse<T> {
  return {
    data,
    meta,
    requestId: uuidv4(),
  };
}

class MockApiClient {
  async post<T>(url: string, data?: unknown): Promise<T> {
    await delay(300 + Math.random() * 200);

    if (url === '/v1/projects') {
      const input = data as { name: string };
      const project = generateMockProject(input.name);
      state.projects.set(project.id, project);
      state.identities.set(project.id, []);
      return createResponse(project) as T;
    }

    if (url.includes('/identities/import')) {
      const projectId = url.split('/')[3];
      const input = data as { identities: Array<{
        email: string;
        name: string;
        role: string;
        area: string;
        criticality: string;
      }> };

      const existingEmails = new Set(
        (state.identities.get(projectId) || []).map(i => i.email.toLowerCase())
      );

      let duplicatesRemoved = 0;
      let invalidRows = 0;
      const newIdentities: Identity[] = [];
      const seenEmails = new Set<string>();

      for (const item of input.identities) {
        const email = item.email.toLowerCase();

        if (existingEmails.has(email) || seenEmails.has(email)) {
          duplicatesRemoved++;
          continue;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          invalidRows++;
          continue;
        }

        const role = Object.keys(ROLES).includes(item.role) ? item.role as Role : 'other';
        const criticality = Object.keys(CRITICALITY_LEVELS).includes(item.criticality)
          ? item.criticality as CriticalityLevel
          : 'medium';

        seenEmails.add(email);
        newIdentities.push({
          id: uuidv4(),
          email,
          name: item.name || email.split('@')[0],
          role,
          area: item.area || 'Other',
          criticality,
          createdAt: new Date().toISOString(),
        });
      }

      const allIdentities = [
        ...(state.identities.get(projectId) || []),
        ...newIdentities,
      ];
      state.identities.set(projectId, allIdentities);

      const project = state.projects.get(projectId);
      if (project) {
        project.identityCount = allIdentities.length;
        project.updatedAt = new Date().toISOString();
      }

      const dataHash = SHA256(JSON.stringify(newIdentities.map(i => i.email))).toString();

      const result: ImportResult = {
        count: newIdentities.length,
        hash: dataHash,
        duplicatesRemoved,
        invalidRows,
      };

      return createResponse(result) as T;
    }

    if (url.includes('/checks') && !url.includes('/checks/')) {
      const projectId = url.split('/')[3];
      const identities = state.identities.get(projectId) || [];

      const checkId = uuidv4();
      const checkStatus: CheckStatus = {
        checkId,
        status: 'running',
        progress: 0,
        totalIdentities: identities.length,
        processedIdentities: 0,
        startedAt: new Date().toISOString(),
      };

      state.checks.set(checkId, checkStatus);

      this.simulateCheck(projectId, checkId, identities);

      return createResponse({ checkId }) as T;
    }

    if (url.includes('/evidence/export')) {
      return createResponse(new Blob(['mock evidence data'], { type: 'application/json' })) as T;
    }

    throw new Error(`Unknown POST endpoint: ${url}`);
  }

  private async simulateCheck(projectId: string, checkId: string, identities: Identity[]) {
    const checkStatus = state.checks.get(checkId)!;
    const results: CheckResult[] = [];

    for (let i = 0; i < identities.length; i++) {
      await delay(50);

      const result = generateMockCheckResult(identities[i], projectId);
      results.push(result);

      checkStatus.processedIdentities = i + 1;
      checkStatus.progress = Math.round(((i + 1) / identities.length) * 100);
    }

    checkStatus.status = 'completed';
    checkStatus.completedAt = new Date().toISOString();

    state.results.set(projectId, results);

    const recommendations = generateMockRecommendations(results);
    state.recommendations.set(projectId, recommendations);

    const project = state.projects.get(projectId);
    if (project) {
      project.lastCheckId = checkId;
      project.lastCheckAt = checkStatus.completedAt;
    }
  }

  async get<T>(url: string): Promise<T> {
    await delay(200 + Math.random() * 100);

    if (url.match(/\/v1\/projects\/[^/]+$/)) {
      const projectId = url.split('/')[3];
      const project = state.projects.get(projectId);
      if (!project) throw new Error('Project not found');
      return createResponse(project) as T;
    }

    if (url.includes('/identities')) {
      const projectId = url.split('/')[3];
      const identities = state.identities.get(projectId) || [];
      return createResponse(identities, { total: identities.length }) as T;
    }

    if (url.match(/\/v1\/checks\/[^/]+$/)) {
      const checkId = url.split('/')[3];
      const status = state.checks.get(checkId);
      if (!status) throw new Error('Check not found');
      return createResponse(status) as T;
    }

    if (url.includes('/results')) {
      const projectId = url.split('/')[3];
      const results = state.results.get(projectId) || [];
      return createResponse(results, { total: results.length }) as T;
    }

    if (url.includes('/breakdown')) {
      const projectId = url.split('/')[3];
      const results = state.results.get(projectId) || [];

      const byRole: Record<string, { count: number; avgScore: number }> = {};
      const byArea: Record<string, { count: number; avgScore: number }> = {};
      const bySeverity: Record<RiskLevel, number> = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      for (const result of results) {
        const role = result.identity.role;
        const area = result.identity.area;

        if (!byRole[role]) byRole[role] = { count: 0, avgScore: 0 };
        byRole[role].count++;
        byRole[role].avgScore += result.score;

        if (!byArea[area]) byArea[area] = { count: 0, avgScore: 0 };
        byArea[area].count++;
        byArea[area].avgScore += result.score;

        bySeverity[result.riskLevel]++;
      }

      for (const role of Object.keys(byRole)) {
        byRole[role].avgScore = Math.round(byRole[role].avgScore / byRole[role].count);
      }

      for (const area of Object.keys(byArea)) {
        byArea[area].avgScore = Math.round(byArea[area].avgScore / byArea[area].count);
      }

      const breakdown: ScoreBreakdown = {
        byRole: byRole as Record<Role, { count: number; avgScore: number }>,
        byArea,
        bySeverity,
      };

      return createResponse(breakdown) as T;
    }

    if (url.includes('/recommendations')) {
      const projectId = url.split('/')[3];
      const recommendations = state.recommendations.get(projectId) || [];
      return createResponse(recommendations, { total: recommendations.length }) as T;
    }

    throw new Error(`Unknown GET endpoint: ${url}`);
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    await delay(200);

    if (url.includes('/exposed')) {
      const parts = url.split('/');
      const projectId = parts[3];
      const identityId = parts[5];
      const input = data as { exposed: boolean };

      const results = state.results.get(projectId) || [];
      const result = results.find(r => r.identityId === identityId);

      if (result) {
        result.manuallyMarked = true;
        result.isExposed = input.exposed;
      }

      return createResponse(result) as T;
    }

    if (url.includes('/done')) {
      const parts = url.split('/');
      const projectId = parts[3];
      const recommendationId = parts[5];
      const input = data as { done: boolean };

      const recommendations = state.recommendations.get(projectId) || [];
      const rec = recommendations.find(r => r.id === recommendationId);

      if (rec) {
        rec.isDone = input.done;
        rec.doneAt = input.done ? new Date().toISOString() : undefined;
      }

      return createResponse(rec) as T;
    }

    throw new Error(`Unknown PATCH endpoint: ${url}`);
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    await delay(200);
    throw new Error(`Unknown PUT endpoint: ${url}`);
  }

  async delete<T>(url: string): Promise<T> {
    await delay(200);
    throw new Error(`Unknown DELETE endpoint: ${url}`);
  }
}

export const mockApiClient = new MockApiClient();
