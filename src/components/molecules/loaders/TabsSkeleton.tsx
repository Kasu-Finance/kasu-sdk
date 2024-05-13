import { Box, Skeleton } from '@mui/material'
import React from 'react'

interface TabsSkeletonProps {
  numTabs: number
}

const TabsSkeleton: React.FC<TabsSkeletonProps> = ({ numTabs }) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        pl: 0,
      }}
    >
      {Array.from({ length: numTabs }, (_, index) => (
        <Skeleton
          key={index}
          width={100}
          height={30}
          variant='rounded'
          sx={{ bgcolor: 'grey', mr: 2 }}
        />
      ))}
    </Box>
  )
}

export default TabsSkeleton
