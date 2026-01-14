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
        whiteSpace: 'normal',
        '.MuiTableCell-root': {
          ...(showBorder
            ? { borderColor: 'gray.extraDark' }
            : { border: 'none' }),
          px: 1,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          '&:first-child': {
            pl: 0,
          },
          '&:last-child': {
            pr: 0,
          },
        },
      }}
    >
      <TableCell width='10%'>Epoch</TableCell>
      <TableCell width='24%'>Date</TableCell>
      <TableCell width='26%'>Transaction</TableCell>
      <TableCell width='12%' align='right'>
        Amount
      </TableCell>
      <TableCell width='23%' align={isWithdrawal ? 'right' : 'left'}>
        {isWithdrawal ? 'Remaing Amount Queued' : 'Status/Outcome'}
      </TableCell>
      <TableCell width='5%'>TX</TableCell>
    </TableRow>
  </TableHead>
)

export default TraansactionHistoryTableHeader
