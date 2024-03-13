import { useMemo } from 'react'

import en from '@/locales/en.json'

import { defaultLocale } from '@/config/i18nConfig'
import { getNestedTranslation } from '@/utils'

import { Leaves } from '@/types/utils'

export const TRANSLATIONS = {
  en,
} as const

export type TranslationKeys = Leaves<(typeof TRANSLATIONS)['en']>

// Define a type with overloaded signatures
type TranslateFunction = {
  // For known translation keys
  <K extends TranslationKeys>(key: K): string
  // For any string
  (key: string): string
}

const useTranslation = () => {
  const currentLocale = defaultLocale

  const t: TranslateFunction = useMemo(() => {
    const translate: TranslateFunction = (key: any): string => {
      // Implementation signature and logic
      const translation = getNestedTranslation(key, TRANSLATIONS[currentLocale])
      return translation || key
    }
    return translate
  }, [currentLocale])
  return { t }
}

export default useTranslation
