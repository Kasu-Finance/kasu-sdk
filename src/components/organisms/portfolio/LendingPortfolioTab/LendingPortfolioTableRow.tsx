import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { TableCell, TableRow, Typography } from '@mui/material'

import useUserLendingTrancheBalanceSubgraph from '@/hooks/lending/useUserLendingTrancheBalanceSubgraph'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'
import useNextClearingPeriod from '@/hooks/web3/useNextClearingPeriod'

import DottedDivider from '@/components/atoms/DottedDivider'
import NextLink from '@/components/atoms/NextLink'
import LendingPortfolioTableTrancheRow from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableTrancheRow'

import { Routes } from '@/config/routes'
import { mergeSubheading } from '@/utils'

type LendingPortfolioTableRowProps = {
  portfolioPool: PortfolioLendingPool
  currentEpoch: string
}

const LendingPortfolioTableRow: React.FC<LendingPortfolioTableRowProps> = ({
  portfolioPool,
  currentEpoch,
}) => {
  const { t } = getTranslation()
  const { userLendingTrancheBalance } = useUserLendingTrancheBalanceSubgraph(
    portfolioPool.id,
    portfolioPool.tranches
  )
  const { nextEpochTime } = useNextEpochTime()
  const { nextClearingPeriod } = useNextClearingPeriod()

  const isClearingPeriod =
    Boolean(nextEpochTime && nextClearingPeriod) &&
    nextClearingPeriod > nextEpochTime

  const tranches = userLendingTrancheBalance ?? portfolioPool.tranches

  // Check if any tranche would actually be visible
  // Tranches only render if they have non-zero investedAmount or yieldEarnings
  const hasVisibleTranches = tranches.some((tranche) => {
    const investedAmount = parseFloat(tranche.investedAmount || '0')
    const yieldLifetime = parseFloat(
      tranche.yieldEarnings?.lifetime?.toString() || '0'
    )
    const hasFixedLoans = (tranche.fixedLoans?.length ?? 0) > 0
    return investedAmount > 0 || yieldLifetime > 0 || hasFixedLoans
  })

  return (
    <>
      <TableRow>
        <TableCell colSpan={7} sx={{ pt: 4 }}>
          <Typography
            variant='baseMdBold'
            color='gold.dark'
            whiteSpace='normal'
            component={NextLink}
            href={`${Routes.lending.root.url}/${portfolioPool.id}`}
          >
            {mergeSubheading(portfolioPool.poolName, portfolioPool.subheading)}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ pt: 0 }} colSpan={7}>
          <DottedDivider />
        </TableCell>
      </TableRow>
      {hasVisibleTranches ? (
        tranches
          .toReversed()
          .map((tranche) => (
            <LendingPortfolioTableTrancheRow
              pool={portfolioPool}
              tranche={tranche}
              currentEpoch={currentEpoch}
              isClearingPeriod={isClearingPeriod}
              clearingPeriodEndTime={nextEpochTime}
              key={tranche.name}
            />
          ))
      ) : (
        <TableRow>
          <TableCell colSpan={7} sx={{ py: 2 }}>
            <Typography variant='baseSm' color='text.secondary'>
              {t('portfolio.lendingPortfolio.pendingDepositsMessage')}
            </Typography>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default LendingPortfolioTableRow
