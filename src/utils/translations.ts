import { Leaves } from '@/types/utils'

const getNestedTranslation = <T extends Record<string, any>>(
  path: Leaves<T> | string,
  translations: T
): string => {
  if (typeof path !== 'string' || !path) {
    return ''
  }

  const keys = path.split('.')

  let result: any = translations

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key as keyof typeof translations]
    } else {
      return 'Translation not found: ' + path
    }
  }

  return typeof result === 'string' ? result : 'Translation not found'
}

export default getNestedTranslation
