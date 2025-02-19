'use client'

import { Box, Icon, Skeleton, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import { useMemo } from 'react'

import useLoyaltyLevel, {
  LoyalLoyaltyLevels,
  LoyaltyLevel,
} from '@/hooks/locking/useLoyaltyLevel'
import getTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import { getCrown } from '@/components/organisms/header/CurrentLoyaltyCrown'
import LearnButton from '@/components/organisms/lending/OverviewTab/UserLoyalty/LearnButton'

import { CrossIcon, PartialVerifiedIcon, VerifiedIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'

const CurrentLoyaltyDescription = () => {
  const { t } = getTranslation()

  const { stakedPercentage, isLoading } = useLockingPercentage()

  const { currentLevel, isLoyal } = useLoyaltyLevel(stakedPercentage)

  const benefits: Record<
    LoyaltyLevel,
    {
      protocolFeeSharing: boolean
      apyBonus: boolean
      priorityAccess: boolean
      priortiyWithdrawal: boolean
    }
  > = useMemo(
    () => ({
      '-1': {
        protocolFeeSharing: false,
        apyBonus: false,
        priorityAccess: false,
        priortiyWithdrawal: false,
      },
      '0': {
        protocolFeeSharing: true,
        apyBonus: false,
        priorityAccess: false,
        priortiyWithdrawal: false,
      },
      '1': {
        protocolFeeSharing: true,
        apyBonus: true,
        priorityAccess: true,
        priortiyWithdrawal: true,
      },
      '2': {
        protocolFeeSharing: true,
        apyBonus: true,
        priorityAccess: true,
        priortiyWithdrawal: true,
      },
    }),
    []
  )

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant='rounded' width={123} height={24} sx={{ mb: 4.25 }} />
        <Skeleton variant='rounded' height={72} sx={{ mb: 2 }} />
        <Skeleton variant='rounded' height={36} />
        <Skeleton variant='rounded' height={36} sx={{ mt: 1 }} />
        <Skeleton variant='rounded' height={54} sx={{ mt: 1 }} />
      </Box>
    )
  }

  return (
    <Stack justifyContent='space-between' height='100%'>
      <Box display='flex' alignItems='center' mb={1}>
        {currentLevel >= 0 && (
          <Image
            src={getCrown(currentLevel)}
            alt={`crown-level_${currentLevel}`}
            width={81}
            height={48}
          />
        )}
        <Typography variant='h4'>
          {currentLevel >= 0
            ? t(
                `locking.widgets.loyalty.level.level-${isLoyal ? (currentLevel as LoyalLoyaltyLevels) : 0}.title`
              )
            : 'No Loyalty Level'}
        </Typography>
      </Box>
      <Stack spacing={2}>
        <Box display='flex' gap={1} alignItems='center'>
          {benefits[currentLevel]?.protocolFeeSharing ? (
            <Icon
              sx={{
                p: 0,
                m: 0,
                width: 24,
                height: 24,
                fontSize: 'unset',
                path: {
                  fill: customPalette.gold.dark,
                },
              }}
            >
              <VerifiedIcon />
            </Icon>
          ) : (
            <CrossIcon />
          )}
          <Typography variant='baseMdBold'>Protocol Fee Sharing</Typography>
        </Box>
        <Box display='flex' gap={1}>
          {benefits[currentLevel]?.apyBonus ? (
            <Icon
              sx={{
                p: 0,
                m: 0,
                width: 24,
                height: 24,
                fontSize: 'unset',
                path: {
                  fill: customPalette.gold.dark,
                },
              }}
            >
              {currentLevel === 1 ? <PartialVerifiedIcon /> : <VerifiedIcon />}
            </Icon>
          ) : (
            <CrossIcon />
          )}
          <Typography variant='baseMdBold'>APY Bonus</Typography>
        </Box>
        <Box display='flex' gap={1}>
          {benefits[currentLevel]?.priorityAccess ? (
            <Icon
              sx={{
                p: 0,
                m: 0,
                width: 24,
                height: 24,
                fontSize: 'unset',
                path: {
                  fill: customPalette.gold.dark,
                },
              }}
            >
              {currentLevel === 1 ? <PartialVerifiedIcon /> : <VerifiedIcon />}
            </Icon>
          ) : (
            <CrossIcon />
          )}
          <Typography variant='baseMdBold'>
            Priority Access to Lending Strategies
          </Typography>
        </Box>
        <Box display='flex' gap={1}>
          {benefits[currentLevel]?.priortiyWithdrawal ? (
            <Icon
              sx={{
                p: 0,
                m: 0,
                width: 24,
                height: 24,
                fontSize: 'unset',
                path: {
                  fill: customPalette.gold.dark,
                },
              }}
            >
              {currentLevel === 1 ? <PartialVerifiedIcon /> : <VerifiedIcon />}
            </Icon>
          ) : (
            <CrossIcon />
          )}
          <Typography variant='baseMdBold'>Priority Withdrawal</Typography>
        </Box>
      </Stack>
      <LearnButton />
    </Stack>
  )
}

export default CurrentLoyaltyDescription
