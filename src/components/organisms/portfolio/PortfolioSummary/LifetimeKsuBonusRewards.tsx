'use client'

import { Box, Skeleton, SkeletonProps, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import usePortfolioSummaryContext from '@/hooks/context/usePortfolioSummaryContext'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import TokenAmount, { TokenAmountProps } from '@/components/atoms/TokenAmount'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type LifetimeKsuBonusRewardsProps = Partial<TokenAmountProps> & {
  showUsdAmout?: boolean
  skeletonProps?: SkeletonProps
}

const LifetimeKsuBonusRewards: React.FC<LifetimeKsuBonusRewardsProps> = ({
  showUsdAmout = true,
  skeletonProps,
  ...rest
}) => {
  const { portfolioSummary, isLoading } = usePortfolioSummaryContext()

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
