import { Container } from '@mui/material'
import { ReactNode } from 'react'

import PageHeader from '@/components/organisms/lending/PageHeader'
import PoolTabs from '@/components/organisms/lending/PoolTabs'

type LendingLayoutProps = {
  children: ReactNode
  params: Promise<{ slug: string }>
}

export default async function LendingSlugLayout({
  children,
  params,
}: LendingLayoutProps) {
  const { slug: poolId } = await params

  return (
    <Container maxWidth='lg'>
      <PageHeader poolId={poolId} />
      <PoolTabs poolId={poolId} />
      {children}
    </Container>
  )
}
