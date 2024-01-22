export interface ContractAddresses {
    KSUToken: string;
    IKSULocking: string;
    IKSULockBonus: string;
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

