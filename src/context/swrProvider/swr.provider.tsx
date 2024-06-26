'use client'
import { JsonRpcProvider } from '@ethersproject/providers'
import { KasuSdk } from '@solidant/kasu-sdk'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

import sdkConfig, { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

type SWRProviderProps = {
  children: ReactNode
  lockPeriods: LockPeriod[]
  unusedPools: string[]
}

const chain =
  NETWORK === 'BASE' ? SupportedChainIds.BASE : SupportedChainIds.BASE_SEPOLIA

const fallbackProvider = new JsonRpcProvider(RPC_URLS[chain][0])

export const SWRProvider: React.FC<SWRProviderProps> = ({
  children,
  lockPeriods,
  unusedPools,
}) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          ['lockPeriods']: lockPeriods,
          ['unusedPools']: unusedPools,
          ['kasuSDK']: new KasuSdk(
            { ...sdkConfig, UNUSED_LENDING_POOL_IDS: unusedPools },
            fallbackProvider
          ),
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
