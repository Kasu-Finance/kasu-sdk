import { useCallback } from 'react'

import { SwapDataRes } from '@/app/api/getSwapData/route'
import { SupportedChainIds } from '@/connection/chains'

const useGenerateSwapData = () => {
  return useCallback(
    async (
      chainId: SupportedChainIds,
      fromToken: `0x${string}`,
      toToken: `0x${string}`,
      fromAmount: string,
      user: `0x${string}`,
      slippage: string
    ) => {
      const res = await fetch(
        '/api/getSwapData?' +
          new URLSearchParams({
            chainId: chainId.toString(),
            fromToken,
            toToken,
            fromAmount,
            user,
            slippage,
          })
      )

      const data: SwapDataRes = await res.json()

      return data
    },
    []
  )
}

export default useGenerateSwapData
