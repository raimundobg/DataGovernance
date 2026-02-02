'use client';

import { Badge, BadgeProps } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { RiskLevel } from '@/config/constants';

interface RiskBadgeProps extends Omit<BadgeProps, 'colorPalette'> {
  level: RiskLevel;
  showLabel?: boolean;
}

const colorSchemes: Record<RiskLevel, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'green',
};

export function RiskBadge({ level, showLabel = true, ...props }: RiskBadgeProps) {
  const t = useTranslations('risk');

  return (
    <Badge
      colorPalette={colorSchemes[level]}
      variant="subtle"
      px={3}
      py={1}
      borderRadius="full"
      fontSize="xs"
      fontWeight="semibold"
      textTransform="uppercase"
      {...props}
    >
      {showLabel ? t(level) : level}
    </Badge>
  );
}
