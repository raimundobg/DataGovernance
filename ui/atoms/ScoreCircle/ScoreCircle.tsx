'use client';

import { Box, Text, VStack, useTheme } from '@chakra-ui/react';
import { useTheme as useNextTheme } from 'next-themes';
import { getRiskLevel, RiskLevel } from '@/config/constants';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
}

const sizeMap = {
  sm: { outer: 80, inner: 64, strokeWidth: 6, fontSize: 'lg' },
  md: { outer: 120, inner: 96, strokeWidth: 8, fontSize: '2xl' },
  lg: { outer: 160, inner: 128, strokeWidth: 10, fontSize: '3xl' },
  xl: { outer: 200, inner: 160, strokeWidth: 12, fontSize: '4xl' },
};

const colorMap: Record<RiskLevel, string> = {
  critical: '#e53e3e',
  high: '#ed8936',
  medium: '#ecc94b',
  low: '#48bb78',
};

export function ScoreCircle({
  score,
  size = 'md',
  showLabel = true,
  label,
}: ScoreCircleProps) {
  const { outer, inner, strokeWidth, fontSize } = sizeMap[size];
  const riskLevel = getRiskLevel(score);
  const color = colorMap[riskLevel];
  const { resolvedTheme } = useNextTheme();
  const isLight = resolvedTheme === 'light';

  const radius = (outer - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  const trackColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

  return (
    <VStack gap={2}>
      <Box position="relative" width={outer} height={outer}>
        <svg
          width={outer}
          height={outer}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        </svg>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
        >
          <Text
            fontSize={fontSize}
            fontWeight="bold"
            color={color}
            lineHeight="1"
          >
            {Math.round(score)}
          </Text>
        </Box>
      </Box>
      {showLabel && label && (
        <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }} textAlign="center">
          {label}
        </Text>
      )}
    </VStack>
  );
}
