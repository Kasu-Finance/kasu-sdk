import {
  PortfolioLendingPool,
  PortfolioTranche,
} from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { UserTrancheBalance } from '@kasufinance/kasu-sdk/src/services/UserLending/types'
import { Box, TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import ToolTip from '@/components/atoms/ToolTip'
import LendingPortfolioTableActionColumn from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableActionColumn'

import { TRANCHE_ICONS } from '@/constants/pool'
import { customTypography } from '@/themes/typography'
import {
  formatAmount,
  formatPercentage,
  formatTimestamp,
  mapFixedLoanToConfig,
  toBigNumber,
} from '@/utils'

export type LendingPortfolioTableTrancheRowProps = {
  pool: PortfolioLendingPool
  currentEpoch: string
  tranche:
    | PortfolioTranche
    | (PortfolioTranche & { balanceData: UserTrancheBalance })
  isClearingPeriod?: boolean
  clearingPeriodEndTime?: number
}

const LendingPortfolioTableTrancheRow: React.FC<
  LendingPortfolioTableTrancheRowProps
> = ({
  tranche,
  pool,
  currentEpoch,
  isClearingPeriod,
  clearingPeriodEndTime,
}) => {
  const { t } = getTranslation()

  const hasDepositedIntoVariable =
    !toBigNumber(tranche.investedAmount).isZero() ||
    !toBigNumber(tranche.yieldEarnings.lifetime).isZero()

  const mappedFixedTermConfig = mapFixedLoanToConfig(
    tranche.fixedLoans,
    tranche.fixedTermConfig
  )

  const clearingPeriodTooltip = t(
    'portfolio.lendingPortfolio.lastEpochClearingTooltip'
  )
  const clearingPeriodEndsAtLabel = t(
    'portfolio.lendingPortfolio.clearingEndsAt'
  )

  const clearingPeriodEndText = clearingPeriodEndTime
    ? (() => {
        const { date, timestamp, utcOffset } = formatTimestamp(
          clearingPeriodEndTime,
          {
            format: 'DD.MM.YYYY HH:mm:ss',
            includeUtcOffset: true,
          }
        )

        return `${date} ${timestamp} ${utcOffset}`
      })()
    : ''

  const renderLastEpochValue = (value: string) => {
    const shouldShowClearingPlaceholder =
      Boolean(isClearingPeriod) && Number(value) === 0

    if (shouldShowClearingPlaceholder) {
      const tooltipText = clearingPeriodEndText
        ? `${clearingPeriodTooltip} ${clearingPeriodEndsAtLabel} ${clearingPeriodEndText}.`
        : clearingPeriodTooltip

      return (
        <Box display='flex' alignItems='center' justifyContent='flex-end'>
          <Box component='span'>-</Box>
          <ToolTip title={tooltipText} />
        </Box>
      )
    }

    return (
      <>
        {formatAmount(value || '0', {
          minValue: 10_000_000,
          minDecimals: 2,
        })}{' '}
        USDC
      </>
    )
  }

  return (
    <>
      {hasDepositedIntoVariable && (
        <TableRow
          sx={{
            '.MuiTableCell-root': {
              ...customTypography.baseSm,
              py: 0,
              '&:not(:first-child):not(:last-child)': {
                px: 1,
              },
            },
          }}
        >
          <TableCell>
            <Box display='flex' alignItems='center' gap={1}>
              {
                TRANCHE_ICONS[
                  tranche.name.toLowerCase() as keyof typeof TRANCHE_ICONS
                ]
              }
              {tranche.name} {t('general.tranche')}
            </Box>
          </TableCell>
          <TableCell align='right'>{formatPercentage(tranche.apy)}</TableCell>
          <TableCell>Variable</TableCell>
          <TableCell align='right'>
            {formatAmount(tranche.investedAmount || '0', {
              minValue: 10_000_000,
              minDecimals: 2,
            })}{' '}
            USDC
          </TableCell>
          <TableCell align='right'>
            {renderLastEpochValue(tranche.yieldEarnings.lastEpoch || '0')}
          </TableCell>
          <TableCell align='right'>
            {formatAmount(tranche.yieldEarnings.lifetime || '0', {
              minValue: 10_000_000,
              minDecimals: 2,
            })}{' '}
            USDC
          </TableCell>
          <LendingPortfolioTableActionColumn
            currentEpoch={currentEpoch}
            pool={pool}
            tranche={tranche}
            isVariable
          />
        </TableRow>
      )}
      {mappedFixedTermConfig.length
        ? mappedFixedTermConfig.map((fixedTermConfig, index) => (
            <TableRow
              sx={{
                '.MuiTableCell-root': {
                  ...customTypography.baseSm,
                  py: 0,
                  '&:not(:first-child):not(:last-child)': {
                    px: 1,
                  },
                },
              }}
              key={index}
            >
              <TableCell>
                <Box display='flex' alignItems='center' gap={1}>
                  {
                    TRANCHE_ICONS[
                      tranche.name.toLowerCase() as keyof typeof TRANCHE_ICONS
                    ]
                  }
                  {tranche.name} {t('general.tranche')}
                </Box>
              </TableCell>
              <TableCell align='right'>
                {formatPercentage(fixedTermConfig.apy)}
              </TableCell>
              <TableCell>Fixed</TableCell>
              <TableCell align='right'>
                {formatAmount(fixedTermConfig.investedAmount || '0', {
                  minValue: 10_000_000,
                  minDecimals: 2,
                })}{' '}
                USDC
              </TableCell>
              <TableCell align='right'>
                {renderLastEpochValue(
                  fixedTermConfig.yieldEarnings.lastEpoch || '0'
                )}
              </TableCell>
              <TableCell align='right'>
                {formatAmount(fixedTermConfig.yieldEarnings.lifetime || '0', {
                  minValue: 10_000_000,
                  minDecimals: 2,
                })}{' '}
                USDC
              </TableCell>
              <LendingPortfolioTableActionColumn
                currentEpoch={currentEpoch}
                pool={pool}
                tranche={tranche}
                ftdId={fixedTermConfig.configId}
              />
            </TableRow>
          ))
        : null}
    </>
  )
}

export default LendingPortfolioTableTrancheRow
