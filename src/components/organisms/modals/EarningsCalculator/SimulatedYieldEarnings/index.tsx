import { Box, Grid, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import React, { useMemo } from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import SimulatedBaseApy from '@/components/organisms/modals/EarningsCalculator/SimulatedYieldEarnings/SimulatedBaseApy'
import SimulatedBonusEarnings from '@/components/organisms/modals/EarningsCalculator/SimulatedYieldEarnings/SimulatedBonusEarnings'
import SimulatedDefaultEarnings from '@/components/organisms/modals/EarningsCalculator/SimulatedYieldEarnings/SimulatedDefaultEarnings'

import { formatPercentage } from '@/utils'

type SimulatedYieldEarningsProps = {
  loyaltyLevel: LoyaltyLevel
  poolOverview: PoolOverview
}

const SimulatedYieldEarnings: React.FC<SimulatedYieldEarningsProps> = ({
  loyaltyLevel,
  poolOverview,
}) => {
  const { t } = useTranslation()

  const { modalStatus } = useModalStatusState()

  const isLoyal = useMemo(
    () => loyaltyLevel === 1 || loyaltyLevel === 2,
    [loyaltyLevel]
  )

  const apyBonus = useMemo(
    () => (loyaltyLevel === 1 ? 0.1 : loyaltyLevel === 2 ? 0.2 : 0),
    [loyaltyLevel]
  )

  return (
    <Box mt={4}>
      <Typography variant='subtitle1' component='span'>
        {t('modals.earningsCalculator.simulatedYieldEarnings.title')}
      </Typography>
      <ColoredBox sx={{ bgcolor: modalStatus.bgColor, mt: 2, mb: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <SimulatedBaseApy poolOverview={poolOverview} />
          </Grid>
          <Grid item xs={6}>
            <SimulatedDefaultEarnings poolOverview={poolOverview} />
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
                    {formatPercentage(apyBonus / 100)}
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
            <SimulatedBonusEarnings apyBonus={apyBonus} />
          </Grid>
        </Grid>
      </ColoredBox>
    </Box>
  )
}

export default SimulatedYieldEarnings
