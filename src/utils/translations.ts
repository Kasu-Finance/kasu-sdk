import { Leaves } from '@/types/utils'

const getNestedTranslation = <T extends Record<string, any>>(
  path: Leaves<T> | string,
  translations: T
): string => {
  const keys = path.split('.')

  let result: any = translations

  for (const key of keys) {
    // we know for sure that key is a valid key because of type-safety
    result = result[key as keyof typeof translations]
  }

  return typeof result === 'string' ? result : path
}

export default getNestedTranslation
