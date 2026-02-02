import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { colors } from './foundations/colors';
import { shadows } from './foundations/shadows';
import { semanticTokens } from './semanticTokens';

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors,
      shadows,
    },
    semanticTokens,
  },
  globalCss: {
    'html, body': {
      bg: 'bg.canvas',
      color: 'text.primary',
      minHeight: '100vh',
    },
    '*::selection': {
      bg: 'brand.200',
      color: 'brand.900',
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
