import { Card } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import ClosedPoolsTableFooter from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableFooter'
import ClosedPoolsTableHeader from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableHeader'
import ClosedPoolsTableRow from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableRow'

const handleSort = <T extends { [key: string]: any }>(
  a: T,
  b: T,
  sort: Sort<T>
): number => {
  const key = sort.key as keyof T
  const direction = sort.direction === 'asc' ? 1 : -1
  const aValue = a[key]
  const bValue = b[key]

  if (key === 'poolName' || key === 'apy') {
    return typeof aValue === 'string' && typeof bValue === 'string'
      ? aValue.localeCompare(bValue) * direction
      : (aValue - bValue) * direction
  }

  const aNum = parseFloat(aValue)
  const bNum = parseFloat(bValue)
  return (aNum - bNum) * direction
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
      return []
    }

    return pools.map((pool) => {
      const delegate = poolDelegates.find(
        (delegate) => delegate.poolIdFK === pool.id
      )

      return {
        id: pool.id,
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
          sortedData.map((data, idx) => (
            <ClosedPoolsTableRow key={`${data.poolName}-${idx}`} data={data} />
          ))
        }
      </CustomTable>
    </Card>
  )
}

export default ClosedPoolsTable
