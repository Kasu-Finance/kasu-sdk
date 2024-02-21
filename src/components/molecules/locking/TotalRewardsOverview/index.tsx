'use client'

import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import EarningsMultiplier from '@/components/molecules/locking/TotalRewardsOverview/EarningsMultiplier'
import EpochCountdown from '@/components/molecules/locking/TotalRewardsOverview/EpochCountdown'
import LaunchBonus from '@/components/molecules/locking/TotalRewardsOverview/LaunchBonus'
import ProtocolFeeSharing from '@/components/molecules/locking/TotalRewardsOverview/ProtocolFeeSharing'

const TotalRewardsOverview = () => {
  const { t } = useTranslation()

  return (
    <CardWidget title={t('locking.widgets.totalRewards.title')}>
      <EpochCountdown />
      <EarningsMultiplier />
      <LaunchBonus />
      <ProtocolFeeSharing />
    </CardWidget>
  )
}

export default TotalRewardsOverview
