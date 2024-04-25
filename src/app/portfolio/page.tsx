import { Container, Stack } from '@mui/material'

import PortfolioSummary from '@/components/organisms/portfolio/PortfolioSummary'
import PortfolioTabs from '@/components/organisms/portfolio/PortfolioTabs'

const Portfolio = () => {
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
