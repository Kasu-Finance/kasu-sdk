import { CardContent } from '@mui/material'

import LendingPortfolioTabHeader from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioTabHeader'
import LendingPortfolioTable from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTable'

const LendingPortfolioTab = () => {
  return (
    <>
      <LendingPortfolioTabHeader />
      <CardContent>
        <LendingPortfolioTable />
      </CardContent>
    </>
  )
}

export default LendingPortfolioTab
