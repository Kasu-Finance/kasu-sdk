import { Container } from '@mui/material'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import PageHeader from '@/components/organisms/lending/PageHeader'
import PoolTabs from '@/components/organisms/lending/PoolTabs'

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

  return (
    <LiteModeRenderer
      renderOnLiteMode={redirect(Routes.lending.root.url)}
      otherwise={
        <Container maxWidth='lg'>
          <PageHeader poolId={poolId} />
          <PoolTabs poolId={poolId} />
          {children}
        </Container>
      }
    />
  )
}
