import { TableSortLabel } from '@mui/material'

import { Sort } from '@/components/molecules/CustomTable'
import { TransactionHistoryType } from '@/components/molecules/lending/overview/TransactionHistory'

type TransactionSortLabelProps = {
  label: string
  sort: Sort<TransactionHistoryType>
  sortKey: keyof TransactionHistoryType
  handleSortChange: (key: keyof TransactionHistoryType) => void
}

const TransactionSortLabel: React.FC<TransactionSortLabelProps> = ({
  label,
  sortKey,
  sort,
  handleSortChange,
}) => {
  const isActive = sort.key === sortKey

  return (
    <TableSortLabel
      direction={isActive ? sort.direction : 'desc'}
      active={isActive}
      onClick={() => handleSortChange(sortKey)}
    >
      {label}
    </TableSortLabel>
  )
}

export default TransactionSortLabel
