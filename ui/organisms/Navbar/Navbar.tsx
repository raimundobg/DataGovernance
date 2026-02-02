'use client';

import { Box, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher, ThemeToggle } from '@/ui/atoms';
import { env } from '@/config/env';

export function Navbar() {
  const t = useTranslations('common');

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      h={16}
      bg="rgba(26, 26, 46, 0.95)"
      _light={{ bg: 'rgba(255, 255, 255, 0.95)' }}
      backdropFilter="blur(16px)"
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      _light={{ borderColor: 'gray.200' }}
      zIndex={100}
      px={6}
    >
      <HStack h="100%" justify="space-between">
        <Link href="/dashboard">
          <HStack gap={3}>
            <Box
              w={8}
              h={8}
              borderRadius="lg"
              bg="blue.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontWeight="bold" color="white" fontSize="sm">
                EC
              </Text>
            </Box>
            <Text
              fontWeight="semibold"
              color="white"
              _light={{ color: 'gray.800' }}
              fontSize="lg"
              display={{ base: 'none', md: 'block' }}
            >
              {env.appName}
            </Text>
          </HStack>
        </Link>

        <HStack gap={4}>
          {env.demoMode && (
            <Box
              px={3}
              py={1}
              borderRadius="full"
              bg="orange.500"
              opacity={0.9}
            >
              <Text fontSize="xs" fontWeight="semibold" color="white">
                DEMO MODE
              </Text>
            </Box>
          )}

          <ThemeToggle />
          <LanguageSwitcher />
        </HStack>
      </HStack>
    </Box>
  );
}
