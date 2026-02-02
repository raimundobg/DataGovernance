'use client';

import { Button, HStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { Audience, AUDIENCES } from '@/config/constants';

interface AudienceTabProps {
  selected: Audience;
  onChange: (audience: Audience) => void;
}

export function AudienceTab({ selected, onChange }: AudienceTabProps) {
  const t = useTranslations('recommendations.audience');

  const audiences = Object.keys(AUDIENCES) as Audience[];

  return (
    <HStack
      gap={2}
      p={1}
      bg="rgba(255, 255, 255, 0.1)"
      _light={{ bg: 'gray.100' }}
      borderRadius="lg"
      flexWrap="wrap"
    >
      {audiences.map((audience) => (
        <Button
          key={audience}
          size="sm"
          variant={selected === audience ? 'solid' : 'outline'}
          colorPalette={selected === audience ? 'blue' : 'gray'}
          onClick={() => onChange(audience)}
          px={4}
          borderWidth={selected === audience ? 0 : 1}
          borderColor="rgba(255, 255, 255, 0.3)"
          color={selected === audience ? 'white' : 'gray.300'}
          _light={{
            borderColor: 'gray.300',
            color: selected === audience ? 'white' : 'gray.700',
          }}
          _hover={{
            bg: selected === audience ? undefined : 'rgba(255, 255, 255, 0.1)',
            _light: { bg: selected === audience ? undefined : 'gray.200' },
          }}
        >
          {t(audience)}
        </Button>
      ))}
    </HStack>
  );
}
