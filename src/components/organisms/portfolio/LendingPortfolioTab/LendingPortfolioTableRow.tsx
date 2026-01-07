import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { TableCell, TableRow, Typography } from '@mui/material'

import useUserLendingTrancheBalance from '@/hooks/lending/useUserLendingTrancheBalance'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
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
  const { userLendingTrancheBalance } = useUserLendingTrancheBalance(
    portfolioPool.id,
    portfolioPool.tranches
  )
  const { nextEpochTime } = useNextEpochTime()
  const { nextClearingPeriod } = useNextClearingPeriod()

  const isClearingPeriod =
    Boolean(nextEpochTime && nextClearingPeriod) &&
    nextClearingPeriod > nextEpochTime

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
      {(userLendingTrancheBalance ?? portfolioPool.tranches)
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
        ))}
    </>
  )
}

export default LendingPortfolioTableRow
