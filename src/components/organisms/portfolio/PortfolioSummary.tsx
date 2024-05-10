import { Card, CardContent, Grid } from '@mui/material'

import CurrentSummary from '@/components/molecules/portfolio/CurrentSummary'
import LifetimeSummary from '@/components/molecules/portfolio/LifetimeSummary'

const PortfolioSummary = () => {
  return (
    <Card>
      <CardContent component={Grid} container spacing={2}>
        <CurrentSummary />
        <LifetimeSummary />
      </CardContent>
    </Card>
  )
}

export default PortfolioSummary
