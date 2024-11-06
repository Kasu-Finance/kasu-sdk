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

  const formattedTime = formatTimestamp(transaction.timestamp, {
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
            px: 1.5,
            whiteSpace: 'normal',
          },
        }}
      >
        <TableCell>{transaction.lendingPool.name}</TableCell>
        <TableCell>{transaction.trancheName}</TableCell>
        <TableCell>
          {transaction.requestType === 'Deposit'
            ? t('portfolio.transactions.detailedTransactions.lendingRequest')
            : transaction.requestType === 'Withdrawal'
              ? t(
                  'portfolio.transactions.detailedTransactions.withdrawalRequest'
                )
              : t('portfolio.transactions.detailedTransactions.reallocation')}
        </TableCell>
        <TableCell>{formattedTime.date}</TableCell>
        <TableCell>
          {transaction.latestEventStatus === 'Cancelled' ? (
            capitalize(t('general.cancelled'))
          ) : (
            <Stack>
              {transaction.requestType !== 'Reallocation' && (
                <>
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='inherit'>
                      {t('general.requested')}:
                    </Typography>
                    <Typography variant='inherit'>
                      {formatAmount(transaction.requestedAmount, {
                        minDecimals: 2,
                      })}{' '}
                      USDC
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='inherit'>
                      {t('general.accepted')}:
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
                    <Typography variant='inherit'>
                      {t('general.rejected')}:
                    </Typography>
                    <Typography variant='inherit'>
                      {formatAmount(transaction.rejectedAmount, {
                        minDecimals: 2,
                      })}{' '}
                      USDC
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='inherit'>
                      {t('general.reallocatedOut')}:
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
                  <Typography variant='inherit'>
                    {t('general.reallocatedIn')}:
                  </Typography>
                  <Typography variant='inherit'>
                    {formatAmount(transaction.reallocatedInAmount, {
                      minDecimals: 2,
                    })}{' '}
                    USDC
                  </Typography>
                </Box>
              )}
              {transaction.requestType === 'Withdrawal' && (
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='inherit'>
                    {t('general.queued')}:
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
          {transaction.latestEventStatus === 'Cancelled' ? (
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
