import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

const messageLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('@/messages/en.json'),
  hi: () => import('@/messages/hi.json'),
  as: () => import('@/messages/as.json'),
  mr: () => import('@/messages/mr.json'),
};

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const enMessages = (await import('@/messages/en.json')).default;
  const targetMessages = locale === 'en' ? {} : (await messageLoaders[locale]()).default;

  return {
    locale,
    messages: {
      ...enMessages,
      ...targetMessages,
    },
  };
});
