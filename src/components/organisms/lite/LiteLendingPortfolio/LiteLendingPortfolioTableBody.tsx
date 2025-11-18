import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import React from 'react'

import LiteLendingPortfolioTableRow from '@/components/organisms/lite/LiteLendingPortfolio/LiteLendingPortfolioTableRow'

type LiteLendingPortfolioTableBodyProps = {
  portfolioLendingPools: PortfolioLendingPool[]
}

const LiteLendingPortfolioTableBody: React.FC<
  LiteLendingPortfolioTableBodyProps
> = ({ portfolioLendingPools }) => {
  return portfolioLendingPools.map((portfolioPool, index, og) => (
    <LiteLendingPortfolioTableRow
      portfolioLendingPool={portfolioPool}
      poolPositionPercentage={((index + 1) / og.length) * 100}
      key={portfolioPool.id}
    />
  ))
}

export default LiteLendingPortfolioTableBody
