import { CardContent } from '@mui/material'

import RewardsTabHeader from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTabHeader'
import PortfolioRewardsTable from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardsTable'

const RewardsTab = () => {
  return (
    <>
      <RewardsTabHeader />
      <CardContent
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        })}
      >
        <PortfolioRewardsTable />
      </CardContent>
    </>
  )
}

export default RewardsTab
