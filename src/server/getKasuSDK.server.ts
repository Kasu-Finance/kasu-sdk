import { JsonRpcProvider } from '@ethersproject/providers'
import { KasuSdk } from '@solidant/kasu-sdk'
// @ts-ignore: xhr2 type exported as any
import { XMLHttpRequest } from 'xhr2'

import sdkConfig from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

global.XMLHttpRequest = XMLHttpRequest

const fallbackProvider = new JsonRpcProvider(
  RPC_URLS[SupportedChainIds.BASE_SEPOLIA][0]
)

export const getKasuSDK = (provider?: JsonRpcProvider) => {
  const library = provider ?? fallbackProvider
  return new KasuSdk(sdkConfig, library.getSigner() ?? library)
}
