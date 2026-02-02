'use client';

import { Button, HStack } from '@chakra-ui/react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, Locale } from '@/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    const currentPath = pathname.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${currentPath}`);
  };

  return (
    <HStack gap={1}>
      {locales.map((loc) => (
        <Button
          key={loc}
          size="sm"
          variant={locale === loc ? 'solid' : 'ghost'}
          colorPalette={locale === loc ? 'blue' : 'gray'}
          onClick={() => handleLocaleChange(loc)}
          px={3}
          fontWeight={locale === loc ? 'semibold' : 'normal'}
        >
          {loc.toUpperCase()}
        </Button>
      ))}
    </HStack>
  );
}
