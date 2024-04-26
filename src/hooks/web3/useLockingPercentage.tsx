import { formatEther } from 'ethers/lib/utils'

import useRatio from '@/hooks/useRatio'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useTotalLendingPoolDeposits from '@/hooks/web3/useTotalLendingPoolDeposits'

const useLockingPercentage = () => {
  const { totalDeposits } = useTotalLendingPoolDeposits()

  const { rKsuAmount } = useEarnedRKsu()

  const ratio = useRatio(rKsuAmount || '0', totalDeposits || '0')

  const stakedPercentage = parseFloat(formatEther(ratio.mul(100)))

  return stakedPercentage
}

export default useLockingPercentage
