import { SortDirection } from './sortByDate'

const sortByNumber =
  <T extends { [key: string]: any }>(key: keyof T, direction: SortDirection) =>
  (a: T, b: T): number => {
    const numA = Number(a[key])
    const numB = Number(b[key])
    return direction === 'asc' ? numA - numB : numB - numA
  }

export default sortByNumber
