import { TableSortLabel } from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'

import { Sort } from '@/components/molecules/CustomTable'

type TransactionSortLabelProps = {
  label: string
  sort: Sort<UserRequest>
  sortKey: keyof UserRequest
  handleSortChange: (key: keyof UserRequest) => void
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
