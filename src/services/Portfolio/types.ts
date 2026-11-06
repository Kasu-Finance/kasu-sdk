import { PoolOverview, TrancheData } from '../DataService/types';

export interface PortfolioRewards {
    bonusYieldEarnings: {
        claimableBalance: {
            ksuAmount: string;
        };
        lifeTime: {
            ksuAmount: string;
        };
    };
    ksuLaunchBonus: {
        lifeTime: {
            ksuAmount: string;
        };
    };
    protocolFees: {
        claimableBalance: {
            stableAmount: string;
        };
        lifeTime: {
            stableAmount: string;
        };
    };
}

export interface PortfolioSummary {
    current: {
        totalKsuLocked: string;
        totalLendingPoolInvestments: string;
        weightedAverageApy: string;
    };
    daily: {
        yieldEarnings: string;
    };
    weekly: {
        yieldEarnings: string;
        protocolFeesEarned: string;
        ksuBonusRewards: string;
    };
    lifetime: {
        yieldEarnings: string;
        ksuBonusRewards: string;
        protocolFeesEarned: string;
    };
}

export interface PortfolioTrancheDepositDetails {
    timestamp: EpochTimeStamp;
    id: string;
    depositAmount: string;
    acceptedAmount: string;
}
export interface PortfolioTranche extends TrancheData {
    investedAmount: string;
    /**
     * Set when `investedAmount` was raised to 0: the locked amount exceeded
     * the tranche balance, which only a position the subgraph ledger cannot
     * describe produces (see `PortfolioLendingPool.ledgerMismatch`).
     */
    investedAmountFloored?: true;
    yieldEarnings: {
        lastEpoch: string;
        lifetime: string;
    };
    depositDetails: PortfolioTrancheDepositDetails[];
    fixedLoans: {
        isLocked: boolean;
        lockId: string;
        configId: string;
        epochInterestRate: string;
        epochLockStart: string;
        epochLockEnd: string;
        epochLockDuration: string;
        isWithdrawalRequested: boolean;
        startTime: EpochTimeStamp;
        amount: string;
        endTime: EpochTimeStamp;
        yieldEarnings: {
            lastEpoch: string;
            lifetime: string;
        };
        depositDetails: PortfolioTrancheDepositDetails[];
    }[];
}
/**
 * The subgraph ledger and the chain disagreed about the lender's balance in
 * a pool AT THE SAME BLOCK — shares moved to or from the wallet outside a
 * deposit or withdrawal, or a lock whose recorded shares were lost. Balances
 * then come from the chain; display units of the stable token.
 */
export interface LedgerMismatch {
    /**
     * `ledger-exceeds-chain`: the ledger credits shares the wallet does not
     * hold — the pool's last-cycle figures are withheld (0), and
     * `getYieldHistory` leaves the pool out. `chain-exceeds-ledger`: the
     * wallet holds shares the ledger never credited — its figures cover only
     * the ledger's shares.
     */
    kind: 'ledger-exceeds-chain' | 'chain-exceeds-ledger';
    ledgerBalance: string;
    chainBalance: string;
}

export interface PortfolioLendingPool extends Omit<PoolOverview, 'tranches'> {
    totalInvestedAmount: string;
    /** Present only when ledger and chain disagree (see `LedgerMismatch`). */
    ledgerMismatch?: LedgerMismatch;
    /**
     * `false` only when the chain could not be read at the subgraph's block
     * (the node had pruned it, or not reached it) and `latest` was read
     * instead: the balances are the chain's now, and ledger and chain were
     * NOT compared, so no `ledgerMismatch` can be reported. Absent otherwise.
     */
    chainPinned?: false;
    totalYieldEarningsLastEpoch: string;
    totalYieldEarningsLifetime: string;
    isActive: boolean;
    tranches: PortfolioTranche[];
    requestEpochsInAdvance: string;
}
export interface LendingPortfolioData {
    lendingPools: PortfolioLendingPool[];
}

/** A lock share snapshot as the portfolio query reads it. */
export interface LockShareSnapshot {
    epochId: string;
    shareUpdatesIndex: number;
    shares: string;
}

export interface UserLendingPoolTrancheFixedTermDepositLock {
    /** `{lendingPool}-{lockId}`; read by `lendingPortfolioQuery`. */
    id?: string;
    isLocked: boolean;
    lockId: string;
    createdOn: string;
    isWithdrawalRequested: boolean;
    initialTrancheShares: string;
    epochLockStart: string;
    epochLockEnd: string;
    lendingPoolTrancheFixedTermConfig: {
        epochLockDuration: string;
        configId: string;
        epochInterestRate: string;
    };
    unlockAmount: string | null;
    initialAmount: string;
    trancheShares: string;
    userLendingPoolTrancheFixedTermDepositLockShareUpdate:
        | {
              shares: string;
          }[]
        | undefined;
    /**
     * The lock's shares as of the last settled epoch (`epochId < currentEpoch`),
     * the `sharesAtEpoch` of `epochTrancheYield`. Present in
     * `lendingPortfolioQuery` responses only.
     */
    lockSharesAtLastEpoch?:
        | {
              shares: string;
          }[]
        | undefined;
    /**
     * The newest lock snapshot tagged before `$lockRecentEpoch`, and every one
     * tagged from it on: the candidates `getPortfolioLendingData` pairs a
     * recent interest's epoch with. `lendingPortfolioQuery` responses only.
     */
    lockSharesBase?: LockShareSnapshot[] | undefined;
    lockSharesRecent?: LockShareSnapshot[] | undefined;
}

