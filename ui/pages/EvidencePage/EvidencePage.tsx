'use client';

import { VStack, Heading, Text, Box, Button } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { EvidenceExporter } from '@/ui/organisms';
import { GlassCard } from '@/ui/atoms';
import { useProject } from '@/state';

export function EvidencePage() {
  const t = useTranslations('evidence');
  const { project, results, recommendations } = useProject();

  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" _light={{ color: 'gray.800' }} mb={2}>
          {t('title')}
        </Heading>
        <Text color="gray.400" _light={{ color: 'gray.600' }}>
          {t('subtitle')}
        </Text>
      </Box>

      {results.length === 0 ? (
        <GlassCard>
          <VStack py={12} gap={4}>
            <Text fontSize="xl" color="gray.400" _light={{ color: 'gray.600' }}>
              {t('noEvidence')}
            </Text>
            <Text color="gray.500" _light={{ color: 'gray.600' }} textAlign="center" maxW="md">
              {t('noEvidenceDescription')}
            </Text>
            <Link href="/results">
              <Button colorPalette="blue" size="lg" mt={4}>
                {t('goToResults')}
              </Button>
            </Link>
          </VStack>
        </GlassCard>
      ) : (
        <EvidenceExporter
          projectId={project?.id || ''}
          projectName={project?.name || 'Assessment'}
          results={results}
          recommendations={recommendations}
        />
      )}
    </VStack>
  );
}
