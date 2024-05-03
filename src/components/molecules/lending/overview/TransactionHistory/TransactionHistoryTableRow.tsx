import ChevronRight from '@mui/icons-material/ChevronRight'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  alpha,
  Box,
  Button,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { memo } from 'react'

import useModalState from '@/hooks/context/useModalState'

import TokenAmount from '@/components/atoms/TokenAmount'
import TransactionCollapsedContent from '@/components/molecules/lending/overview/TransactionHistory/TransactionCollapsedContent'

import { DATE_FORMAT, TIME_FORMAT } from '@/constants'
import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

type TransactionHistoryTableRowProps = {
  transaction: UserRequest

  isActive: boolean
  handleCollapse: () => void
}

const TransactionHistoryTableRow: React.FC<TransactionHistoryTableRowProps> = ({
  handleCollapse,
  transaction,
  isActive,
}) => {
  const { openModal } = useModalState()

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()

    openModal({
      name:
        transaction.requestType === 'Deposit'
          ? 'cancelDepositModal'
          : 'cancelWithdrawalModal',
      transactionHistory: transaction,
    })
  }

  return (
    <>
      <TableRow
        onClick={handleCollapse}
        hover={!isActive}
        sx={(theme) => ({
          cursor: 'pointer',
          height: '90px',
          '.MuiTableCell-root': {
            borderBottom: '0px',
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
        <TableCell>{transaction.trancheName}</TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(transaction.requestedAmount)}
            symbol='USDC'
            sx={{ width: '100%', textAlign: 'right' }}
          />
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(transaction.acceptedAmount)}
            symbol='USDC'
            sx={{ width: '100%', textAlign: 'right' }}
          />
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(transaction.rejectedAmount)}
            symbol='USDC'
            sx={{ width: '100%', textAlign: 'right' }}
          />
        </TableCell>
        <TableCell align='right'>
          <Typography variant='body1' component='span'>
            {dayjs.unix(transaction.timestamp).format(DATE_FORMAT)}
          </Typography>
          <br />
          <Typography variant='caption' component='span'>
            {dayjs.unix(transaction.timestamp).format(TIME_FORMAT)}
          </Typography>
        </TableCell>
        <TableCell align='center'>
          <Typography variant='body2' component='span' display='block'>
            {transaction.status}
          </Typography>
          {transaction.canCancel && (
            <Button
              sx={{ width: 'auto', height: 30, pl: 1.25, pr: 1.25, mt: 0.75 }}
              size='small'
              variant='contained'
              startIcon={<DeleteIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} padding='none'>
          <Collapse in={isActive} timeout='auto' unmountOnExit>
            <Table>
              <TableBody>
                {transaction.events.map((action) => (
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
}

export default memo(TransactionHistoryTableRow)
