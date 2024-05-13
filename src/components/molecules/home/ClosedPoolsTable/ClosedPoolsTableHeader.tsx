import { alpha, TableCell, TableRow } from '@mui/material'
import React from 'react'

import { Sort } from '@/components/molecules/CustomTable'
import CustomTableSortLabel from '@/components/molecules/CustomTable/CustomTableSortLabel'
import { CLOSED_POOLS_KEYS } from '@/components/molecules/home/ClosedPoolsTable'

interface ClosedPoolsTableHeaderProps {
  handleSortChange: (newKey: (typeof CLOSED_POOLS_KEYS)[number]) => void
  sort: Sort<typeof CLOSED_POOLS_KEYS>
}

const ClosedPoolsTableHeader: React.FC<ClosedPoolsTableHeaderProps> = ({
  handleSortChange,
  sort,
}) => (
  <TableRow
    sx={(theme) => ({
      background: alpha(theme.palette.primary.main, 0.08),
    })}
  >
    <TableCell align='left'>
      <CustomTableSortLabel
        label='Pool'
        sort={sort}
        sortKey='poolName'
        handleSortChange={handleSortChange}
      />
    </TableCell>
    <TableCell align='right'>
      <CustomTableSortLabel
        label='APY'
        sort={sort}
        sortKey='apy'
        handleSortChange={handleSortChange}
      />
    </TableCell>
    <TableCell align='right'>
      <CustomTableSortLabel
        label='TVL'
        sort={sort}
        sortKey='totalValueLocked'
        handleSortChange={handleSortChange}
      />
    </TableCell>
    <TableCell align='right'>
      <CustomTableSortLabel
        label='Loans Under Management'
        sort={sort}
        sortKey='loansUnderManagement'
        handleSortChange={handleSortChange}
      />
    </TableCell>
    <TableCell align='right'>
      <CustomTableSortLabel
        label='Total Funds'
        sort={sort}
        sortKey='totalFunds'
        handleSortChange={handleSortChange}
      />
    </TableCell>
    <TableCell align='right'>
      <CustomTableSortLabel
        label='Loss Rate'
        sort={sort}
        sortKey='totalLossRate'
        handleSortChange={handleSortChange}
      />
    </TableCell>
  </TableRow>
)

export default ClosedPoolsTableHeader
