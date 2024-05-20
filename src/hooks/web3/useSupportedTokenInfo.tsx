import { useWeb3React } from '@web3-react/core'

import { TOKENS } from '@/constants/tokens'
import { isSupportedChain } from '@/utils'

const useSupportedTokenInfo = () => {
  const { chainId } = useWeb3React()

  if (!chainId || !isSupportedChain(chainId)) return undefined

  return TOKENS[chainId]
}

export default useSupportedTokenInfo
