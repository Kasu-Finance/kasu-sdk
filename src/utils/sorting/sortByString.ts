import { SortDirection } from '@/utils/sorting/sortByDate'

const sortByString =
  <T extends { [key: string]: any }>(key: keyof T, direction: SortDirection) =>
  (a: T, b: T): number => {
    const strA = String(a[key]).toLowerCase()
    const strB = String(b[key]).toLowerCase()
    return direction === 'asc' ? (strA < strB ? -1 : 1) : strA > strB ? -1 : 1
  }

export default sortByString
