export interface ContractAddresses {
    IKSULocking: string;
}
export class SdkConfig {
    subgraphUrl: string;
    contracts: ContractAddresses;

    constructor(
        subgraphUrl: string,
        contracts: ContractAddresses,
      ) {
        this.subgraphUrl = subgraphUrl;
        this.contracts = contracts;
      }
}

