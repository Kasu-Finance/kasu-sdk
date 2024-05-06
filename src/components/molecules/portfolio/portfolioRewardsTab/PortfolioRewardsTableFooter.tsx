import { TableCell, TableRow, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import React from 'react'

import useCalculatePortfolioRewardsTotal from '@/hooks/lending/useCalculatePortfolioRewardsTotal'
import { PortfolioRewardsType } from '@/hooks/portfolio/usePortfolioRewards'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type PortfolioRewardsTableFooterProps = {
  portfolioRewards: PortfolioRewardsType[]
}

const PortfolioRewardsTableFooter: React.FC<
  PortfolioRewardsTableFooterProps
> = ({ portfolioRewards }) => {
  const {
    lastEpochKsuBonus,
    lastEpochUsdcBonus,
    lifetimeKsuBonus,
    lifetimeUsdcBonus,
  } = useCalculatePortfolioRewardsTotal(portfolioRewards)

  return (
    <>
      <TableRow
        sx={{
          '& .MuiTableCell-root': {
            py: '6px',
          },
        }}
      >
        <TableCell>
          <Typography variant='subtitle2' component='span'>
            Total USDC Bonus/Rewards{' '}
          </Typography>
          <Typography variant='caption' component='span'>
            (Protocol Fees)
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(lastEpochUsdcBonus), {
              minValue: 1_000_000,
            })}
            symbol='USDC'
            width='100%'
          />
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(lifetimeUsdcBonus), {
              minValue: 1_000_000,
            })}
            symbol='USDC'
            width='100%'
          />
        </TableCell>
      </TableRow>
      <TableRow
        sx={{
          '& .MuiTableCell-root': {
            py: '6px',
          },
        }}
      >
        <TableCell>
          <Typography variant='subtitle2' component='span'>
            Total KSU Bonus/Rewards
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(lastEpochKsuBonus.ksuAmount), {
              minValue: 1_000_000,
            })}
            symbol='KSU'
            usdValue={formatAmount(formatEther(lastEpochKsuBonus.usdAmount), {
              minValue: 1_000_000,
            })}
            width='100%'
          />
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(lifetimeKsuBonus), {
              minValue: 1_000_000,
            })}
            symbol='KSU'
            width='100%'
          />
        </TableCell>
      </TableRow>
    </>
  )
}

export default PortfolioRewardsTableFooter
