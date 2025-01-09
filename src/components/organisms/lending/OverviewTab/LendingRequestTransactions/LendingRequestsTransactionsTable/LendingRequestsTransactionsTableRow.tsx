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

import Countdown from '@/components/atoms/Countdown'
import DottedDivider from '@/components/atoms/DottedDivider'

import { ModalsKeys } from '@/context/modal/modal.types'

import { OptInOutIcon, PaperIcon } from '@/assets/icons'

import { LoanTicketStatus } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'
import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAmount, formatTimestamp } from '@/utils'
import {
  DetailedTransaction,
  DetailedTransactionReallocationRequest,
  DetailedTransactionWrapper,
} from '@/utils/lending/getDetailedTransactions'

type LendingRequestsTransactionsTableRowProps = {
  transactionWrapper: DetailedTransactionWrapper
  currentEpoch: string
}

const LendingRequestsTransactionsTableRow: React.FC<
  LendingRequestsTransactionsTableRowProps
> = ({ transactionWrapper, currentEpoch }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const formattedTime = formatTimestamp(
    transactionWrapper.lastTransactionDate,
    {
      format: 'DD.MM.YYYY',
    }
  )

  const handlePendingDecisionClick = (
    detailedTransaction:
      | DetailedTransaction
      | DetailedTransactionReallocationRequest
  ) =>
    openModal({
      name: ModalsKeys.PENDING_DECISIONS,
      pendingDecisions: [
        {
          id: detailedTransaction.lendingPool.id,
          poolName: detailedTransaction.lendingPool.name,
          tranches: [
            {
              id: detailedTransaction.trancheId,
              name: detailedTransaction.trancheName,
              tickets: transactionWrapper.pendingDecisions,
            },
          ],
        },
      ],
      pools: [
        {
          id: detailedTransaction.lendingPool.id,
          poolName: detailedTransaction.lendingPool.name,
          tranches: [
            {
              id: detailedTransaction.trancheId,
              name: detailedTransaction.trancheName,
            },
          ],
        },
      ],
    })

  const handleDetailsClick = (
    detailedTransaction:
      | DetailedTransactionWrapper
      | DetailedTransactionReallocationRequest
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
                        '&:nth-last-child(3)::after':
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
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                      zIndex: 2,
                    },

                    '&:last-child::before': {
                      width: '100%',
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                    },
                  },
                },
              }}
            >
              <TableCell>{formattedTime.date}</TableCell>
              <TableCell>{transaction.trancheName}</TableCell>
              <TableCell>
                <Stack>
                  <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='end'
                  >
                    <Typography variant='baseSmBold'>Requested</Typography>
                    <Typography variant='baseSmBold'>
                      {formatAmount(transaction.requestedAmount, {
                        minDecimals: 2,
                      })}{' '}
                      USDC
                    </Typography>
                  </Box>
                  {transaction.requestStatus === 'Cancelled' && (
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='end'
                    >
                      <Typography variant='baseSm' color='gray.middle'>
                        Cancelled
                      </Typography>
                      <Typography variant='baseSm' color='gray.middle'>
                        {formatAmount(transaction.requestedAmount, {
                          minDecimals: 2,
                        })}{' '}
                        USDC
                      </Typography>
                    </Box>
                  )}
                  {transaction.requestStatus === 'Requested' && (
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='end'
                    >
                      <Typography variant='baseSm' color='gray.middle'>
                        Queued
                      </Typography>
                      <Typography variant='baseSm' color='gray.middle'>
                        {formatAmount(transaction.requestedAmount, {
                          minDecimals: 2,
                        })}{' '}
                        USDC
                      </Typography>
                    </Box>
                  )}
                  {transaction.requestStatus === 'Processed' && (
                    <>
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
                      <Box
                        display='flex'
                        justifyContent='space-between'
                        alignItems='end'
                      >
                        <Typography variant='baseSm' color='gray.middle'>
                          Rejected
                        </Typography>
                        <Typography variant='baseSm' color='gray.middle'>
                          {formatAmount(transaction.rejectedAmount, {
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
                          Reallocated Out
                        </Typography>
                        <Typography variant='baseSm' color='gray.middle'>
                          {formatAmount(transaction.reallocatedOutAmount, {
                            minDecimals: 2,
                          })}{' '}
                          USDC
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </TableCell>

              {index === 0 && (
                <>
                  <TableCell
                    rowSpan={transactionWrapper.transactions.length * 2 - 1}
                    className={
                      transactionWrapper.transactions.length > 1
                        ? 'merged'
                        : undefined
                    }
                  >
                    {transactionWrapper.currentDecisionStatus?.status ===
                      LoanTicketStatus.emailSent &&
                    transactionWrapper.pendingDecisions.length ? (
                      <Box
                        display='flex'
                        flexDirection='column'
                        alignItems='start'
                      >
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
                          startIcon={<OptInOutIcon />}
                          onClick={() =>
                            handlePendingDecisionClick(transaction)
                          }
                        >
                          {t('general.optInOut')}
                        </Button>
                        <Typography
                          variant='baseSm'
                          color='gray.middle'
                          position='relative'
                        >
                          <Typography variant='inherit' display='block'>
                            {t('general.timeLeft')}:
                          </Typography>
                          <Countdown
                            endTime={dayjs(
                              transactionWrapper.currentDecisionStatus.createdOn
                            )
                              .add(2, 'days')
                              .unix()}
                            format='HH:mm:ss'
                            render={(countDown) => {
                              const [hours, minutes, seconds] =
                                countDown.split(':')

                              return `${hours} hrs, ${minutes} mins, ${seconds} secs.`
                            }}
                          />
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant='inherit' position='relative'>
                        N/A
                      </Typography>
                    )}
                  </TableCell>
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
                </>
              )}
            </TableRow>
            {(!transactionWrapper.reallocationEvents.length ||
              (transactionWrapper.reallocationEvents.length &&
                index !== transactionWrapper.transactions.length - 1)) && (
              <TableRow>
                <TableCell
                  sx={{ py: 0, px: 1.5 }}
                  colSpan={
                    transactionWrapper.transactions.length <= 1 ||
                    index === transactionWrapper.transactions.length - 1
                      ? 5
                      : 3
                  }
                >
                  <DottedDivider />
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        )
      })}
      {transactionWrapper.reallocationEvents.length
        ? transactionWrapper.reallocationEvents.map(
            (reallocatedTransaction, index) => (
              <Fragment key={reallocatedTransaction.id}>
                <TableRow>
                  <TableCell
                    sx={{
                      py: 0,
                      zIndex: 2,
                    }}
                    colSpan={6}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        borderBottom: '2px solid white !important',
                        zIndex: 2,

                        '&::before': {
                          zIndex: 2,
                          width: 16,
                          height: 16,
                          content: '""',
                          position: 'absolute',
                          left: '50%',
                          transform: 'translate(-50%, -8px) rotate(45deg)',
                          bgcolor: 'gray.extraLight',
                          borderTop: '2px solid white',
                          borderLeft: '2px solid white',
                          borderTopLeftRadius: 2,
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{
                    '.MuiTableCell-root': {
                      ...customTypography.baseSm,
                      lineHeight: '18px',
                      verticalAlign: 'top',
                      px: 1,
                      whiteSpace: 'normal',
                      position: 'relative',
                      zIndex: 1,

                      '&:first-of-type': {
                        pl: 2.5,

                        '&::before': {
                          width: 'calc(100% - 12px)',
                          left: 12,
                        },
                      },
                      '&:last-of-type::before': {
                        width: 'calc(100% - 12px)',
                        left: 'unset',
                        right: 12,
                      },

                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'gray.extraLight',
                      },
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant='inherit' position='relative'>
                      {
                        formatTimestamp(
                          reallocatedTransaction.requestTimestamp,
                          {
                            format: 'DD.MM.YYYY',
                          }
                        ).date
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='inherit' position='relative'>
                      {reallocatedTransaction.trancheName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack>
                      <Box
                        display='flex'
                        justifyContent='space-between'
                        position='relative'
                      >
                        <Typography variant='baseSmBold'>
                          Reallocated In
                        </Typography>
                        <Typography variant='baseSmBold'>
                          {formatAmount(
                            reallocatedTransaction.reallocatedInAmount,
                            {
                              minDecimals: 2,
                            }
                          )}{' '}
                          USDC
                        </Typography>
                      </Box>
                      <Box
                        display='flex'
                        justifyContent='space-between'
                        position='relative'
                      >
                        <Typography variant='baseSm' color='gray.middle'>
                          Accepted
                        </Typography>
                        <Typography variant='baseSm' color='gray.middle'>
                          {formatAmount(reallocatedTransaction.acceptedAmount, {
                            minDecimals: 2,
                          })}{' '}
                          USDC
                        </Typography>
                      </Box>
                      <Box
                        display='flex'
                        justifyContent='space-between'
                        position='relative'
                      >
                        <Typography variant='baseSm' color='gray.middle'>
                          Rejected
                        </Typography>
                        <Typography variant='baseSm' color='gray.middle'>
                          {formatAmount(reallocatedTransaction.rejectedAmount, {
                            minDecimals: 2,
                          })}{' '}
                          USDC
                        </Typography>
                      </Box>
                      <Box
                        display='flex'
                        justifyContent='space-between'
                        position='relative'
                      >
                        <Typography variant='baseSm' color='gray.middle'>
                          Reallocated Out
                        </Typography>
                        <Typography variant='baseSm' color='gray.middle'>
                          {formatAmount(
                            reallocatedTransaction.reallocatedOutAmount,
                            {
                              minDecimals: 2,
                            }
                          )}{' '}
                          USDC
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {reallocatedTransaction.currentDecisionStatus?.status ===
                      LoanTicketStatus.emailSent &&
                    reallocatedTransaction.pendingDecisions.length ? (
                      <Button
                        variant='text'
                        sx={{
                          ...customTypography.baseSm,
                          color: 'gold.dark',
                          textTransform: 'capitalize',
                          height: 21,
                          position: 'relative',
                          '.MuiButton-startIcon path': {
                            fill: customPalette.gold.dark,
                          },
                        }}
                        startIcon={<OptInOutIcon />}
                        onClick={() =>
                          handlePendingDecisionClick(reallocatedTransaction)
                        }
                      >
                        {t('general.optInOut')}
                      </Button>
                    ) : (
                      <Typography variant='inherit' position='relative'>
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='text'
                      sx={{
                        ...customTypography.baseSm,
                        color: 'gold.dark',
                        textTransform: 'capitalize',
                        height: 21,
                        position: 'relative',
                        '.MuiButton-startIcon path': {
                          fill: customPalette.gold.dark,
                        },
                      }}
                      startIcon={<PaperIcon />}
                      onClick={() => handleDetailsClick(reallocatedTransaction)}
                    >
                      {t(
                        'portfolio.transactions.detailedLendingRequestTransactions.actions.seeDetails'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
                {index === transactionWrapper.reallocationEvents.length - 1 && (
                  <TableRow>
                    <TableCell sx={{ py: 0, px: 1.5 }} colSpan={5}>
                      <DottedDivider />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          )
        : null}
    </>
  )
}

export default LendingRequestsTransactionsTableRow
