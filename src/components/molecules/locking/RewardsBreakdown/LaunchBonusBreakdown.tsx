import useLaunchBonusBreakdown from '@/hooks/locking/useLaunchBonusBreakdown'
import useTranslation from '@/hooks/useTranslation'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

import { formatAmount } from '@/utils'

const LaunchBonusBreakdown = () => {
  const { t } = useTranslation()

  const {
    totalLaunchBonus,
    weightedAverageDaysLeft,
    weightedAverageDaysLocked,
  } = useLaunchBonusBreakdown()

  return (
    <RewardsBreakdownCard
      title='Reward 2 • KSU Launch Bonus'
      breakdowns={[
        {
          title: 'Your Total Launch Bonus',
          toolTipInfo: 'info',
          metric: [
            formatAmount(totalLaunchBonus ?? '0', { minDecimals: 2 }),
            'KSU',
          ],
        },
        {
          title: 'Weighted Average Days Locked',
          toolTipInfo: 'info',
          metric: [
            formatAmount(weightedAverageDaysLocked ?? '0', {
              minDecimals: 2,
              hideTrailingZero: true,
            }),
            t('time.days'),
          ],
        },
        {
          title: 'Weighted Average Lock Days Left',
          toolTipInfo: 'info',
          metric: [
            formatAmount(weightedAverageDaysLeft ?? '0', {
              minDecimals: 2,
              hideTrailingZero: true,
            }),
            t('time.days'),
          ],
        },
      ]}
    />
  )
}

export default LaunchBonusBreakdown
