import { computed } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';

export interface I18nConfig<T = unknown> {
  en: T;
  'zh-cn': T;
}

function getLang(unknownLang?: string): keyof I18nConfig {
  if (unknownLang !== 'en' && unknownLang !== 'zh-cn') return 'en';
  return unknownLang;
}

export interface UrlParams {
  lang?: string;
}

export default function useI18n<T = unknown>(configs: I18nConfig<T>) {
  const params = useUrlSearchParams<UrlParams>('history');
  return computed(() => configs[getLang(params.lang)]);
}
