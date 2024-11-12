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
    lastEpoch: {
        yieldEarnings: string;
    };
}

export interface PortfolioTranche extends TrancheData {
    investedAmount: string;
    yieldEarnings: {
        lastEpoch: string;
        lifetime: string;
    };
    fixedLoans: {
        lockId: string;
        epochLockStart: string;
        epochLockEnd: string;
        epochLockDuration: string;
        isWithdrawalRequested;
        startTime: EpochTimeStamp;
        amount: string;
        endTime: EpochTimeStamp;
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
