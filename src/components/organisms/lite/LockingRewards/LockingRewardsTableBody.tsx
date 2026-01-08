'use client'

import { Stack, TableCell, TableRow, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { type FC, useCallback, useEffect, useRef, useState } from 'react'

import useEarnedBonusLockingAmount from '@/hooks/locking/useEarnedBonusLockingAmount'
import useLockingRewards from '@/hooks/locking/useLockingRewards'
import useUserBonusData from '@/hooks/locking/useUserBonusData'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import LiteModeSkeleton from '@/components/atoms/LiteModeSkeleton'
import LockingRewardsTableRow from '@/components/organisms/lite/LockingRewards/LockingRewardsTableRow'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type LockingRewardsTableBodyProps = {
  onReady?: () => void
}

const LockingRewardsTableBody: FC<LockingRewardsTableBodyProps> = ({
  onReady,
}) => {
  const { t } = getTranslation()

  const [step, setStep] = useState(0)
  const readyRef = useRef(false)

  const signalReady = useCallback(() => {
    if (readyRef.current) return
    readyRef.current = true
    onReady?.()
  }, [onReady])

  useEffect(() => {
    if (step === 0) {
      setStep(1)
    }
  }, [step])

  const { userBonus, isLoading: isUserBonusLoading } = useUserBonusData({
    enabled: step >= 1,
  })

  useEffect(() => {
    if (step === 1 && !isUserBonusLoading) {
      setStep(2)
    }
  }, [step, isUserBonusLoading])

  const { lockingRewards, isLoading: isLockingRewardsLoading } =
    useLockingRewards({
      enabled: step >= 2,
    })

  useEffect(() => {
    if (step === 2 && !isLockingRewardsLoading) {
      setStep(3)
    }
  }, [step, isLockingRewardsLoading])

  const { totalLaunchBonus, isLoading: isLaunchBonusLoading } =
    useEarnedBonusLockingAmount({
      enabled: step >= 3,
    })

  useEffect(() => {
    if (step === 3 && !isLaunchBonusLoading) {
      setStep(4)
    }
  }, [step, isLaunchBonusLoading])

  const { ksuPrice, isLoading: isKsuPriceLoading } = useKsuPrice({
    enabled: step >= 4,
  })

  useEffect(() => {
    if (step === 4 && !isKsuPriceLoading) {
      setStep(5)
      signalReady()
    }
  }, [step, isKsuPriceLoading, signalReady])

  const isLoading =
    step < 5 ||
    isUserBonusLoading ||
    isLockingRewardsLoading ||
    isLaunchBonusLoading ||
    isKsuPriceLoading

  if (isLoading) {
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
