import { TableCell, TableRow } from '@mui/material'
import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import React from 'react'

import usePortfolioState from '@/hooks/context/usePortfolioState'
import usePagination from '@/hooks/usePagination'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import NoMatchingFilter from '@/components/atoms/NoMatchingFilter'
import CustomTable from '@/components/molecules/CustomTable'
import LendingPortfolioTableHeader from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableHeader'
import LendingPortfolioTableRow from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableRow'

type LendingPortfolioTableProps = {
  portfolioPools: PortfolioLendingPool[]
}

const ROW_PER_PAGE = 5

const LendingPortfolioTable: React.FC<LendingPortfolioTableProps> = ({
  portfolioPools,
}) => {
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
            />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} sx={{ pt: 7, pb: 7 }}>
              {portfolioPools.length ? (
                <NoMatchingFilter />
              ) : (
                <EmptyDataPlaceholder text='You have not deposited into any lending strategies...' />
              )}
            </TableCell>
          </TableRow>
        )
      }
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
