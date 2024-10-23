import { Box, TableCell, TableRow, Typography } from '@mui/material'

import DottedDivider from '@/components/atoms/DottedDivider'
import ToolTip from '@/components/atoms/ToolTip'

type WithdrawalRequestsTableRowProps = {
  title: string
  tooltipInfo: string
  currentEpochValue: string
  totalLifetimeValue: string
}

const WithdrawalRequestsTableRow: React.FC<WithdrawalRequestsTableRowProps> = ({
  title,
  tooltipInfo,
  currentEpochValue,
  totalLifetimeValue,
}) => {
  return (
    <>
      <TableRow sx={{ '.MuiTableCell-root': { px: 0 } }}>
        <TableCell>
          <Box display='flex' alignItems='center'>
            {title}
            <ToolTip title={tooltipInfo} />
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant='baseMdBold'>{currentEpochValue}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant='baseMdBold'>{totalLifetimeValue}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell padding='none' colSpan={3}>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </>
  )
}

export default WithdrawalRequestsTableRow
