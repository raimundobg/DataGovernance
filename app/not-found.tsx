import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('common');

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
        <Heading size="2xl" color="white">
          404
        </Heading>
        <Heading size="lg" color="gray.300">
          {t('pageNotFound')}
        </Heading>
        <Text color="gray.400" maxW="md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Text>
        <Link href="/dashboard" passHref>
          <Button colorPalette="blue" size="lg">
            Go to Dashboard
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}
