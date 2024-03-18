import {
  Box,
  Card,
  Divider,
  styled,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/customTable'
import { CustomTableHeader } from '@/components/molecules/customTable/TableHeaders'
import ActionCell from '@/components/molecules/risk/reportingTable/ActionCell'
import DateDisplay from '@/components/molecules/risk/reportingTable/DateDisplay'
import TextContent from '@/components/molecules/risk/reportingTable/TextContent'

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
        headersStyle={{
          '& > *': {
            pb: 1,
            pt: 1.5,
          },
        }}
      >
        {(sortedData) =>
          sortedData.map((data, index) => (
            <StyledTableRow key={index}>
              <TableCell align='left' width='50%'>
                <Box display='flex' alignItems='center'>
                  <CircularTypography variant='body2'>
                    {index + 1}
                  </CircularTypography>

                  <Box ml={3} display='flex' flexDirection='column'>
                    <Typography variant='subtitle1' pb={0.5}>
                      {data.category}
                    </Typography>

                    <Divider />

                    <TextContent text={data.description} />
                  </Box>
                </Box>
              </TableCell>
              <TableCell align='right'>
                <DateDisplay uploadDate={data.uploadDate} />
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>{data.version}</Typography>
              </TableCell>
              <TableCell align='right'>
                <ActionCell actionUrl={data.actionUrl} />
              </TableCell>
            </StyledTableRow>
          ))
        }
      </CustomTable>
    </Card>
  )
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:last-child': {
    borderBottom: `1px solid ${theme.palette.grey[600]}`,
  },
}))

const CircularTypography = styled(Typography)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  width: '1.3rem',
  height: '1.3rem',
  color: theme.palette.primary.contrastText,
  fontSize: '0.6rem',
}))

export default ReportingTable
