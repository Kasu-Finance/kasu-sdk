import { useChainId } from 'wagmi'

import { TOKENS } from '@/constants/tokens'
import { isSupportedChain } from '@/utils'

const useSupportedTokenInfo = () => {
  const chainId = useChainId()

  if (!chainId || !isSupportedChain(chainId)) return undefined

  return TOKENS[chainId]
}

export default useSupportedTokenInfo
