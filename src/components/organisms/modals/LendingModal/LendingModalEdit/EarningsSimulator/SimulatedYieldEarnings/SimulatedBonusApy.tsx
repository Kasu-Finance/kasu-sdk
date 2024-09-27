import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { formatPercentage } from '@/utils'

const SimulatedBonusApy = () => {
  const { t } = useTranslation()

  const { stakedPercentage } = useLockingPercentage()

  const { currentLevel, isLoyal } = useLoyaltyLevel(stakedPercentage)

  const apyBonus = useMemo(
    () => (currentLevel === 1 ? 0.1 : currentLevel === 2 ? 0.2 : 0),
    [currentLevel]
  )

  return (
    <InfoRow
      title={t(
        'modals.earningsCalculator.simulatedYieldEarnings.metric-3-title'
      )}
      toolTipInfo={
        <ToolTip
          title={t(
            'modals.earningsCalculator.simulatedYieldEarnings.metric-3-tooltip'
          )}
          iconSx={{
            color: 'gold.extraDark',
            '&:hover': {
              color: 'rgba(133, 87, 38, 1)',
            },
          }}
        />
      }
      showDivider
      dividerProps={{
        color: 'white',
      }}
      metric={
        <Box>
          <Typography variant='baseMdBold' mr='1ch'>
            {formatPercentage(apyBonus / 100)}
          </Typography>
          <Typography variant='baseMd' color='rgba(133, 87, 38, 1)'>
            {isLoyal
              ? currentLevel.toString()
              : t('locking.widgets.loyalty.level.level-0.title')}
          </Typography>
        </Box>
      }
    />
  )
}

export default SimulatedBonusApy
