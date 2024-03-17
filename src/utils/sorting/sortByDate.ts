export type SortDirection = 'asc' | 'desc'

const sortByDate = <T extends { [key: string]: any }>(
  key: keyof T,
  direction: SortDirection
): ((a: T, b: T) => number) => {
  return (a, b) => {
    const timeA = new Date(a[key] as string).getTime()
    const timeB = new Date(b[key] as string).getTime()
    return (direction === 'asc' ? 1 : -1) * (timeA - timeB)
  }
}

export default sortByDate
