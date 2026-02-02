'use client';

import { useCallback, useState } from 'react';
import { Button, HStack, VStack, Text, Badge, Box, Table } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/ui/atoms';
import { useEvidence } from '@/state';
import { exportToJSON } from '@/utils/evidence/jsonExporter';
import { exportToPDF } from '@/utils/evidence/pdfExporter';
import { CheckResult, Recommendation } from '@/services/api/types';

interface EvidenceExporterProps {
  projectId: string;
  projectName: string;
  results: CheckResult[];
  recommendations: Recommendation[];
}

export function EvidenceExporter({
  projectId,
  projectName,
  results,
  recommendations,
}: EvidenceExporterProps) {
  const t = useTranslations('evidence');
  const {
    events,
    isIntegrityValid,
    verifyAndReport,
    recordExport,
    getTimelineForExport,
  } = useEvidence();

  const [isExporting, setIsExporting] = useState(false);
  const [lastVerified, setLastVerified] = useState<boolean | null>(null);

  const handleVerify = useCallback(() => {
    const isValid = verifyAndReport(projectId);
    setLastVerified(isValid);
  }, [verifyAndReport, projectId]);

  const handleExportJSON = useCallback(async () => {
    setIsExporting(true);
    try {
      const timeline = getTimelineForExport();
      await exportToJSON({
        projectId,
        projectName,
        timeline,
        results,
        recommendations,
      });
      recordExport(projectId, 'json');
    } finally {
      setIsExporting(false);
    }
  }, [projectId, projectName, results, recommendations, getTimelineForExport, recordExport]);

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const timeline = getTimelineForExport();
      await exportToPDF({
        projectId,
        projectName,
        timeline,
        results,
        recommendations,
      });
      recordExport(projectId, 'pdf');
    } finally {
      setIsExporting(false);
    }
  }, [projectId, projectName, results, recommendations, getTimelineForExport, recordExport]);

  return (
    <VStack gap={6} align="stretch">
      <GlassCard>
        <VStack gap={4} align="stretch">
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <VStack align="start" gap={1}>
              <Text fontSize="lg" fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>
                {t('title')}
              </Text>
              <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
                {t('eventsRecorded', { count: events.length })}
              </Text>
            </VStack>

            <HStack gap={2}>
              <Badge
                colorPalette={isIntegrityValid ? 'green' : 'red'}
                variant="solid"
                px={3}
                py={1}
              >
                {isIntegrityValid ? t('integrityValid') : t('integrityInvalid')}
              </Badge>
            </HStack>
          </HStack>

          <HStack gap={3} flexWrap="wrap">
            <Button
              variant="outline"
              colorPalette="blue"
              onClick={handleVerify}
            >
              {t('verifyIntegrity')}
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleExportJSON}
              loading={isExporting}
            >
              {t('exportJson')}
            </Button>
            <Button
              colorPalette="purple"
              onClick={handleExportPDF}
              loading={isExporting}
            >
              {t('exportPdf')}
            </Button>
          </HStack>
        </VStack>
      </GlassCard>

      <GlassCard>
        <VStack gap={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>
            {t('timeline')}
          </Text>

          {events.length === 0 ? (
            <Text color="gray.400" _light={{ color: 'gray.600' }} textAlign="center" py={4}>
              {t('noEventsYet')}
            </Text>
          ) : (
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader color="gray.400" _light={{ color: 'gray.600' }}>{t('eventType')}</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.400" _light={{ color: 'gray.600' }}>{t('timestamp')}</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.400" _light={{ color: 'gray.600' }}>{t('hash')}</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {events.map((event) => (
                    <Table.Row key={event.id}>
                      <Table.Cell>
                        <Badge colorPalette="blue" variant="subtle">
                          {t(`events.${event.type}`)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell color="gray.300" _light={{ color: 'gray.700' }}>
                        {new Date(event.timestamp).toLocaleString()}
                      </Table.Cell>
                      <Table.Cell>
                        <Text
                          fontSize="xs"
                          fontFamily="mono"
                          color="gray.500"
                          _light={{ color: 'gray.600' }}
                          maxW="200px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {event.hash}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </VStack>
      </GlassCard>
    </VStack>
  );
}
