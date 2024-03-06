import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

const FeesEarnedBreakdown = () => {
  return (
    <RewardsBreakdownCard
      title='Reward 3 • Protocol Fee Sharing'
      breakdowns={[
        {
          title: 'Claimable Balance',
          toolTipInfo: 'info',
          metric: ['500.00', 'USDC'],
        },

        {
          title: 'Lifetime Protocol Fees',
          toolTipInfo: 'info',
          metric: ['1,000.00', 'USDC'],
        },
      ]}
    />
  )
}

export default FeesEarnedBreakdown
