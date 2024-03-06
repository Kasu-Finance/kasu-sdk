import useTranslation from '@/hooks/useTranslation'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

const LaunchBonusBreakdown = () => {
  const { t } = useTranslation()

  return (
    <RewardsBreakdownCard
      title='Reward 2 • KSU Launch Bonus'
      breakdowns={[
        {
          title: 'Your Total Launch Bonus',
          toolTipInfo: 'info',
          metric: ['500.00', 'KSU'],
        },
        {
          title: 'Weighted Average Days Locked',
          toolTipInfo: 'info',
          metric: ['270', t('time.days')],
        },
        {
          title: 'Weighted Average Lock Days Left',
          toolTipInfo: 'info',
          metric: ['100', t('time.days')],
        },
      ]}
    />
  )
}

export default LaunchBonusBreakdown
