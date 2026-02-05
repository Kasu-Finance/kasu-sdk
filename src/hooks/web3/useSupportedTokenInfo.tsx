import { useChain } from '@/hooks/context/useChain'

import { TOKENS } from '@/constants/tokens'
import { isSupportedChain } from '@/utils'

const useSupportedTokenInfo = () => {
  const { currentChainId: chainId } = useChain()

  if (!chainId || !isSupportedChain(chainId)) return undefined

  return TOKENS[chainId]
}

export default useSupportedTokenInfo
