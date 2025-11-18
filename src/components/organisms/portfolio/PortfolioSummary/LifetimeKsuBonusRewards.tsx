'use client'

import { Box, Skeleton, SkeletonProps, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { formatEther, parseEther } from 'ethers/lib/utils'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import TokenAmount, { TokenAmountProps } from '@/components/atoms/TokenAmount'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type LifetimeKsuBonusRewardsProps = Partial<TokenAmountProps> & {
  currentEpoch: string
  poolOverviews: PoolOverview[]
  showUsdAmout?: boolean
  skeletonProps?: SkeletonProps
}

const LifetimeKsuBonusRewards: React.FC<LifetimeKsuBonusRewardsProps> = ({
  currentEpoch,
  poolOverviews,
  showUsdAmout = true,
  skeletonProps,
  ...rest
}) => {
  const { portfolioSummary, isLoading } = usePortfolioSummary(
    currentEpoch,
    poolOverviews
  )

  const { ksuPrice, isLoading: ksuPriceLoading } = useKsuPrice()

  if (isLoading && ksuPriceLoading) {
    return (
      <Skeleton variant='rounded' width={90} height={24} {...skeletonProps} />
    )
  }

  const ksuInUSD = convertToUSD(
    toBigNumber(portfolioSummary?.lifetime.ksuBonusRewards || '0'),
    parseEther(ksuPrice || '0')
  )

  return (
    <Box display='flex' alignItems='end'>
      <TokenAmount
        amount={formatAmount(
          portfolioSummary?.lifetime.ksuBonusRewards || '0',
          {
            minDecimals: 2,
          }
        )}
        symbol='KASU'
        {...rest}
      />
      {showUsdAmout && (
        <Typography variant='baseMd' color='gray.middle' ml='1ch'>
          ({formatAmount(formatEther(ksuInUSD))} USDC)
        </Typography>
      )}
    </Box>
  )
}

export default LifetimeKsuBonusRewards
