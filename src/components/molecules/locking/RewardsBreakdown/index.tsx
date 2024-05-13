'use client'

import { Grid } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import ApyBonusBreakdown from '@/components/molecules/locking/RewardsBreakdown/ApyBonusBreakdown'
import FeesEarnedBreakdown from '@/components/molecules/locking/RewardsBreakdown/FeesEarnedBreakdown'
import LaunchBonusBreakdown from '@/components/molecules/locking/RewardsBreakdown/LaunchBonusBreakdown'

const RewardsBreakdown = () => {
  const { t } = useTranslation()

  return (
    <CardWidget title={t('locking.widgets.rewardsSummary.title')}>
      <Grid container spacing={3}>
        <ApyBonusBreakdown />
        <LaunchBonusBreakdown />
        <FeesEarnedBreakdown />
      </Grid>
    </CardWidget>
  )
}

export default RewardsBreakdown
