import { Box, Grid, Typography } from '@mui/material'
import React from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

type SimulatedYieldEarningsProps = {
  loyaltyLevel: LoyaltyLevel
}

const SimulatedYieldEarnings: React.FC<SimulatedYieldEarningsProps> = ({
  loyaltyLevel,
}) => {
  const { modalStatus } = useModalStatusState()

  const { t } = useTranslation()

  const isLoyal = loyaltyLevel === 1 || loyaltyLevel === 2

  return (
    <Box mt={4}>
      <Typography variant='subtitle1' component='span'>
        {t('modals.earningsCalculator.simulatedDuration.title')}
      </Typography>
      <ColoredBox sx={{ bgcolor: modalStatus.bgColor, mt: 2, mb: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <InfoColumn
              title={t('general.apy')}
              subtitle={`(${t('general.base')})`}
              subtitleStyle={{
                variant: 'caption',
                textTransform: 'capitalize',
              }}
              toolTipInfo={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-1-toolip'
              )}
              showDivider
              metric={
                <Typography
                  variant='h6'
                  component='span'
                  display='block'
                  pt='6px'
                  pl={2}
                >
                  5.00 %
                </Typography>
              }
            />
          </Grid>
          <Grid item xs={6}>
            <BalanceItem
              title={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-2-title'
              )}
              toolTipInfo={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-2-tooltip'
              )}
              value={['500.00', 'USDC']}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoColumn
              title={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-3-title'
              )}
              toolTipInfo={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-3-tooltip'
              )}
              showDivider
              metric={
                <Box pt='6px' pl={2}>
                  <Typography variant='h6' component='span'>
                    0.10 %
                  </Typography>
                  <Typography
                    display='block'
                    variant='body1'
                    component='span'
                    color={(theme) => theme.palette.text.secondary}
                  >
                    {isLoyal
                      ? loyaltyLevel.toString()
                      : t('locking.widgets.loyalty.level.level-0.title')}
                  </Typography>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={6}>
            <BalanceItem
              title={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-4-title'
              )}
              toolTipInfo={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-4-tooltip'
              )}
              value={['500.00', 'KSU']}
              usdValue='250.00'
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </Box>
  )
}

export default SimulatedYieldEarnings
