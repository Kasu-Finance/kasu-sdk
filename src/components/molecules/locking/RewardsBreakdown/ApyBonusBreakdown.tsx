import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useUserApyBonus from '@/hooks/locking/useUserApyBonus'
import useTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

import { capitalize, formatAmount } from '@/utils'

const ApyBonusBreakdown = () => {
  const { t } = useTranslation()

  const stakedPercentage = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)
  const { apyBonus } = useUserApyBonus()

  return (
    <RewardsBreakdownCard
      title={t('locking.widgets.rewardsBreakdown.rewards-1.title')}
      subtitle={t('locking.widgets.rewardsBreakdown.rewards-1.subtitle')}
      breakdowns={[
        {
          title: t('locking.widgets.rewardsBreakdown.rewards-1.metric-1'),
          toolTipInfo: t(
            'locking.widgets.rewardsBreakdown.rewards-1.metric-1-tooltip'
          ),
          metric: [
            currentLevel === 1 ? '0.1%' : currentLevel === 2 ? '0.2%' : 'None',
          ],
        },
        {
          title: capitalize(t('general.balance')),
          toolTipInfo: t(
            'locking.widgets.rewardsBreakdown.rewards-1.metric-2-tooltip'
          ),
          metric: [formatAmount(apyBonus?.balance.toString() || '0'), 'KSU'],
        },
        {
          title: capitalize(t('general.lifetime')),
          toolTipInfo: t(
            'locking.widgets.rewardsBreakdown.rewards-1.metric-3-tooltip'
          ),
          metric: [formatAmount(apyBonus?.lifetime || '0'), 'KSU'],
        },
      ]}
    />
  )
}

export default ApyBonusBreakdown
