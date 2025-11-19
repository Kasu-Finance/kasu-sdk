'use client'

import { Stack, TableCell, TableRow, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'

import usePortfolioRewards from '@/hooks/portfolio/usePortfolioRewards'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import LiteModeSkeleton from '@/components/atoms/LiteModeSkeleton'
import LockingRewardsTableRow from '@/components/organisms/lite/LockingRewards/LockingRewardsTableRow'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const LockingRewardsTableBody = () => {
  const { t } = getTranslation()

  const { portfolioRewards, isLoading } = usePortfolioRewards()
  const { ksuPrice, isLoading: isKsuPriceLoading } = useKsuPrice()

  if (isLoading || isKsuPriceLoading) {
    return (
      <TableRow sx={{ '.MuiTableCell-root': { py: 1 } }}>
        <TableCell>
          <LiteModeSkeleton width={170} height={30} />
        </TableCell>
        <TableCell>
          <LiteModeSkeleton width={120} height={30} sx={{ ml: 'auto' }} />
        </TableCell>
        <TableCell>
          <LiteModeSkeleton width={120} height={30} sx={{ ml: 'auto' }} />
        </TableCell>
      </TableRow>
    )
  }

  const claimableYieldEarningsBalanceUSD = convertToUSD(
    toBigNumber(
      portfolioRewards?.bonusYieldEarnings.claimableBalance.ksuAmount || '0'
    ),
    toBigNumber(ksuPrice || '0')
  )

  const lifetimeYieldEarningsBalanceUSD = convertToUSD(
    toBigNumber(portfolioRewards?.bonusYieldEarnings.lifeTime.ksuAmount || '0'),
    toBigNumber(ksuPrice || '0')
  )

  const lifetimeLaunchBonusUSD = convertToUSD(
    toBigNumber(portfolioRewards?.ksuLaunchBonus.lifeTime.ksuAmount || '0'),
    toBigNumber(ksuPrice || '0')
  )

  return (
    <>
      <LockingRewardsTableRow
        key={0}
        label={
          portfolioRewards?.bonusYieldEarnings.label ??
          t('portfolio.rewards.bonusYieldEarnings')
        }
        lifeTimeRewards={
          <Stack>
            <Typography variant='baseSmBold'>
              {formatAmount(
                portfolioRewards?.bonusYieldEarnings.lifeTime.ksuAmount || '0',
                {
                  minValue: 1_000_000,
                  minDecimals: 2,
                }
              )}{' '}
              KASU
            </Typography>
            <Typography variant='baseSm' color='gray.middle'>
              {formatAmount(formatEther(lifetimeYieldEarningsBalanceUSD), {
                minValue: 1_000_000,
                minDecimals: 2,
              })}{' '}
              USDC
            </Typography>
          </Stack>
        }
        claimableRewards={
          <Stack>
            <Typography variant='baseSmBold'>
              {formatAmount(
                portfolioRewards?.bonusYieldEarnings.claimableBalance
                  .ksuAmount || '0',
                {
                  minValue: 1_000_000,
                  minDecimals: 2,
                }
              )}{' '}
              KASU
            </Typography>
            <Typography variant='baseSm' color='gray.middle'>
              {formatAmount(formatEther(claimableYieldEarningsBalanceUSD), {
                minValue: 1_000_000,
                minDecimals: 2,
              })}{' '}
              USDC
            </Typography>
          </Stack>
        }
      />
      <LockingRewardsTableRow
        key={1}
        label={
          portfolioRewards?.protocolFees.label ??
          t('portfolio.rewards.protocolFees')
        }
        lifeTimeRewards={`${formatAmount(
          portfolioRewards?.protocolFees.lifeTime.usdcAmount || '0',
          {
            minValue: 1_000_000,
            minDecimals: 2,
          }
        )} USDC `}
        claimableRewards={`${formatAmount(
          portfolioRewards?.protocolFees.claimableBalance.usdcAmount || '0',
          {
            minValue: 1_000_000,
            minDecimals: 2,
          }
        )} USDC`}
      />
      <LockingRewardsTableRow
        key={2}
        label={
          portfolioRewards?.ksuLaunchBonus.label ??
          t('portfolio.rewards.ksuLaunchBonus')
        }
        lifeTimeRewards={
          <Stack>
            <Typography variant='baseSmBold'>
              {formatAmount(
                portfolioRewards?.ksuLaunchBonus.lifeTime.ksuAmount || '0',
                {
                  minValue: 1_000_000,
                  minDecimals: 2,
                }
              )}{' '}
              KASU
            </Typography>
            <Typography variant='baseSm' color='gray.middle'>
              {formatAmount(formatEther(lifetimeLaunchBonusUSD), {
                minValue: 1_000_000,
                minDecimals: 2,
              })}{' '}
              USDC
            </Typography>
          </Stack>
        }
        claimableRewards={
          <Typography variant='inherit' mr='1ch'>
            -
          </Typography>
        }
      />
    </>
  )
}

export default LockingRewardsTableBody
