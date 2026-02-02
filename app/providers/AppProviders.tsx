'use client';

import { ReactNode } from 'react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { ProjectProvider } from '@/state/ProjectContext';
import { EvidenceProvider } from '@/state/EvidenceContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ChakraProvider value={defaultSystem}>
        <EvidenceProvider>
          <ProjectProvider>
            {children}
          </ProjectProvider>
        </EvidenceProvider>
      </ChakraProvider>
    </ThemeProvider>
  );
}
