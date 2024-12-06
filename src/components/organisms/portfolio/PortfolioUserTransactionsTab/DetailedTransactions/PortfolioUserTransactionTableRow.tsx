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
import ToolTip from '@/components/atoms/ToolTip'
import DetailedTransactionAcceptedTooltip from '@/components/molecules/tooltips/DetailedTransactions/DetailedTransactionAcceptedTooltip'
import DetailedTransactionQueuedTooltip from '@/components/molecules/tooltips/DetailedTransactions/DetailedTransactionQueuedTooltip'
import DetailedTransactionReallocationInTooltip from '@/components/molecules/tooltips/DetailedTransactions/DetailedTransactionReallocatedInTooltip'
import DetailedTransactionReallocationOutTooltip from '@/components/molecules/tooltips/DetailedTransactions/DetailedTransactionReallocatedOutTooltip'
import DetailedTransactionRejectedTooltip from '@/components/molecules/tooltips/DetailedTransactions/DetailedTransactionRejectedTooltip'
import DetailedTransactionRequestedTooltip from '@/components/molecules/tooltips/DetailedTransactions/DetailedTransactionRequestedTooltip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { OptInOutIcon, PaperIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { capitalize, formatAmount, formatTimestamp } from '@/utils'
import {
  DetailedTransaction,
  DetailedTransactionReallocationRequest,
} from '@/utils/lending/getDetailedTransactions'

type PortfolioUserTransactionTableRowProps = {
  transaction: DetailedTransaction
  currentEpoch: string
}

const PortfolioUserTransactionTableRow: React.FC<
  PortfolioUserTransactionTableRowProps
