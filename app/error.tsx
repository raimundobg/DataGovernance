'use client';

import { useEffect } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.900"
      p={8}
    >
      <VStack gap={6} textAlign="center">
        <Heading size="xl" color="white">
          {t('errorOccurred')}
        </Heading>
        <Text color="gray.400" maxW="md">
          {error.message || t('error')}
        </Text>
        {error.digest && (
          <Text color="gray.500" fontSize="sm">
            Error ID: {error.digest}
          </Text>
        )}
        <Button
          colorPalette="blue"
          onClick={reset}
          size="lg"
        >
          {t('retry')}
        </Button>
      </VStack>
    </Box>
  );
}
