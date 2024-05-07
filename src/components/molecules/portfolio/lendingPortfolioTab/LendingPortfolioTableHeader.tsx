import { alpha, Box, TableCell, TableRow } from '@mui/material'

import ToolTip from '@/components/atoms/ToolTip'

const LendingPortfolioTableHeader = () => (
  <>
    <TableRow
      sx={(theme) => ({
        background: alpha(theme.palette.primary.main, 0.04),
      })}
    >
      <TableCell rowSpan={2} width='17%'>
        Pool
      </TableCell>
      <TableCell rowSpan={2} align='right' width='17%' className='apy'>
        APY
      </TableCell>
      <TableCell rowSpan={2} align='right' width='17%'>
        <Box display='flex' alignItems='center' justifyContent='end'>
          Investment
          <ToolTip title='info' />
        </Box>
      </TableCell>
      <TableCell colSpan={2} align='center' width='48%'>
        Yield Earnings
      </TableCell>
    </TableRow>
    <TableRow
      sx={(theme) => ({
        background: alpha(theme.palette.primary.main, 0.04),
      })}
    >
      <TableCell align='right'>Last Epoch</TableCell>
      <TableCell align='right'>Lifetime</TableCell>
    </TableRow>
  </>
)

export default LendingPortfolioTableHeader
