import { alpha, TableCell, TableRow, Typography } from '@mui/material'
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
          flipIcon
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          label={t('general.tvl')}
          sort={sort}
          sortKey='totalValueLocked'
          handleSortChange={handleSortChange}
          flipIcon
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          label={
            <Typography
              variant='inherit'
              component='span'
              maxWidth={75}
              whiteSpace='normal'
              display='block'
            >
              {t('lending.poolOverview.detailCard.loansUnder.label')}
            </Typography>
          }
          sort={sort}
          sortKey='loansUnderManagement'
          handleSortChange={handleSortChange}
          flipIcon
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          label={
            <Typography
              variant='inherit'
              component='span'
              maxWidth={120}
              whiteSpace='normal'
              display='block'
            >
              {t('details.poolDelegate.totalFunds.label')}
            </Typography>
          }
          sort={sort}
          sortKey='totalFunds'
          handleSortChange={handleSortChange}
          flipIcon
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          label={t('home.closedPools.table.lossRate')}
          sort={sort}
          sortKey='totalLossRate'
          handleSortChange={handleSortChange}
          flipIcon
        />
      </TableCell>
    </TableRow>
  )
}

export default ClosedPoolsTableHeader
