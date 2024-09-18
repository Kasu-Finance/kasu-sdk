import { Box, TableCell, TableRow, Typography } from '@mui/material'

const BadAndDoubtfulDebtsTableHeader = () => (
  <>
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          pb: 0,
        },
      }}
    >
      <TableCell width='25%' />
      <TableCell width='25%'>
        <Typography variant='baseMdBold'>Total (Lifetime)</Typography>
      </TableCell>
      <TableCell width='25%'>
        <Typography variant='baseMdBold'>
          Monthly Average (Last 12 Months)
        </Typography>
      </TableCell>
      <TableCell width='25%'>
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
      <TableCell>
        <Box display='flex'>
          <Typography variant='inherit' flex={1}>
            Amount
          </Typography>
          <Typography variant='inherit' width='70px'>
            %
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box display='flex'>
          <Typography variant='inherit' flex={1}>
            Amount
          </Typography>
          <Typography variant='inherit' width='70px'>
            %
          </Typography>
        </Box>
      </TableCell>{' '}
      <TableCell>
        <Box display='flex'>
          <Typography variant='inherit' flex={1}>
            Amount
          </Typography>
          <Typography variant='inherit' width='70px'>
            %
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  </>
)

export default BadAndDoubtfulDebtsTableHeader
