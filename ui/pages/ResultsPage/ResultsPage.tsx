'use client';

import { useCallback } from 'react';
import { VStack, Heading, Text, Box, HStack, Button } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ResultsTable } from '@/ui/organisms';
import { CheckProgress } from '@/ui/molecules';
import { GlassCard } from '@/ui/atoms';
import { useProject } from '@/state';

export function ResultsPage() {
  const t = useTranslations('results');
  const tCommon = useTranslations('common');
  const {
    project,
    identities,
    results,
    checkStatus,
    isLoading,
    isPolling,
    startCheck,
    markIdentityExposed,
  } = useProject();

  const handleRunCheck = useCallback(async () => {
    if (project) {
      await startCheck(project.id);
    }
  }, [project, startCheck]);

  const handleMarkExposed = useCallback(async (identityId: string, exposed: boolean) => {
    if (project) {
      await markIdentityExposed(project.id, identityId, exposed);
    }
  }, [project, markIdentityExposed]);

  const canRunCheck = identities.length > 0 && !isPolling && !isLoading;

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="white" _light={{ color: 'gray.800' }} mb={2}>
            {t('title')}
          </Heading>
          <Text color="gray.400" _light={{ color: 'gray.600' }}>
            {t('subtitle')}
          </Text>
        </Box>

        <HStack gap={3}>
          {identities.length === 0 && (
            <Link href="/import">
              <Button colorPalette="gray" variant="outline">
                {t('importFirst')}
              </Button>
            </Link>
          )}
          <Button
            colorPalette="blue"
            onClick={handleRunCheck}
            loading={isLoading || isPolling}
            disabled={!canRunCheck}
          >
            {t('runCheck')}
          </Button>
        </HStack>
      </HStack>

      {checkStatus && checkStatus.status === 'running' && (
        <CheckProgress status={checkStatus} />
      )}

      {identities.length === 0 ? (
        <GlassCard>
          <VStack py={12} gap={4}>
            <Text fontSize="xl" color="gray.400" _light={{ color: 'gray.600' }}>
              {t('noIdentities')}
            </Text>
            <Text color="gray.500" _light={{ color: 'gray.600' }} textAlign="center" maxW="md">
              {t('noIdentitiesDescription')}
            </Text>
            <Link href="/import">
              <Button colorPalette="blue" size="lg" mt={4}>
                {tCommon('import')}
              </Button>
            </Link>
          </VStack>
        </GlassCard>
      ) : results.length === 0 ? (
        <GlassCard>
          <VStack py={12} gap={4}>
            <Text fontSize="xl" color="gray.400" _light={{ color: 'gray.600' }}>
              {t('identitiesReady', { count: identities.length })}
            </Text>
            <Text color="gray.500" _light={{ color: 'gray.600' }} textAlign="center" maxW="md">
              {t('clickRunCheck')}
            </Text>
            <Button
              colorPalette="blue"
              size="lg"
              mt={4}
              onClick={handleRunCheck}
              loading={isLoading}
            >
              {t('runCheck')}
            </Button>
          </VStack>
        </GlassCard>
      ) : (
        <ResultsTable results={results} onMarkExposed={handleMarkExposed} />
      )}
    </VStack>
  );
}
