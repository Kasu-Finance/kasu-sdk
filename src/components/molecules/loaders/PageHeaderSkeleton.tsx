import { Box, Paper, Skeleton } from '@mui/material'
import React from 'react'

const PageHeaderSkeleton: React.FC = () => {
  return (
    <Paper sx={{ borderRadius: '4px' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100px',
          overflow: 'hidden',
          background: 'grey.300',
          borderTopRightRadius: '4px',
          borderTopLeftRadius: '4px',
        }}
      >
        <Skeleton variant='rectangular' width='100%' height={100} />
      </Box>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        p={2}
      >
        <Box display='flex' alignItems='center'>
          <Skeleton variant='circular' width={40} height={40} />
          <Skeleton variant='text' width={140} height={30} sx={{ ml: 2 }} />
        </Box>
        <Skeleton variant='rectangular' width={100} height={40} />
      </Box>
    </Paper>
  )
}

export default PageHeaderSkeleton
