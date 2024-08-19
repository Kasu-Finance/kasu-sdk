'use client'

import { Slider, Stack, Typography } from '@mui/material'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import ProgressCustomRail from '@/components/organisms/lending/OverviewTab/UserLoyalty/LoyaltyProgress/ProgressCustomRail'
import ProgressIndicator from '@/components/organisms/lending/OverviewTab/UserLoyalty/LoyaltyProgress/ProgressIndicator'

const LoyaltyProgress = () => {
  const { t } = useTranslation()

  const stakedPercentage = useLockingPercentage()

  const { level_2 } = useLoyaltyLevel(stakedPercentage)

  return (
    <Stack>
      <Stack>
        <ProgressCustomRail
          variant='upper'
          progress={(Math.min(stakedPercentage, level_2) / level_2) * 100}
          labels={{
            0: t('locking.widgets.loyalty.level.level-0.title'),
            20: t('locking.widgets.loyalty.level.level-1.level'),
            100: t('locking.widgets.loyalty.level.level-2.level'),
          }}
        />
        <Typography
          variant='baseXs'
          textTransform='capitalize'
          textAlign='right'
          mt='3px'
          color='gray.middle'
        >
          {t('general.loyaltyLevel')}
        </Typography>
      </Stack>
      <Slider
        min={0}
        value={stakedPercentage}
        max={level_2}
        disabled
        slots={{
          thumb: ({ style }) => <ProgressIndicator {...style} />,
        }}
        sx={{
          '.MuiSlider-track': {
            border: 'none',
            color: 'gold.dark',
          },
          '.MuiSlider-rail': {
            color: 'gray.extraDark',
            opacity: 1,
          },
        }}
      />
      <Stack>
        <Typography
          variant='baseXs'
          textAlign='right'
          mb='3px'
          color='gray.middle'
        >
          {t('locking.widgets.loyaltyProgress.rKsuRatio')}
        </Typography>
        <ProgressCustomRail
          variant='lower'
          progress={(Math.min(stakedPercentage, level_2) / level_2) * 100}
          labels={{
            0: '0%',
            20: '1%',
            40: '2%',
            60: '3%',
            80: '4%',
            100: '5%',
          }}
        />
      </Stack>
    </Stack>
  )
}

export default LoyaltyProgress
