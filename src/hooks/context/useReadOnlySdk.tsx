import { KasuSdk } from '@kasufinance/kasu-sdk'
import { useMemo } from 'react'

import { useChain } from '@/hooks/context/useChain'

import sdkConfig from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'
import QueuedJsonRpcProvider from '@/utils/rpc/QueuedJsonRpcProvider'

type UseReadOnlySdkOptions = {
  maxConcurrent?: number
}

const sdkCache = new Map<string, KasuSdk>()

const useReadOnlySdk = (options?: UseReadOnlySdkOptions) => {
  const { currentChainId: chainId } = useChain()
  const rpcUrl = RPC_URLS[chainId as SupportedChainIds]?.[0]
  const maxConcurrent = options?.maxConcurrent ?? 2

  return useMemo(() => {
    if (!rpcUrl) return undefined
    const cacheKey = `${rpcUrl}|${maxConcurrent}`
    const cached = sdkCache.get(cacheKey)
    if (cached) return cached

    const provider = new QueuedJsonRpcProvider(rpcUrl, maxConcurrent)
    const sdk = new KasuSdk(sdkConfig, provider)
    sdkCache.set(cacheKey, sdk)
    return sdk
  }, [rpcUrl, maxConcurrent])
}

export default useReadOnlySdk
