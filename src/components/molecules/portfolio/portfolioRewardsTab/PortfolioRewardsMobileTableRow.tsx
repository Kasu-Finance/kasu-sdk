import { Box, Grid, TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import { PortfolioRewardsType } from '@/hooks/portfolio/usePortfolioRewards'
import useTranslation from '@/hooks/useTranslation'

import { formatAmount } from '@/utils'

type PortfolioRewardsTableRowProps = {
  portfolioReward: PortfolioRewardsType
}

const PortfolioRewardsMobileTableRow: React.FC<
  PortfolioRewardsTableRowProps
> = ({ portfolioReward }) => {
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell sx={{ px: 0, borderColor: '#E0C19C' }}>
        <Typography variant='subtitle2' component='span' fontSize={12}>
          {portfolioReward.label}
        </Typography>
        <Grid container columns={10} mt={1}>
          <Grid item xs={6}>
            <Typography
              variant='body2'
              component='span'
              fontSize={10}
              display='block'
            >
              {t('portfolio.rewards.claimableBalance')}
            </Typography>
            {portfolioReward.lastEpoch ? (
              <Box>
                <Typography variant='body2' component='span'>
                  {formatAmount(
                    portfolioReward.lastEpoch.ksuAmount ??
                      portfolioReward.lastEpoch.usdcAmount,
                    { minValue: 1_000_000 }
                  )}{' '}
                  {portfolioReward.lastEpoch.ksuAmount ? 'KSU' : 'USDC'}
                  <Typography
                    variant='inherit'
                    component='span'
                    color='#8C8C8C'
                  >
                    {portfolioReward.lastEpoch.ksuAmount
                      ? `${formatAmount(
                          portfolioReward.lastEpoch.usdcAmount || '0',
                          {
                            minValue: 1_000_000,
                          }
                        )} USDC`
                      : undefined}
                  </Typography>
                </Typography>
              </Box>
            ) : (
              <Typography
                variant='body1'
                component='span'
                color={(theme) => theme.palette.text.disabled}
              >
                –
              </Typography>
            )}
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
              {formatAmount(
                portfolioReward.lifeTime.ksuAmount ??
                  portfolioReward.lifeTime.usdcAmount,
                { minValue: 1_000_000 }
              )}{' '}
              {portfolioReward.lifeTime.ksuAmount ? 'KSU' : 'USDC'}
            </Typography>
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  )
}

export default PortfolioRewardsMobileTableRow
