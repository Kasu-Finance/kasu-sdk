import { Leaves } from '@/types/utils'

const getNestedTranslation = <T extends Record<string, any>>(
  path: Leaves<T, 5>,
  translations: T
): string => {
  const keys = path.split('.')

  let result: any

  for (const key in keys) {
    // we know for sure that key is a valid key because of type-safety
    result = translations[key as keyof typeof translations]
  }

  return typeof result === 'string' ? result : path
}

export default getNestedTranslation
