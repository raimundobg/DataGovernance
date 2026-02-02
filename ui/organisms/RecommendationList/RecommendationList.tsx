'use client';

import { useState, useMemo } from 'react';
import { VStack, Text, HStack, Badge } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/ui/atoms';
import { RecommendationCard, AudienceTab } from '@/ui/molecules';
import { Recommendation } from '@/services/api/types';
import { Audience } from '@/config/constants';

interface RecommendationListProps {
  recommendations: Recommendation[];
  onMarkDone?: (recommendationId: string, done: boolean) => void;
}

export function RecommendationList({
  recommendations,
  onMarkDone,
}: RecommendationListProps) {
  const t = useTranslations('recommendations');
  const [selectedAudience, setSelectedAudience] = useState<Audience>('security');

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r) => r.audience === selectedAudience);
  }, [recommendations, selectedAudience]);

  const counts = useMemo(() => {
    return {
      security: recommendations.filter((r) => r.audience === 'security').length,
      legal: recommendations.filter((r) => r.audience === 'legal').length,
      executive: recommendations.filter((r) => r.audience === 'executive').length,
    };
  }, [recommendations]);

  const pendingCount = filteredRecommendations.filter((r) => !r.isDone).length;
  const completedCount = filteredRecommendations.filter((r) => r.isDone).length;

  if (recommendations.length === 0) {
    return (
      <GlassCard>
        <VStack py={8}>
          <Text color="gray.400" _light={{ color: 'gray.600' }}>{t('noRecommendations')}</Text>
        </VStack>
      </GlassCard>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <AudienceTab selected={selectedAudience} onChange={setSelectedAudience} />

        <HStack gap={4}>
          <Badge colorPalette="blue" variant="subtle" px={3} py={1}>
            {counts[selectedAudience]} {t('total')}
          </Badge>
          <Badge colorPalette="yellow" variant="subtle" px={3} py={1}>
            {pendingCount} {t('pending')}
          </Badge>
          <Badge colorPalette="green" variant="subtle" px={3} py={1}>
            {completedCount} {t('completed')}
          </Badge>
        </HStack>
      </HStack>

      {filteredRecommendations.length === 0 ? (
        <GlassCard>
          <VStack py={8}>
            <Text color="gray.400" _light={{ color: 'gray.600' }}>
              {t('noRecommendationsFor', { audience: t(`audience.${selectedAudience}`) })}
            </Text>
          </VStack>
        </GlassCard>
      ) : (
        <VStack gap={4} align="stretch">
          {filteredRecommendations
            .sort((a, b) => {
              if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
              const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return severityOrder[a.severity] - severityOrder[b.severity];
            })
            .map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onMarkDone={onMarkDone}
              />
            ))}
        </VStack>
      )}
    </VStack>
  );
}
