'use client'

import { Box } from '@mui/material'

import useLiteModeState from '@/hooks/context/useLiteModeState'

import PoolLayoutWrapperSkeleton from '@/components/organisms/home/PoolLayoutWrapperSkeleton'

const Loading = () => {
  const { isLiteMode } = useLiteModeState()

  if (typeof isLiteMode === 'undefined' || isLiteMode) {
    return null
  }

  return (
    <Box mt={3}>
      <PoolLayoutWrapperSkeleton />
    </Box>
  )
}

export default Loading
