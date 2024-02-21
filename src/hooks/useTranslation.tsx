import en from '@/locales/en.json'

import { defaultLocale } from '@/config/i18nConfig'
import { getNestedTranslation } from '@/utils'

import { Leaves } from '@/types/utils'

export const TRANSLATIONS = {
  en,
} as const

export type TranslationKeys = Leaves<(typeof TRANSLATIONS)['en']>

export default function useTranslation() {
  const currentLocale = defaultLocale

  const t = (key: TranslationKeys): string => {
    const translation = getNestedTranslation(key, TRANSLATIONS[currentLocale])
    return translation
  }

  return { t }
}
