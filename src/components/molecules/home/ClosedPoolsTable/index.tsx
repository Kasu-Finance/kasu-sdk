import { Card } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import CustomTable from '@/components/molecules/CustomTable'
import ClosedPoolsTableFooter from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableFooter'
import ClosedPoolsTableHeader from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableHeader'
import ClosedPoolsTableRow from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableRow'

type GenericSort<T> = {
  key: keyof T
  direction: 'asc' | 'desc'
}

const handleSort = <T extends object>(
  a: T,
  b: T,
  sort: GenericSort<T>
): number => {
  const key = sort.key
  const direction = sort.direction === 'asc' ? 1 : -1
  const aValue = a[key]
  const bValue = b[key]

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return aValue.localeCompare(bValue) * direction
  } else if (typeof aValue === 'number' && typeof bValue === 'number') {
    return (aValue - bValue) * direction
  } else if (typeof aValue === 'number' && typeof bValue === 'string') {
    return -1 * direction
  } else if (typeof aValue === 'string' && typeof bValue === 'number') {
    return 1 * direction
  }
  return 0
}

export interface ClosedPoolData {
  poolName: string
  apy: number
  totalValueLocked: string
  loansUnderManagement: number
  poolImage: string
  tranches: TrancheData[]
  totalFunds: number
  totalLossRate: number
  assetClass: string
}

interface ClosedPoolsTableProps {
  pools: PoolOverview[]
  poolDelegates: PoolDelegateProfileAndHistory[]
}

const ClosedPoolsTable: React.FC<ClosedPoolsTableProps> = ({
  pools,
  poolDelegates,
}) => {
  const tableData: ClosedPoolData[] = useMemo(() => {
    if (!pools.length || !poolDelegates.length) {
      console.warn('No data available to merge')
      return []
    }

    return pools.map((pool) => {
      const delegate = poolDelegates.find(
        (delegate) => delegate.poolIdFK === pool.id
      )
      return {
        poolName: pool.poolName,
        apy: pool.apy,
        totalValueLocked: pool.totalValueLocked,
        loansUnderManagement: pool.loansUnderManagement,
        poolImage: pool.thumbnailImageUrl,
        tranches: pool.tranches,
        totalFunds: delegate.totalLoanFundsOriginated,
        totalLossRate: delegate.historicLossRate,
        assetClass: delegate.assetClasses,
      }
    })
  }, [pools, poolDelegates])

  console.warn('Merged data for table:', tableData)

  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2 }} elevation={1}>
      <CustomTable
        data={tableData}
        defaultSortKey='poolName'
        handleSort={handleSort}
        headers={(handleSortChange, sort) => (
          <ClosedPoolsTableHeader
            handleSortChange={handleSortChange}
            sort={sort}
          />
        )}
        footer={<ClosedPoolsTableFooter />}
        headersStyle={{
          '& > *': {
            py: 1,
            pl: 2,
            maxWidth: '100px',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          },
        }}
      >
        {(sortedData) =>
          sortedData.map((data) => (
            <ClosedPoolsTableRow
              key={`${data.poolName}-standard`}
              data={data}
            />
          ))
        }
      </CustomTable>
    </Card>
  )
}

export default ClosedPoolsTable
