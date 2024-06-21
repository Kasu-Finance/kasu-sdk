import { alpha, TableCell, TableRow } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

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
}) => {
  const { t } = useTranslation()

  return (
    <TableRow
      sx={(theme) => ({
        background: alpha(theme.palette.primary.main, 0.08),
      })}
    >
      <TableCell align='left'>
        <CustomTableSortLabel
          label={t('general.lendingStrategy')}
          sort={sort}
          sortKey='poolName'
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          label={t('general.apy')}
          sort={sort}
          sortKey='apy'
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          label={t('general.tvl')}
          sort={sort}
          sortKey='totalValueLocked'
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          label={t('lending.poolOverview.detailCard.loansUnder.label')}
          sort={sort}
          sortKey='loansUnderManagement'
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          label={t('details.poolDelegate.totalFunds.label')}
          sort={sort}
          sortKey='totalFunds'
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          label={t('home.closedPools.table.lossRate')}
          sort={sort}
          sortKey='totalLossRate'
          handleSortChange={handleSortChange}
        />
      </TableCell>
    </TableRow>
  )
}

export default ClosedPoolsTableHeader
