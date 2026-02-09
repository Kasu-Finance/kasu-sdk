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

export type SupportedChain = 'base' | 'xdc' | 'plume';

export interface ChainConfigEntry {
    chainId: number;
    name: string;
    isLiteDeployment: boolean;
    contracts: ContractAddresses;
    subgraphUrl: string;
    directusUrl: string;
    unusedPoolIds: string[];
    poolMetadataMapping?: Record<string, string>;
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
    /** Minimum deposit in USDC (ether-formatted string). */
    minimumDeposit: string;
    /** Maximum deposit in USDC (ether-formatted string). */
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
    /** Amount in USDC base units (BigNumberish). */
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
    /** Swap calldata. Pass `'0x'` when depositing USDC directly. */
    swapData?: BytesLike;
    /** Native token value to send (e.g. for gas on some chains). Defaults to `'0'`. */
    ethValue?: string;
}

export interface WithdrawParams {
    poolId: string;
    trancheId: string;
    /** USDC amount to withdraw, or `'max'` to withdraw entire balance. */
    amount: BigNumberish;
    /** Required when `amount` is `'max'`. */
    userAddress?: string;
}

export interface DepositLimits {
    /** Minimum deposit (ether-formatted USDC). */
    min: string;
    /** Maximum deposit (ether-formatted USDC). */
    max: string;
    /** Remaining tranche capacity (ether-formatted USDC). */
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
