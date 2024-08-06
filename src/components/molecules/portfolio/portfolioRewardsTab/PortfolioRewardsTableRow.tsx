import { TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import { PortfolioRewardsType } from '@/hooks/portfolio/usePortfolioRewards'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type PortfolioRewardsTableRowProps = {
  portfolioReward: PortfolioRewardsType
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
              ? formatAmount(portfolioReward.lastEpoch.usdcAmount || '0', {
                  minValue: 1_000_000,
                })
              : undefined
          }
          amountProps={{ variant: 'body1' }}
          symbolProps={{ variant: 'caption' }}
          usdcProps={{ variant: 'caption' }}
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
          portfolioReward.lifeTime.ksuAmount ??
            portfolioReward.lifeTime.usdcAmount,
          { minValue: 1_000_000 }
        )}
        symbol={portfolioReward.lifeTime.ksuAmount ? 'KSU' : 'USDC'}
        amountProps={{ variant: 'body1' }}
        symbolProps={{ variant: 'caption' }}
        usdcProps={{ variant: 'caption' }}
        width='100%'
      />
    </TableCell>
  </TableRow>
)

export default PortfolioRewardsTableRow
