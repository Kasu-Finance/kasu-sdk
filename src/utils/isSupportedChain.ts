import { SupportedChainIds } from '@/connection/chains';

const isSupportedChain = (chainId: number): chainId is SupportedChainIds => {
    return chainId in SupportedChainIds;
};

export default isSupportedChain;
