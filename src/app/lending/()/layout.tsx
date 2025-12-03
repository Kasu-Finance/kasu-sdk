import { Container } from '@mui/material'
import { ReactNode, Suspense } from 'react'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import ReferralDetector from '@/components/atoms/ReferralDetector'
import Home from '@/components/molecules/home'
import HomeOverviewSkeleton from '@/components/molecules/loaders/home/HomeOverviewSkeleton'
import HomeTabs from '@/components/organisms/home/HomeTabs'
import ReferralBanner from '@/components/organisms/home/ReferralBanner'

import HomeState from '@/context/home/home.provider'

type LendingLayoutProps = {
  children: ReactNode
}

export const dynamic = 'force-dynamic'

export default async function LendingLayout({ children }: LendingLayoutProps) {
  return (
    <Container maxWidth='lg'>
      <LiteModeRenderer
        renderOnLiteMode={children}
        otherwise={
          <HomeState>
            <Suspense fallback={<HomeOverviewSkeleton />}>
              <Home />
            </Suspense>
            <ReferralDetector />
            <ReferralBanner />
            <HomeTabs />
            {children}
          </HomeState>
        }
      />
    </Container>
  )
}
