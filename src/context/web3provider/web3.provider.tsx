'use client'

import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { ReactNode, useEffect } from 'react'

import { connections } from '@/connection/connectors'

type Web3ProviderProps = {
  children: ReactNode
}

const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const connectors = connections.map<[Connector, Web3ReactHooks]>(
    ({ hooks, connector }) => [connector, hooks]
  )

  useEffect(() => {
    // Dynamically import and execute eagerlyConnect
    import('@/connection/eagerlyConnect')
  }, [])

  return (
    <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>
  )
}

export default Web3Provider
