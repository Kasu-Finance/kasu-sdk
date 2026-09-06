// Main entry point
export { Kasu } from './kasu';

// Individual facades (for advanced composition)
export { StrategiesFacade } from './strategies';
export { DepositsFacade } from './deposits';
export { PortfolioFacade } from './user-portfolio';
export { FlowsFacade } from './flows';
export type {
    DepositFlowPortOverrides,
    WithdrawFlowPortOverrides,
} from './flows';

// The one refusal every write path shares
export { READ_ONLY_MESSAGE } from './read-only';

// Chain configurations
export { CHAIN_CONFIGS } from './chain-configs';

// Directus-backed helpers (I/O — not part of `domain/`)
export { fetchUnusedPoolIds } from './unused-pool-ids';

// All facade types
export type {
    SupportedChain,
    ChainConfigEntry,
    StableAsset,
    KasuOptions,
    Strategy,
    StrategyTranche,
    FixedTermOption,
    DepositParams,
    WithdrawParams,
    DepositLimits,
    KycParams,
    UserPositions,
    PlatformStats,
} from './types';
