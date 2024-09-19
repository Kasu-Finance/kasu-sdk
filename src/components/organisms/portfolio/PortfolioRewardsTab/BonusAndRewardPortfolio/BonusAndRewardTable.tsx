'use client'

import usePortfolioRewards from '@/hooks/portfolio/usePortfolioRewards'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import CustomTableTest from '@/components/molecules/CustomTableTest'
import BonusAndRewardSkeleton from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/BonusAndRewardSkeleton'
import BonusAndRewardTableBody from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/BonusAndRewardTableBody'
import BonusAndRewardTableHeader from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/BonusAndRewardTableHeader'

const BonusAndRewardTable = () => {
  const { portfolioRewards, isLoading } = usePortfolioRewards()
  const { ksuPrice, isLoading: isKsuPriceLoading } = useKsuPrice()

  if (isLoading || isKsuPriceLoading) {
    return <BonusAndRewardSkeleton />
  }

  if (!portfolioRewards) return null

  return (
    <CustomTableTest
      tableHeader={<BonusAndRewardTableHeader />}
      tableBody={
        <BonusAndRewardTableBody
          rewards={portfolioRewards}
          ksuPrice={ksuPrice || '0'}
        />
      }
    />
  )
}

export default BonusAndRewardTable
