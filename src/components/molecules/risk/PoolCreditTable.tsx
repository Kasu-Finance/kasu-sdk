import {
  Card,
  CardContent,
  CardHeader,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { PoolCreditMetricsDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import { Fragment, useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import ToolTip from '@/components/atoms/ToolTip'
import CustomTable, {
  CustomTableHeader,
  Sort,
} from '@/components/molecules/CustomTable'

import { formatAmount, formatPercentage } from '@/utils'

const handleSort = (
  _a: PoolCreditMetricsDirectus,
  _b: PoolCreditMetricsDirectus,
  _sort: Sort<string[]>
): number => {
  return 0
}

interface PoolCreditTableProps {
  data: PoolCreditMetricsDirectus[]
}

const PoolCreditTable: React.FC<PoolCreditTableProps> = ({ data }) => {
  const { t } = useTranslation()

  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  const headers: CustomTableHeader<string[]>[] = useMemo(
    () => [
      {
        label: t('risk.poolCredit.headers.column-1'),
        value: 'keyCreditMetric',
        disableSort: true,
        styles: { width: '47%', fontSize: '14px', fontFamily: 'Barlow' },
      },
      {
        label: t('risk.poolCredit.headers.column-2'),
        value: 'previousFiscalYear',
        disableSort: true,
        styles: { width: '17%', fontSize: '14px', fontFamily: 'Barlow' },
      },
      {
        label: t('risk.poolCredit.headers.column-3'),
        value: 'mostRecentQuarter',
        disableSort: true,
        styles: { width: '19%', fontSize: '14px', fontFamily: 'Barlow' },
      },
      {
        label: t('risk.poolCredit.headers.column-4'),
        value: 'priorMonth',
        disableSort: true,
        styles: { width: '17%', fontSize: '14px', fontFamily: 'Barlow' },
      },
    ],
    [t]
  )

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title={
          <Typography variant='h6' fontSize={isMobile ? 16 : undefined}>
            {t('risk.poolCredit.title')}
          </Typography>
        }
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            height: 42,
            p: 1,
          },
        })}
      />
      <CardContent
        sx={(theme) => ({
          padding: 2,
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        })}
      >
        <CustomTable
          headers={!isMobile ? headers : []}
          data={data}
          pagination={false}
          defaultSortKey='poolIdFK'
          handleSort={handleSort}
          sortKeys={[]}
          headersStyle={{
            '& .MuiTableCell-root': {
              py: '6px',
              px: 2,
            },
          }}
        >
          {(sortedData) =>
            sortedData.map((data, index) => (
              <Fragment key={index}>
                {isMobile && (
                  <TableRow
                    sx={(theme) => ({
                      [theme.breakpoints.down('sm')]: {
                        '.MuiTableCell-root': {
                          px: 0,
                          pb: 0,
                          border: 'none',
                        },
                      },
                    })}
                  >
                    <TableCell
                      width='30%'
                      align='left'
                      colSpan={3}
                      sx={(theme) => ({
                        ...theme.typography.subtitle1,
                        fontSize: 12,
                      })}
                    >
                      {data.keyCreditMetric}
                      {data.tooltip && (
                        <ToolTip
                          iconSx={{
                            position: 'relative',
                            top: '5px',
                          }}
                          title={data.tooltip}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow
                  sx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      '.MuiTableCell-root': {
                        px: 0,
                        pt: 0,
                      },
                    },
                  })}
                >
                  {!isMobile && (
                    <TableCell width='30%' align='left'>
                      {data.keyCreditMetric}
                      {data.tooltip && (
                        <ToolTip
                          iconSx={{
                            position: 'relative',
                            top: '5px',
                          }}
                          title={data.tooltip}
                        />
                      )}
                    </TableCell>
                  )}
                  <TableCell align={isMobile ? 'left' : 'right'}>
                    {isMobile && (
                      <Typography
                        variant='caption'
                        component='span'
                        fontSize={10}
                      >
                        {t('risk.poolCredit.headers.column-2')}
                      </Typography>
                    )}
                    <Typography variant='body1'>
                      {index < 2
                        ? `${formatAmount(data.previousFiscalYear || '0', { minDecimals: 2 })} x`
                        : formatPercentage(data.previousFiscalYear)}
                    </Typography>
                  </TableCell>
                  <TableCell align={isMobile ? 'left' : 'right'}>
                    {isMobile && (
                      <Typography
                        variant='caption'
                        component='span'
                        fontSize={10}
                      >
                        {t('risk.poolCredit.headers.column-3')}
                      </Typography>
                    )}
                    <Typography variant='body1'>
                      {index < 2
                        ? `${formatAmount(data.mostRecentQuarter || '0', { minDecimals: 2 })} x`
                        : formatPercentage(data.mostRecentQuarter)}
                    </Typography>
                  </TableCell>
                  <TableCell align={isMobile ? 'left' : 'right'}>
                    {isMobile && (
                      <Typography
                        variant='caption'
                        component='span'
                        fontSize={10}
                      >
                        {t('risk.poolCredit.headers.column-4')}
                      </Typography>
                    )}
                    <Typography variant='body1'>
                      {index < 2
                        ? `${formatAmount(data.priorMonth || '0', { minDecimals: 2 })} x`
                        : formatPercentage(data.priorMonth)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))
          }
        </CustomTable>
      </CardContent>
    </Card>
  )
}

export default PoolCreditTable
