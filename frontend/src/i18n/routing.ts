import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'hi', 'as', 'mr'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
