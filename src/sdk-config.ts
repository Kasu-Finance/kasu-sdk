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
    /**
     * Pool ids to EXCLUDE from every subgraph query (`id_not_in`).
     *
     * An empty array is normalised to `['']` by the `SdkConfig` constructor.
     * The subgraph reads `id_not_in: []` as "match nothing", not "exclude
     * nothing": on Base, `[]` returns 0 pools where `['']` returns all 9
     * (verified live 2026-09-04). Passing `[]` therefore used to make the SDK
     * silently return an empty platform, which is why every consumer already
     * passes a sentinel of its own. A sentinel you pass yourself is left
     * untouched.
     */
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
    /**
     * Decimals of the stable asset used by lending pools (e.g. 6 for USDC/AUDD).
     * @default 6
     */
    stableAssetDecimals?: number;
}

export class SdkConfig {
    subgraphUrl: string;
    contracts: ContractAddresses;
    /** Directus CMS URL. When empty, DataService skips CMS enrichment and returns on-chain data only. */
    directusUrl: string;
    UNUSED_LENDING_POOL_IDS: string[];
    isLiteDeployment: boolean;
    poolMetadataMapping: Record<string, string>;
    stableAssetDecimals: number;

    constructor(options: SdkConfigOptions) {
        this.subgraphUrl = options.subgraphUrl;
        this.contracts = options.contracts;
        this.directusUrl = options.directusUrl ?? '';
        // `id_not_in: []` matches NOTHING in the subgraph, so an empty
        // exclusion list would hide every pool. The empty-string sentinel is
        // the "exclude nothing" spelling — no pool id is the empty string, and
        // it is what the consumers already work around this with.
        this.UNUSED_LENDING_POOL_IDS =
            options.UNUSED_LENDING_POOL_IDS.length > 0
                ? options.UNUSED_LENDING_POOL_IDS
                : [''];
        this.isLiteDeployment = options.isLiteDeployment ?? false;
        this.poolMetadataMapping = options.poolMetadataMapping ?? {};
        this.stableAssetDecimals = options.stableAssetDecimals ?? 6;
    }
}
