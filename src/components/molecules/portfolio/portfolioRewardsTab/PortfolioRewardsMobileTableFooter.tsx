import {
  Box,
  Divider,
  Grid,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import React from 'react'

import useCalculatePortfolioRewardsTotal from '@/hooks/lending/useCalculatePortfolioRewardsTotal'
import { PortfolioRewardsType } from '@/hooks/portfolio/usePortfolioRewards'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type PortfolioRewardsTableFooterProps = {
  portfolioRewards: PortfolioRewardsType[]
}

const PortfolioRewardsMobileTableFooter: React.FC<
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
    <TableRow
      sx={{
        '& .MuiTableCell-root': {
          py: '6px',
          px: 0,
        },
      }}
    >
      <TableCell>
        <ColoredBox sx={{ p: 1 }}>
          <Box>
            <Typography variant='subtitle2' component='span' fontSize={12}>
              {t('portfolio.rewards.totalUsdcBonus')}{' '}
            </Typography>
            <Typography variant='caption' component='span'>
              ({t('portfolio.rewards.protocolFees')})
            </Typography>
          </Box>
          <Grid container columns={10}>
            <Grid item xs={6}>
              <Typography
                variant='body2'
                component='span'
                fontSize={10}
                display='block'
              >
                {t('portfolio.rewards.claimableBalance')}
              </Typography>
              <TokenAmount
                amount={formatAmount(formatEther(lastEpochUsdcBonus || '0'), {
                  minValue: 1_000_000,
                })}
                symbol='USDC'
                width='100%'
                textAlign='left'
              />
            </Grid>
            <Grid item xs={4}>
              <Typography
                variant='body2'
                component='span'
                fontSize={10}
                textTransform='capitalize'
                display='block'
              >
                {t('general.lifetime')}
              </Typography>
              <Typography variant='body2' component='span'>
                <TokenAmount
                  amount={formatAmount(formatEther(lifetimeUsdcBonus || '0'), {
                    minValue: 1_000_000,
                  })}
                  symbol='USDC'
                  width='100%'
                  textAlign='left'
                />
              </Typography>
            </Grid>
          </Grid>
          <Divider
            sx={(theme) => ({ bgcolor: theme.palette.primary.main, my: 1 })}
          />
          <Typography variant='subtitle2' component='span' fontSize={12}>
            {t('portfolio.rewards.totalKsuBonus')}
          </Typography>
          <Grid container columns={10}>
            <Grid item xs={6}>
              <Typography
                variant='body2'
                component='span'
                fontSize={10}
                display='block'
              >
                {t('portfolio.rewards.totalKsuBonus')}
              </Typography>
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
                textAlign='left'
                sx={{
                  '.MuiBox-root': {
                    display: 'inline-block',
                    ml: '1ch',
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography
                variant='body2'
                component='span'
                fontSize={10}
                textTransform='capitalize'
                display='block'
              >
                {t('general.lifetime')}
              </Typography>
              <Typography variant='body2' component='span'>
                <TokenAmount
                  amount={formatAmount(formatEther(lifetimeKsuBonus || '0'), {
                    minValue: 1_000_000,
                  })}
                  symbol='KSU'
                  width='100%'
                  textAlign='left'
                />
              </Typography>
            </Grid>
          </Grid>
        </ColoredBox>
      </TableCell>
    </TableRow>
  )
}

export default PortfolioRewardsMobileTableFooter
