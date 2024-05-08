import { Card, TableCell, TableRow, Typography } from '@mui/material'
import { PoolCreditMetricsDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

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

  const headers: CustomTableHeader<string[]>[] = useMemo(
    () => [
      {
        label: t('risk.poolCredit.headers.column-1'),
        value: 'keyCreditMetric',
        disableSort: true,
        styles: { width: '47%' },
      },
      {
        label: t('risk.poolCredit.headers.column-2'),
        value: 'previousFiscalYear',
        disableSort: true,
        styles: { width: '17%' },
      },
      {
        label: t('risk.poolCredit.headers.column-3'),
        value: 'mostRecentQuarter',
        disableSort: true,
        styles: { width: '19%' },
      },
      {
        label: t('risk.poolCredit.headers.column-4'),
        value: 'priorMonth',
        disableSort: true,
        styles: { width: '17%' },
      },
    ],
    [t]
  )

  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2 }} elevation={1}>
      <Typography variant='h6' component='h2' mb={3}>
        {t('risk.poolCredit.title')}
      </Typography>

      <CustomTable
        headers={headers}
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
            <TableRow key={index}>
              <TableCell width='30%' align='left'>
                {data.keyCreditMetric}
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {index < 2
                    ? `${formatAmount(data.previousFiscalYear)} x`
                    : formatPercentage(data.previousFiscalYear)}
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {index < 2
                    ? `${formatAmount(data.mostRecentQuarter)} x`
                    : formatPercentage(data.mostRecentQuarter)}
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {index < 2
                    ? `${formatAmount(data.priorMonth)} x`
                    : formatPercentage(data.priorMonth)}
                </Typography>
              </TableCell>
            </TableRow>
          ))
        }
      </CustomTable>
    </Card>
  )
}

export default PoolCreditTable
