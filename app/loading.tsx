import { Box, Spinner as ChakraSpinner, VStack, Text } from '@chakra-ui/react';

export default function Loading() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.900"
    >
      <VStack gap={4}>
        <ChakraSpinner
          size="xl"
          color="blue.400"
          borderWidth="4px"
        />
        <Text color="gray.400">Loading...</Text>
      </VStack>
    </Box>
  );
}
