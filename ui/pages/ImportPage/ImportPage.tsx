'use client';

import { useCallback, useEffect } from 'react';
import { VStack, Heading, Text, Box } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ImportPanel } from '@/ui/organisms';
import { useProject } from '@/state';
import { ParsedIdentity } from '@/utils/csv/parser';

export function ImportPage() {
  const t = useTranslations('import');
  const router = useRouter();
  const { project, isLoading, createProject, importIdentities } = useProject();

  useEffect(() => {
    if (!project) {
      createProject('New Assessment');
    }
  }, [project, createProject]);

  const handleImport = useCallback(async (identities: ParsedIdentity[]) => {
    if (!project) return;

    await importIdentities(project.id, identities);
    router.push('/results');
  }, [project, importIdentities, router]);

  return (
    <VStack gap={6} align="stretch" maxW="900px" mx="auto">
      <Box>
        <Heading size="lg" color="white" _light={{ color: 'gray.800' }} mb={2}>
          {t('title')}
        </Heading>
        <Text color="gray.400" _light={{ color: 'gray.600' }}>
          {t('subtitle')}
        </Text>
      </Box>

      <ImportPanel onImport={handleImport} isLoading={isLoading} />
    </VStack>
  );
}
