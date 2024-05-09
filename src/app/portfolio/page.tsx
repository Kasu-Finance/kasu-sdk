'use client'

import { Container, Stack } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { redirect } from 'next/navigation'

import PortfolioSummary from '@/components/organisms/portfolio/PortfolioSummary'
import PortfolioTabs from '@/components/organisms/portfolio/PortfolioTabs'

import { Routes } from '@/config/routes'

const Portfolio = () => {
  const { account } = useWeb3React()

  if (!account) redirect(Routes.home.root.url)

  return (
    <Container maxWidth='lg'>
      <Stack spacing={3}>
        <PortfolioSummary />
        <PortfolioTabs />
      </Stack>
    </Container>
  )
}

export default Portfolio
