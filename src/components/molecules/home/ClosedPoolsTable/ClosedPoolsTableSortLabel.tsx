import { TableSortLabel } from '@mui/material'

import { Sort } from '@/components/molecules/CustomTable'
import { ClosedPoolData } from '@/components/molecules/home/ClosedPoolsTable'

type ClosedPoolsTableSortLabelProps = {
  label: string
  sort: Sort<ClosedPoolData>
  sortKey: keyof ClosedPoolData
  handleSortChange: (key: keyof ClosedPoolData) => void
}

const ClosedPoolsTableSortLabel: React.FC<ClosedPoolsTableSortLabelProps> = ({
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

export default ClosedPoolsTableSortLabel
