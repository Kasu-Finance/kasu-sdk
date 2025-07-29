import { Grid2, Stack, Typography } from '@mui/material'

import WaveBox from '@/components/atoms/WaveBox'
import BasicStats from '@/components/organisms/lite/BasicStats'
import PendingTransactionRequests from '@/components/organisms/lite/PendingTransactionRequests'

const LiteModeApp = () => {
  return (
    <Grid2 container spacing={3}>
      <Grid2 size={8}>
        <WaveBox variant='dark-gray' borderRadius={6} p={2}>
          <Stack spacing={4.5}>
            <Typography variant='h2' color='gold.dark'>
              Lending Portfolio
            </Typography>
            <Stack spacing={3}>
              <BasicStats />
              <PendingTransactionRequests />
            </Stack>
          </Stack>
        </WaveBox>
      </Grid2>
      <Grid2 size={4}>
        <WaveBox variant='dark-gray' borderRadius={6} p={2}>
          <Typography color='white'>world</Typography>
        </WaveBox>
      </Grid2>
    </Grid2>
  )
}

export default LiteModeApp
