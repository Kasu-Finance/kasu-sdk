import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { SdkConfig } from './sdk-config';
import { DataService } from './services/DataService/data-service';
import { KSULocking } from './services/Locking/locking';
import { UserLending } from './services/UserLending/user-lending';
import { Portfolio } from './services/Portfolio/portfolio';

export class KasuSdk {
    private readonly _graphClient: GraphQLClient;
    public readonly Locking: KSULocking;
    public readonly DataService: DataService;
    public readonly UserLending: UserLending;
    public readonly Portfolio: Portfolio;
    constructor(config: SdkConfig, signerOrProvider: Provider | Signer) {
        this._graphClient = new GraphQLClient(config.subgraphUrl);
        this.Locking = new KSULocking(config, signerOrProvider);
        this.UserLending = new UserLending(config, signerOrProvider);
        this.Portfolio = new Portfolio(config, signerOrProvider);
        this.DataService = new DataService(config);
    }
}
