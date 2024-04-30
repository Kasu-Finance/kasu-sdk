import { CardContent } from '@mui/material'

import RewardsTabHeader from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTabHeader'
import PortfolioRewardsTable from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardsTable'

const RewardsTab = () => {
  return (
    <>
      <RewardsTabHeader />
      <CardContent>
        <PortfolioRewardsTable />
      </CardContent>
    </>
  )
}

export default RewardsTab
