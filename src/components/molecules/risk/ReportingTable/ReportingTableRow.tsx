import {
  Box,
  Divider,
  styled,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { FinancialReportingDocumentsItemsDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import React from 'react'

import ActionCell from '@/components/molecules/risk/ReportingTable/ActionCell'

import dayjs from '@/dayjs'
import { formatAmount, formatTimestamp } from '@/utils'

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
  width: '19.2px',
  height: '19.2px',
  color: theme.palette.primary.contrastText,
  fontSize: '9.6px',
  padding: '8px',
  lineHeight: 26,
}))

interface ReportingTableRowProps {
  data: FinancialReportingDocumentsItemsDirectus
  index: number
}

const ReportingTableRow: React.FC<ReportingTableRowProps> = ({
  data,
  index,
}) => {
  const formattedTime = formatTimestamp(dayjs(data.date_created).unix(), {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <StyledTableRow>
      <TableCell align='left' width='50%'>
        <Box display='flex' alignItems='center'>
          <CircularTypography variant='body2'>{index + 1}</CircularTypography>
          <Box ml={3} display='flex' flexDirection='column'>
            <Typography variant='subtitle1' pb={0.5}>
              {data.name}
            </Typography>
            <Divider />
            <Typography variant='body2' sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              {data.description}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body1'>{formattedTime.date}</Typography>
        <Typography variant='body2' color='grey.500' sx={{ fontSize: 12 }}>
          {formattedTime.timestamp} {formattedTime.utcOffset}
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body1'>
          {formatAmount(data.version, { minDecimals: 2 })}
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <ActionCell actionUrl={data.document} />
      </TableCell>
    </StyledTableRow>
  )
}

export default ReportingTableRow
