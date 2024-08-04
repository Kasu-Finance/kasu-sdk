import { TableCell, TableRow } from '@mui/material'
import React from 'react'

import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import CustomTable from '@/components/molecules/CustomTable'
import TableSkeleton from '@/components/molecules/loaders/TableSkeleton'
import LendingPortfolioMobileTableFooter from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioMobileTableFooter'
import LendingPortfolioMobileTableRow from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioMobileTableRow'
import LendingPortfolioTableFooter from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioTableFooter'
import LendingPortfolioTableHeader from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioTableHeader'
import LendingPortfolioTableRow from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioTableRow'

export const LENDING_PORTFOLIO_KEYS = [
  'poolName',
  'weightedApy',
  'totalInvestedAmount',
  'totalYieldEarningsLastEpoch',
  'totalYieldEarningsLifetime',
] as const

type LendingPortfolioTableProps = {
  filter: {
    activePools: boolean
    closedPools: boolean
  }
}

const LendingPortfolioTable: React.FC<LendingPortfolioTableProps> = ({
  filter,
}) => {
  const { lendingPortfolioData, isLoading } = useLendingPortfolioData()

  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  if (isLoading || !lendingPortfolioData)
    return <TableSkeleton rows={6} columns={3} />

  const filteredPools = lendingPortfolioData.lendingPools.filter(
    ({ isActive }) =>
      (filter.activePools && filter.closedPools) ||
      (filter.activePools === isActive && filter.closedPools !== isActive)
  )

  return (
    <CustomTable
      headers={isMobile ? [] : LendingPortfolioTableHeader}
      sortKeys={LENDING_PORTFOLIO_KEYS}
      data={filteredPools}
      defaultSortKey='weightedApy'
      handleSort={() => 0}
      headersStyle={{
        '& .MuiTableCell-root': {
          py: '6px',
          px: 2,
          textTransform: 'capitalize',

          '&.apy': {
            pr: 0,
          },

          '&.MuiTableCell-alignRight .MuiTableSortLabel-icon': {
            order: -1,
          },
        },
      }}
      footer={
        isMobile ? (
          <LendingPortfolioMobileTableFooter lendingPortfolio={filteredPools} />
        ) : (
          <LendingPortfolioTableFooter lendingPortfolio={filteredPools} />
        )
      }
      footerStyle={(theme) => ({
        '& .MuiTableCell-root': {
          background: 'none',
          height: '100px',
          textTransform: 'capitalize',
        },
        [theme.breakpoints.down('sm')]: {
          border: 'none',
        },
      })}
    >
      {(data) =>
        data.length ? (
          data.map((userPortfolio, index) => {
            return isMobile ? (
              <LendingPortfolioMobileTableRow
                portfolio={userPortfolio}
                key={index}
              />
            ) : (
              <LendingPortfolioTableRow portfolio={userPortfolio} key={index} />
            )
          })
        ) : (
          <TableRow>
            <TableCell>
              {lendingPortfolioData.lendingPools.length
                ? 'No pools match the filter'
                : 'No data available'}
            </TableCell>
          </TableRow>
        )
      }
    </CustomTable>
  )
}

export default LendingPortfolioTable
