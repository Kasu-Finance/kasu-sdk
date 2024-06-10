'use client'

import { useMemo } from 'react'

import { connections } from '@/connection/connectors'
import {
  eip6963Connection,
  isSupportedConnector,
} from '@/connection/connectors/eip6963'
import { EIP6963_PROVIDER_MANAGER } from '@/connection/providers/eip6963/eip6963manager'

import { Connection, ConnectionType } from '@/types/connectors'

function useEIP6963Connections() {
  const eip6963Injectors = EIP6963_PROVIDER_MANAGER.list

  return useMemo(() => {
    const eip6963Connections = eip6963Injectors
      .flatMap(
        (injector) =>
          eip6963Connection.wrap(injector.info) ?? ([] as Connection[])
      )
      .filter((injector) => injector.shouldDisplay())

    // Displays ui to activate window.ethereum for edge-case where we detect window.ethereum !== one of the eip6963 providers
    const showDeprecatedMessage = false
    // eip6963Connections.length > 0 &&
    // shouldUseDeprecatedInjector(eip6963Injectors);

    return { eip6963Connections, showDeprecatedMessage }
  }, [eip6963Injectors])
}

function mergeConnections(
  connections: Connection[],
  eip6963Connections: Connection[]
) {
  const hasEip6963Connections = eip6963Connections.length > 0
  const displayedConnections = connections.filter((c) => {
    // filter injected connections that show up but are not supported by us.
    if (c.type === ConnectionType.INJECTED) {
      const providerInfo = c.getProviderInfo()

      return (
        providerInfo.rdns &&
        isSupportedConnector(providerInfo.rdns) &&
        c.shouldDisplay()
      )
    }

    return c.shouldDisplay()
  })

  if (!hasEip6963Connections) return displayedConnections

  const eip6963Names = eip6963Connections.map((connection) => {
    return connection.getProviderInfo().name
  })

  const allConnections = [
    ...eip6963Connections,
    ...displayedConnections.filter(
      (connection) => !eip6963Names.includes(connection.getProviderInfo().name)
    ),
  ]

  return allConnections
}

export function useOrderedConnections() {
  const { eip6963Connections, showDeprecatedMessage } = useEIP6963Connections()
  const orderedConnections = useMemo(() => {
    const allConnections = mergeConnections(connections, eip6963Connections)
    return allConnections
  }, [eip6963Connections])

  return { orderedConnections, showDeprecatedMessage }
}
