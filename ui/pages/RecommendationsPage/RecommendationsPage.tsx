'use client';

import { useCallback } from 'react';
import { VStack, Heading, Text, Box, Button, HStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { RecommendationList } from '@/ui/organisms';
import { GlassCard } from '@/ui/atoms';
import { useProject } from '@/state';

export function RecommendationsPage() {
  const t = useTranslations('recommendations');
  const { project, recommendations, results, markRecommendationDone } = useProject();

  const handleMarkDone = useCallback(async (recommendationId: string, done: boolean) => {
    if (project) {
      await markRecommendationDone(project.id, recommendationId, done);
    }
  }, [project, markRecommendationDone]);

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
      </HStack>

      {results.length === 0 ? (
        <GlassCard>
          <VStack py={12} gap={4}>
            <Text fontSize="xl" color="gray.400">
              No check results yet
            </Text>
            <Text color="gray.500" textAlign="center" maxW="md">
              Run an exposure check first to generate recommendations.
            </Text>
            <Link href="/results">
              <Button colorPalette="blue" size="lg" mt={4}>
                Go to Results
              </Button>
            </Link>
          </VStack>
        </GlassCard>
      ) : (
        <RecommendationList
          recommendations={recommendations}
          onMarkDone={handleMarkDone}
        />
      )}
    </VStack>
  );
}
