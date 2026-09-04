import { BigNumberish, BytesLike } from 'ethers';

import { ContractAddresses, SdkConfigOptions } from '../sdk-config';
import { LendingTotals, PoolOverview, TrancheData } from '../services/DataService/types';
import {
    PortfolioLendingPool,
    PortfolioSummary,
} from '../services/Portfolio/types';

// ---------------------------------------------------------------------------
// Chain & SDK Configuration
// ---------------------------------------------------------------------------

export type SupportedChain = 'base' | 'xdc' | 'xdc-usdc' | 'plume';

/**
 * The single stable token a deployment lends in. There is exactly ONE per
 * deployment and it never changes: a different stable token is a separate full
 * deployment (the XDC AUDD / XDC USDC pattern), never a companion vault on an
 * existing one. That is why this is a plain object on the chain config rather
 * than a list.
 */
export interface StableAsset {
    /** ERC-20 address of the stable token on this chain. */
    address: string;
    /** Ticker as the token contract reports it (`USDC`, `AUDD`, `pUSD`). */
    symbol: string;
    /** Token name as the contract reports it (`USD Coin`). */
    name: string;
    /**
     * Token decimals. Feeds `SdkConfig.stableAssetDecimals`, so every
     * `parseUnits`/`formatUnits` in the SDK follows the chain rather than the
     * hard-coded default of 6.
     */
    decimals: number;
    /**
     * ISO-4217 code of the fiat currency the token tracks (`USD`, `AUD`).
     * A CODE, not copy: consumers pick their own symbol and locale from it.
     * Nothing in this SDK formats it.
     */
    currencyCode: string;
}

export interface ChainConfigEntry {
    chainId: number;
    name: string;
    isLiteDeployment: boolean;
    contracts: ContractAddresses;
    subgraphUrl: string;
    directusUrl: string;
    /**
     * Pools to hide. An EMPTY array is normalised to `['']` by `SdkConfig` —
     * the subgraph reads `id_not_in: []` as "match nothing" and returns zero
     * pools. See `SdkConfigOptions.UNUSED_LENDING_POOL_IDS`.
     */
    unusedPoolIds: string[];
    poolMetadataMapping?: Record<string, string>;
    /** The one stable token this deployment lends in. */
    stableAsset: StableAsset;
    /**
     * Public RPC endpoints for read-only use, in STARTING preference order
     * only. Apps are expected to override with their own paid/keyed endpoints
     * and their own failover; `Kasu.create` uses `rpcUrls[0]` and nothing else
     * when no `signerOrProvider` is passed.
     *
     * Empty on a retired deployment, which has no read-only default.
     */
    rpcUrls: string[];
    /**
     * True for a wound-down deployment kept only as frozen history. It has no
     * default RPC, so a read-only `Kasu.create` on it throws.
     */
    retired?: boolean;
}

/** Options passed to `Kasu.create()`. */
export interface KasuOptions {
    /** A supported chain name or a custom `ChainConfigEntry`. */
    chain: SupportedChain | ChainConfigEntry;
    /** ethers Signer (for transactions) or Provider (read-only). */
    signerOrProvider: import('ethers').Signer | import('@ethersproject/providers').Provider;
    /** Override any default config value. */
    configOverrides?: Partial<SdkConfigOptions>;
}

// ---------------------------------------------------------------------------
// Strategy (pool) types – integrator-friendly view of PoolOverview
// ---------------------------------------------------------------------------

export interface Strategy {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    /** Weighted-average APY across tranches (decimal, e.g. 0.08 = 8 %). */
    apy: number;
    tvl: {
        /** On-chain + off-chain total. */
        total: string;
        offchain: string;
    };
    /** Remaining capacity across all tranches. */
    availableCapacity: string;
    /** 0-1 utilisation ratio. */
    capacityUtilisation: string;
    tranches: StrategyTranche[];
    /** Asset class label (e.g. "Tax Receivables"). */
    assetClass: string;
    /** Fixed or Variable. */
    apyStructure: 'Variable' | 'Fixed';
    /** Thumbnail image URL (empty string when Directus unavailable). */
    thumbnailUrl: string;
    /** Banner image URL (empty string when Directus unavailable). */
    bannerUrl: string;
    /** Raw `PoolOverview` for power-users who need all fields. */
    _raw: PoolOverview;
}

export interface StrategyTranche {
    id: string;
    name: string;
    /** Current base APY (decimal). */
    apy: number;
    minApy: number;
    maxApy: number;
    /** Minimum deposit in stable asset units (ether-formatted string). */
    minimumDeposit: string;
    /** Maximum deposit in stable asset units (ether-formatted string). */
    maximumDeposit: string;
    /** Remaining tranche capacity (ether-formatted string). */
    availableCapacity: string;
    /** Fixed-term deposit options on this tranche. */
    fixedTermOptions: FixedTermOption[];
    /** Raw `TrancheData` for power-users. */
    _raw: TrancheData;
}

export interface FixedTermOption {
    configId: string;
    /** Annual APY (decimal). */
    apy: number;
    /** Lock duration in epochs (1 epoch ≈ 1 week). */
    epochLockDuration: string;
}

// ---------------------------------------------------------------------------
// Deposit / Withdraw
// ---------------------------------------------------------------------------

export interface DepositParams {
    poolId: string;
    trancheId: string;
    /** Amount in stable asset base units (BigNumberish). */
    amount: BigNumberish;
    /** KYC signature obtained from the Nexera flow. */
    kycSignature: {
        blockExpiration: BigNumberish;
        signature: BytesLike;
    };
    /** ABI-encoded deposit data (contract acceptance). Pass `'0x'` when not needed. */
    depositData?: BytesLike;
    /** Fixed-term config ID. Pass `0` for variable deposits. */
    fixedTermConfigId?: BigNumberish;
    /** Swap calldata. Pass `'0x'` when depositing the stable asset directly. */
    swapData?: BytesLike;
    /** Native token value to send (e.g. for gas on some chains). Defaults to `'0'`. */
    ethValue?: string;
}

export interface WithdrawParams {
    poolId: string;
    trancheId: string;
    /** Stable asset amount to withdraw, or `'max'` to withdraw entire balance. */
    amount: BigNumberish;
    /** Required when `amount` is `'max'`. */
    userAddress?: string;
}

export interface DepositLimits {
    /** Minimum deposit (ether-formatted stable asset amount). */
    min: string;
    /** Maximum deposit (ether-formatted stable asset amount). */
    max: string;
    /** Remaining tranche capacity (ether-formatted stable asset amount). */
    availableCapacity: string;
}

// ---------------------------------------------------------------------------
// KYC helpers
// ---------------------------------------------------------------------------

export interface KycParams {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contractAbi: any;
    contractAddress: string;
    functionName: string;
    args: BytesLike[];
    userAddress: string;
    chainId: string;
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export interface UserPositions {
    /** Per-pool breakdown. */
    pools: PortfolioLendingPool[];
    /** Aggregate summary (invested, yields, APY). */
    summary: PortfolioSummary;
}

// ---------------------------------------------------------------------------
// Platform stats
// ---------------------------------------------------------------------------

export type PlatformStats = LendingTotals;
