'use client';

import { useMemo } from 'react';

import { connections } from '@/connection/connectors';
import { eip6963Connection } from '@/connection/connectors/eip6963';
import { EIP6963_PROVIDER_MANAGER } from '@/connection/providers/eip6963/eip6963manager';

import { Connection, ConnectionType } from '@/types/connectors';

function useEIP6963Connections() {
    const eip6963Injectors = EIP6963_PROVIDER_MANAGER.list;

    return useMemo(() => {
        const eip6963Connections = eip6963Injectors.flatMap(
            (injector) => eip6963Connection.wrap(injector.info) ?? []
        );

        // Displays ui to activate window.ethereum for edge-case where we detect window.ethereum !== one of the eip6963 providers
        const showDeprecatedMessage = false;
        // eip6963Connections.length > 0 &&
        // shouldUseDeprecatedInjector(eip6963Injectors);

        return { eip6963Connections, showDeprecatedMessage };
    }, [eip6963Injectors]);
}

function mergeConnections(connections: Connection[], eip6963Connections: Connection[]) {
    const hasEip6963Connections = eip6963Connections.length > 0;
    const displayedConnections = connections.filter((c) => c.shouldDisplay());

    if (!hasEip6963Connections) return displayedConnections;

    const allConnections = [
        ...eip6963Connections,
        ...displayedConnections.filter(
            (c) =>
                ![ConnectionType.INJECTED, ConnectionType.COINBASE_WALLET].includes(
                    c.type
                )
        ),
    ];
    // By default, injected options should appear second in the list (below Uniswap wallet)
    // allConnections.splice(1, 0, ...eip6963Connections);

    return allConnections;
}

// // TODO(WEB-3244) Improve ordering logic to make less brittle, as it is spread across connections/index.ts and here
// /** Returns an array of all connection Options that should be displayed, where the recent connection is first in the array */
// function getOrderedConnections(
//     connections: Connection[]
//     // recentConnection: RecentConnectionMeta | undefined
// ) {
//     const list: JSX.Element[] = [];
//     for (const connection of connections) {
//         if (!connection.shouldDisplay()) continue;
//         const { name, rdns } = connection.getProviderInfo();

//         // For eip6963 injectors, we need to check rdns in addition to connection type to ensure it's the recent connection
//         // const isRecent =
//         //     connection.type === recentConnection?.type &&
//         //     (!rdns || rdns === recentConnection.rdns);

//         const option = <Option key={name} connection={connection} isRecent={isRecent} />;

//         list.push(option);
//     }

//     return list;
// }

export function useOrderedConnections() {
    const { eip6963Connections, showDeprecatedMessage } = useEIP6963Connections();
    const orderedConnections = useMemo(() => {
        const allConnections = mergeConnections(connections, eip6963Connections);
        return allConnections;
    }, [eip6963Connections]);

    return { orderedConnections, showDeprecatedMessage };
}
