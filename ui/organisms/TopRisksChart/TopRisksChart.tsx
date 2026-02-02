'use client';

import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { GlassCard, RiskBadge } from '@/ui/atoms';
import { CheckResult } from '@/services/api/types';
import { getRiskLevel } from '@/config/constants';

interface TopRisksChartProps {
  results: CheckResult[];
  limit?: number;
}

const riskColors = {
  critical: '#e53e3e',
  high: '#ed8936',
  medium: '#ecc94b',
  low: '#48bb78',
};

export function TopRisksChart({ results, limit = 20 }: TopRisksChartProps) {
  const t = useTranslations('dashboard');

  const topResults = [...results]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const maxScore = Math.max(...topResults.map((r) => r.score), 100);

  if (topResults.length === 0) {
    return (
      <GlassCard>
        <VStack py={8}>
          <Text color="gray.400" _light={{ color: 'gray.600' }}>{t('noCheckYet')}</Text>
        </VStack>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <VStack gap={4} align="stretch">
        <Text fontSize="lg" fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>
          {t('topRisks')}
        </Text>

        <VStack gap={2} align="stretch">
          {topResults.map((result, index) => {
            const riskLevel = getRiskLevel(result.score);
            const barWidth = (result.score / maxScore) * 100;

            return (
              <HStack key={result.id} gap={3} align="center">
                <Text
                  fontSize="xs"
                  color="gray.500"
                  w={6}
                  textAlign="right"
                >
                  {index + 1}
                </Text>

                <Box flex={1} position="relative">
                  <Box
                    position="relative"
                    h={8}
                    bg="rgba(255, 255, 255, 0.05)"
                    _light={{ bg: 'gray.100' }}
                    borderRadius="md"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      left={0}
                      top={0}
                      h="100%"
                      w={`${barWidth}%`}
                      bg={riskColors[riskLevel]}
                      opacity={0.7}
                      borderRadius="md"
                      transition="width 0.3s ease-out"
                    />
                    <HStack
                      position="absolute"
                      left={0}
                      top={0}
                      h="100%"
                      w="100%"
                      px={3}
                      justify="space-between"
                      align="center"
                    >
                      <Text
                        fontSize="sm"
                        color="white"
                        _light={{ color: 'gray.800' }}
                        fontWeight="medium"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        maxW="60%"
                      >
                        {result.identity.name}
                      </Text>
                      <HStack gap={2}>
                        <RiskBadge level={riskLevel} />
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="white"
                          _light={{ color: 'gray.800' }}
                        >
                          {result.score}
                        </Text>
                      </HStack>
                    </HStack>
                  </Box>
                </Box>
              </HStack>
            );
          })}
        </VStack>
      </VStack>
    </GlassCard>
  );
}
