'use client'

import { Box, Skeleton, Typography } from '@mui/material'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import UnorderedList from '@/components/atoms/UnorderedList'

import { customTypography } from '@/themes/typography'

const CurrentLoyaltyDescription = () => {
  const { t } = useTranslation()

  const { stakedPercentage, isLoading } = useLockingPercentage()

  const { currentLevel, isLoyal } = useLoyaltyLevel(stakedPercentage)

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
      <Typography variant='h4' mb={4.25}>
        {t(
          `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.title`
        )}
      </Typography>
      <Typography variant='baseSm' component='p' mb={2}>
        {t(
          `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.subtitle`
        )}
      </Typography>
      <UnorderedList
        sx={{
          ...customTypography.baseSm,
          pl: 2,
          'li + li': {
            mt: 1,
          },
        }}
      >
        <li>
          {t(
            `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.list.list-0`
          )}
        </li>
        <li>
          {t(
            `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.list.list-1`
          )}
        </li>
        <li>
          {t(
            `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.list.list-2`
          )}
        </li>
      </UnorderedList>
    </Box>
  )
}

export default CurrentLoyaltyDescription
