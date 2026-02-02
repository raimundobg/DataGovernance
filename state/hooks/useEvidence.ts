'use client';

import { useCallback } from 'react';
import { useEvidenceContext, EvidenceEventType } from '../EvidenceContext';
import { trackEvent, ANALYTICS_EVENTS } from '@/services/analytics';

export function useEvidence() {
  const context = useEvidenceContext();

  const recordEvent = useCallback((
    type: EvidenceEventType,
    data: Record<string, unknown>
  ) => {
    return context.appendEvent(type, data);
  }, [context]);

  const recordExport = useCallback((projectId: string, format: 'json' | 'pdf') => {
    context.appendEvent('evidence.exported', {
      projectId,
      format,
      eventCount: context.events.length,
    });

    trackEvent(ANALYTICS_EVENTS.EVIDENCE_EXPORTED, {
      projectId,
      format,
    });
  }, [context]);

  const verifyAndReport = useCallback((projectId: string) => {
    const isValid = context.verifyIntegrity();

    trackEvent(ANALYTICS_EVENTS.INTEGRITY_VERIFIED, {
      projectId,
      valid: isValid,
    });

    return isValid;
  }, [context]);

  const getTimelineForExport = useCallback(() => {
    return {
      events: context.events.map(event => ({
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        data: event.data,
        hash: event.hash,
        previousHash: event.previousHash,
      })),
      metadata: {
        totalEvents: context.events.length,
        firstEvent: context.events[0]?.timestamp,
        lastEvent: context.events[context.events.length - 1]?.timestamp,
        integrityVerified: context.isIntegrityValid,
        exportedAt: new Date().toISOString(),
      },
    };
  }, [context]);

  return {
    events: context.events,
    isIntegrityValid: context.isIntegrityValid,
    recordEvent,
    recordExport,
    verifyIntegrity: context.verifyIntegrity,
    verifyAndReport,
    getEventsByType: context.getEventsByType,
    getTimelineForExport,
    clear: context.clear,
  };
}
