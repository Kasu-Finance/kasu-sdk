'use client'

import React, { ReactNode } from 'react'
import { SWRConfig } from 'swr'

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
      }}
    >
      {children}
    </SWRConfig>
  )
}

export default SwrProvider
