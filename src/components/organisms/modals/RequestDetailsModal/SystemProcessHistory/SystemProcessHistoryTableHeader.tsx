import { TableCell, TableHead, TableRow } from '@mui/material'

type TransactionHistoryTableHeaderProps = {
  showBorder: boolean
  isWithdrawal?: boolean
}

const TraansactionHistoryTableHeader: React.FC<
  TransactionHistoryTableHeaderProps
> = ({ showBorder, isWithdrawal }) => (
  <TableHead>
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          ...(showBorder
            ? { borderColor: 'gray.extraDark' }
            : { border: 'none' }),
          px: 1,
          '&:first-child': {
            pl: 0,
          },
          '&:last-child': {
            pr: 0,
          },
        },
      }}
    >
      <TableCell width='5%'>Epoch</TableCell>
      <TableCell width='20%'>Date</TableCell>
      <TableCell width='30%'>Transaction</TableCell>
      <TableCell width='10%' align='right'>
        Amount
      </TableCell>
      <TableCell width='30%' align={isWithdrawal ? 'right' : 'left'}>
        {isWithdrawal ? 'Remaing Amount Queued' : 'Status/Outcome'}
      </TableCell>
      <TableCell width='5%'>TX</TableCell>
    </TableRow>
  </TableHead>
)

export default TraansactionHistoryTableHeader
