'use client'

import { Card, CardContent, Grid } from '@mui/material'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import CurrentSummary from '@/components/molecules/portfolio/CurrentSummary'
import LifetimeSummary from '@/components/molecules/portfolio/LifetimeSummary'

const PortfolioSummary = () => {
  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  return (
    <Card>
      <CardContent
        component={Grid}
        container
        spacing={2}
        sx={{ p: isMobile ? 1 : undefined }}
      >
        <CurrentSummary />
        <LifetimeSummary />
      </CardContent>
    </Card>
  )
}

export default PortfolioSummary
