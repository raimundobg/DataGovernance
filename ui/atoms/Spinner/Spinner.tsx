'use client';

import { Spinner as ChakraSpinner, SpinnerProps as ChakraSpinnerProps, VStack, Text } from '@chakra-ui/react';

interface SpinnerProps extends ChakraSpinnerProps {
  label?: string;
}

export function Spinner({ label, size = 'lg', ...props }: SpinnerProps) {
  return (
    <VStack gap={3}>
      <ChakraSpinner
        size={size}
        color="blue.400"
        borderWidth="3px"
        {...props}
      />
      {label && (
        <Text fontSize="sm" color="gray.400">
          {label}
        </Text>
      )}
    </VStack>
  );
}
