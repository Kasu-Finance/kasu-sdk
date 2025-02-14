'use client'

import { Box, Skeleton, Stack, Typography } from '@mui/material'

import { getCrown } from '@/components/organisms/header/CurrentLoyaltyCrown'
import useLoyaltyLevel, {
  LoyalLoyaltyLevels,
} from '@/hooks/locking/useLoyaltyLevel'
import getTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'
import Image from 'next/image'
import { useMemo } from 'react'

const CurrentLoyaltyDescription = () => {
  const { t } = getTranslation()

  const { stakedPercentage, isLoading } = useLockingPercentage()

  const { currentLevel, isLoyal } = useLoyaltyLevel(stakedPercentage)

  const benefits = useMemo(() => ({}), [currentLevel, t])

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
    <Box>
      <Box display='flex' alignItems='center' mb={1}>
        <Image
          src={getCrown(currentLevel)}
          alt={`crown-level_${currentLevel}`}
          width={81}
          height={48}
        />
        <Typography variant='h4'>
          {t(
            `locking.widgets.loyalty.level.level-${isLoyal ? (currentLevel as LoyalLoyaltyLevels) : 0}.title`
          )}
        </Typography>
      </Box>
      <Stack spacing={2}></Stack>
    </Box>
  )
}

export default CurrentLoyaltyDescription
