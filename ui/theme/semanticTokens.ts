export const semanticTokens = {
  colors: {
    'bg.canvas': {
      value: { base: '{colors.gray.50}', _dark: '{colors.gray.900}' },
    },
    'bg.surface': {
      value: { base: 'white', _dark: '{colors.gray.800}' },
    },
    'bg.muted': {
      value: { base: '{colors.gray.100}', _dark: '{colors.gray.700}' },
    },
    'bg.glass': {
      value: { base: 'rgba(255, 255, 255, 0.7)', _dark: 'rgba(26, 26, 46, 0.8)' },
    },
    'border.glass': {
      value: { base: 'rgba(255, 255, 255, 0.3)', _dark: 'rgba(255, 255, 255, 0.1)' },
    },
    'text.primary': {
      value: { base: '{colors.gray.900}', _dark: 'white' },
    },
    'text.secondary': {
      value: { base: '{colors.gray.600}', _dark: '{colors.gray.400}' },
    },
    'text.muted': {
      value: { base: '{colors.gray.500}', _dark: '{colors.gray.500}' },
    },
  },
};
