'use server'

import { JsonRpcProvider } from '@ethersproject/providers'
import { KasuSdk } from '@solidant/kasu-sdk'
// @ts-ignore: xhr2 type exported as any
import { XMLHttpRequest } from 'xhr2'

import getUnusedPools from '@/actions/getUnusedPools'
import sdkConfig, { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

global.XMLHttpRequest = XMLHttpRequest

const CURRENT_NETWORK =
  NETWORK === 'BASE'
    ? SupportedChainIds['BASE']
    : SupportedChainIds['BASE_SEPOLIA']

const fallbackProvider = new JsonRpcProvider(RPC_URLS[CURRENT_NETWORK][0])

export const getKasuSDK = async (provider?: JsonRpcProvider) => {
  const unusedPools: string[] = await getUnusedPools()

  const library = provider ?? fallbackProvider
  return new KasuSdk(
    { ...sdkConfig, UNUSED_LENDING_POOL_IDS: unusedPools! },
    library.getSigner() ?? library
  )
}
