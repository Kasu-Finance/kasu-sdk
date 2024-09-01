import { TableCell, TableRow, Typography } from '@mui/material'

const BadAndDoubtfulDebtsTableHeader = () => (
  <>
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          pb: 0,
        },
      }}
    >
      <TableCell />
      <TableCell colSpan={2}>
        <Typography variant='baseMdBold'>Total (Lifetime)</Typography>
      </TableCell>
      <TableCell colSpan={2}>
        <Typography variant='baseMdBold'>
          Monthly Average (Last 12 Months)
        </Typography>
      </TableCell>
      <TableCell colSpan={2}>
        <Typography variant='baseMdBold'>Current Status</Typography>
      </TableCell>
    </TableRow>
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          pt: 0,
        },
      }}
    >
      <TableCell />
      <TableCell>Amount</TableCell>
      <TableCell width='70px'>%</TableCell>
      <TableCell>Amount</TableCell>
      <TableCell width='70px'>%</TableCell>
      <TableCell>Amount</TableCell>
      <TableCell width='70px'>%</TableCell>
    </TableRow>
  </>
)

export default BadAndDoubtfulDebtsTableHeader
