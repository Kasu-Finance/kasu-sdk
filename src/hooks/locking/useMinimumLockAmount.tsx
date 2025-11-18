import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'

import {
  LOYALTY_LEVEL_1_REQUIREMENT,
  LOYALTY_LEVEL_2_REQUIREMENT,
} from '@/hooks/locking/useLoyaltyLevel'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useTotalLendingPoolDeposits from '@/hooks/web3/useTotalLendingPoolDeposits'

import { convertFromUSD, convertToUSD, toBigNumber } from '@/utils'

const useMinimumLockAmount = () => {
  const { totalDeposits, isLoading: totalDepositsLoading } =
    useTotalLendingPoolDeposits()

  const { rKsuAmount, isLoading: rKsuLoading } = useEarnedRKsu()

  const { ksuPrice, isLoading: ksuPriceLoading } = useKsuPrice()

  const rKsuInUSD = convertToUSD(
    toBigNumber(rKsuAmount || '0'),
    toBigNumber(ksuPrice || '0')
  )

  const totalDepositsUSD = toBigNumber(
    totalDeposits.activeDepositAmount || '0'
  ).add(toBigNumber(totalDeposits.pendingDepositAmount || '0'))

  const level_1_min = BigNumber.from(LOYALTY_LEVEL_1_REQUIREMENT)
    .mul(totalDepositsUSD)
    .sub(rKsuInUSD)

  const level_2_min = BigNumber.from(LOYALTY_LEVEL_2_REQUIREMENT)
    .mul(totalDepositsUSD)
    .sub(rKsuInUSD)

  return {
    isLoading: (totalDepositsLoading || rKsuLoading) && ksuPriceLoading,
    level_1_min: formatEther(
      convertFromUSD(level_1_min, toBigNumber(ksuPrice || '0'))
    ),
    level_2_min: formatEther(
      convertFromUSD(level_2_min, toBigNumber(ksuPrice || '0'))
    ),
  }
}

export default useMinimumLockAmount
