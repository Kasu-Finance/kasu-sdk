import { Box, Container } from '@mui/material'
import { ReactNode } from 'react'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import RedirectHandler from '@/components/atoms/RedirectHandler'
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
          <RedirectHandler to={Routes.home.root.url} whenNotConnected />
          <Container maxWidth='lg'>
            <PortfolioSummary />
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
