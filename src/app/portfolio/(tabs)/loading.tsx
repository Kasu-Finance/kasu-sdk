'use client'

import { Card, CardContent, Skeleton, Stack } from '@mui/material'

import useLiteModeState from '@/hooks/context/useLiteModeState'

import LendingPortfolioTableSkeleton from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableSkeleton'

const Loading = () => {
  const { isLiteMode } = useLiteModeState()

  if (typeof isLiteMode === 'undefined' || isLiteMode) {
    return null
  }

  return (
    <Stack spacing={3}>
      <Skeleton variant='rounded' height={40} />
      <Card>
        <Skeleton variant='rectangular' height={72} />
        <CardContent sx={{ p: 0 }}>
          <LendingPortfolioTableSkeleton />
        </CardContent>
      </Card>
    </Stack>
  )
}

export default Loading
