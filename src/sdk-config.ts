export interface ContractAddresses {
    KSUToken: string;
    IKSULocking: string;
    IKSULockBonus: string;
    UserManager: string;
    LendingPoolManager: string;
    KasuAllowList: string;
    SystemVariables: string;
    UserLoyaltyRewards: string;
}
export class SdkConfig {
    subgraphUrl: string;
    contracts: ContractAddresses;
    directusUrl: string;

    constructor(
        subgraphUrl: string,
        contracts: ContractAddresses,
        directusUrl: string,
    ) {
        this.subgraphUrl = subgraphUrl;
        this.contracts = contracts;
        this.directusUrl = directusUrl;
    }
}
