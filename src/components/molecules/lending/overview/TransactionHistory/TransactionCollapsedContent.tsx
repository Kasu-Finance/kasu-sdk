import Receipt from '@mui/icons-material/Receipt'
import { Button, TableCell, TableRow, Typography } from '@mui/material'

import TokenAmount from '@/components/atoms/TokenAmount'
import { ActionHistory } from '@/components/molecules/lending/overview/TransactionHistory'

import dayjs from '@/dayjs'

type TransactionCollapsedContentProps = {
  actionHistory: ActionHistory
}

const TransactionCollapsedContent: React.FC<
  TransactionCollapsedContentProps
> = ({ actionHistory }) => {
  return (
    <TableRow
      sx={{
        '& .MuiTableCell-root': {
          p: 2,
        },
      }}
    >
      <TableCell width='18%' padding='none'>
        <Typography
          fontSize='inherit'
          fontFamily='inherit'
          fontWeight='inherit'
          display='block'
          pl={6}
        >
          {actionHistory.actionType}
        </Typography>
      </TableCell>
      <TableCell width='18%' align='right' padding='none'>
        <TokenAmount
          amount={actionHistory.requestedAmount}
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell width='18%' align='right' padding='none'>
        <TokenAmount
          amount={actionHistory.acceptedAmount}
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell width='18%' align='right' padding='none'>
        <TokenAmount
          amount={actionHistory.rejectedAmount}
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell width='14%' align='right' padding='none'>
        <Typography variant='body1' component='span'>
          {dayjs.unix(actionHistory.requestDate).format('DD.MM.YYYY')}
        </Typography>
        <br />
        <Typography variant='caption' component='span'>
          {dayjs.unix(actionHistory.requestDate).format('HH:mm:ss UTCZZ')}
        </Typography>
      </TableCell>
      <TableCell width='14%' align='center' padding='none'>
        <Button
          variant='outlined'
          size='small'
          href={actionHistory.txHash}
          target='_blank'
          startIcon={<Receipt />}
          sx={{ height: 30, width: 97 }}
        >
          VIEW TX
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default TransactionCollapsedContent
