'use client';

import { Box, HStack, Text, Button, Badge } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { RiskBadge, ScoreCircle } from '@/ui/atoms';
import { CheckResult } from '@/services/api/types';

interface IdentityRowProps {
  result: CheckResult;
  onMarkExposed?: (identityId: string, exposed: boolean) => void;
}

export function IdentityRow({ result, onMarkExposed }: IdentityRowProps) {
  const t = useTranslations('results');
  const tRoles = useTranslations('roles');
  const tCriticality = useTranslations('criticality');

  const { identity, score, riskLevel, breachCount, lastBreachDate, isExposed, manuallyMarked } = result;

  return (
    <Box
      p={4}
      bg="rgba(255, 255, 255, 0.05)"
      _light={{ bg: 'white', boxShadow: 'sm' }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.1)"
      _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }}
      transition="background 0.2s"
    >
      <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
        <HStack gap={4} flex={1} minW="300px">
          <ScoreCircle score={score} size="sm" showLabel={false} />

          <Box flex={1}>
            <Text fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>
              {identity.name}
            </Text>
            <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
              {identity.email}
            </Text>
          </Box>
        </HStack>

        <HStack gap={3} flexWrap="wrap">
          <Badge colorPalette="purple" variant="subtle">
            {tRoles(identity.role)}
          </Badge>

          <Badge colorPalette="blue" variant="subtle">
            {identity.area}
          </Badge>

          <Badge
            colorPalette={
              identity.criticality === 'high'
                ? 'red'
                : identity.criticality === 'medium'
                ? 'yellow'
                : 'green'
            }
            variant="subtle"
          >
            {tCriticality(identity.criticality)}
          </Badge>

          <RiskBadge level={riskLevel} />
        </HStack>

        <HStack gap={4} minW="200px" justify="flex-end">
          <Box textAlign="right">
            <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
              {t('breaches')}: {breachCount}
            </Text>
            {lastBreachDate && (
              <Text fontSize="xs" color="gray.500" _light={{ color: 'gray.600' }}>
                {t('lastBreach')}: {new Date(lastBreachDate).toLocaleDateString()}
              </Text>
            )}
          </Box>

          <Badge
            colorPalette={isExposed ? 'red' : 'green'}
            variant="solid"
            px={3}
            py={1}
          >
            {isExposed ? t('exposed') : t('safe')}
            {manuallyMarked && ' *'}
          </Badge>

          {onMarkExposed && !isExposed && (
            <Button
              size="sm"
              variant="outline"
              colorPalette="orange"
              onClick={() => onMarkExposed(identity.id, true)}
            >
              {t('markExposed')}
            </Button>
          )}
        </HStack>
      </HStack>
    </Box>
  );
}
