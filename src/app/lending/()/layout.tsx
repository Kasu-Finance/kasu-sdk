import { Container, Grid2, Stack, Typography } from '@mui/material'
import { ReactNode, Suspense } from 'react'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import ReferralDetector from '@/components/atoms/ReferralDetector'
import WaveBox from '@/components/atoms/WaveBox'
import Home from '@/components/molecules/home'
import HomeOverviewSkeleton from '@/components/molecules/loaders/home/HomeOverviewSkeleton'
import HomeTabs from '@/components/organisms/home/HomeTabs'
import PromoBanner from '@/components/organisms/lending/PromoBanner'
import BasicStats from '@/components/organisms/lite/BasicStats'

import HomeState from '@/context/home/home.provider'

type LendingLayoutProps = {
  children: ReactNode
}

export const dynamic = 'force-dynamic'

export default async function LendingLayout({ children }: LendingLayoutProps) {
  return (
    <Container maxWidth='lg'>
      <LiteModeRenderer
        renderOnLiteMode={
          <Grid2 container spacing={3}>
            <Grid2 size={8}>
              <WaveBox variant='dark-gray' borderRadius={6} p={2}>
                <Stack spacing={4.5}>
                  <Typography variant='h2' color='gold.dark'>
                    Lending Portfolio
                  </Typography>
                  <Stack spacing={3}>
                    <BasicStats />
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
        }
        otherwise={
          <HomeState>
            <Suspense fallback={<HomeOverviewSkeleton />}>
              <Home />
            </Suspense>
            <PromoBanner />
            <ReferralDetector />
            <HomeTabs />
            {children}
          </HomeState>
        }
      />
    </Container>
  )
}
