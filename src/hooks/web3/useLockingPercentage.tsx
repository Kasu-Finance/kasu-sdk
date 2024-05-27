import { formatEther } from 'ethers/lib/utils'

import useRatio from '@/hooks/useRatio'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useTotalLendingPoolDeposits from '@/hooks/web3/useTotalLendingPoolDeposits'

import { SupportedTokens } from '@/constants/tokens'
import { convertToUSD, toBigNumber } from '@/utils'

const useLockingPercentage = () => {
  const { totalDeposits } = useTotalLendingPoolDeposits()

  const { rKsuAmount } = useEarnedRKsu()

  const { ksuPrice } = useKsuPrice()

  const supportedToken = useSupportedTokenInfo()

  const rKsuInUSD = convertToUSD(
    toBigNumber(rKsuAmount || '0'),
    toBigNumber(
      ksuPrice || '0',
      supportedToken?.[SupportedTokens.USDC].decimals
    )
  )

  const totalDepositsUSD = toBigNumber(
    totalDeposits.activeDepositAmount || '0'
  ).add(toBigNumber(totalDeposits.pendingDepositAmount || '0'))

  const ratio = useRatio(
    parseFloat(formatEther(rKsuInUSD)),
    parseFloat(formatEther(totalDepositsUSD))
  )

  const stakedPercentage = parseFloat(formatEther(ratio.mul(100)))

  return stakedPercentage
}

export default useLockingPercentage
