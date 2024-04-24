'use client'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

type SWRProviderProps = {
  children: ReactNode
  lockPeriods: LockPeriod[]
}

export const SWRProvider: React.FC<SWRProviderProps> = ({
  children,
  lockPeriods,
}) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          ['lockPeriods']: lockPeriods,
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
