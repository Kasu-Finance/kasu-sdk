'use client'

import { Stack, TableCell, TableRow, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'

import useEarnedBonusLockingAmount from '@/hooks/locking/useEarnedBonusLockingAmount'
import useLockingRewards from '@/hooks/locking/useLockingRewards'
import useUserBonusData from '@/hooks/locking/useUserBonusData'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import LiteModeSkeleton from '@/components/atoms/LiteModeSkeleton'
import LockingRewardsTableRow from '@/components/organisms/lite/LockingRewards/LockingRewardsTableRow'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const LockingRewardsTableBody = () => {
  const { t } = getTranslation()

  const { userBonus, isLoading: isUserBonusLoading } = useUserBonusData()
  const { lockingRewards, isLoading: isLockingRewardsLoading } =
    useLockingRewards()
  const { totalLaunchBonus, isLoading: isLaunchBonusLoading } =
    useEarnedBonusLockingAmount()
  const { ksuPrice, isLoading: isKsuPriceLoading } = useKsuPrice()

  if (
    isUserBonusLoading ||
    isLockingRewardsLoading ||
    isLaunchBonusLoading ||
    isKsuPriceLoading
  ) {
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
    toBigNumber(userBonus?.ksuBonusAndRewards || '0'),
    toBigNumber(ksuPrice || '0')
  )

  const lifetimeYieldEarningsBalanceUSD = convertToUSD(
    toBigNumber(userBonus?.ksuBonusAndRewardsLifetime || '0'),
    toBigNumber(ksuPrice || '0')
  )

  const lifetimeLaunchBonusUSD = convertToUSD(
    toBigNumber(totalLaunchBonus || '0'),
    toBigNumber(ksuPrice || '0')
  )

  return (
    <>
      <LockingRewardsTableRow
        key={0}
        label={t('portfolio.rewards.bonusYieldEarnings')}
        lifeTimeRewards={
          <Stack>
            <Typography variant='baseSmBold'>
              {formatAmount(userBonus?.ksuBonusAndRewardsLifetime || '0', {
                minValue: 1_000_000,
                minDecimals: 2,
              })}{' '}
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
              {formatAmount(userBonus?.ksuBonusAndRewards || '0', {
                minValue: 1_000_000,
                minDecimals: 2,
              })}{' '}
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
        label={t('portfolio.rewards.protocolFees')}
        lifeTimeRewards={`${formatAmount(
          lockingRewards?.lifeTimeRewards || '0',
          {
            minValue: 1_000_000,
            minDecimals: 2,
          }
        )} USDC `}
        claimableRewards={`${formatAmount(
          lockingRewards?.claimableRewards || '0',
          {
            minValue: 1_000_000,
            minDecimals: 2,
          }
        )} USDC`}
      />
      <LockingRewardsTableRow
        key={2}
        label={t('portfolio.rewards.ksuLaunchBonus')}
        lifeTimeRewards={
          <Stack>
            <Typography variant='baseSmBold'>
              {formatAmount(totalLaunchBonus || '0', {
                minValue: 1_000_000,
                minDecimals: 2,
              })}{' '}
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
