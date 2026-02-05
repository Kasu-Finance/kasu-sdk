import { Container } from '@mui/material'
import { ReactNode } from 'react'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import RedirectHandler from '@/components/atoms/RedirectHandler'
import PageHeaderChainWrapper from '@/components/organisms/lending/PageHeaderChainWrapper'
import PoolTabs from '@/components/organisms/lending/PoolTabs'

import { getPoolOverview } from '@/app/_requests/pools'
import { Routes } from '@/config/routes'

type LendingLayoutProps = {
  children: ReactNode
  params: Promise<{ slug: string }>
}

export default async function LendingSlugLayout({
  children,
  params,
}: LendingLayoutProps) {
  const { slug: poolId } = await params

  // Fetch pool from default chain (Base) for server rendering
  // The PageHeaderChainWrapper will fetch client-side for other chains
  const pools = await getPoolOverview(poolId)
  const serverPool = pools?.[0] ?? null

  return (
    <LiteModeRenderer
      renderOnLiteMode={<RedirectHandler to={Routes.lending.root.url} />}
      otherwise={
        <Container maxWidth='lg'>
          <PageHeaderChainWrapper poolId={poolId} serverPool={serverPool} />
          <PoolTabs poolId={poolId} />
          {children}
        </Container>
      }
    />
  )
}
