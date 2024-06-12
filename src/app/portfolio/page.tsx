'use client'

import { Container, Stack } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

import PortfolioSummary from '@/components/organisms/portfolio/PortfolioSummary'
import PortfolioTabs from '@/components/organisms/portfolio/PortfolioTabs'

import { Routes } from '@/config/routes'

const Portfolio = () => {
  const { account } = useWeb3React()

  const [delayed, setDelayed] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDelayed(true)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [])

  // dekay for eagerly connect to run before redirecting
  if (!account && delayed) redirect(Routes.home.root.url)

  return (
    <Container maxWidth='lg'>
      <Stack spacing={1}>
        <PortfolioSummary />
        <PortfolioTabs />
      </Stack>
    </Container>
  )
}

export default Portfolio
