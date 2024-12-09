import { Box, TableCell, TableRow, Typography } from '@mui/material'
import { ReactNode } from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'
import ToolTip from '@/components/atoms/ToolTip'

type WithdrawalRequestsTableRowProps = {
  title: string
  tooltipInfo: ReactNode
  currentEpochValue: string
  totalLifetimeValue: string
  variant?: 'primary' | 'secondary'
}

const WithdrawalRequestsTableRow: React.FC<WithdrawalRequestsTableRowProps> = ({
  title,
  tooltipInfo,
  currentEpochValue,
  totalLifetimeValue,
  variant = 'primary',
}) => {
  return (
    <>
      <TableRow
        sx={{
          '.MuiTableCell-root': {
            bgcolor: variant === 'primary' ? 'gray.extraLight' : undefined,
            '&:first-child': {
              pl: variant === 'primary' ? 4 : 2,
            },
          },
        }}
      >
        <TableCell>
          <Box display='flex' alignItems='center'>
            <Typography
              variant={variant === 'primary' ? 'baseMd' : 'baseMdBold'}
            >
              {title}
            </Typography>
            <ToolTip title={tooltipInfo} />
          </Box>
        </TableCell>
        <TableCell align='right'>
          <Typography variant='baseMdBold'>{currentEpochValue}</Typography>
        </TableCell>
        <TableCell align='right'>
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
