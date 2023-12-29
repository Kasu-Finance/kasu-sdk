import { SupportedChainIds } from './chains';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import AppStaticJsonRpcProvider from './rpc/StaticJsonRpcProvider';
import AppRpcProvider from './rpc/AppJsonRpcProvider';
import { RPC_URLS } from './networks';

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
