import { Container } from '@mui/material'
import { ReactNode, Suspense } from 'react'

import Home from '@/components/molecules/home'
import HomeOverviewSkeleton from '@/components/molecules/loaders/home/HomeOverviewSkeleton'
import HomeTabs from '@/components/organisms/home/HomeTabs'

type LendingLayoutProps = {
  children: ReactNode
}

export default async function LendingLayout({ children }: LendingLayoutProps) {
  return (
    <Container maxWidth='lg'>
      <Suspense fallback={<HomeOverviewSkeleton />}>
        <Home />
      </Suspense>
      <HomeTabs />
      {children}
    </Container>
  )
}
