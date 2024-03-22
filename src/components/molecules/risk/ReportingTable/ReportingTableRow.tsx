import {
  Box,
  Divider,
  styled,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'

import { ReportingData } from '@/components/molecules/risk/ReportingTable'
import ActionCell from '@/components/molecules/risk/ReportingTable/ActionCell'

import { extractDateAndUtcOffset, formatTimestampWithOffset } from '@/utils'

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
  data: ReportingData
  index: number
}

const ReportingTableRow: React.FC<ReportingTableRowProps> = ({
  data,
  index,
}) => {
  const formattedDate = formatTimestampWithOffset(data.uploadDate, 1)
  const { date, time, format, offset } = extractDateAndUtcOffset(formattedDate)

  return (
    <StyledTableRow>
      <TableCell align='left' width='50%'>
        <Box display='flex' alignItems='center'>
          <CircularTypography variant='body2'>{index + 1}</CircularTypography>
          <Box ml={3} display='flex' flexDirection='column'>
            <Typography variant='subtitle1' pb={0.5}>
              {data.category}
            </Typography>
            <Divider />
            <Typography variant='body2' sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              {data.description}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body1'>{date}</Typography>
        <Typography variant='body2' color='grey.500' sx={{ fontSize: 12 }}>
          {time} {format}
          {offset}
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body1'>{data.version}</Typography>
      </TableCell>
      <TableCell align='right'>
        <ActionCell actionUrl={data.actionUrl} />
      </TableCell>
    </StyledTableRow>
  )
}

export default ReportingTableRow
