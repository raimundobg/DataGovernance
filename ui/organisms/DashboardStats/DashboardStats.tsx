'use client';

import { Box, SimpleGrid, Text, VStack, HStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { GlassCard, ScoreCircle, RiskBadge } from '@/ui/atoms';
import { AggregatedStats } from '@/domain/scoring';

interface DashboardStatsProps {
  stats: AggregatedStats | null;
  lastCheckAt?: string;
}

export function DashboardStats({ stats, lastCheckAt }: DashboardStatsProps) {
  const t = useTranslations('dashboard');

  if (!stats) {
    return (
      <GlassCard>
        <VStack py={8}>
          <Text color="gray.400" _light={{ color: 'gray.600' }}>{t('noCheckYet')}</Text>
        </VStack>
      </GlassCard>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
        <GlassCard>
          <VStack align="center" gap={4}>
            <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }} textTransform="uppercase">
              {t('globalScore')}
            </Text>
            <ScoreCircle score={stats.globalScore} size="lg" />
            <RiskBadge level={stats.globalRiskLevel} />
          </VStack>
        </GlassCard>

        <GlassCard>
          <VStack align="stretch" gap={4}>
            <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }} textTransform="uppercase">
              {t('totalIdentities')}
            </Text>
            <Text fontSize="4xl" fontWeight="bold" color="white" _light={{ color: 'gray.800' }}>
              {stats.totalIdentities}
            </Text>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>{t('exposed')}</Text>
              <Text fontSize="sm" color="red.400" _light={{ color: 'red.600' }} fontWeight="semibold">
                {stats.exposedCount} ({stats.exposedPercent}%)
              </Text>
            </HStack>
          </VStack>
        </GlassCard>

        <GlassCard>
          <VStack align="stretch" gap={4}>
            <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }} textTransform="uppercase">
              {t('riskDistribution')}
            </Text>
            <VStack align="stretch" gap={2}>
              <HStack justify="space-between">
                <HStack gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg="red.500" />
                  <Text fontSize="sm" color="gray.300" _light={{ color: 'gray.700' }}>{t('critical')}</Text>
                </HStack>
                <Text fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>{stats.bySeverity.critical}</Text>
              </HStack>
              <HStack justify="space-between">
                <HStack gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg="orange.500" />
                  <Text fontSize="sm" color="gray.300" _light={{ color: 'gray.700' }}>{t('high')}</Text>
                </HStack>
                <Text fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>{stats.bySeverity.high}</Text>
              </HStack>
              <HStack justify="space-between">
                <HStack gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg="yellow.500" />
                  <Text fontSize="sm" color="gray.300" _light={{ color: 'gray.700' }}>{t('medium')}</Text>
                </HStack>
                <Text fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>{stats.bySeverity.medium}</Text>
              </HStack>
              <HStack justify="space-between">
                <HStack gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg="green.500" />
                  <Text fontSize="sm" color="gray.300" _light={{ color: 'gray.700' }}>{t('low')}</Text>
                </HStack>
                <Text fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>{stats.bySeverity.low}</Text>
              </HStack>
            </VStack>
          </VStack>
        </GlassCard>

        <GlassCard>
          <VStack align="stretch" gap={4}>
            <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }} textTransform="uppercase">
              {t('lastCheck')}
            </Text>
            {lastCheckAt ? (
              <VStack align="start" gap={1}>
                <Text fontSize="lg" fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>
                  {new Date(lastCheckAt).toLocaleDateString()}
                </Text>
                <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
                  {new Date(lastCheckAt).toLocaleTimeString()}
                </Text>
              </VStack>
            ) : (
              <Text color="gray.500" _light={{ color: 'gray.600' }}>{t('noCheckYet')}</Text>
            )}
          </VStack>
        </GlassCard>
      </SimpleGrid>
    </VStack>
  );
}
