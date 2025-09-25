export interface ContractAddresses {
    KSUToken: string;
    IKSULocking: string;
    IKSULockBonus: string;
    UserManager: string;
    LendingPoolManager: string;
    KasuAllowList: string;
    SystemVariables: string;
    UserLoyaltyRewards: string;
    KsuPrice: string;
    ClearingCoordinator: string;
    KasuNFTs: string;
    ExternalTVL: string;
}
export class SdkConfig {
    subgraphUrl: string;
    plumeSubgraphUrl: string;
    contracts: ContractAddresses;
    directusUrl: string;
    UNUSED_LENDING_POOL_IDS: string[];

    constructor(
        subgraphUrl: string,
        plumeSubgraphUrl: string,
        contracts: ContractAddresses,
        directusUrl: string,
        UNUSED_LENDING_POOL_IDS: string[],
    ) {
        this.subgraphUrl = subgraphUrl;
        this.plumeSubgraphUrl = plumeSubgraphUrl;
        this.contracts = contracts;
        this.directusUrl = directusUrl;
        this.UNUSED_LENDING_POOL_IDS = UNUSED_LENDING_POOL_IDS;
    }
}
