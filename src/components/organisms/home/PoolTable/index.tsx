import React from 'react'

import usePagination from '@/hooks/usePagination'

import CustomTableTest from '@/components/molecules/CustomTableTest'
import ActivePoolTableHeader from '@/components/organisms/home/PoolTable/ActivePoolTableHeader'
import ClosedPoolTableHeader from '@/components/organisms/home/PoolTable/ClosedPoolTableHeader'
import PoolTableBody from '@/components/organisms/home/PoolTable/PoolTableBody'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolTableProps = {
  pools: PoolOverviewWithDelegate[]
}

const ROW_PER_PAGE = 10

const PoolTable: React.FC<PoolTableProps> = ({ pools }) => {
  const { currentPage, setPage, paginateData } = usePagination(
    ROW_PER_PAGE,
    pools.length
  )

  return (
    <CustomTableTest
      tableHeader={
        pools[0].isActive ? (
          <ActivePoolTableHeader />
        ) : (
          <ClosedPoolTableHeader />
        )
      }
      tableBody={<PoolTableBody pools={paginateData([...pools])} />}
      paginationProps={
        pools.length > ROW_PER_PAGE
          ? {
              count: Math.ceil(pools.length / ROW_PER_PAGE),
              page: currentPage,
              onChange: (_, page) => setPage(page),
            }
          : undefined
      }
      sx={{ boxShadow: '0px 5px 20px 0px rgba(0, 0, 0, 0.1)' }}
    />
  )
}

export default PoolTable
