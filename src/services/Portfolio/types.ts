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
            usdcAmount: string;
        };
        lifeTime: {
            usdcAmount: string;
        };
    };
}

export interface PortfolioSummary {
    current: {
        totalKsuLocked: string;
        totalLendingPoolInvestments: string;
        weightedAverageApy: string;
    };
    lifetime: {
        yieldEarnings: string;
        ksuBonusRewards: string;
        protocolFeesEarned: string;
    };
}

export interface PortfolioTranche extends TrancheData {
    investedAmount: string;
    yieldEarnings: {
        lastEpoch: string;
        lifetime: string;
    };
    fixedLoans: {
        isLocked: boolean;
        lockId: string;
        configId: string;
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
    };
    unlockAmount: string | null;
    initialAmount: string;
    trancheShares: string;
    userLendingPoolTrancheFixedTermDepositLockShareUpdate:
        | {
              shares: string;
          }[]
        | undefined;
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
                lendingPoolTrancheUserEpochSharesUpdates:
                    | {
                          shares: string;
                      }[]
                    | undefined;
                totalAcceptedDeposits: string;
                totalAcceptedWithdrawnAmount: string;
                tranche: {
                    id: string;
                    shares: string;
                    balance: string;
                    lendingPoolTrancheShareUpdates:
                        | {
                              shares: string;
                          }[]
                        | undefined;
                    lendingPoolTrancheEpochInterest:
                        | {
                              epochInterestAmount: string;
                          }[]
                        | undefined;
                };
            }[];
        }[];
    } | null;
}
