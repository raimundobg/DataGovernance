'use client';

import { useState, useMemo, useCallback } from 'react';
import { Box, HStack, Input, VStack, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/ui/atoms';
import { IdentityRow } from '@/ui/molecules';
import { CheckResult } from '@/services/api/types';
import { RiskLevel, Role } from '@/config/constants';

interface ResultsTableProps {
  results: CheckResult[];
  onMarkExposed?: (identityId: string, exposed: boolean) => void;
}

type SortField = 'score' | 'name' | 'email' | 'breachCount';
type SortDirection = 'asc' | 'desc';

export function ResultsTable({ results, onMarkExposed }: ResultsTableProps) {
  const t = useTranslations('results');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<RiskLevel | 'all'>('all');

  const filteredAndSortedResults = useMemo(() => {
    let filtered = results;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.identity.name.toLowerCase().includes(query) ||
          r.identity.email.toLowerCase().includes(query)
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter((r) => r.identity.role === filterRole);
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter((r) => r.riskLevel === filterSeverity);
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'name':
          comparison = a.identity.name.localeCompare(b.identity.name);
          break;
        case 'email':
          comparison = a.identity.email.localeCompare(b.identity.email);
          break;
        case 'breachCount':
          comparison = a.breachCount - b.breachCount;
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [results, searchQuery, sortField, sortDirection, filterRole, filterSeverity]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  if (results.length === 0) {
    return (
      <GlassCard>
        <VStack py={8}>
          <Text color="gray.400" _light={{ color: 'gray.600' }}>{t('noData')}</Text>
        </VStack>
      </GlassCard>
    );
  }

  return (
    <VStack gap={4} align="stretch">
      <GlassCard p={4}>
        <HStack gap={4} flexWrap="wrap">
          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxW="300px"
            bg="rgba(255, 255, 255, 0.05)"
            borderColor="rgba(255, 255, 255, 0.1)"
            color="white"
            _light={{ bg: 'white', borderColor: 'gray.300', color: 'gray.800' }}
            _placeholder={{ color: 'gray.500' }}
          />

          <HStack gap={2}>
            <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
              {t('sortBy')}:
            </Text>
            {(['score', 'name', 'breachCount'] as SortField[]).map((field) => (
              <Box
                key={field}
                as="button"
                px={3}
                py={1}
                borderRadius="md"
                bg={sortField === field ? 'blue.500' : 'rgba(255, 255, 255, 0.05)'}
                _light={{ bg: sortField === field ? 'blue.500' : 'gray.100' }}
                color={sortField === field ? 'white' : 'gray.400'}
                fontSize="sm"
                onClick={() => handleSort(field)}
                _hover={{ bg: sortField === field ? 'blue.600' : 'rgba(255, 255, 255, 0.1)' }}
              >
                {field === 'score' ? t('score') : field === 'name' ? t('identity') : t('breaches')}
                {sortField === field && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
              </Box>
            ))}
          </HStack>
        </HStack>
      </GlassCard>

      <VStack gap={3} align="stretch">
        {filteredAndSortedResults.map((result) => (
          <IdentityRow
            key={result.id}
            result={result}
            onMarkExposed={onMarkExposed}
          />
        ))}
      </VStack>

      <Text fontSize="sm" color="gray.500" _light={{ color: 'gray.600' }} textAlign="center">
        {t('showingResults', { shown: filteredAndSortedResults.length, total: results.length })}
      </Text>
    </VStack>
  );
}
