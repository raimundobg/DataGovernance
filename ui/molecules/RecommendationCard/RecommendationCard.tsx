'use client';

import { Box, Button, HStack, Text, VStack, Badge } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { GlassCard, RiskBadge } from '@/ui/atoms';
import { Recommendation } from '@/services/api/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onMarkDone?: (recommendationId: string, done: boolean) => void;
}

export function RecommendationCard({
  recommendation,
  onMarkDone,
}: RecommendationCardProps) {
  const t = useTranslations('recommendations');
  const tTemplates = useTranslations();

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + recommendation.suggestedDeadlineDays);

  // Get translated text or fallback to raw value
  const getTranslatedTitle = () => {
    try {
      return tTemplates(recommendation.title);
    } catch {
      return recommendation.title;
    }
  };

  const getTranslatedDescription = () => {
    try {
      return tTemplates(recommendation.description);
    } catch {
      return recommendation.description;
    }
  };

  const getTranslatedAction = () => {
    try {
      return tTemplates(recommendation.suggestedActionKey);
    } catch {
      return recommendation.suggestedActionKey;
    }
  };

  return (
    <GlassCard
      opacity={recommendation.isDone ? 0.7 : 1}
      borderLeftWidth="4px"
      borderLeftColor={
        recommendation.severity === 'critical'
          ? 'red.500'
          : recommendation.severity === 'high'
          ? 'orange.500'
          : recommendation.severity === 'medium'
          ? 'yellow.500'
          : 'green.500'
      }
    >
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="start" wrap="wrap" gap={2}>
          <VStack align="start" gap={1} flex={1}>
            <HStack gap={2} flexWrap="wrap">
              <Text
                fontWeight="semibold"
                fontSize="lg"
                color="white"
                _light={{ color: 'gray.800' }}
                textDecoration={recommendation.isDone ? 'line-through' : 'none'}
              >
                {getTranslatedTitle()}
              </Text>
              <RiskBadge level={recommendation.severity} />
            </HStack>
            <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
              {getTranslatedDescription()}
            </Text>
          </VStack>

          {recommendation.isDone && (
            <Badge colorPalette="green" variant="solid" px={3} py={1}>
              {t('done')}
            </Badge>
          )}
        </HStack>

        <Box
          p={4}
          bg="rgba(255, 255, 255, 0.05)"
          _light={{ bg: 'gray.100' }}
          borderRadius="md"
        >
          <Text fontSize="sm" fontWeight="medium" color="gray.300" _light={{ color: 'gray.700' }} mb={1}>
            {t('suggestedAction')}:
          </Text>
          <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
            {getTranslatedAction()}
          </Text>
        </Box>

        {recommendation.complianceRefs && recommendation.complianceRefs.length > 0 && (
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={2}>
              {t('compliance')}:
            </Text>
            <HStack gap={2} flexWrap="wrap">
              {recommendation.complianceRefs.map((ref, idx) => (
                <Badge key={idx} colorPalette="purple" variant="subtle" fontSize="xs">
                  {ref}
                </Badge>
              ))}
            </HStack>
          </Box>
        )}

        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <HStack gap={4} flexWrap="wrap">
            <Box>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                {t('affectedIdentities')}
              </Text>
              <Text fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>
                {recommendation.affectedCount}
              </Text>
            </Box>

            <Box>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                {t('deadline')}
              </Text>
              <Text fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>
                {deadlineDate.toLocaleDateString()}
              </Text>
            </Box>
          </HStack>

          {onMarkDone && !recommendation.isDone && (
            <Button
              colorPalette="green"
              variant="solid"
              size="sm"
              onClick={() => onMarkDone(recommendation.id, true)}
            >
              {t('markDone')}
            </Button>
          )}
        </HStack>
      </VStack>
    </GlassCard>
  );
}
