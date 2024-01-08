import { SupportedChainIds } from '@/connection/chains';
import { networks } from '@/connection/networks';
import { ErrorCode } from '@/constants';
import { useWeb3React } from '@web3-react/core';
import { ProviderRpcError } from '@web3-react/types';
import { useCallback } from 'react';

const useSwitchChain = () => {
    const { connector } = useWeb3React();

    return useCallback(
        async (chainId: SupportedChainIds) => {
            if (!connector) return;

            try {
                await connector.activate(chainId);
            } catch (error) {
                const errorCode =
                    (error as any).data?.originalError?.code ||
                    (error as ProviderRpcError).code;

                if (errorCode === ErrorCode.CHAIN_NOT_ADDED) {
                    console.log(networks[chainId]);

                    // label cannot be present ( look at AddEthereumChainParameter type )
                    delete networks[chainId].label;

                    await connector.activate(networks[chainId]);
                }
            }
        },
        [connector]
    );
};

export default useSwitchChain;
