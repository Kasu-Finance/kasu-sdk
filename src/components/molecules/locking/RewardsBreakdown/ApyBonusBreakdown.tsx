import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

const ApyBonusBreakdown = () => {
  return (
    <RewardsBreakdownCard
      title='Reward 1 • APY Bonus'
      subtitle='(Paid in KSU)'
      breakdowns={[
        {
          title: 'APY Bonus Based on Loyalty Level',
          toolTipInfo: 'info',
          metric: ['1.00 %'],
        },
        {
          title: 'Balance',
          toolTipInfo: 'info',
          metric: ['1.00', 'KSU'],
        },
        {
          title: 'Lifetime',
          toolTipInfo: 'info',
          metric: ['2.00', 'KSU'],
        },
      ]}
    />
  )
}

export default ApyBonusBreakdown
