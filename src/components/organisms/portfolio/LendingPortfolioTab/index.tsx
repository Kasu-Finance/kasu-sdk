import { CardContent } from '@mui/material'
import { useState } from 'react'

import LendingPortfolioTabHeader from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioTabHeader'
import LendingPortfolioTable from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTable'

const LendingPortfolioTab = () => {
  const [filter, setFilter] = useState({
    activePools: true,
    closedPools: true,
  })

  return (
    <>
      <LendingPortfolioTabHeader filter={filter} setFilter={setFilter} />
      <CardContent
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        })}
      >
        <LendingPortfolioTable filter={filter} />
      </CardContent>
    </>
  )
}

export default LendingPortfolioTab
