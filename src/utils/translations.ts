import { Translations, TranslationValue } from '@/types/locales'

const getNestedTranslation = (
  path: string,
  translations: Translations
): string | null => {
  const keys = path.split('.')
  // Start with a broad type that can be narrowed down as we progress through the keys.
  let result: TranslationValue | null = translations

  for (const key of keys) {
    // If result is no longer an object (or it's null), break early.
    if (result === null || typeof result !== 'object' || !(key in result)) {
      return null
    }
    result = result[key]
  }

  // Ensure the final result is a string, otherwise return null.
  return typeof result === 'string' ? result : null
}

export default getNestedTranslation
