import { Card } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import React, { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import { CustomTableHeader } from '@/components/molecules/CustomTable/TableHeaders'
import ClosedPoolsTableFooter from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableFooter'
import ClosedPoolsTableRow from '@/components/molecules/home/ClosedPoolsTable/ClosedPoolsTableRow'

export interface MergedPoolData
  extends PoolOverview,
    PoolDelegateProfileAndHistory {}

export type TableData = MergedPoolData

interface TableDataHeader {
  poolName: string
  apy: number | string
  totalValueLocked: number
  loansUnderManagement: number
  totalFunds: number
  totalLossRate: string | number
}

const handleSort = (
  _a: TableData,
  _b: TableData,
  _sort: Sort<TableData>
): number => {
  return 0
}

interface ClosedPoolsTableProps {
  pools: PoolOverview[]
  poolDelegates: PoolDelegateProfileAndHistory[]
}

const ClosedPoolsTable: React.FC<ClosedPoolsTableProps> = ({
  pools,
  poolDelegates,
}) => {
  const { t } = useTranslation()

  const tableData = useMemo(() => {
    if (!pools.length || !poolDelegates.length) {
      return []
    }

    const mergedPoolsData = pools.map((pool) => {
      const delegate = poolDelegates.find(
        (delegate) => delegate.poolIdFK === pool.id
      )
      return { ...pool, ...delegate }
    })

    return mergedPoolsData
  }, [pools, poolDelegates])

  console.warn('tableData', tableData)

  const headers: CustomTableHeader<TableDataHeader>[] = useMemo(
    () => [
      {
        label: t('general.pool'),
        value: 'poolName',
      },
      {
        label: t('general.tvl'),
        value: 'totalValueLocked',
      },
      {
        label: t('general.apy'),
        value: 'apy',
      },
      {
        label: t('lending.poolOverview.detailCard.loansUnder.label'),
        value: 'loansUnderManagement',
      },
      {
        label: t('details.poolDelegate.totalFunds.label'),
        value: 'totalFunds',
      },
      {
        label: t('home.closedPools.table.lossRate'),
        value: 'totalLossRate',
      },
    ],
    [t]
  )

  console.warn('tableData', tableData)
  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2 }} elevation={1}>
      <CustomTable
        headers={headers}
        data={tableData}
        defaultSortKey='poolName'
        handleSort={handleSort}
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
