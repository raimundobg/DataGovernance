'use client';

import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { GlassCard, Spinner } from '@/ui/atoms';
import { CheckStatus } from '@/services/api/types';

interface CheckProgressProps {
  status: CheckStatus;
}

export function CheckProgress({ status }: CheckProgressProps) {
  const t = useTranslations('results');

  const isRunning = status.status === 'running';
  const isCompleted = status.status === 'completed';
  const isFailed = status.status === 'failed';

  return (
    <GlassCard>
      <VStack gap={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="semibold" color="white" _light={{ color: 'gray.800' }}>
            {t('progress')}
          </Text>
          <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
            {status.processedIdentities} / {status.totalIdentities}
          </Text>
        </HStack>

        <Box position="relative" h={3} bg="rgba(255, 255, 255, 0.1)" _light={{ bg: 'gray.200' }} borderRadius="full" overflow="hidden">
          <Box
            position="absolute"
            left={0}
            top={0}
            h="100%"
            w={`${status.progress}%`}
            bg={isFailed ? 'red.500' : isCompleted ? 'green.500' : 'blue.500'}
            borderRadius="full"
            transition="width 0.3s ease-out"
          />
        </Box>

        <HStack justify="center" gap={3}>
          {isRunning && <Spinner size="sm" />}

          <Text
            fontSize="sm"
            color={
              isFailed ? 'red.400' : isCompleted ? 'green.400' : 'gray.400'
            }
            _light={{
              color: isFailed ? 'red.600' : isCompleted ? 'green.600' : 'gray.600'
            }}
          >
            {isFailed
              ? status.error || t('checkFailed')
              : isCompleted
              ? t('checkCompleted')
              : t('running')}
          </Text>

          <Text fontSize="lg" fontWeight="bold" color="white" _light={{ color: 'gray.800' }}>
            {status.progress}%
          </Text>
        </HStack>
      </VStack>
    </GlassCard>
  );
}
