'use client';

import { Box, VStack, Text, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  labelKey: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: '📊' },
  { href: '/import', labelKey: 'import', icon: '📥' },
  { href: '/results', labelKey: 'results', icon: '🔍' },
  { href: '/recommendations', labelKey: 'recommendations', icon: '💡' },
  { href: '/evidence', labelKey: 'evidence', icon: '📋' },
];

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    return cleanPath === href || cleanPath.startsWith(href + '/');
  };

  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top={16}
      bottom={0}
      w={64}
      bg="rgba(26, 26, 46, 0.8)"
      _light={{ bg: 'rgba(255, 255, 255, 0.9)' }}
      backdropFilter="blur(16px)"
      borderRight="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      _light={{ borderColor: 'gray.200' }}
      py={6}
      px={3}
      display={{ base: 'none', lg: 'block' }}
    >
      <VStack gap={2} align="stretch">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <HStack
                gap={3}
                px={4}
                py={3}
                borderRadius="lg"
                bg={active ? 'rgba(66, 153, 225, 0.2)' : 'transparent'}
                _light={{ bg: active ? 'blue.50' : 'transparent' }}
                color={active ? 'blue.300' : 'gray.400'}
                _light={{ color: active ? 'blue.600' : 'gray.600' }}
                _hover={{
                  bg: active ? 'rgba(66, 153, 225, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: active ? 'blue.300' : 'white',
                  _light: {
                    bg: active ? 'blue.50' : 'gray.100',
                    color: active ? 'blue.600' : 'gray.800',
                  },
                }}
                transition="all 0.2s"
                position="relative"
              >
                {active && (
                  <Box
                    position="absolute"
                    left={0}
                    top="50%"
                    transform="translateY(-50%)"
                    w={1}
                    h={6}
                    bg="blue.400"
                    _light={{ bg: 'blue.500' }}
                    borderRadius="full"
                  />
                )}
                <Text fontSize="lg">{item.icon}</Text>
                <Text fontWeight={active ? 'semibold' : 'normal'}>
                  {t(item.labelKey)}
                </Text>
              </HStack>
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
}
