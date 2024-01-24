import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { KSULocking } from './services/Locking/locking';
import { SdkConfig } from './sdk-config';

export class KasuSdk {
    private readonly _graphClient: GraphQLClient;
    public readonly Locking: KSULocking;
    constructor(config: SdkConfig, signerOrProvider: Provider | Signer) {
        this._graphClient = new GraphQLClient(config.subgraphUrl);
        this.Locking = new KSULocking(config, signerOrProvider);
    }
}
