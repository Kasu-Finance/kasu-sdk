import { JsonRpcProvider } from '@ethersproject/providers'
import { KasuSdk } from '@solidant/kasu-sdk'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import sdkConfig from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

const fallbackProvider = new JsonRpcProvider(
  RPC_URLS[SupportedChainIds.BASE_SEPOLIA][0]
)

const useKasuSDK = () => {
  const { provider } = useWeb3React()

  const { data, error } = useSWR(
    provider ? ['kasuSDK', provider] : null,
    ([_, library]) => new KasuSdk(sdkConfig, library.getSigner() ?? library),
    { fallbackData: new KasuSdk(sdkConfig, fallbackProvider) }
  )

  if (error) {
    console.error(error)
  }

  return data
}

export default useKasuSDK
