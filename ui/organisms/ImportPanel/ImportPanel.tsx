'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Table,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/ui/atoms';
import { FileUploader } from '@/ui/molecules';
import { parseCSV, ParsedIdentity, ParseResult } from '@/utils/csv/parser';
import { validateIdentities, ValidationResult } from '@/utils/csv/validator';
import { deduplicateIdentities } from '@/utils/csv/deduper';

interface ImportPanelProps {
  onImport: (identities: ParsedIdentity[]) => Promise<void>;
  isLoading?: boolean;
}

export function ImportPanel({ onImport, isLoading = false }: ImportPanelProps) {
  const t = useTranslations('import');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [previewData, setPreviewData] = useState<ParsedIdentity[]>([]);

  const handleFileSelect = useCallback(async (file: File) => {
    const result = await parseCSV(file);
    setParseResult(result);

    if (result.data.length > 0) {
      const validation = validateIdentities(result.data);
      setValidationResult(validation);

      const deduplicated = deduplicateIdentities(validation.validIdentities);
      setPreviewData(deduplicated.identities);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (previewData.length > 0) {
      await onImport(previewData);
      setParseResult(null);
      setValidationResult(null);
      setPreviewData([]);
    }
  }, [previewData, onImport]);

  const handleCancel = useCallback(() => {
    setParseResult(null);
    setValidationResult(null);
    setPreviewData([]);
  }, []);

  if (!parseResult) {
    return <FileUploader onFileSelect={handleFileSelect} disabled={isLoading} />;
  }

  return (
    <VStack gap={6} align="stretch">
      <GlassCard>
        <VStack gap={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>
            {t('preview')}
          </Text>

          <HStack gap={6} flexWrap="wrap">
            <Box>
              <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
                {t('rows')}
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="white" _light={{ color: 'gray.800' }}>
                {parseResult.data.length}
              </Text>
            </Box>

            {validationResult && (
              <>
                <Box>
                  <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
                    {t('validRows')}
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.400" _light={{ color: 'green.600' }}>
                    {validationResult.validIdentities.length}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
                    {t('invalidRows')}
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="red.400" _light={{ color: 'red.600' }}>
                    {validationResult.invalidCount}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
                    {t('duplicates')}
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="yellow.400" _light={{ color: 'yellow.600' }}>
                    {validationResult.validIdentities.length - previewData.length}
                  </Text>
                </Box>
              </>
            )}
          </HStack>
        </VStack>
      </GlassCard>

      {previewData.length > 0 && (
        <GlassCard>
          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader color="gray.400" _light={{ color: 'gray.600' }}>{t('email')}</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400" _light={{ color: 'gray.600' }}>{t('name')}</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400" _light={{ color: 'gray.600' }}>{t('role')}</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400" _light={{ color: 'gray.600' }}>{t('area')}</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400" _light={{ color: 'gray.600' }}>{t('criticality')}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {previewData.slice(0, 10).map((identity, index) => (
                  <Table.Row key={index}>
                    <Table.Cell color="white" _light={{ color: 'gray.800' }}>{identity.email}</Table.Cell>
                    <Table.Cell color="gray.300" _light={{ color: 'gray.700' }}>{identity.name}</Table.Cell>
                    <Table.Cell color="gray.300" _light={{ color: 'gray.700' }}>{identity.role}</Table.Cell>
                    <Table.Cell color="gray.300" _light={{ color: 'gray.700' }}>{identity.area}</Table.Cell>
                    <Table.Cell color="gray.300" _light={{ color: 'gray.700' }}>{identity.criticality}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>

            {previewData.length > 10 && (
              <Text fontSize="sm" color="gray.500" _light={{ color: 'gray.600' }} mt={2} textAlign="center">
                {t('moreRows', { count: previewData.length - 10 })}
              </Text>
            )}
          </Box>
        </GlassCard>
      )}

      <HStack justify="flex-end" gap={3}>
        <Button
          variant="ghost"
          colorPalette="gray"
          onClick={handleCancel}
          disabled={isLoading}
        >
          {t('cancel')}
        </Button>
        <Button
          colorPalette="blue"
          onClick={handleImport}
          loading={isLoading}
          disabled={previewData.length === 0}
        >
          {isLoading ? t('importing') : t('startImport')}
        </Button>
      </HStack>
    </VStack>
  );
}
