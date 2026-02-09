// Main entry point
export { Kasu } from './kasu';

// Individual facades (for advanced composition)
export { StrategiesFacade } from './strategies';
export { DepositsFacade } from './deposits';
export { PortfolioFacade } from './user-portfolio';

// Chain configurations
export { CHAIN_CONFIGS } from './chain-configs';

// All facade types
export type {
    SupportedChain,
    ChainConfigEntry,
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
