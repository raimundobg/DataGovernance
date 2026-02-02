import { CheckResult, Recommendation } from '@/services/api/types';
import { EvidenceEvent } from '@/state/EvidenceContext';
import { hashObject } from './hashUtils';

interface ExportInput {
  projectId: string;
  projectName: string;
  timeline: {
    events: EvidenceEvent[];
    metadata: {
      totalEvents: number;
      firstEvent?: string;
      lastEvent?: string;
      integrityVerified: boolean;
      exportedAt: string;
    };
  };
  results: CheckResult[];
  recommendations: Recommendation[];
}

interface ExportedEvidence {
  version: string;
  exportedAt: string;
  project: {
    id: string;
    name: string;
  };
  summary: {
    totalIdentities: number;
    exposedCount: number;
    criticalCount: number;
    highCount: number;
    recommendationCount: number;
    pendingRecommendations: number;
  };
  timeline: {
    events: Array<{
      id: string;
      type: string;
      timestamp: string;
      data: Record<string, unknown>;
      hash: string;
      previousHash: string;
    }>;
    metadata: {
      totalEvents: number;
      firstEvent?: string;
      lastEvent?: string;
      integrityVerified: boolean;
    };
  };
  results: Array<{
    identityId: string;
    email: string;
    name: string;
    role: string;
    area: string;
    criticality: string;
    score: number;
    riskLevel: string;
    breachCount: number;
    isExposed: boolean;
    manuallyMarked: boolean;
    checkedAt: string;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    audience: string;
    severity: string;
    affectedCount: number;
    isDone: boolean;
  }>;
  integrity: {
    resultsHash: string;
    recommendationsHash: string;
    timelineHash: string;
    exportHash: string;
  };
}

export async function exportToJSON(input: ExportInput): Promise<void> {
  const { projectId, projectName, timeline, results, recommendations } = input;

  const simplifiedResults = results.map((r) => ({
    identityId: r.identityId,
    email: r.identity.email,
    name: r.identity.name,
    role: r.identity.role,
    area: r.identity.area,
    criticality: r.identity.criticality,
    score: r.score,
    riskLevel: r.riskLevel,
    breachCount: r.breachCount,
    isExposed: r.isExposed,
    manuallyMarked: r.manuallyMarked,
    checkedAt: r.checkedAt,
  }));

  const simplifiedRecommendations = recommendations.map((r) => ({
    id: r.id,
    title: r.title,
    audience: r.audience,
    severity: r.severity,
    affectedCount: r.affectedCount,
    isDone: r.isDone,
  }));

  const resultsHash = hashObject(simplifiedResults);
  const recommendationsHash = hashObject(simplifiedRecommendations);
  const timelineHash = hashObject(timeline.events);

  const exportData: ExportedEvidence = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    project: {
      id: projectId,
      name: projectName,
    },
    summary: {
      totalIdentities: results.length,
      exposedCount: results.filter((r) => r.isExposed).length,
      criticalCount: results.filter((r) => r.riskLevel === 'critical').length,
      highCount: results.filter((r) => r.riskLevel === 'high').length,
      recommendationCount: recommendations.length,
      pendingRecommendations: recommendations.filter((r) => !r.isDone).length,
    },
    timeline: {
      events: timeline.events,
      metadata: timeline.metadata,
    },
    results: simplifiedResults,
    recommendations: simplifiedRecommendations,
    integrity: {
      resultsHash,
      recommendationsHash,
      timelineHash,
      exportHash: '',
    },
  };

  exportData.integrity.exportHash = hashObject({
    resultsHash,
    recommendationsHash,
    timelineHash,
    exportedAt: exportData.exportedAt,
  });

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evidence-pack-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
