export type Order = 'asc' | 'desc';

export const descendingComparator = <T>(a: T, b: T, orderBy: keyof T): number => {
  if (orderBy === 'repaymentDate') {
    const dateA = new Date(a[orderBy] as unknown as string);
    const dateB = new Date(b[orderBy] as unknown as string);
    return dateB.getTime() - dateA.getTime();
  }
  
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};
;

export const getComparator = <Key extends keyof any>(
  order: Order,
  orderBy: Key,
): ((a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

export const stableSort = <T>(array: T[], comparator: (a: T, b: T) => number): T[] => {
  const stabilizedThis: [T, number][] = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
};
