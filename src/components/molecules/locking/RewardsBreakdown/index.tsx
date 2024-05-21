'use client'

import { Grid } from '@mui/material'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import ApyBonusBreakdown from '@/components/molecules/locking/RewardsBreakdown/ApyBonusBreakdown'
import FeesEarnedBreakdown from '@/components/molecules/locking/RewardsBreakdown/FeesEarnedBreakdown'
import LaunchBonusBreakdown from '@/components/molecules/locking/RewardsBreakdown/LaunchBonusBreakdown'

const RewardsBreakdown = () => {
  const { t } = useTranslation()
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  return (
    <CardWidget title={t('locking.widgets.rewardsBreakdown.title')}>
      <Grid container spacing={3} direction={isMobile ? 'column' : 'row'}>
        <ApyBonusBreakdown />
        <LaunchBonusBreakdown />
        <FeesEarnedBreakdown />
      </Grid>
    </CardWidget>
  )
}

export default RewardsBreakdown
