'use client';

import { useEffect } from 'react';
import { VStack, Heading, Text, Box, SimpleGrid, Button, HStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { DashboardStats, TopRisksChart } from '@/ui/organisms';
import { GlassCard } from '@/ui/atoms';
import { useProject } from '@/state';

export function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const { project, aggregatedStats, results, createProject } = useProject();

  useEffect(() => {
    if (!project) {
      createProject('New Assessment');
    }
  }, [project, createProject]);

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

        {results.length === 0 && (
          <Link href="/import">
            <Button colorPalette="blue" size="lg">
              {t('getStarted')}
            </Button>
          </Link>
        )}
      </HStack>

      <DashboardStats
        stats={aggregatedStats}
        lastCheckAt={project?.lastCheckAt}
      />

      {results.length > 0 && (
        <SimpleGrid columns={{ base: 1, xl: 2 }} gap={6}>
          <TopRisksChart results={results} limit={10} />

          <GlassCard>
            <VStack gap={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>
                {t('quickActions')}
              </Text>

              <VStack gap={3} align="stretch">
                <Link href="/import">
                  <Button w="100%" variant="outline" colorPalette="blue" justifyContent="flex-start">
                    {t('importMore')}
                  </Button>
                </Link>
                <Link href="/results">
                  <Button w="100%" variant="outline" colorPalette="blue" justifyContent="flex-start">
                    {t('viewResults')}
                  </Button>
                </Link>
                <Link href="/recommendations">
                  <Button w="100%" variant="outline" colorPalette="blue" justifyContent="flex-start">
                    {t('reviewRecommendations')}
                  </Button>
                </Link>
                <Link href="/evidence">
                  <Button w="100%" variant="outline" colorPalette="blue" justifyContent="flex-start">
                    {t('exportEvidence')}
                  </Button>
                </Link>
              </VStack>
            </VStack>
          </GlassCard>
        </SimpleGrid>
      )}

      {results.length === 0 && (
        <GlassCard>
          <VStack py={12} gap={4}>
            <Text fontSize="xl" color="gray.400" _light={{ color: 'gray.600' }}>
              {t('noDataYet')}
            </Text>
            <Text color="gray.500" _light={{ color: 'gray.600' }} textAlign="center" maxW="md">
              {t('noDataDescription')}
            </Text>
            <Link href="/import">
              <Button colorPalette="blue" size="lg" mt={4}>
                {tCommon('import')}
              </Button>
            </Link>
          </VStack>
        </GlassCard>
      )}
    </VStack>
  );
}
