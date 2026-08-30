import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

const messageLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('@/messages/en.json'),
  hi: () => import('@/messages/hi.json'),
  as: () => import('@/messages/as.json'),
  mr: () => import('@/messages/mr.json'),
  bn: () => import('@/messages/bn.json'),
  ne: () => import('@/messages/ne.json'),
  mni: () => import('@/messages/mni.json'),
  lus: () => import('@/messages/lus.json'),
  kha: () => import('@/messages/kha.json'),
  brx: () => import('@/messages/brx.json'),
  grt: () => import('@/messages/grt.json'),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    if (isRecord(result[key]) && isRecord(source[key])) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const enMessages = (await import('@/messages/en.json')).default;
  const targetMessages = locale === 'en' ? {} : (await messageLoaders[locale]()).default;

  return {
    locale,
    messages: deepMerge(enMessages as Record<string, unknown>, targetMessages as Record<string, unknown>),
  };
});
