import ReceiptIcon from '@mui/icons-material/Receipt'
import {
  alpha,
  Box,
  Button,
  Card,
  Divider,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
  PoolTranche,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import React, { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import PoolAvatar from '@/components/atoms/PoolAvatar'
import CustomTable from '@/components/molecules/CustomTable'
import { CustomTableHeader } from '@/components/molecules/CustomTable/TableHeaders'

import { formatAmount, formatPercentage } from '@/utils'
import { SortDirection } from '@/utils/sorting/sortByDate'

interface Sort<T> {
  key: keyof T
  direction: SortDirection
}

interface TableData {
  poolName: string
  apy: number | string
  totalValueLocked: number
  loansUnderManagement: number
  totalFunds: number
  totalLossRate: string | number
  tranches?: PoolTranche[]
  thumbnailImageUrl?: string
  assetClass?: string
  isStandardPoolRow?: boolean
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
      return { ...pool, ...delegate, isStandardPoolRow: true }
    })

    const averageAndTotalRows: TableData[] = [
      {
        poolName: 'Average',
        apy: 'Text',
        totalValueLocked: 10,
        loansUnderManagement: 10,
        totalFunds: 10,
        totalLossRate: 5,
        isStandardPoolRow: false,
      },
      {
        poolName: 'Total',
        apy: 'Text',
        totalValueLocked: 10,
        loansUnderManagement: 10,
        totalFunds: 10,
        totalLossRate: 'Text',
        isStandardPoolRow: false,
      },
    ]

    return [...mergedPoolsData, ...averageAndTotalRows]
  }, [pools, poolDelegates])

  const headers: CustomTableHeader<TableData>[] = useMemo(
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

  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2 }} elevation={1}>
      <CustomTable
        headers={headers}
        data={tableData}
        pagination={false}
        defaultSortKey='poolName'
        handleSort={handleSort}
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
          sortedData.map((data, index) =>
            data.isStandardPoolRow ? (
              <TableRow key={index}>
                <TableCell align='left' width='30%'>
                  <Box display='flex' alignItems='center' mb={1}>
                    <PoolAvatar
                      src={data?.thumbnailImageUrl}
                      name={data?.poolName}
                      showActiveStatus
                    />
                    <Typography variant='h6' component='h1' ml={1}>
                      {data?.poolName || 'N/A'}
                    </Typography>
                  </Box>
                  <Divider />

                  <Box display='flex' justifyContent='space-between' mt={0.5}>
                    <InfoRow
                      title={t(`details.poolDetails.assetClass.label`)}
                      toolTipInfo=''
                      metric={
                        <Typography variant='subtitle2'>
                          {data?.assetClass || 'N/A'}
                        </Typography>
                      }
                      sx={{ p: 0 }}
                    />
                  </Box>
                  <Button
                    sx={{ height: 30, width: 97, p: '4px 10px', mt: 1 }}
                    variant='outlined'
                    startIcon={<ReceiptIcon />}
                    href='#'
                    target='_blank'
                  >
                    VIEW
                  </Button>
                </TableCell>
                <TableCell align='right'>
                  <Box
                    display='flex'
                    justifyContent='flex-end'
                    flexDirection='column'
                  >
                    {data.tranches.map((tranche, index) => {
                      const isMultiTranche = data.tranches.length > 1

                      if (!isMultiTranche) {
                        return (
                          <Typography
                            key={tranche.id}
                            variant='subtitle2'
                            sx={{ pl: 2, mt: 0.5 }}
                          >
                            {formatPercentage(tranche.apy)}
                          </Typography>
                        )
                      }

                      return (
                        <Box key={tranche.apy}>
                          <Typography pt={0.5}>
                            {formatPercentage(tranche.apy)}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            component='p'
                            pb={0.5}
                          >
                            {isMultiTranche
                              ? t(
                                  `lending.tranche.${tranche.name.toLowerCase()}.title`
                                )
                              : ''}
                          </Typography>

                          {index < data.tranches.length - 1 && <Divider />}
                        </Box>
                      )
                    })}
                  </Box>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='subtitle2'>
                    {formatAmount(data.totalValueLocked)} M
                    <Typography variant='caption'> USDC</Typography>
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='subtitle2'>
                    {formatAmount(data.loansUnderManagement)} M
                    <Typography variant='caption'> USDC</Typography>
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='subtitle2'>
                    {formatAmount(data?.totalFunds)} M
                    <Typography variant='caption'> USDC</Typography>
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='subtitle2'>
                    {formatPercentage(data?.totalLossRate || 0)}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow
                key={index}
                sx={(theme) => ({
                  background: alpha(theme.palette.primary.main, 0.08),
                })}
              >
                <TableCell align='left'>
                  <Typography variant='subtitle2'>{data.poolName}</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='h6'>{data.apy}</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='h6'>
                    {data.totalValueLocked} M{' '}
                    <Typography variant='body2' component='span'>
                      USDC
                    </Typography>
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='h6'>
                    {data.loansUnderManagement} M{' '}
                    <Typography variant='body2' component='span'>
                      USDC
                    </Typography>
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='h6'>
                    {data.totalFunds} M{' '}
                    <Typography variant='body2' component='span'>
                      USDC
                    </Typography>
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='h6'>
                    {data.poolName === 'Total'
                      ? data?.totalLossRate
                      : formatPercentage(data?.totalLossRate) || 0}
                  </Typography>
                </TableCell>
              </TableRow>
            )
          )
        }
      </CustomTable>
    </Card>
  )
}

export default ClosedPoolsTable
