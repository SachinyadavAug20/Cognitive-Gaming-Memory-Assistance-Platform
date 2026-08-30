import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'hi', 'as', 'mr', 'bn', 'ne', 'mni', 'lus', 'kha', 'brx', 'grt'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
