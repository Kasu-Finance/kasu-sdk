'use client'

import { Card, CardContent, Skeleton, Stack } from '@mui/material'

import useLiteModeState from '@/hooks/context/useLiteModeState'

import BonusAndRewardSkeleton from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/BonusAndRewardSkeleton'

const Loading = () => {
  const { isLiteMode } = useLiteModeState()

  if (typeof isLiteMode === 'undefined' || isLiteMode) {
    return null
  }

  return (
    <Stack spacing={3}>
      <Card>
        <Skeleton variant='rectangular' height={72} />
        <CardContent>
          <Skeleton variant='rounded' height={220} />
        </CardContent>
      </Card>

      <Card>
        <Skeleton variant='rectangular' height={72} />
        <CardContent>
          <BonusAndRewardSkeleton />
          <Skeleton variant='rounded' height={220} sx={{ mt: 3 }} />
          <Skeleton variant='rounded' height={120} sx={{ mt: 3 }} />
        </CardContent>
      </Card>
    </Stack>
  )
}

export default Loading
