'use client';

import { useCallback, useState } from 'react';
import { useProjectContext } from '../ProjectContext';
import { useEvidenceContext } from '../EvidenceContext';
import { apiClient } from '@/services/api';
import { trackEvent, ANALYTICS_EVENTS } from '@/services/analytics';

export function useProject() {
  const context = useProjectContext();
  const { appendEvent } = useEvidenceContext();
  const [isPolling, setIsPolling] = useState(false);

  const createProject = useCallback(async (name: string) => {
    context.setLoading(true);
    try {
      const response = await apiClient.createProject({ name });
      context.setProject(response.data);

      appendEvent('project.created', {
        projectId: response.data.id,
        name: response.data.name,
      });

      trackEvent(ANALYTICS_EVENTS.PROJECT_CREATED, {
        projectId: response.data.id,
      });

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      context.setError(message);
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context, appendEvent]);

  const importIdentities = useCallback(async (
    projectId: string,
    identities: Array<{
      email: string;
      name: string;
      role: string;
      area: string;
      criticality: string;
    }>
  ) => {
    context.setLoading(true);
    try {
      const response = await apiClient.importIdentities({ projectId, identities });

      const identitiesResponse = await apiClient.getIdentities(projectId);
      context.setIdentities(identitiesResponse.data);

      appendEvent('identities.imported', {
        projectId,
        count: response.data.count,
        hash: response.data.hash,
        duplicatesRemoved: response.data.duplicatesRemoved,
      });

      trackEvent(ANALYTICS_EVENTS.IMPORT_COMPLETED, {
        projectId,
        count: response.data.count,
        duplicates: response.data.duplicatesRemoved,
      });

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import identities';
      context.setError(message);
      trackEvent(ANALYTICS_EVENTS.IMPORT_FAILED, {
        projectId,
        error: message,
      });
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context, appendEvent]);

  const startCheck = useCallback(async (projectId: string) => {
    context.setLoading(true);
    try {
      const response = await apiClient.startCheck({ projectId });
      const checkId = response.data.checkId;

      appendEvent('check.started', {
        projectId,
        checkId,
        identityCount: context.identities.length,
      });

      trackEvent(ANALYTICS_EVENTS.CHECK_STARTED, {
        projectId,
        identityCount: context.identities.length,
      });

      setIsPolling(true);
      const startTime = Date.now();

      const pollStatus = async () => {
        try {
          const statusResponse = await apiClient.getCheckStatus(checkId);
          context.setCheckStatus(statusResponse.data);

          if (statusResponse.data.status === 'completed') {
            setIsPolling(false);

            const [resultsResponse, recommendationsResponse] = await Promise.all([
              apiClient.getResults(projectId),
              apiClient.getRecommendations(projectId),
            ]);

            context.setResults(resultsResponse.data);
            context.setRecommendations(recommendationsResponse.data);

            appendEvent('check.completed', {
              projectId,
              checkId,
              totalChecked: resultsResponse.data.length,
              exposedCount: resultsResponse.data.filter(r => r.isExposed).length,
            });

            trackEvent(ANALYTICS_EVENTS.CHECK_COMPLETED, {
              projectId,
              checkId,
              duration: Date.now() - startTime,
            });

            context.setLoading(false);
          } else if (statusResponse.data.status === 'failed') {
            setIsPolling(false);
            context.setError(statusResponse.data.error || 'Check failed');
            context.setLoading(false);
          } else {
            setTimeout(pollStatus, 500);
          }
        } catch (error) {
          setIsPolling(false);
          const message = error instanceof Error ? error.message : 'Failed to check status';
          context.setError(message);
          context.setLoading(false);
        }
      };

      pollStatus();

      return checkId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start check';
      context.setError(message);
      context.setLoading(false);
      throw error;
    }
  }, [context, appendEvent]);

  const markIdentityExposed = useCallback(async (
    projectId: string,
    identityId: string,
    exposed: boolean
  ) => {
    try {
      const response = await apiClient.markIdentityExposed({
        projectId,
        identityId,
        exposed,
      });

      context.updateResult(response.data);

      trackEvent(ANALYTICS_EVENTS.IDENTITY_MARKED_EXPOSED, {
        identityId,
        exposed,
      });

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update identity';
      context.setError(message);
      throw error;
    }
  }, [context]);

  const markRecommendationDone = useCallback(async (
    projectId: string,
    recommendationId: string,
    done: boolean
  ) => {
    try {
      const response = await apiClient.markRecommendationDone({
        projectId,
        recommendationId,
        done,
      });

      context.updateRecommendation(response.data);

      if (done) {
        appendEvent('action.marked_done', {
          projectId,
          recommendationId,
        });

        trackEvent(ANALYTICS_EVENTS.RECOMMENDATION_MARKED_DONE, {
          recommendationId,
        });
      }

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update recommendation';
      context.setError(message);
      throw error;
    }
  }, [context, appendEvent]);

  return {
    ...context,
    isPolling,
    createProject,
    importIdentities,
    startCheck,
    markIdentityExposed,
    markRecommendationDone,
  };
}
