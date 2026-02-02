'use client';

import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { GlassCard, ScoreCircle, RiskBadge } from '@/ui/atoms';
import { getRiskLevel } from '@/config/constants';

interface RiskScoreCardProps {
  score: number;
  label: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskScoreCard({
  score,
  label,
  subtitle,
  size = 'md',
}: RiskScoreCardProps) {
  const riskLevel = getRiskLevel(score);

  return (
    <GlassCard>
      <VStack gap={4} align="stretch">
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={1}>
            <Text fontSize="lg" fontWeight="semibold" color="white">
              {label}
            </Text>
            {subtitle && (
              <Text fontSize="sm" color="gray.400">
                {subtitle}
              </Text>
            )}
          </VStack>
          <RiskBadge level={riskLevel} />
        </HStack>

        <Box display="flex" justifyContent="center" py={2}>
          <ScoreCircle score={score} size={size} />
        </Box>
      </VStack>
    </GlassCard>
  );
}
