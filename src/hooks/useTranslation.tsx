import en from '@/locales/en.json'

import { defaultLocale } from '@/config/i18nConfig'
import { getNestedTranslation } from '@/utils'

import { Translations } from '@/types/locales'

const translations: { [key: string]: Translations } = {
  en,
}

export default function useTranslation() {
  const currentLocale = defaultLocale

  const t = (key: string): string => {
    const translation = getNestedTranslation(key, translations[currentLocale])
    return translation || key // Return the key as a fallback if translation is not found
  }

  return { t }
}
