import {
  alpha,
  Card,
  CardContent,
  CardHeader,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { BadAndDoubtfulDebtsDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable from '@/components/molecules/CustomTable'
import BadDebtsCell from '@/components/molecules/risk/BadDebtsTable/BadDebtsCell'
import DataTypography from '@/components/molecules/risk/BadDebtsTable/DataTypography'

type BadDebtsTableProps = {
  data: (Pick<
    BadAndDoubtfulDebtsDirectus,
    'id' | 'poolIdFK' | 'name' | 'tooltip'
  > & {
    totalAmount: string
    totalPercentage: string
    monthlyAverageAmount: string
    monthlyAveragePercentage: string
    currentStatusAmount: string
    currentStatusPercentage: string
  })[]
}

const BadDebtsTable: React.FC<BadDebtsTableProps> = ({ data }) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader
        title={<Typography variant='h6'>{t('risk.badDebts.title')}</Typography>}
      />

      <CardContent sx={{ padding: 2 }}>
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
                  <Typography component='span' variant='body1'>
                    {t('risk.badDebts.headers.column-1')}{' '}
                  </Typography>
                  <Typography component='span' variant='caption'>
                    {t('risk.badDebts.headers.column-1-suffix')}
                  </Typography>
                </TableCell>
                <TableCell align='center' width='25%'>
                  <Typography component='span' variant='body1'>
                    {t('risk.badDebts.headers.column-2')}{' '}
                  </Typography>

                  <Typography component='span' variant='caption'>
                    {t('risk.badDebts.headers.column-2-suffix')}
                  </Typography>
                </TableCell>
                <TableCell align='center' width='25%'>
                  <Typography component='span' variant='body1'>
                    {t('risk.badDebts.headers.column-3')}
                  </Typography>
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
          sortKeys={['']}
          data={data}
          pagination={false}
          defaultSortKey='' // not needed
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
                  <DataTypography data={data.name} toolTip={data.tooltip} />
                </TableCell>
                <BadDebtsCell
                  value={[
                    <DataTypography
                      data={data.totalAmount}
                      suffix=''
                      key={1}
                    />,
                    <DataTypography data={data.totalPercentage} key={2} />,
                  ]}
                />
                <BadDebtsCell
                  value={[
                    <DataTypography
                      data={data.monthlyAverageAmount}
                      suffix=''
                      key={1}
                    />,
                    <DataTypography
                      data={data.monthlyAveragePercentage}
                      key={2}
                    />,
                  ]}
                />
                <BadDebtsCell
                  value={[
                    <DataTypography
                      data={data.currentStatusAmount}
                      suffix=''
                      key={1}
                    />,
                    <DataTypography
                      data={data.currentStatusPercentage}
                      key={2}
                    />,
                  ]}
                />
              </TableRow>
            ))
          }
        </CustomTable>
      </CardContent>
    </Card>
  )
}

export default BadDebtsTable
