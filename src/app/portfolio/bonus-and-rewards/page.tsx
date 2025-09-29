import { Stack } from '@mui/material'
import { redirect } from 'next/navigation'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import BonusAndRewardPortfolio from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio'
import PortfolioRewardSummary from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardSummary'

import { Routes } from '@/config/routes'

const BonusAndRewards = () => {
  return (
    <LiteModeRenderer
      renderOnLiteMode={redirect(Routes.portfolio.root.url)}
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
