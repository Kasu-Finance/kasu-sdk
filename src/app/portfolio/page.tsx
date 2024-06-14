import { Container, Stack } from '@mui/material'

import RedirectHandler from '@/components/atoms/RedirectHandler'
import PortfolioSummary from '@/components/organisms/portfolio/PortfolioSummary'
import PortfolioTabs from '@/components/organisms/portfolio/PortfolioTabs'

import { Routes } from '@/config/routes'

const Portfolio = () => {
  return (
    <>
      <RedirectHandler delay={2000} url={Routes.home.root.url} />
      <Container maxWidth='lg'>
        <Stack spacing={1}>
          <PortfolioSummary />
          <PortfolioTabs />
        </Stack>
      </Container>
    </>
  )
}

export default Portfolio
