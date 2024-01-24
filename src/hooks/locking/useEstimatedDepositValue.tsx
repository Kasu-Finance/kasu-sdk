import { formatEther, parseEther } from 'ethers/lib/utils'

import useKsuPrice from '@/hooks/useKsuPrice'

const useEstimatedDepositValue = (amount: string) => {
  const { ksuPrice } = useKsuPrice()

  return ksuPrice && amount
    ? formatEther(
        parseEther(amount).mul(parseEther(ksuPrice)).div(parseEther('1'))
      )
    : '0'
}

export default useEstimatedDepositValue
