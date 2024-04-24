import { Card, Typography } from '@mui/material'
import { FinancialReportingDocumentsDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import { CustomTableHeader } from '@/components/molecules/CustomTable/TableHeaders'
import ReportingTableRow from '@/components/molecules/risk/ReportingTable/ReportingTableRow'

const handleSort = (
  _a: FinancialReportingDocumentsDirectus,
  _b: FinancialReportingDocumentsDirectus,
  _sort: Sort<FinancialReportingDocumentsDirectus>
): number => {
  return 0
}

interface ReportingTableProps {
  data: FinancialReportingDocumentsDirectus[]
}

const ReportingTable: React.FC<ReportingTableProps> = ({ data }) => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<FinancialReportingDocumentsDirectus>[] = [
    {
      label: t('risk.reporting.headers.column-1'),
      extraLabel: {
        text: t('risk.reporting.headers.column-1-suffix'),
        props: {
          variant: 'caption',
          component: 'p',
          sx: { fontSize: 12, mt: -0.3 },
        },
      },
      value: 'name',
      disableSort: true,
    },
    {
      label: t('risk.reporting.headers.column-2'),
      value: 'uploadTimestamp',
      disableSort: true,
    },
    {
      label: t('risk.reporting.headers.column-3'),
      value: 'version',
      disableSort: true,
    },
    {
      label: t('risk.reporting.headers.column-4'),
      value: 'documentUrl',
      disableSort: true,
    },
  ]

  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2, mt: 3 }} elevation={1}>
      <Typography variant='h6' component='h2' mb={3}>
        {t('risk.reporting.title')}
      </Typography>
      <CustomTable
        headers={headers}
        data={data}
        handleSort={handleSort}
        defaultSortKey='name'
        headersStyle={{ '& > *': { pb: 1, pt: 1.5 } }}
      >
        {(sortedData) =>
          sortedData.map((data, index) => (
            <ReportingTableRow key={index} data={data} index={index} />
          ))
        }
      </CustomTable>
    </Card>
  )
}

export default ReportingTable
