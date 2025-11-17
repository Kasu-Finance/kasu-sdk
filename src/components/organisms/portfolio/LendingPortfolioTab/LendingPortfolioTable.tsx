import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { TableCell, TableRow } from '@mui/material'
import React from 'react'

import usePortfolioState from '@/hooks/context/usePortfolioState'
import usePagination from '@/hooks/usePagination'
import getTranslation from '@/hooks/useTranslation'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import NoMatchingFilter from '@/components/atoms/NoMatchingFilter'
import CustomTable from '@/components/molecules/CustomTable'
import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'
import LendingPortfolioTableHeader from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableHeader'
import LendingPortfolioTableRow from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableRow'

type LendingPortfolioTableProps = {
  portfolioPools: PortfolioLendingPool[]
  currentEpoch: string
}

const ROW_PER_PAGE = 5

const LendingPortfolioTable: React.FC<LendingPortfolioTableProps> = ({
  portfolioPools,
  currentEpoch,
}) => {
  const { t } = getTranslation()

  const { filter } = usePortfolioState()

  const filteredPools = portfolioPools.filter(
    ({ isActive }) =>
      (filter.activePools && filter.closedPools) ||
      (filter.activePools === isActive && filter.closedPools !== isActive)
  )

  const { currentPage, setPage, paginateData } = usePagination(
    ROW_PER_PAGE,
    filteredPools.length
  )

  return (
    <CustomTable
      tableHeader={<LendingPortfolioTableHeader />}
      tableBody={
        filteredPools.length ? (
          [...paginateData(filteredPools)].map((portfolioPool) => (
            <LendingPortfolioTableRow
              key={portfolioPool.id}
              portfolioPool={portfolioPool}
              currentEpoch={currentEpoch}
            />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} sx={{ pt: 4, pb: 4 }}>
              {portfolioPools.length && 1 > 2 ? (
                <NoMatchingFilter />
              ) : (
                <EmptyDataPlaceholder text='You have not yet made any Lending Requests...'>
                  <NextClearingPeriodInfo
                    beforeText={t('portfolio.lendingPortfolio.dataUpdateTime')}
                    sx={{
                      bgcolor: 'unset',
                      maxWidth: 680,
                      textAlign: 'center',
                      pt: 1,
                    }}
                    typographyProps={{
                      variant: 'baseSm',
                      whiteSpace: 'normal',
                    }}
                    skeletonProps={{
                      sx: {
                        bgcolor: 'rgba(40, 40, 42, 0.11)',
                      },
                    }}
                  />
                </EmptyDataPlaceholder>
              )}
            </TableCell>
          </TableRow>
        )
      }
      tableHeaderSx={portfolioPools.length ? undefined : { display: 'none' }}
      tableBodySx={{
        '& .MuiTableRow-root:first-child': {
          display: 'none',
        },
      }}
      paginationProps={
        filteredPools.length > ROW_PER_PAGE
          ? {
              count: Math.ceil(filteredPools.length / ROW_PER_PAGE),
              page: currentPage,
              onChange: (_, page) => setPage(page),
            }
          : undefined
      }
    />
  )
}

export default LendingPortfolioTable
