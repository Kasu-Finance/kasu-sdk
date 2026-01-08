import { formatEther } from 'ethers/lib/utils'

import useRatio from '@/hooks/useRatio'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useTotalLendingPoolDeposits from '@/hooks/web3/useTotalLendingPoolDeposits'

import { convertToUSD, toBigNumber } from '@/utils'

type UseLockingPercentageOptions = {
  enabled?: boolean
}

const useLockingPercentage = (options?: UseLockingPercentageOptions) => {
  const enabled = options?.enabled ?? true
  const { totalDeposits, isLoading: totalDepositsLoading } =
    useTotalLendingPoolDeposits({ enabled })

  const { rKsuAmount, isLoading: rKsuLoading } = useEarnedRKsu({ enabled })

  const { ksuPrice, isLoading: ksuPriceLoading } = useKsuPrice({ enabled })

  const rKsuInUSD = convertToUSD(
    toBigNumber(rKsuAmount || '0'),
    toBigNumber(ksuPrice || '0')
  )

  const totalDepositsUSD = toBigNumber(
    totalDeposits.activeDepositAmount || '0'
  ).add(toBigNumber(totalDeposits.pendingDepositAmount || '0'))

  const ratio = useRatio(formatEther(rKsuInUSD), formatEther(totalDepositsUSD))

  const stakedPercentage = parseFloat(formatEther(ratio.mul(100)))

  return {
    stakedPercentage,
    isLoading:
      enabled && (totalDepositsLoading || rKsuLoading || ksuPriceLoading),
  }
}

export default useLockingPercentage
