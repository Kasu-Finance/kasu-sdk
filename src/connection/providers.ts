import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { SupportedChainIds } from './chains';
import AppStaticJsonRpcProvider from './providers/rpc/StaticJsonRpcProvider';
import AppRpcProvider from './providers/rpc/AppJsonRpcProvider';
import { RPC_URLS } from './rpc';

const providerFactory = (chainId: SupportedChainIds, i = 0) =>
    new AppStaticJsonRpcProvider(chainId, RPC_URLS[chainId][i]);

export const RPC_PROVIDERS: {
    [key in SupportedChainIds]: StaticJsonRpcProvider;
} = {
    [SupportedChainIds.MAINNET]: new AppRpcProvider(SupportedChainIds.MAINNET, [
        providerFactory(SupportedChainIds.MAINNET),
        providerFactory(SupportedChainIds.MAINNET, 1),
    ]),
    [SupportedChainIds.ARBITRUM_ONE]: providerFactory(SupportedChainIds.ARBITRUM_ONE),
};
