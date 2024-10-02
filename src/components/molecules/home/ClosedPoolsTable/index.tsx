import { Card } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import ClosedPoolsMobileTableRow from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsMobileTableRow'
import ClosedPoolsTableFooter from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableFooter'
import ClosedPoolsTableHeader from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableHeader'
import ClosedPoolsTableRow from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableRow'

export const CLOSED_POOLS_KEYS = [
  'poolName',
  'apy',
  'totalValueLocked',
  'loansUnderManagement',
  'totalFunds',
  'totalLossRate',
  'assetClass',
] as const

const handleSort = (
  a: ClosedPoolData,
  b: ClosedPoolData,
  sort: Sort<typeof CLOSED_POOLS_KEYS>
): number => {
  const key = sort.key
  const direction = sort.direction === 'asc' ? 1 : -1

  const aValue = parseFloat(String(a[key]))
  const bValue = parseFloat(String(b[key]))

  if (!isNaN(aValue) && !isNaN(bValue)) {
    return (aValue - bValue) * direction
  }

  return String(a[key]).localeCompare(String(b[key])) * direction
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
  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  const tableData: ClosedPoolData[] = useMemo(() => {
    if (!pools.length || !poolDelegates.length) {
      return []
    }

    return pools.map((pool) => {
      const delegate = poolDelegates.find((delegate) =>
        delegate.otherKASUPools.find((otherPool) => otherPool.id === pool.id)
      )

      return {
        id: pool.id,
        poolName: pool.poolName,
        apy: pool.apy,
        totalValueLocked: pool.totalValueLocked,
        loansUnderManagement: Number(pool.loansUnderManagement),
        poolImage: pool.thumbnailImageUrl,
        tranches: pool.tranches,
        totalFunds: delegate?.totalLoanFundsOriginated ?? 0,
        totalLossRate: delegate?.historicLossRate ?? 0,
        assetClass: delegate?.assetClasses ?? '',
      }
    })
  }, [pools, poolDelegates])

  return (
    <Card
      sx={(theme) => ({
        minWidth: 275,
        padding: 2,
        [theme.breakpoints.down('sm')]: {
          p: 0,
          bgcolor: 'transparent',
        },
      })}
    >
      <CustomTable
        data={tableData}
        defaultSortKey='poolName'
        sortKeys={CLOSED_POOLS_KEYS}
        handleSort={handleSort}
        headers={
          isMobile
            ? []
            : (handleSortChange, sort) => (
                <ClosedPoolsTableHeader
                  handleSortChange={handleSortChange}
                  sort={sort}
                />
              )
        }
        footer={isMobile ? undefined : <ClosedPoolsTableFooter />}
        tableStyles={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            borderRadius: 0,
            border: 'none',
          },
        })}
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
        paginationStyle={{
          mt: 1,
          px: '8px !important',
          bgcolor: 'white',
        }}
      >
        {(sortedData) =>
          sortedData.map((data, idx) =>
            isMobile ? (
              <ClosedPoolsMobileTableRow
                key={`${data.poolName}-${idx}`}
                data={data}
              />
            ) : (
              <ClosedPoolsTableRow
                key={`${data.poolName}-${idx}`}
                data={data}
              />
            )
          )
        }
      </CustomTable>
    </Card>
  )
}

export default ClosedPoolsTable
