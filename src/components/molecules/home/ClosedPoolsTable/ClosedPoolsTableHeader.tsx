import { alpha, TableCell, TableRow } from '@mui/material'
import React from 'react'

import { Sort } from '@/components/molecules/CustomTable'
import { ClosedPoolData } from '@/components/molecules/home/ClosedPoolsTable'

import ClosedPoolsTableSortLabel from './ClosedPoolsTableSortLabel'

interface ClosedPoolsTableHeaderProps {
  handleSortChange: (newKey: keyof ClosedPoolData) => void
  sort: Sort<ClosedPoolData>
}

const ClosedPoolsTableHeader: React.FC<ClosedPoolsTableHeaderProps> = ({
  handleSortChange,
  sort,
}) => (
  <TableRow
    sx={(theme) => ({
      background: alpha(theme.palette.primary.main, 0.04),
    })}
  >
    <TableCell align='left'>
      <ClosedPoolsTableSortLabel
        label='Pool'
        sort={sort}
        sortKey='poolName'
        handleSortChange={handleSortChange}
      />
    </TableCell>
    <TableCell align='right'>
      <ClosedPoolsTableSortLabel
        label='APY'
        sort={sort}
        sortKey='apy'
        handleSortChange={handleSortChange}
      />
    </TableCell>
    <TableCell align='right'>
      <ClosedPoolsTableSortLabel
        label='TVL'
        sort={sort}
        sortKey='totalValueLocked'
        handleSortChange={handleSortChange}
      />
    </TableCell>
    <TableCell align='right'>
      <ClosedPoolsTableSortLabel
        label='Loans Under Management'
        sort={sort}
        sortKey='loansUnderManagement'
        handleSortChange={handleSortChange}
      />
    </TableCell>
    <TableCell align='right'>
      <ClosedPoolsTableSortLabel
        label='Total Funds'
        sort={sort}
        sortKey='totalFunds'
        handleSortChange={handleSortChange}
      />
    </TableCell>
    <TableCell align='right'>
      <ClosedPoolsTableSortLabel
        label='Loss Rate'
        sort={sort}
        sortKey='totalLossRate'
        handleSortChange={handleSortChange}
      />
    </TableCell>
  </TableRow>
)

export default ClosedPoolsTableHeader
