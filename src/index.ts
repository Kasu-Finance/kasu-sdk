import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { SdkConfig } from './sdk-config';
import { DataService } from './services/DataService/data-service';
import { KSULocking } from './services/Locking/locking';

export class KasuSdk {
    private readonly _graphClient: GraphQLClient;
    public readonly Locking: KSULocking;
    public readonly DataService: DataService
    constructor(config: SdkConfig, signerOrProvider: Provider | Signer) {
        this._graphClient = new GraphQLClient(config.subgraphUrl);
        this.Locking = new KSULocking(config, signerOrProvider);
        this.DataService = new DataService(config);
    }
}
