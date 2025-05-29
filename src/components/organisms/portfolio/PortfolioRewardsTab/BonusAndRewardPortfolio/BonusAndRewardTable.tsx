'use client'

import usePortfolioRewards from '@/hooks/portfolio/usePortfolioRewards'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import CustomTable from '@/components/molecules/CustomTable'
import BonusAndRewardSkeleton from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/BonusAndRewardSkeleton'
import BonusAndRewardTableBody from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/BonusAndRewardTableBody'
import BonusAndRewardTableHeader from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/BonusAndRewardTableHeader'

const BonusAndRewardTable = () => {
  const { portfolioRewards, isLoading } = usePortfolioRewards()
  const { ksuPrice, isLoading: isKsuPriceLoading } = useKsuPrice()

  if (isLoading || isKsuPriceLoading) {
    return <BonusAndRewardSkeleton />
  }

  return (
    <CustomTable
      tableHeader={<BonusAndRewardTableHeader />}
      tableBody={
        <BonusAndRewardTableBody
          rewards={portfolioRewards}
          ksuPrice={ksuPrice || '0'}
        />
      }
      sx={{
        bgcolor: 'white',
        borderRadius: 2,
      }}
    />
  )
}

export default BonusAndRewardTable