> = ({ transaction, currentEpoch }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const formattedTime = formatTimestamp(transaction.latestEvent.timestamp, {
    format: 'DD.MM.YYYY',
  })

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
              tickets: detailedTransaction.pendingDecisions,
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
      | DetailedTransaction
      | DetailedTransactionReallocationRequest
  ) =>
    openModal({
      name: ModalsKeys.REQUEST_DETAILS,
      detailedTransaction,
      currentEpoch,
    })

  return (
    <>
      <TableRow
        sx={{
          '.MuiTableCell-root': {
            ...customTypography.baseSm,
            lineHeight: '18px',
            verticalAlign: 'top',
            px: 1,
            whiteSpace: 'normal',
          },
        }}
      >
        <TableCell>{transaction.lendingPool.name}</TableCell>
        <TableCell>{transaction.trancheName}</TableCell>
        <TableCell>
          {transaction.requestType === 'Deposit' ? (
            t('portfolio.transactions.detailedTransactions.lendingRequest')
          ) : transaction.requestType === 'Withdrawal' ? (
            t('portfolio.transactions.detailedTransactions.withdrawalRequest')
          ) : (
            <Box display='flex' alignItems='center'>
              {t('general.fundsReturned')}
              <ToolTip
                title={
                  <DetailedTransactionRequestedTooltip
                    requestType={transaction.requestType}
                  />
                }
              />
            </Box>
          )}
        </TableCell>
        <TableCell>{formattedTime.date}</TableCell>
        <TableCell>
          {transaction.latestEvent.requestType === 'Cancelled' ? (
            <Box display='flex' justifyContent='space-between'>
              <Typography variant='inherit'>
                {capitalize(t('general.cancelled'))}
              </Typography>
              <Typography variant='inherit'>
                {formatAmount(transaction.latestEvent.assetAmount, {
                  minDecimals: 2,
                })}{' '}
                USDC
              </Typography>
            </Box>
          ) : (
            <Stack>
              {(transaction.requestType === 'Deposit' ||
                transaction.requestType === 'Withdrawal') && (
                <>
                  <Box display='flex' justifyContent='space-between'>
                    <Box>
                      <Typography
                        variant='inherit'
                        component={Box}
                        display='flex'
                        alignItems='center'
                      >
                        {t('general.requested')}{' '}
                        <ToolTip
                          title={
                            <DetailedTransactionRequestedTooltip
                              requestType={transaction.requestType}
                            />
                          }
                        />
                      </Typography>
                    </Box>
                    <Typography variant='inherit'>
                      {formatAmount(transaction.requestedAmount, {
                        minDecimals: 2,
                      })}{' '}
                      USDC
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between'>
                    <Typography
                      variant='inherit'
                      component={Box}
                      display='flex'
                      alignItems='center'
                    >
                      {t('general.accepted')}{' '}
                      <ToolTip
                        title={
                          <DetailedTransactionAcceptedTooltip
                            requestType={transaction.requestType}
                          />
                        }
                      />
                    </Typography>
                    <Typography variant='inherit'>
                      {formatAmount(transaction.acceptedAmount, {
                        minDecimals: 2,
                      })}{' '}
                      USDC
                    </Typography>
                  </Box>
                </>
              )}
              {transaction.requestType === 'Deposit' && (
                <>
                  <Box display='flex' justifyContent='space-between'>
                    <Typography
                      variant='inherit'
                      component={Box}
                      display='flex'
                      alignItems='center'
                    >
                      {t('general.rejected')}{' '}
                      <ToolTip title={<DetailedTransactionRejectedTooltip />} />
                    </Typography>
                    <Typography variant='inherit'>
                      {formatAmount(transaction.rejectedAmount, {
                        minDecimals: 2,
                      })}{' '}
                      USDC
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between'>
                    <Typography
                      variant='inherit'
                      component={Box}
                      display='flex'
                      alignItems='center'
                    >
                      {t('general.reallocatedOut')}{' '}
                      <ToolTip
                        title={<DetailedTransactionReallocationOutTooltip />}
                      />
                    </Typography>
                    <Typography variant='inherit'>
                      {formatAmount(transaction.reallocatedOutAmount, {
                        minDecimals: 2,
                      })}{' '}
                      USDC
                    </Typography>
                  </Box>
                </>
              )}
              {transaction.requestType === 'Funds Returned' && (
                <Box display='flex' justifyContent='space-between'>
                  <Typography
                    variant='inherit'
                    component={Box}
                    display='flex'
                    alignItems='center'
                  >
                    {t('general.fundsReturned')}{' '}
                    <ToolTip
                      title={t(
                        'portfolio.transactions.detailedTransactions.tooltips.fundsReturned.tooltip-2'
                      )}
                    />
                  </Typography>
                  <Typography variant='inherit'>
                    {formatAmount(transaction.fundsReturnedAmount, {
                      minDecimals: 2,
                    })}{' '}
                    USDC
                  </Typography>
                </Box>
              )}
              {transaction.requestType === 'Withdrawal' && (
                <Box display='flex' justifyContent='space-between'>
                  <Typography
                    variant='inherit'
                    component={Box}
                    display='flex'
                    alignItems='center'
                  >
                    {t('general.queued')}{' '}
                    <ToolTip title={<DetailedTransactionQueuedTooltip />} />
                  </Typography>
                  <Typography variant='inherit'>
                    {formatAmount(transaction.queuedAmount, {
                      minDecimals: 2,
                    })}{' '}
                    USDC
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </TableCell>
        <TableCell>
          {transaction.pendingDecisions.length ? (
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
              onClick={() => handlePendingDecisionClick(transaction)}
            >
              {t('general.optInOut')}
            </Button>
          ) : (
            'N/A'
          )}
        </TableCell>
        <TableCell>
          {transaction.latestEvent.requestType === 'Cancelled' ? (
            'N/A'
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
              onClick={() => handleDetailsClick(transaction)}
            >
              {t(
                'portfolio.transactions.detailedTransactions.actions.seeDetails'
              )}
            </Button>
          )}
        </TableCell>
      </TableRow>
      {transaction.requestType === 'Deposit' &&
      transaction.reallocatedEvents.length
        ? transaction.reallocatedEvents.map((reallocatedTransaction) => (
            <Fragment key={reallocatedTransaction.id}>
              <TableRow>
                <TableCell
                  sx={{
                    py: 0,
                    zIndex: 2,
                  }}
                  colSpan={7}
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

                    '&:first-of-type::before': {
                      width: 'calc(100% - 12px)',
                      left: 12,
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
                <TableCell />
                <TableCell>
                  <Typography variant='inherit' position='relative'>
                    {reallocatedTransaction.trancheName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box position='relative' display='flex' alignItems='center'>
                    {t(
                      'portfolio.transactions.detailedTransactions.reallocation'
                    )}
                    <ToolTip
                      title={
                        <DetailedTransactionRequestedTooltip
                          requestType={reallocatedTransaction.requestType}
                        />
                      }
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='inherit' position='relative'>
                    {
                      formatTimestamp(reallocatedTransaction.timestamp, {
                        format: 'DD.MM.YYYY',
                      }).date
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    display='flex'
                    justifyContent='space-between'
                    position='relative'
                  >
                    <Typography
                      variant='inherit'
                      component={Box}
                      display='flex'
                      alignItems='center'
                    >
                      {t('general.reallocatedIn')}{' '}
                      <ToolTip
                        title={<DetailedTransactionReallocationInTooltip />}
                      />
                    </Typography>
                    <Typography variant='inherit'>
                      {formatAmount(
                        reallocatedTransaction.reallocatedInAmount,
                        {
                          minDecimals: 2,
                        }
                      )}{' '}
                      USDC
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {reallocatedTransaction.pendingDecisions.length ? (
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
                  {reallocatedTransaction.latestEvent.requestType ===
                  'Cancelled' ? (
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
                        position: 'relative',
                        '.MuiButton-startIcon path': {
                          fill: customPalette.gold.dark,
                        },
                      }}
                      startIcon={<PaperIcon />}
                      onClick={() => handleDetailsClick(reallocatedTransaction)}
                    >
                      {t(
                        'portfolio.transactions.detailedTransactions.actions.seeDetails'
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            </Fragment>
          ))
        : null}
      <TableRow>
        <TableCell sx={{ py: 0, px: 1.5 }} colSpan={7}>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </>
  )
}

export default PortfolioUserTransactionTableRow
