import { JsonRpcProvider } from '@ethersproject/providers'
import { KasuSdk } from '@solidant/kasu-sdk'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import sdkConfig, { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

const chain =
  NETWORK === 'BASE' ? SupportedChainIds.BASE : SupportedChainIds.BASE_SEPOLIA

const fallbackProvider = new JsonRpcProvider(RPC_URLS[chain][0])

const useKasuSDK = () => {
  const { provider, account } = useWeb3React()

  const { data, error } = useSWR(
    account && provider ? ['kasuSDK', provider] : null,
    async ([_, library]) => {
      return new KasuSdk(sdkConfig, library.getSigner())
    },
    { fallbackData: new KasuSdk(sdkConfig, fallbackProvider) }
  )

  if (error) {
    console.error(error)
  }

  return data
}

export default useKasuSDK
