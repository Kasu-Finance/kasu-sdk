import { TableCell, TableRow, Typography } from '@mui/material'
import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'

import useUserLendingTrancheBalance from '@/hooks/lending/useUserLendingTrancheBalance'

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
            key={tranche.name}
          />
        ))}
    </>
  )
}

export default LendingPortfolioTableRow
