import { TableSortLabel } from '@mui/material'

import { Sort } from '@/components/molecules/CustomTable'
import { TableDataHeader } from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableHeader'

type ClosedPoolsTableSortLabelProps = {
  label: string
  sort: Sort<TableDataHeader>
  sortKey: keyof TableDataHeader
  handleSortChange: (key: keyof TableDataHeader) => void
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
