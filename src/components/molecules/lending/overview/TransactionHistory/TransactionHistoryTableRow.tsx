import ChevronRight from '@mui/icons-material/ChevronRight'
import DeleteIcon from '@mui/icons-material/Delete'
import ChevronRightCircle from '@mui/icons-material/ExpandCircleDown'
import {
  alpha,
  Box,
  Button,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { memo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import TokenAmount from '@/components/atoms/TokenAmount'
import TransactionCollapsedContent from '@/components/molecules/lending/overview/TransactionHistory/TransactionCollapsedContent'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount, formatTimestamp } from '@/utils'

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

  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()

    openModal({
      name:
        transaction.requestType === 'Deposit'
          ? ModalsKeys.CANCEL_DEPOSIT
          : ModalsKeys.CANCEL_WITHDRAWAL,
      transactionHistory: transaction,
    })
  }

  const formattedTime = formatTimestamp(transaction.timestamp, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <>
      <TableRow
        onClick={handleCollapse}
        hover={!isActive}
        sx={(theme) => ({
          cursor: 'pointer',
          height: isMobile ? '54px' : '90px',
          '.MuiTableCell-root': {
            borderBottom: '0px',
            ...(isActive && {
              borderColor: 'rgba(0,0,0,0)',
              background: alpha(theme.palette.primary.main, 0.08),
            }),
            transition: 'border-color 0.3s ease, background 0.3s ease',

            [theme.breakpoints.down('sm')]: {
              p: 0,
              '& .MuiTypography-root': {
                fontSize: 10,
              },
            },
          },
          transition: 'background-color 0.3s ease',
          '&.MuiTableRow-hover:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        })}
      >
        <TableCell align='center' sx={{ pl: isMobile ? 0 : undefined }}>
          <Box display='flex' alignItems='center'>
            {!isMobile && (
              <ChevronRight
                sx={{
                  transform: `rotate(${isActive ? '-' : ''}90deg)`,
                  transition: 'transform 0.3s ease',
                  mr: 3,
                }}
              />
            )}
            <Typography variant='body1' component='span'>
              {transaction.requestType === 'Deposit'
                ? 'Lending'
                : transaction.requestType}
            </Typography>
          </Box>
        </TableCell>
        {!isMobile && (
          <TableCell align='center'>{transaction.trancheName}</TableCell>
        )}
        {!isMobile && (
          <TableCell align='right'>
            <TokenAmount
              amount={formatAmount(transaction.requestedAmount || '0')}
              amountProps={{ variant: 'body1' }}
              symbol='USDC'
              symbolProps={{ variant: 'caption' }}
              sx={{ width: '100%', textAlign: 'right' }}
            />
          </TableCell>
        )}
        <TableCell
          align={isMobile ? 'left' : 'right'}
          width={isMobile ? '32%' : undefined}
        >
          <TokenAmount
            amount={formatAmount(transaction.acceptedAmount || '0')}
            amountProps={{ variant: 'body1' }}
            symbol='USDC'
            symbolProps={{ variant: 'caption' }}
            width='100%'
            textAlign={isMobile ? 'left' : 'right'}
          />
        </TableCell>
        {!isMobile && (
          <TableCell align='right'>
            <TokenAmount
              amount={formatAmount(transaction.rejectedAmount || '0')}
              amountProps={{ variant: 'body1' }}
              symbol='USDC'
              symbolProps={{ variant: 'caption' }}
              sx={{ width: '100%', textAlign: 'right' }}
            />
          </TableCell>
        )}
        <TableCell
          align={isMobile ? 'left' : 'right'}
          width={isMobile ? '25%' : undefined}
        >
          <Typography variant='body1' component='span'>
            {formattedTime.date}
          </Typography>
          {!isMobile && (
            <>
              <br />
              <Typography variant='caption' component='span'>
                {formattedTime.timestamp} {formattedTime.utcOffset}
              </Typography>
            </>
          )}
        </TableCell>
        <TableCell align={isMobile ? 'left' : 'center'}>
          <Typography
            variant='body2'
            component='span'
            display={isMobile ? 'inline-block' : 'block'}
          >
            {transaction.status}
          </Typography>
          {!isMobile && transaction.canCancel && (
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
          {isMobile && (
            <IconButton
              sx={{
                '& .MuiSvgIcon-root': {
                  transform: 'rotate(-90deg)',
                  width: 16,
                  height: 16,
                  fill: '#C7A377',
                },
              }}
            >
              <ChevronRightCircle />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      {!isMobile && (
        <TableRow>
          <TableCell colSpan={7} padding='none'>
            <Collapse in={isActive} timeout='auto' unmountOnExit>
              <Table>
                <TableBody>
                  {transaction.events.map((action) => (
                    <TransactionCollapsedContent
                      key={action.id}
                      actionHistory={action}
                      requestTrancheName={transaction?.trancheName || ''}
                    />
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default memo(TransactionHistoryTableRow)
