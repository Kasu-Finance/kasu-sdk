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
export interface PortfolioLendingPool extends Omit<PoolOverview, 'tranches'> {
    totalInvestedAmount: string;
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
    /** Every withdrawal accepted (any lender) in those epochs. */
    recentWithdrawalsAccepted: {
        id: string;
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
