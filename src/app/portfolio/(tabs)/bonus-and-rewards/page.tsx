import { Stack } from '@mui/material'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import RedirectHandler from '@/components/atoms/RedirectHandler'
import BonusAndRewardPortfolio from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio'
import PortfolioRewardSummary from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardSummary'

import { Routes } from '@/config/routes'

const BonusAndRewards = () => {
  return (
    <LiteModeRenderer
      renderOnLiteMode={<RedirectHandler to={Routes.portfolio.root.url} />}
      otherwise={
        <Stack spacing={3}>
          <PortfolioRewardSummary />
          <BonusAndRewardPortfolio />
        </Stack>
      }
    />
  )
}

export default BonusAndRewards
