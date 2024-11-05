import { TrancheData } from '../DataService/types';

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

export interface PortfolioTranche {
    name: string;
    id: string;
    apy: string;
    investedAmount: string;
    yieldEarnings: {
        lastEpoch: string;
        lifetime: string;
    };
    fixedTermConfig: TrancheData['fixedTermConfig'];
}
export interface PortfolioLendingPool {
    id: string;
    name: string;
    totalInvestedAmount: string;
    totalYieldEarningsLastEpoch: string;
    totalYieldEarningsLifetime: string;
    isActive: boolean;
    tranches: PortfolioTranche[];
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
            };
            lendingPoolTrancheUserDetails: {
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
