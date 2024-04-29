import { alpha, Card, TableCell, TableRow, Typography } from '@mui/material'
import { BadAndDoubtfulDebtsDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable from '@/components/molecules/CustomTable'
import BadDebtsCell from '@/components/molecules/risk/BadDebtsTable/BadDebtsCell'
import DataTypography from '@/components/molecules/risk/BadDebtsTable/DataTypography'

import { formatAmount, formatPercentage } from '@/utils'

interface BadDebtsTableProps {
  data: BadAndDoubtfulDebtsDirectus[]
}

export interface ExtendedBadAndDoubtfulDebts
  extends BadAndDoubtfulDebtsDirectus {
  empty: string
}

const BadDebtsTable: React.FC<BadDebtsTableProps> = ({ data }) => {
  const { t } = useTranslation()

  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2, mt: 3 }} elevation={1}>
      <Typography variant='h6' component='h2' mb={3}>
        {t('risk.badDebts.title')}
      </Typography>

      <CustomTable
        headers={() => (
          <>
            <TableRow
              sx={(theme) => ({
                background: alpha(theme.palette.primary.main, 0.08),
              })}
            >
              <TableCell width='25%' rowSpan={2} />
              <TableCell align='center' width='25%'>
                {t('risk.badDebts.headers.column-1')}{' '}
                <Typography component='span' variant='caption'>
                  {t('risk.badDebts.headers.column-1-suffix')}
                </Typography>
              </TableCell>
              <TableCell align='center' width='25%'>
                {t('risk.badDebts.headers.column-2')}{' '}
                <Typography component='span' variant='caption'>
                  {t('risk.badDebts.headers.column-2-suffix')}
                </Typography>
              </TableCell>
              <TableCell align='center' width='25%'>
                {t('risk.badDebts.headers.column-3')}
              </TableCell>
            </TableRow>
            <TableRow
              sx={(theme) => ({
                background: alpha(theme.palette.primary.main, 0.08),
              })}
            >
              <BadDebtsCell value={['Amount', '%']} />
              <BadDebtsCell value={['Amount', '%']} />
              <BadDebtsCell value={['Amount', '%']} />
            </TableRow>
          </>
        )}
        sortKeys={[]}
        data={data as ExtendedBadAndDoubtfulDebts[]}
        pagination={false}
        defaultSortKey='totalAmount' // not needed
        handleSort={() => 0} // not needed
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
              <TableCell align='left' width='10%'>
                <DataTypography data={data.name} />
              </TableCell>
              <BadDebtsCell
                value={[
                  <DataTypography
                    data={formatAmount(data.totalAmount)}
                    suffix='USDC'
                    key={1}
                  />,
                  <DataTypography
                    data={formatPercentage(data.totalPercentage)}
                    key={2}
                  />,
                ]}
              />
              <BadDebtsCell
                value={[
                  <DataTypography
                    data={formatAmount(data.monthlyAverageAmount)}
                    suffix='USDC'
                    key={1}
                  />,
                  <DataTypography
                    data={formatPercentage(data.monthlyAveragePercentage)}
                    key={2}
                  />,
                ]}
              />
              <BadDebtsCell
                value={[
                  <DataTypography
                    data={formatAmount(data.currentStatusAmount)}
                    suffix='USDC'
                    key={1}
                  />,
                  <DataTypography
                    data={formatPercentage(data.currentStatusPercentage)}
                    key={2}
                  />,
                ]}
              />
            </TableRow>
          ))
        }
      </CustomTable>
    </Card>
  )
}

export default BadDebtsTable
