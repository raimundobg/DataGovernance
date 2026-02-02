'use client';

import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { Navbar, Sidebar } from '@/ui/organisms';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box minH="100vh" bg="gray.900" _light={{ bg: 'gray.50' }}>
      <Navbar />
      <Sidebar />

      <Box
        ml={{ base: 0, lg: 64 }}
        mt={16}
        minH="calc(100vh - 64px)"
        p={6}
      >
        {children}
      </Box>
    </Box>
  );
}
