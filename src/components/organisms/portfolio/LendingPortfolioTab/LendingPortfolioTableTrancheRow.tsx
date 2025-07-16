import { Box, TableCell, TableRow } from '@mui/material'
import {
  PortfolioLendingPool,
  PortfolioTranche,
} from '@solidant/kasu-sdk/src/services/Portfolio/types'
import { UserTrancheBalance } from '@solidant/kasu-sdk/src/services/UserLending/types'

import getTranslation from '@/hooks/useTranslation'

import LendingPortfolioTableActionColumn from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableActionColumn'

import { TRANCHE_ICONS } from '@/constants/pool'
import { customTypography } from '@/themes/typography'
import {
  formatAmount,
  formatPercentage,
  mapFixedLoanToConfig,
  toBigNumber,
} from '@/utils'

export type LendingPortfolioTableTrancheRowProps = {
  pool: PortfolioLendingPool
  currentEpoch: string
  tranche:
    | PortfolioTranche
    | (PortfolioTranche & { balanceData: UserTrancheBalance })
}

const LendingPortfolioTableTrancheRow: React.FC<
  LendingPortfolioTableTrancheRowProps
> = ({ tranche, pool, currentEpoch }) => {
  const { t } = getTranslation()

  const hasDepositedIntoVariable =
    !toBigNumber(tranche.investedAmount).isZero() ||
    !toBigNumber(tranche.yieldEarnings.lifetime).isZero()

  const mappedFixedTermConfig = mapFixedLoanToConfig(
    tranche.fixedLoans,
    tranche.fixedTermConfig
  )

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
          <TableCell align='right'>
            {formatPercentage(tranche.apy).replaceAll(' ', '')}
          </TableCell>
          <TableCell>Variable</TableCell>
          <TableCell align='right'>
            {formatAmount(tranche.investedAmount || '0', {
              minValue: 10_000_000,
              minDecimals: 2,
            })}{' '}
            USDC
          </TableCell>
          <TableCell align='right'>
            {formatAmount(tranche.yieldEarnings.lastEpoch || '0', {
              minValue: 10_000_000,
              minDecimals: 2,
            })}{' '}
            USDC
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
                {formatPercentage(fixedTermConfig.apy).replaceAll(' ', '')}
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
                {formatAmount(fixedTermConfig.yieldEarnings.lastEpoch || '0', {
                  minValue: 10_000_000,
                  minDecimals: 2,
                })}{' '}
                USDC
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
