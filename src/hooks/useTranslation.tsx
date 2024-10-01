import en from '@/locales/en.json'

import { defaultLocale } from '@/config/i18nConfig'
import { getNestedTranslation } from '@/utils'

import { Leaves } from '@/types/utils'

export const TRANSLATIONS = {
  en,
} as const

export type TranslationKeys = Leaves<(typeof TRANSLATIONS)['en']>

// Define a type with overloaded signatures
export type TranslateFunction = {
  // For known translation keys
  <K extends TranslationKeys>(key: K): string
  // For any string
  // (key: string): string
}

const useTranslation = () => {
  const t: TranslateFunction = (key: TranslationKeys) => {
    const translation = getNestedTranslation(key, TRANSLATIONS[defaultLocale])

    return translation || key
  }
  return { t }
}

export default useTranslation
