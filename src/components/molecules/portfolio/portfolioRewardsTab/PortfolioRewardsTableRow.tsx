import { TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import TokenAmount from '@/components/atoms/TokenAmount'
import { PortfolioRewards } from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardsTable'

import { formatAmount } from '@/utils'

type PortfolioRewardsTableRowProps = {
  portfolioReward: PortfolioRewards
}

const PortfolioRewardsTableRow: React.FC<PortfolioRewardsTableRowProps> = ({
  portfolioReward,
}) => (
  <TableRow>
    <TableCell>
      <Typography variant='subtitle2' component='span'>
        {portfolioReward.label}
      </Typography>
    </TableCell>
    <TableCell align='right'>
      {portfolioReward.lastEpoch ? (
        <TokenAmount
          amount={formatAmount(
            portfolioReward.lastEpoch.ksuAmount ??
              portfolioReward.lastEpoch.usdcAmount,
            { minValue: 1_000_000 }
          )}
          symbol={portfolioReward.lastEpoch.ksuAmount ? 'KSU' : 'USDC'}
          usdValue={
            portfolioReward.lastEpoch.ksuAmount
              ? formatAmount(portfolioReward.lastEpoch.usdcAmount, {
                  minValue: 1_000_000,
                })
              : undefined
          }
          amountVariant='body1'
          symbolVariant='caption'
          usdcVariant='caption'
          width='100%'
        />
      ) : (
        <Typography
          variant='body1'
          component='span'
          color={(theme) => theme.palette.text.disabled}
        >
          –
        </Typography>
      )}
    </TableCell>
    <TableCell align='right'>
      <TokenAmount
        amount={formatAmount(
          portfolioReward.lifetime.ksuAmount ??
            portfolioReward.lifetime.usdcAmount,
          { minValue: 1_000_000 }
        )}
        symbol={portfolioReward.lifetime.ksuAmount ? 'KSU' : 'USDC'}
        amountVariant='body1'
        symbolVariant='caption'
        usdcVariant='caption'
        width='100%'
      />
    </TableCell>
  </TableRow>
)

export default PortfolioRewardsTableRow
