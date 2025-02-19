'use client'

import { Box, LinearProgress, Slider, Stack, Typography } from '@mui/material'
import Image from 'next/image'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import getTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import { getCrown } from '@/components/organisms/header/CurrentLoyaltyCrown'
import ProgressCustomRail from '@/components/organisms/lending/OverviewTab/UserLoyalty/LoyaltyProgress/ProgressCustomRail'

const LoyaltyProgress = () => {
  const { t } = getTranslation()

  const { stakedPercentage, isLoading } = useLockingPercentage()

  const { level_2 } = useLoyaltyLevel(stakedPercentage)

  const progress =
    stakedPercentage > 5
      ? 120
      : ((Math.min(stakedPercentage, level_2) / level_2) * 100) / 1.2

  return (
    <Box display='flex' gap={1.5}>
      <Stack justifyContent='space-between' alignItems='end' mt={-2}>
        <Typography
          variant='baseXs'
          textTransform='capitalize'
          color='gray.middle'
        >
          {t('general.loyaltyLevel')}
        </Typography>

        <Typography variant='baseXs' color='gray.middle'>
          {t('locking.widgets.loyaltyProgress.rKsuRatio')}
        </Typography>
      </Stack>
      <Stack flex={1}>
        <Stack>
          <ProgressCustomRail
            variant='upper'
            progress={progress}
            labels={{
              1: (
                <Stack alignItems='center' ml={-1.2}>
                  <Typography variant='baseSm' color='gold.dark'>
                    1
                  </Typography>
                  <Box
                    component={Image}
                    src={getCrown(0)}
                    alt={`crown-level_${0}`}
                    width={24}
                    height={14}
                  />
                </Stack>
              ),
              16.6: (
                <Stack alignItems='center' ml={-1.2}>
                  <Typography variant='baseSm' color='gold.dark'>
                    2
                  </Typography>
                  <Box
                    component={Image}
                    src={getCrown(1)}
                    alt={`crown-level_${1}`}
                    width={24}
                    height={14}
                  />
                </Stack>
              ),
              83.3: (
                <Stack alignItems='center' ml={-1.2}>
                  <Typography variant='baseSm' color='gold.dark'>
                    3
                  </Typography>
                  <Box
                    component={Image}
                    src={getCrown(2)}
                    alt={`crown-level_${2}`}
                    width={24}
                    height={14}
                  />
                </Stack>
              ),
            }}
          />
        </Stack>
        <Slider
          min={0}
          value={stakedPercentage > 5 ? 6 : stakedPercentage}
          max={level_2 + 1}
          disabled
          slots={{
            thumb: () => null,
            track: (props) => {
              const value =
                (props.ownerState.value / props.ownerState.max) * 100

              return (
                <LinearProgress
                  value={value}
                  variant={isLoading ? 'indeterminate' : 'determinate'}
                  sx={{
                    position: 'absolute',
                    height: 'inherit',
                    width: '100%',
                    borderRadius: 'inherit',
                    border: 'none',
                    backgroundColor: 'gray.extraDark',
                  }}
                />
              )
            },
          }}
          sx={{
            py: 0.5,
            '.MuiSlider-track': {
              border: 'none',
              color: 'gold.dark',
              borderRadius: 1,
            },
            '.MuiSlider-rail': {
              color: 'gray.extraDark',
              borderRadius: 1,
              opacity: 1,
            },
          }}
        />
        <Stack>
          <ProgressCustomRail
            variant='lower'
            progress={progress}
            labels={{
              0: '0%',
              16.6: '1%',
              33.3: '2%',
              50: '3%',
              66.6: '4%',
              83.3: '5%',
              100: '...',
            }}
          />
        </Stack>
      </Stack>
    </Box>
  )
}

export default LoyaltyProgress
