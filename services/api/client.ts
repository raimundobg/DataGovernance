import { httpClient } from './http';
import { mockApiClient } from './mock/mockServer';
import { env } from '@/config/env';
import {
  ApiResponse,
  Project,
  Identity,
  CheckResult,
  CheckStatus,
  Recommendation,
  ImportResult,
  ScoreBreakdown,
} from './types';

interface CreateProjectInput {
  name: string;
}

interface ImportIdentitiesInput {
  projectId: string;
  identities: Array<{
    email: string;
    name: string;
    role: string;
    area: string;
    criticality: string;
  }>;
}

interface StartCheckInput {
  projectId: string;
}

interface MarkIdentityExposedInput {
  projectId: string;
  identityId: string;
  exposed: boolean;
}

interface MarkRecommendationDoneInput {
  projectId: string;
  recommendationId: string;
  done: boolean;
}

class ApiClient {
  private get client() {
    return env.demoMode ? mockApiClient : httpClient;
  }

  async createProject(input: CreateProjectInput): Promise<ApiResponse<Project>> {
    return this.client.post<ApiResponse<Project>>('/v1/projects', input);
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    return this.client.get<ApiResponse<Project>>(`/v1/projects/${projectId}`);
  }

  async importIdentities(input: ImportIdentitiesInput): Promise<ApiResponse<ImportResult>> {
    return this.client.post<ApiResponse<ImportResult>>(
      `/v1/projects/${input.projectId}/identities/import`,
      { identities: input.identities }
    );
  }

  async getIdentities(projectId: string): Promise<ApiResponse<Identity[]>> {
    return this.client.get<ApiResponse<Identity[]>>(`/v1/projects/${projectId}/identities`);
  }

  async startCheck(input: StartCheckInput): Promise<ApiResponse<{ checkId: string }>> {
    return this.client.post<ApiResponse<{ checkId: string }>>(
      `/v1/projects/${input.projectId}/checks`,
      {}
    );
  }

  async getCheckStatus(checkId: string): Promise<ApiResponse<CheckStatus>> {
    return this.client.get<ApiResponse<CheckStatus>>(`/v1/checks/${checkId}`);
  }

  async getResults(projectId: string): Promise<ApiResponse<CheckResult[]>> {
    return this.client.get<ApiResponse<CheckResult[]>>(`/v1/projects/${projectId}/results`);
  }

  async getScoreBreakdown(projectId: string): Promise<ApiResponse<ScoreBreakdown>> {
    return this.client.get<ApiResponse<ScoreBreakdown>>(`/v1/projects/${projectId}/breakdown`);
  }

  async getRecommendations(projectId: string): Promise<ApiResponse<Recommendation[]>> {
    return this.client.get<ApiResponse<Recommendation[]>>(
      `/v1/projects/${projectId}/recommendations`
    );
  }

  async markIdentityExposed(input: MarkIdentityExposedInput): Promise<ApiResponse<CheckResult>> {
    return this.client.patch<ApiResponse<CheckResult>>(
      `/v1/projects/${input.projectId}/identities/${input.identityId}/exposed`,
      { exposed: input.exposed }
    );
  }

  async markRecommendationDone(
    input: MarkRecommendationDoneInput
  ): Promise<ApiResponse<Recommendation>> {
    return this.client.patch<ApiResponse<Recommendation>>(
      `/v1/projects/${input.projectId}/recommendations/${input.recommendationId}/done`,
      { done: input.done }
    );
  }

  async exportEvidence(
    projectId: string,
    format: 'json' | 'pdf'
  ): Promise<ApiResponse<Blob>> {
    return this.client.post<ApiResponse<Blob>>(
      `/v1/projects/${projectId}/evidence/export`,
      { format }
    );
  }
}

export const apiClient = new ApiClient();
