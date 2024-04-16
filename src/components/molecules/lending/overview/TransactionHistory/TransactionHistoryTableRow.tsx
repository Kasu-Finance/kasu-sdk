import ChevronRight from '@mui/icons-material/ChevronRight'
import {
  alpha,
  Box,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'

import TokenAmount from '@/components/atoms/TokenAmount'
import { TransactionHistoryType } from '@/components/molecules/lending/overview/TransactionHistory'
import TransactionCollapsedContent from '@/components/molecules/lending/overview/TransactionHistory/TransactionCollapsedContent'

import dayjs from '@/dayjs'

type TransactionHistoryTableRowProps = {
  transaction: TransactionHistoryType

  isActive: boolean
  handleCollapse: () => void
}

const TransactionHistoryTableRow: React.FC<TransactionHistoryTableRowProps> = ({
  handleCollapse,
  transaction,
  isActive,
}) => (
  <>
    <TableRow
      onClick={handleCollapse}
      hover={!isActive}
      sx={(theme) => ({
        cursor: 'pointer',
        '.MuiTableCell-root': {
          ...(isActive && {
            borderColor: 'rgba(0,0,0,0)',
            background: alpha(theme.palette.primary.main, 0.08),
          }),
          transition: 'border-color 0.3s ease, background 0.3s ease',
        },
        transition: 'background-color 0.3s ease',
        '&.MuiTableRow-hover:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
      })}
    >
      <TableCell align='center'>
        <Box display='flex' alignItems='center'>
          <ChevronRight
            sx={{
              transform: `rotate(${isActive ? '-' : ''}90deg)`,
              transition: 'transform 0.3s ease',
              mr: 3,
            }}
          />
          {transaction.requestType}
        </Box>
      </TableCell>
      <TableCell align='right'>
        <TokenAmount
          amount={transaction.requestedAmount}
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell align='right'>
        <TokenAmount
          amount={transaction.acceptedAmount}
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell align='right'>
        <TokenAmount
          amount={transaction.rejectedAmount}
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body1' component='span'>
          {dayjs.unix(transaction.requestDate).format('DD.MM.YYYY')}
        </Typography>
        <br />
        <Typography variant='caption' component='span'>
          {dayjs.unix(transaction.requestDate).format('HH:mm:ss UTCZZ')}
        </Typography>
      </TableCell>
      <TableCell align='center'>{transaction.status}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell colSpan={7} padding='none'>
        <Collapse in={isActive} timeout='auto' unmountOnExit>
          <Table>
            <TableBody>
              {transaction.actionHistory.map((action) => (
                <TransactionCollapsedContent
                  key={action.id}
                  actionHistory={action}
                />
              ))}
            </TableBody>
          </Table>
        </Collapse>
      </TableCell>
    </TableRow>
  </>
)

export default TransactionHistoryTableRow
