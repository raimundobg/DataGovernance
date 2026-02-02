'use client';

import { Box, BoxProps } from '@chakra-ui/react';
import { usePrefersReducedTransparency } from '@/hooks/useA11y';

interface GlassCardProps extends BoxProps {
  intensity?: 'light' | 'medium' | 'heavy';
}

export function GlassCard({
  children,
  intensity = 'medium',
  ...props
}: GlassCardProps) {
  const prefersReducedTransparency = usePrefersReducedTransparency();

  const blurValues = {
    light: '8px',
    medium: '16px',
    heavy: '24px',
  };

  const opacityValues = {
    light: 0.6,
    medium: 0.8,
    heavy: 0.9,
  };

  if (prefersReducedTransparency) {
    return (
      <Box
        bg="bg.surface"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="md"
        p={6}
        _dark={{
          bg: 'gray.800',
          borderColor: 'gray.700',
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      borderRadius="xl"
      p={6}
      bg={`rgba(26, 26, 46, ${opacityValues[intensity]})`}
      backdropFilter={`blur(${blurValues[intensity]})`}
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.2)"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
        borderRadius: 'xl xl 0 0',
      }}
      _light={{
        bg: `rgba(255, 255, 255, ${opacityValues[intensity]})`,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
