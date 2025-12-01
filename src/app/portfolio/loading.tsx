'use client'

import { Backdrop, CircularProgress, Stack, Typography } from '@mui/material'

const PortfolioLoading = () => {
  return (
    <Backdrop
      open
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        background: 'rgba(0, 0, 0, 0.65)',
        color: 'gold.dark',
      }}
    >
      <Stack spacing={1.5} alignItems='center'>
        <CircularProgress color='inherit' thickness={4} />
        <Typography variant='h5' color='gold.dark'>
          Loading portfolio…
        </Typography>
      </Stack>
    </Backdrop>
  )
}

export default PortfolioLoading
