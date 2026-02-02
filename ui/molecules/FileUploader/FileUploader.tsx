'use client';

import { useCallback, useState, useRef } from 'react';
import { Box, Text, VStack, Icon, Input } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/ui/atoms';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export function FileUploader({
  onFileSelect,
  accept = '.csv',
  maxSize = 10 * 1024 * 1024,
  disabled = false,
}: FileUploaderProps) {
  const t = useTranslations('import');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);

    if (maxSize && file.size > maxSize) {
      setError(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
      return false;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (accept && extension && !accept.includes(`.${extension}`)) {
      setError(`Invalid file type. Expected: ${accept}`);
      return false;
    }

    return true;
  }, [accept, maxSize]);

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleFile]);

  return (
    <GlassCard
      p={8}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      opacity={disabled ? 0.6 : 1}
      borderStyle="dashed"
      borderWidth="2px"
      borderColor={isDragging ? 'blue.400' : 'transparent'}
      bg={isDragging ? 'rgba(66, 153, 225, 0.1)' : undefined}
      transition="all 0.2s"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      _hover={{
        borderColor: disabled ? 'transparent' : 'blue.400',
      }}
    >
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        display="none"
        onChange={handleInputChange}
        disabled={disabled}
      />

      <VStack gap={4} textAlign="center">
        <Box
          w={16}
          h={16}
          borderRadius="full"
          bg="blue.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          opacity={0.8}
        >
          <Text fontSize="2xl" color="white">
            +
          </Text>
        </Box>

        <VStack gap={2}>
          <Text fontSize="lg" fontWeight="medium" color="white" _light={{ color: 'gray.800' }}>
            {t('dropzone')}
          </Text>
          <Text fontSize="sm" color="gray.400" _light={{ color: 'gray.600' }}>
            {t('supported')}
          </Text>
        </VStack>

        {error && (
          <Text fontSize="sm" color="red.400" _light={{ color: 'red.600' }}>
            {error}
          </Text>
        )}
      </VStack>
    </GlassCard>
  );
}
