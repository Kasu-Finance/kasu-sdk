import {
  alpha,
  Card,
  CardContent,
  CardHeader,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { BadAndDoubtfulDebts } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import CustomTable from '@/components/molecules/CustomTable'
import BadDebtsCell from '@/components/molecules/risk/BadDebtsTable/BadDebtsCell'
import BadDebtsMobileRow from '@/components/molecules/risk/BadDebtsTable/BadDebtsMobileRow'
import DataTypography from '@/components/molecules/risk/BadDebtsTable/DataTypography'

type BadDebtsTableProps = {
  data: BadAndDoubtfulDebts
}

const BadDebtsTable: React.FC<BadDebtsTableProps> = ({ data }) => {
  const { t } = useTranslation()

  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant='h6' fontSize={isMobile ? 16 : undefined}>
            {t('risk.badDebts.title')}
          </Typography>
        }
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            height: 42,
            p: 1,
          },
        })}
      />

      <CardContent sx={{ padding: 2 }}>
        <CustomTable
          headers={() =>
            isMobile ? null : (
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
                  <BadDebtsCell value={[t('general.amount'), '%']} />
                  <BadDebtsCell value={[t('general.amount'), '%']} />
                  <BadDebtsCell value={[t('general.amount'), '%']} />
                </TableRow>
              </>
            )
          }
          sortKeys={['']}
          data={data.items}
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
            sortedData.map((data, index) =>
              isMobile ? (
                <BadDebtsMobileRow key={index} data={data} />
              ) : (
                <TableRow key={index}>
                  <TableCell align='left' width='10%'>
                    <DataTypography
                      data={data.item.name}
                      toolTip={data.item.tooltip}
                      isLabel
                    />
                  </TableCell>
                  <BadDebtsCell
                    value={[
                      <DataTypography
                        data={data.totalLifetimeAmount}
                        suffix={data.item.unit ?? 'USDC'}
                        key={1}
                      />,
                      <DataTypography
                        data={data.totalLifetimePercentage}
                        suffix={data.item.unit ?? '%'}
                        key={2}
                      />,
                    ]}
                  />
                  <BadDebtsCell
                    value={[
                      <DataTypography
                        data={data.monthlyAverageAmount}
                        suffix={data.item.unit ?? 'USDC'}
                        key={1}
                      />,
                      <DataTypography
                        data={data.monthlyAveragePercentage}
                        suffix={data.item.unit ?? '%'}
                        key={2}
                      />,
                    ]}
                  />
                  <BadDebtsCell
                    value={[
                      <DataTypography
                        data={data.currentAmount}
                        suffix={data.item.unit ?? 'USDC'}
                        key={1}
                      />,
                      <DataTypography
                        data={data.currentPercentage}
                        suffix={data.item.unit ?? '%'}
                        key={2}
                      />,
                    ]}
                  />
                </TableRow>
              )
            )
          }
        </CustomTable>
      </CardContent>
    </Card>
  )
}

export default BadDebtsTable
