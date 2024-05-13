import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import { FinancialReportingDocumentsDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, {
  CustomTableHeader,
  Sort,
} from '@/components/molecules/CustomTable'
import ReportingTableRow from '@/components/molecules/risk/ReportingTable/ReportingTableRow'

const handleSort = (
  _a: FinancialReportingDocumentsDirectus,
  _b: FinancialReportingDocumentsDirectus,
  _sort: Sort<string[]>
): number => {
  return 0
}

interface ReportingTableProps {
  data: FinancialReportingDocumentsDirectus[]
}

const ReportingTable: React.FC<ReportingTableProps> = ({ data }) => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<string[]>[] = [
    {
      label: (
        <Box>
          {t('risk.reporting.headers.column-1')}
          <br />
          <Typography display='block' variant='caption' component='span'>
            {t('risk.reporting.headers.column-1-suffix')}
          </Typography>
        </Box>
      ),
      value: 'name',
      disableSort: true,
      styles: { width: '65%', fontSize: '14px', fontFamily: 'Barlow' },
    },
    {
      label: t('risk.reporting.headers.column-2'),
      value: 'uploadTimestamp',
      disableSort: true,
      styles: { width: '18%', fontSize: '14px', fontFamily: 'Barlow' },
    },
    {
      label: t('risk.reporting.headers.column-3'),
      value: 'version',
      disableSort: true,
      styles: { width: '8.5%', fontSize: '14px', fontFamily: 'Barlow' },
    },
    {
      label: t('risk.reporting.headers.column-4'),
      value: 'documentUrl',
      disableSort: true,
      styles: { width: '8.5%', fontSize: '14px', fontFamily: 'Barlow' },
    },
  ]

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant='h6'>{t('risk.reporting.title')}</Typography>
        }
      />
      <CardContent sx={{ padding: 2 }}>
        <CustomTable
          headers={headers}
          data={data}
          handleSort={handleSort}
          sortKeys={[]}
          defaultSortKey='name'
          headersStyle={{
            '& .MuiTableCell-root': {
              py: '6px',
              px: 2,
              verticalAlign: 'bottom',
              fontSize: '14px',
              fontFamily: 'Barlow',
            },
          }}
        >
          {(sortedData) =>
            sortedData.map((data, index) => (
              <ReportingTableRow key={index} data={data} index={index} />
            ))
          }
        </CustomTable>
      </CardContent>
    </Card>
  )
}

export default ReportingTable
