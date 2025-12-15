'use client'

import React, { ReactNode } from 'react'
import { SWRConfig } from 'swr'

import { TimeConversions } from '@/utils'

type SwrProviderProps = {
  children: ReactNode
  unusedPools: string[]
}

const SwrProvider: React.FC<SwrProviderProps> = ({ children, unusedPools }) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          unusedPools,
        },
        dedupingInterval: TimeConversions.SECONDS_PER_MINUTE * 5,
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  )
}

export default SwrProvider
