import { Card, CardContent } from '@mui/material'

import LendingPortfolioTabHeader from '@/components/molecules/portfolio/LendingPortfolioTabHeader'
import LendingPortfolioTable from '@/components/organisms/portfolio/LendingPortfolioTable'

const LendingPortfolioTab = () => {
  return (
    <Card>
      <LendingPortfolioTabHeader />
      <CardContent>
        <LendingPortfolioTable />
      </CardContent>
    </Card>
  )
}

export default LendingPortfolioTab
