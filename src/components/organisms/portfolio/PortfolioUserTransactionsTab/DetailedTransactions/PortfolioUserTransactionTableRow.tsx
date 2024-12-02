import {
  Box,
  Button,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'

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
import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'

type PortfolioUserTransactionTableRowProps = {
  transaction: DetailedTransaction
}

const PortfolioUserTransactionTableRow: React.FC<
  PortfolioUserTransactionTableRowProps
> = ({ transaction }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const formattedTime = formatTimestamp(transaction.latestEvent.timestamp, {
    format: 'DD.MM.YYYY',
  })

  const handlePendingDecisionClick = () =>
    openModal({
      name: ModalsKeys.PENDING_DECISIONS,
      pendingDecisions: [
        {
          id: transaction.lendingPool.id,
          poolName: transaction.lendingPool.name,
          tranches: [
            {
              id: transaction.trancheId,
              name: transaction.trancheName,
              tickets: transaction.pendingDecisions,
            },
          ],
        },
      ],
      pools: [
        {
          id: transaction.lendingPool.id,
          poolName: transaction.lendingPool.name,
          tranches: [
            {
              id: transaction.trancheId,
              name: transaction.trancheName,
            },
          ],
        },
      ],
    })

  const handleDetailsClick = () =>
    openModal({
      name: ModalsKeys.REQUEST_DETAILS,
      detailedTransaction: transaction,
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
          ) : transaction.requestType === 'Funds Returned' ? (
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
          ) : (
            <Box display='flex' alignItems='center'>
              {t('portfolio.transactions.detailedTransactions.reallocation')}
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
              {transaction.requestType === 'Reallocation' && (
                <Box display='flex' justifyContent='space-between'>
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
                    {formatAmount(transaction.reallocatedInAmount, {
                      minDecimals: 2,
                    })}{' '}
                    USDC
                  </Typography>
                </Box>
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
              onClick={handlePendingDecisionClick}
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
              onClick={() => handleDetailsClick()}
            >
              {t(
                'portfolio.transactions.detailedTransactions.actions.seeDetails'
              )}
            </Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={7}>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </>
  )
}

export default PortfolioUserTransactionTableRow
