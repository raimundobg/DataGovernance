export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Exposure & Compliance Signals',
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en',
} as const;

export type Env = typeof env;
