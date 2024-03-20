import { Card, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import { CustomTableHeader } from '@/components/molecules/CustomTable/TableHeaders'
import ReportingTableRow from '@/components/molecules/risk/reportingTable/ReportingTableRow'

import { reportingMock } from '@/app/mock-data/risk-data'
import { ReportingTableKeys } from '@/constants/riskReporting'

export type ReportingData = {
  category: string
  description: string
  uploadDate: number
  version: string
  actionUrl: string
}

const handleSort = (
  _a: ReportingData,
  _b: ReportingData,
  _sort: Sort<ReportingData>
): number => {
  return 0
}

const ReportingTable: React.FC = () => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<ReportingData>[] = [
    {
      label: t('risk.reporting.headers.column-1'),
      value: ReportingTableKeys.CATEGORY,
      disableSort: true,
    },
    {
      label: t('risk.reporting.headers.column-2'),
      value: ReportingTableKeys.UPLOAD_DATE,
      disableSort: true,
    },
    {
      label: t('risk.reporting.headers.column-3'),
      value: ReportingTableKeys.VERSION,
      disableSort: true,
    },
    {
      label: t('risk.reporting.headers.column-4'),
      value: ReportingTableKeys.ACTION_URL,
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
        data={reportingMock}
        handleSort={handleSort}
        defaultSortKey={ReportingTableKeys.CATEGORY}
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
