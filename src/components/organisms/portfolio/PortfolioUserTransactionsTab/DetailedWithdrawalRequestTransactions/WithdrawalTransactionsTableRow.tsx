import {
  Box,
  Button,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { Fragment } from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PaperIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAmount, formatTimestamp } from '@/utils'
import { WithdrawalTransactionWrapper } from '@/utils/lending/getWithdrawalTransactions'

type WithdrawalTransactionsTableRowProps = {
  transactionWrapper: WithdrawalTransactionWrapper
  currentEpoch: string
}

const WithdrawalTransactionsTableRow: React.FC<
  WithdrawalTransactionsTableRowProps
> = ({ transactionWrapper, currentEpoch }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const formattedTime = formatTimestamp(
    transactionWrapper.lastTransactionDate,
    {
      format: 'DD.MM.YYYY',
    }
  )

  const handleDetailsClick = (
    detailedTransaction: WithdrawalTransactionWrapper
  ) =>
    openModal({
      name: ModalsKeys.REQUEST_DETAILS,
      detailedTransaction,
      currentEpoch,
    })

  return (
    <>
      {transactionWrapper.transactions.map((transaction, index) => {
        return (
          <Fragment key={transaction.id}>
            <TableRow
              sx={{
                '.MuiTableCell-root': {
                  ...customTypography.baseSm,
                  lineHeight: '18px',
                  verticalAlign: 'top',
                  whiteSpace: 'normal',
                  position: 'relative',
                  '&:not(:first-child):not(:last-child)': {
                    px: 1,

                    '&:nth-last-child(2)': {
                      pl: index === 0 ? 1.5 : undefined,
                    },
                  },

                  ...(transactionWrapper.transactions.length > 1
                    ? {
                        '&:nth-last-child(2)::after':
                          index === 0
                            ? {
                                content: '""',
                                bgcolor: 'rgba(244, 244, 244, 1)',
                                position: 'absolute',
                                width: 22,
                                height: 22,
                                borderRadius: 1,
                                transform:
                                  'translate(20px, -50%) rotate(45deg)',
                                top: '50%',
                                right: 0,
                                zIndex: 1,
                              }
                            : undefined,
                        '&:last-child':
                          index !== 0
                            ? {
                                px: 1,
                                '&::after': {
                                  content: '""',
                                  bgcolor: 'rgba(244, 244, 244, 1)',
                                  position: 'absolute',
                                  width: 22,
                                  height: 22,
                                  borderRadius: 1,
                                  transform:
                                    'translate(20px, -50%) rotate(45deg)',
                                  top: '50%',
                                  right: 0,
                                  zIndex: 1,
                                },
                              }
                            : undefined,
                      }
                    : undefined),

                  '&.merged': {
                    verticalAlign: 'middle',

                    '.MuiTypography-root, .MuiButton-root': {
                      zIndex: 2,
                    },

                    '&::before': {
                      bgcolor: 'rgba(244, 244, 244, 1)',
                      width: 'calc(100% - 16px)',
                      height: 'calc(100% - 12px)',
                      content: '""',
                      position: 'absolute',
                      top: 6,
                      right: 12,
                      zIndex: 2,
                      borderRadius: 1,
                    },
                  },
                },
              }}
            >
              <TableCell>{formattedTime.date}</TableCell>
              <TableCell>{transaction.lendingPool.name}</TableCell>
              <TableCell>{transaction.trancheName}</TableCell>
              <TableCell>
                <Stack spacing={3}>
                  {transaction.requestStatus !== 'Cancelled' && (
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='end'
                    >
                      <Typography variant='baseSmBold'>
                        Most Recent Withdrawal Accepted
                      </Typography>
                      <Typography variant='baseSmBold'>
                        {transaction.requestStatus === 'Processed'
                          ? `${formatAmount(transaction.lastAcceptedAmount, {
                              minDecimals: 2,
                            })} USDC`
                          : 'N/A'}
                      </Typography>
                    </Box>
                  )}
                  <Stack>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='end'
                    >
                      <Typography variant='baseSmBold'>
                        Original Withdrawal Request
                      </Typography>
                      <Typography variant='baseSmBold'>
                        {formatAmount(transaction.requestedAmount, {
                          minDecimals: 2,
                        })}{' '}
                        USDC
                      </Typography>
                    </Box>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='end'
                    >
                      <Typography variant='baseSm' color='gray.middle'>
                        {transaction.requestStatus === 'Cancelled'
                          ? 'Cancelled'
                          : 'Queued'}
                      </Typography>
                      <Typography variant='baseSm' color='gray.middle'>
                        {formatAmount(
                          transaction.requestStatus === 'Cancelled'
                            ? transaction.requestedAmount
                            : transaction.requestStatus === 'Processed'
                              ? transaction.queuedAmount
                              : transaction.requestedAmount,
                          {
                            minDecimals: 2,
                          }
                        )}{' '}
                        USDC
                      </Typography>
                    </Box>
                    {transaction.requestStatus === 'Processed' && (
                      <Box
                        display='flex'
                        justifyContent='space-between'
                        alignItems='end'
                      >
                        <Typography variant='baseSm' color='gray.middle'>
                          Accepted
                        </Typography>
                        <Typography variant='baseSm' color='gray.middle'>
                          {formatAmount(transaction.acceptedAmount, {
                            minDecimals: 2,
                          })}{' '}
                          USDC
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </TableCell>

              {index === 0 && (
                <TableCell
                  rowSpan={transactionWrapper.transactions.length * 2 - 1}
                  className={
                    transactionWrapper.transactions.length > 1
                      ? 'merged'
                      : undefined
                  }
                >
                  {transaction.requestStatus === 'Cancelled' ? (
                    <Typography variant='inherit' position='relative'>
                      N/A
                    </Typography>
                  ) : (
                    <Button
                      variant='text'
                      sx={{
                        ...customTypography.baseSm,
                        color: 'gold.dark',
                        textTransform: 'capitalize',
                        height: 21,
                        '.MuiButton-startIcon path': {
                          fill: customPalette.gold.dark,
                        },
                      }}
                      startIcon={<PaperIcon />}
                      onClick={() => handleDetailsClick(transactionWrapper)}
                    >
                      {t(
                        'portfolio.transactions.detailedLendingRequestTransactions.actions.seeDetails'
                      )}
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell
                sx={{ py: 0, px: 1.5 }}
                colSpan={
                  transactionWrapper.transactions.length <= 1 ||
                  index === transactionWrapper.transactions.length - 1
                    ? 6
                    : 4
                }
              >
                <DottedDivider />
              </TableCell>
            </TableRow>
          </Fragment>
        )
      })}
    </>
  )
}

export default WithdrawalTransactionsTableRow
