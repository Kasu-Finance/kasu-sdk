import { Stack } from '@mui/material'

import BonusAndRewardPortfolio from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio'
import PortfolioRewardSummary from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardSummary'

const BonusAndRewards = () => {
  return (
    <Stack spacing={3}>
      <PortfolioRewardSummary />
      <BonusAndRewardPortfolio />
    </Stack>
  )
}

export default BonusAndRewards
