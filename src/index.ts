// ---------------------------------------------------------------------------
// Core SDK class (low-level service access)
// ---------------------------------------------------------------------------
export { KasuSdk } from './kasu-sdk';
export type { KasuSdkOptions } from './kasu-sdk';

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

export type { YieldHistoryOptions } from './services/Portfolio/yield-history';

export type { PoolTvlHistoryOptions } from './services/DataService/tvl-history';
export {
    PastStateUnavailableError,
    PoolTvlHistoryAbortedError,
    PoolTvlHistoryTimeoutError,
} from './services/DataService/tvl-history';
export { NO_HISTORY_PROVIDER_MESSAGE } from './services/DataService/data-service';

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

export { NO_DIRECTUS_URL_MESSAGE } from './services/DataService/directus-client';

// ---------------------------------------------------------------------------
// Re-export facade (high-level integrator API)
// ---------------------------------------------------------------------------
export * from './facade';

// ---------------------------------------------------------------------------
// Shared domain layer — pure rate, tranche and pool rules. Numbers and codes
// only: no copy, no locale. See `src/domain/index.ts`.
// ---------------------------------------------------------------------------
export * from './domain';

// ---------------------------------------------------------------------------
// Flows — the headless deposit / withdraw state machines. No React, no copy,
// no I/O of their own: every side effect is an injected port and every
// observable state is a code. See `src/flows/index.ts`.
// ---------------------------------------------------------------------------
export * from './flows';
