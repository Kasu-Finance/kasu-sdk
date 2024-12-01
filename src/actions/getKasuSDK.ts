'use server'

import { JsonRpcProvider } from '@ethersproject/providers'
import { KasuSdk } from '@solidant/kasu-sdk'
// @ts-ignore: xhr2 type exported as any
import { XMLHttpRequest } from 'xhr2'

import { getUnusedPools } from '@/app/_requests/unusedPools'
import sdkConfig, { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

global.XMLHttpRequest = XMLHttpRequest

const CURRENT_NETWORK =
  NETWORK === 'BASE'
    ? SupportedChainIds['BASE']
    : SupportedChainIds['BASE_SEPOLIA']

const provider = new JsonRpcProvider({
  url: RPC_URLS[CURRENT_NETWORK][0],
  skipFetchSetup: true,
})

export const getKasuSDK = async () => {
  const unusedPools = await getUnusedPools()

  return new KasuSdk(
    {
      ...sdkConfig,
      UNUSED_LENDING_POOL_IDS: unusedPools.length ? unusedPools : [''],
    },
    provider
  )
}
