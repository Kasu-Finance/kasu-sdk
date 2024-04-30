import { alpha, TableCell, TableRow } from '@mui/material'
import React from 'react'

import { Sort } from '@/components/molecules/CustomTable'
import CustomTableSortLabel from '@/components/molecules/CustomTable/CustomTableSortLabel'
import { LENDING_PORTFOLIO_KEYS } from '@/components/organisms/portfolio/LendingPortfolioTable'

type LendingPortfolioTableHeaderProps = {
  handleSortChange: (newKey: (typeof LENDING_PORTFOLIO_KEYS)[number]) => void
  sort: Sort<typeof LENDING_PORTFOLIO_KEYS>
}

const LendingPortfolioTableHeader: React.FC<
  LendingPortfolioTableHeaderProps
> = ({ handleSortChange, sort }) => (
  <>
    <TableRow
      sx={(theme) => ({
        background: alpha(theme.palette.primary.main, 0.04),
      })}
    >
      <TableCell rowSpan={2}>
        <CustomTableSortLabel
          sort={sort}
          handleSortChange={handleSortChange}
          label='Pool'
          sortKey='poolName'
        />
      </TableCell>
      <TableCell rowSpan={2} align='right'>
        <CustomTableSortLabel
          sort={sort}
          handleSortChange={handleSortChange}
          label='APY'
          sortKey='weightedApy'
        />
      </TableCell>
      <TableCell rowSpan={2} align='right'>
        <CustomTableSortLabel
          sort={sort}
          handleSortChange={handleSortChange}
          label='Investment'
          sortKey='totalInvestedAmount'
        />
      </TableCell>
      <TableCell colSpan={4} align='center'>
        Yield Earnings
      </TableCell>
    </TableRow>
    <TableRow>
      <TableCell align='right'>
        <CustomTableSortLabel
          sort={sort}
          handleSortChange={handleSortChange}
          label='Last Epoch'
          sortKey='totalYieldEarningsLastEpoch'
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          sort={sort}
          handleSortChange={handleSortChange}
          label='Last 30 Days'
          sortKey='totalYieldEarningsLastMonth'
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          sort={sort}
          handleSortChange={handleSortChange}
          label='Last 12 Months'
          sortKey='totalYieldEarningsLastYear'
        />
      </TableCell>
      <TableCell align='right'>
        <CustomTableSortLabel
          sort={sort}
          handleSortChange={handleSortChange}
          label='Lifetime'
          sortKey='totalYieldEarningsLifetime'
        />
      </TableCell>
    </TableRow>
  </>
)

export default LendingPortfolioTableHeader