export interface LastEpochQueryResult {
    user: {
        lendingPoolUserDetails: {
            id: string;
            lendingPool: {
                id: string;
                name: string;
                balance: string;
                configuration: {
                    lendingPoolWithdrawalConfig: {
                        requestEpochsInAdvance: string;
                        cancelRequestEpochsInAdvance: string;
                    };
                };
                tranches: {
                    shares: string;
                }[];
            };
            lendingPoolTrancheUserDetails: {
                userLendingPoolTrancheFixedTermDepositLocks: {
                    lockId: string;
                    createdOn: string;
                    isWithdrawalRequested: boolean;
                    initialTrancheShares: string;
                    epochLockStart: string;
                    epochLockEnd: string;
                    lendingPoolTrancheFixedTermConfig: {
                        epochLockDuration: string;
                    };
                }[];
                lendingPoolTrancheUserEpochSharesUpdates: {
                    shares: string;
                }[];
                tranche: {
                    id: string;
                    lendingPoolTrancheShareUpdates: {
                        shares: string;
                    }[];
                    lendingPoolTrancheEpochInterest: {
                        epochInterestAmount: string;
                    }[];
                };
            }[];
        }[];
    } | null;
}

/** A tranche or lender share snapshot as the portfolio query reads it. */
export interface PortfolioShareSnapshot {
    epochId: string;
    shareUpdatesIndex: number;
    shares: string;
    /** Unix seconds. */
    timestamp: string;
}

export interface LendingPortfolioQueryResult {
    /** The block the subgraph answered at. */
    _meta?: { block: { number: number } };
    user: {
        lendingPoolUserDetails: {
            id: string;
            totalAcceptedDeposits: string;
            totalAcceptedWithdrawnAmount: string;
            lendingPool: {
                id: string;
                name: string;
                balance: string;
                configuration: {
                    lendingPoolWithdrawalConfig: {
                        requestEpochsInAdvance: string;
                        cancelRequestEpochsInAdvance: string;
                    };
                };
                tranches: {
                    shares: string;
                }[];
            };
            lendingPoolTrancheUserDetails: {
                id: string;
                shares: string;
                userLendingPoolTrancheFixedTermDepositLocks: UserLendingPoolTrancheFixedTermDepositLock[];
                /** The newest snapshot tagged before `$recentEpoch`. */
                lendingPoolTrancheUserEpochSharesUpdates:
                    | PortfolioShareSnapshot[]
                    | undefined;
                /** Every snapshot tagged `$recentEpoch` or later. */
                recentUserShareUpdates: PortfolioShareSnapshot[] | undefined;
                totalAcceptedDeposits: string;
                totalAcceptedWithdrawnAmount: string;
                tranche: {
                    id: string;
                    shares: string;
                    balance: string;
                    /** The newest snapshot tagged before `$recentEpoch`. */
                    lendingPoolTrancheShareUpdates:
                        | PortfolioShareSnapshot[]
                        | undefined;
                    /** Every snapshot tagged `$recentEpoch` or later. */
                    recentTrancheShareUpdates:
                        | PortfolioShareSnapshot[]
                        | undefined;
                    lendingPoolTrancheEpochInterest:
                        | {
                              epochId: string;
                              epochInterestAmount: string;
                          }[]
                        | undefined;
                };
            }[];
        }[];
    } | null;
    /** The clearings of `$recentEpoch` up to the last settled epoch. */
    lendingPoolClearings: {
        id: string;
        epochId: string;
        startTimestamp: string;
        lendingPool: { id: string };
    }[];
    /** Every share exit (any lender) in the listed tranches, those epochs. */
    recentWithdrawalsAccepted: {
        id: string;
        type: 'WithdrawalAccepted' | 'ImmediateWithdrawalExecuted';
        epochId: string;
        createdOn: string;
        sharesAmount: string | null;
        tranche: { id: string };
    }[];
    userRequests: {
        createdOn: string;
        amountAccepted: string;
        tranche: {
            id: string;
        };
        fixedTermConfigId: string;
        userRequestEvents: {
            id: string;
            assetAmount: string;
        }[];
    }[];
}
