import { Box, Container } from '@mui/material'
import { ReactNode } from 'react'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import RedirectHandler from '@/components/atoms/RedirectHandler'
import PromoBanner from '@/components/organisms/lending/PromoBanner'
import PortfolioSummary from '@/components/organisms/portfolio/PortfolioSummary'
import PortfolioTabs from '@/components/organisms/portfolio/PortfolioTabs'

import PortfolioState from '@/context/portfolio/portfolio.provider'

import { Routes } from '@/config/routes'

type PortfolioLayoutProps = {
  children: ReactNode
}

export default async function PortfolioLayout({
  children,
}: PortfolioLayoutProps) {
  return (
    <LiteModeRenderer
      renderOnLiteMode={<Container maxWidth='lg'>{children}</Container>}
      otherwise={
        <>
          <RedirectHandler delay={2000} url={Routes.home.root.url} />
          <Container maxWidth='lg'>
            <PortfolioSummary />
            <PromoBanner />
            <PortfolioTabs />
            <Box pt={3}>
              <PortfolioState>{children}</PortfolioState>
            </Box>
          </Container>
        </>
      }
    />
  )
}
