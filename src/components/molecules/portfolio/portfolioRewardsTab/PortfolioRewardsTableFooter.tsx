import { TableCell, TableRow, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import React from 'react'

import useCalculatePortfolioRewardsTotal from '@/hooks/lending/useCalculatePortfolioRewardsTotal'
import { PortfolioRewardsType } from '@/hooks/portfolio/usePortfolioRewards'
import useTranslation from '@/hooks/useTranslation'

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

  const { t } = useTranslation()

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
            {t('portfolio.rewards.totalUsdcBonus')}{' '}
          </Typography>
          <Typography variant='caption' component='span'>
            ({t('portfolio.rewards.protocolFees')})
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(lastEpochUsdcBonus || '0'), {
              minValue: 1_000_000,
            })}
            symbol='USDC'
            width='100%'
          />
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(lifetimeUsdcBonus || '0'), {
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
            {t('portfolio.rewards.totalKsuBonus')}
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(
              formatEther(lastEpochKsuBonus.ksuAmount || '0'),
              {
                minValue: 1_000_000,
              }
            )}
            symbol='KSU'
            usdValue={formatAmount(
              formatEther(lastEpochKsuBonus.usdAmount || '0'),
              {
                minValue: 1_000_000,
              }
            )}
            width='100%'
          />
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(lifetimeKsuBonus || '0'), {
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
