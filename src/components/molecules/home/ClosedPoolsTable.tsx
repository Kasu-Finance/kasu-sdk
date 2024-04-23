import { Card, TableCell, TableRow, Typography } from '@mui/material'
import { PoolCreditMetricsDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import React, { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import { CustomTableHeader } from '@/components/molecules/CustomTable/TableHeaders'

import { formatAmount } from '@/utils'

const handleSort = (
  _a: PoolCreditMetricsDirectus,
  _b: PoolCreditMetricsDirectus,
  _sort: Sort<PoolCreditMetricsDirectus>
): number => {
  return 0
}

interface ClosedPoolData {
  pool: string
  apy: number
  totalValueLocked: number
  loansUnder: number
  totalFunds: number
  totalLossRate: number
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

  const mergedPools = useMemo(() => {
    if (
      !pools ||
      pools.length === 0 ||
      !poolDelegates ||
      poolDelegates.length === 0
    ) {
      return []
    }

    return pools.map((pool) => {
      const delegate = poolDelegates.find(
        (delegate) => delegate.poolIdFK === pool.id
      )
      if (delegate) {
        return { ...pool, ...delegate }
      }
      return pool
    })
  }, [pools, poolDelegates])

  console.warn('mergedPools', mergedPools)

  const headers: CustomTableHeader<ClosedPoolData>[] = useMemo(
    () => [
      {
        label: t('general.pool'),
        value: 'pool',
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
        value: 'loansUnder',
      },
      {
        label: t('details.poolDelegate.totalFunds.label'),
        value: 'totalFunds',
      },
      {
        label: t('lending.poolOverview.detailCard.totalLossRate.label'),
        value: 'totalLossRate',
      },
    ],
    [t]
  )
  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2 }} elevation={1}>
      <CustomTable
        headers={headers}
        data={mergedPools}
        pagination={false}
        defaultSortKey='pool'
        handleSort={handleSort}
        headersStyle={{
          '& > *': {
            p: 1,
            pl: 2,
            pr: 2,
          },
        }}
      >
        {(sortedData) =>
          sortedData.map((pool, index) => (
            <TableRow key={index}>
              <TableCell align='left' width='50%'>
                {pool.poolName}
              </TableCell>
              <TableCell align='right'>
                {pool.tranches.map((tranche) => (
                  <Typography key={tranche.id} variant='body1'>
                    {tranche.name} {tranche.apy} %
                  </Typography>
                ))}
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {formatAmount(pool.totalValueLocked)} M USDC
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {pool.loansUnderManagement}
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {pool?.totalLoanFundsOriginated?.toFixed(2) || 0} M USDC
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {pool?.lossRate?.toFixed(2) || 0} %
                </Typography>
              </TableCell>
            </TableRow>
          ))
        }
      </CustomTable>
    </Card>
  )
}

export default ClosedPoolsTable
