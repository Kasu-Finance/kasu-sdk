export interface ContractAddresses {
    /** KSU Token address - only present on Full deployments (Base), undefined on Lite (XDC, Plume) */
    KSUToken?: string;
    IKSULocking: string;
    IKSULockBonus: string;
    UserManager: string;
    LendingPoolManager: string;
    KasuAllowList: string;
    SystemVariables: string;
    UserLoyaltyRewards: string;
    KsuPrice: string;
    ClearingCoordinator: string;
    /** KasuNFTs address - only present on Full deployments */
    KasuNFTs?: string;
    ExternalTVL: string;
}

export interface SdkConfigOptions {
    subgraphUrl: string;
    contracts: ContractAddresses;
    /** Directus CMS URL. Optional – when omitted, pool descriptions/images will not be available but on-chain data still works. */
    directusUrl?: string;
    UNUSED_LENDING_POOL_IDS: string[];
    /**
     * Whether this is a Lite deployment (no KSU token, locking, or loyalty features).
     * Set to true for XDC, Plume, and other chains without the full token system.
     * @default false
     */
    isLiteDeployment?: boolean;
    /**
     * Maps pool addresses to their metadata source pool address in Directus.
     * Used for chains (XDC, Plume) that share pool descriptions with Base.
     * Key: pool address on this chain (lowercase)
     * Value: pool address in Directus / Base pool (lowercase)
     */
    poolMetadataMapping?: Record<string, string>;
}

export class SdkConfig {
    subgraphUrl: string;
    contracts: ContractAddresses;
    /** Directus CMS URL. When empty, DataService skips CMS enrichment and returns on-chain data only. */
    directusUrl: string;
    UNUSED_LENDING_POOL_IDS: string[];
    isLiteDeployment: boolean;
    poolMetadataMapping: Record<string, string>;

    constructor(options: SdkConfigOptions) {
        this.subgraphUrl = options.subgraphUrl;
        this.contracts = options.contracts;
        this.directusUrl = options.directusUrl ?? '';
        this.UNUSED_LENDING_POOL_IDS = options.UNUSED_LENDING_POOL_IDS;
        this.isLiteDeployment = options.isLiteDeployment ?? false;
        this.poolMetadataMapping = options.poolMetadataMapping ?? {};
    }
}
