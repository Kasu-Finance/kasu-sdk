// ---------------------------------------------------------------------------
// Core SDK class (low-level service access)
// ---------------------------------------------------------------------------
export { KasuSdk } from './kasu-sdk';

// ---------------------------------------------------------------------------
// Re-export config types
// ---------------------------------------------------------------------------
export type { ContractAddresses, SdkConfigOptions } from './sdk-config';
export { SdkConfig } from './sdk-config';

// ---------------------------------------------------------------------------
// Re-export service types so consumers don't need deep imports
// ---------------------------------------------------------------------------
export type {
    PoolOverview,
    TrancheData,
    LendingTotals,
    PoolRepayment,
    RiskManagement,
    PoolDelegateProfileAndHistory,
    PoolTranche,
    PoolCreditMetrics,
    BadAndDoubtfulDebts,
    FinancialReportingDocuments,
} from './services/DataService/types';

export type {
    UserRequest,
    UserRequestEvent,
    UserTrancheBalance,
    UserPoolBalance,
    UserApyBonus,
    PortfolioUserTrancheBalance,
} from './services/UserLending/types';

export type {
    PortfolioSummary,
    PortfolioLendingPool,
    PortfolioTranche,
    PortfolioRewards,
    PortfolioTrancheDepositDetails,
} from './services/Portfolio/types';

export type {
    UserLock,
    UserBonusData,
    LockPeriod,
    GQLGetLockingPeriods,
    SystemVariables,
} from './services/Locking/types';

export type {
    PoolOverviewDirectus,
    PlatformOverviewDirectus,
} from './services/DataService/directus-types';

// ---------------------------------------------------------------------------
// Re-export facade (high-level integrator API)
// ---------------------------------------------------------------------------
export * from './facade';
