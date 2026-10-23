/**
 * The shared domain layer: the rules every Kasu frontend needs to agree on,
 * in one place instead of three.
 *
 * Two rules govern what may live here.
 *
 * 1. **Numbers and codes only.** No copy, no locale, no `Intl`, no string a
 *    user reads — `netEffectiveApy` returns `0.196`, never `'19.60% p.a.'`,
 *    and `derivePoolStatus` returns the code `'Full'`, not a sentence. The
 *    formatters that turn these into text stay in each app, where the design
 *    system and the visitor's locale are.
 *
 *    Two kinds of string are exempt, and only these two. `getTrancheDisplayName`
 *    is here precisely because that rename must NOT drift between apps. And
 *    `loan-contract.ts` builds PROTOCOL strings — messages kasu-backend
 *    reconstructs byte-for-byte to verify a lender's signature. Those are not
 *    copy: nobody may reword them, in any language, without a matching backend
 *    change, which is exactly why they belong in one place.
 * 2. **Pure.** No network, no clock, no environment. Anything with I/O belongs
 *    in `facade/` (see `fetchUnusedPoolIds`).
 */
export {
    apyToEpochRate,
    epochRateToApy,
    EPOCHS_IN_YEAR,
    netEffectiveApy,
} from './rates';

export {
    AU_ALPHA3,
    AU_MIN_CUMULATIVE_BY_STABLE,
    auMinimumRemaining,
    auThresholdFor,
    isAuMinimumExempt,
    isAustralianKyc,
    parseMinorUnits,
} from './au-minimum';
export type { AuMinimumInput } from './au-minimum';

export {
    DepositBatchMismatchError,
    ENTRY_POINT_V07,
    proveDepositInReceipt,
    proveUserOperationInReceipt,
    validateDepositBatchCalls,
} from './batch-proof';
export type {
    DepositBatchCall,
    DepositBatchExpectation,
    DepositProof,
    DepositProofExpectation,
    ReceiptLike,
    ReceiptLog,
    UserOperationProof,
    UserOperationProofExpectation,
    ValidatedDepositBatch,
} from './batch-proof';

export {
    ceilToCents,
    floorToCents,
    isBelowMinimumCapacity,
    MAX_LENDING_AMOUNT_FALLBACK,
    MIN_LENDING_AMOUNT_FALLBACK,
    parseTrancheBound,
    resolveBoundShortcuts,
    resolveDepositBounds,
} from './deposit-bounds';
export type { BoundShortcuts, DepositBounds } from './deposit-bounds';

export { explorerAddressUrl, explorerTxUrl } from './explorer-urls';
export type { ExplorerConfig } from './explorer-urls';

export {
    availableFixedTermConfigs,
    DAYS_PER_EPOCH,
    DAYS_PER_MONTH,
    isFixedTermConfigId,
    lockDurationDays,
    lockDurationMonths,
    MIN_DAYS_FOR_MONTHS,
} from './fixed-term';
export type { FixedTermConfig } from './fixed-term';

export {
    APXIUM,
    getCreditOriginator,
    getInstitutionalLender,
    getStrategyRegion,
    INVOICEMATE,
    RIXON_CAPITAL,
} from './partners';
export type { PoolNameSignal, StrategyPartner } from './partners';

export {
    asContractType,
    buildContractVersionType,
    buildFullNameRequestMessage,
    buildLegacyContractRequestMessage,
    buildLoanAgreementSignMessage,
    encodeDepositData,
    formatSignTimestampUtc,
    parseFormattedMessage,
} from './loan-contract';
export type {
    ContractListItem,
    ContractSection,
    ContractType,
    ExemptLoanContract,
    GenerateContractResponse,
    LoanContractFormatted,
    ResolvedContractResponse,
    RetailLoanContract,
} from './loan-contract';

export {
    maxNetRateCeiling,
    pickHighestYieldTranche,
    poolMaxApy,
    selectVisiblePools,
} from './pools';
export type { BestTranche } from './pools';

export {
    cancelDeadline,
    countSubmissions,
    deriveRequestState,
    firstSubmissionTimestamp,
    isCycleClosed,
    lastEventTimestamp,
    submissionEvents,
} from './requests';
export type {
    RequestKind,
    RequestState,
    RequestStatusCode,
} from './requests';

export { decodeRevert, extractRevertData } from './revert-errors';
export type { DecodedRevert, RevertFamily } from './revert-errors';

export {
    CLEARING_WINDOW_SECONDS,
    computeSettlementWindow,
    deriveCycleDates,
    nextCycleBoundary,
} from './settlement';
export type {
    CycleDates,
    SettlementWindowInput,
    SettlementWindowState,
} from './settlement';

export {
    encodeCancelDepositCall,
    encodeCancelWithdrawalCall,
    encodeRequestWithdrawalCall,
    encodeStableTransfer,
    encodeWithdrawAtExpiryCall,
    SPONSORED_CALL_KINDS,
    SPONSORED_CALL_SELECTORS,
    SponsoredCallInputError,
} from './sponsored-calls';
export type { SponsoredCall, SponsoredCallKind } from './sponsored-calls';

export { getTrancheDisplayName, UPPER_MEZZANINE } from './tranche-display-name';

export {
    compareTrancheSeniority,
    derivePoolStatus,
    MIN_TRANCHE_CAPACITY,
    netTrancheApyBounds,
    pickDefaultTrancheId,
    poolAllTranchesFull,
    trancheApyBounds,
    trancheHasCapacity,
    trancheRiskRank,
} from './tranches';
export type {
    ApyBounds,
    PoolStatus,
    TrancheCapacitySignal,
} from './tranches';

export {
    classifyWalletFailure,
    isUnpredictableGas,
    isUserRejected,
} from './wallet-errors';
export type { WalletFailure } from './wallet-errors';

export {
    accruedInterest,
    dailyInterest,
    projectedAnnualEarnings,
    SECONDS_PER_WEEK,
    weeklyInterest,
    weightedAverageApy,
} from './yields';
export type { InterestSlice, PoolAccrual } from './yields';
