
export interface PortfolioRewards {
    bonusYieldEarnings: {
        lastEpoch: {
            ksuAmount:  string;
            usdcAmount: string;
        }
        lifeTime: {
            ksuAmount:  string;
            usdcAmount: string;
        }
    }
    protocolFees: {
        lastEpoch: {
            usdcAmount: string;
        }
        lifeTime: {
            usdcAmount: string;
        }
    }
    ksuLaunchBonus: {
        lastEpoch: {
            usdcAmount: string;
        }
        lifeTime: {
            ksuAmount:  string;
            usdcAmount: string;
        }
    }
}

export interface PortfolioSummary  {
    current: {
        totalKsuLocked: string;
        totalLendingPoolInvestments: string;
        weightedAverageApy: string;
    }
    lifetime: {
        yieldEarnings: string;
        ksuBonusRewards: string;
        protocolFeesEarned: string;
    }
    lastEpoch: {
        yieldEarnings: string;
    }
}

export interface PortfolioTranche {
    name: string;
    id:string;
    apy: string;
    investedAmount:string;
    yieldEarnings:{
        lastEpoch: string;
        lifetime: string;
    }
}
export interface  PortfolioLendingPool {
    id: string;
    name: string;
    totalInvestedAmount: string;
    totalYieldEarningsLastEpoch: string;
    totalYieldEarningsLifetime: string;
    isActive: boolean;
    tranches: PortfolioTranche[]
}
export interface LendingPortfolioData {
    lendingPools: PortfolioLendingPool[]
}

export interface LastEpochQueryResult {
    user: {
        lendingPoolUserDetails: {
            id: string
            lendingPool: {
                id: string
                name: string
            }
            lendingPoolTrancheUserDetails: {
                lendingPoolTrancheUserEpochSharesUpdates: {
                    shares: string
                }[]
                tranche: {
                    id: string
                    lendingPoolTrancheShareUpdates: {
                        shares: string
                    }[]
                    lendingPoolTrancheEpochInterest: {
                        epochInterestAmount: string
                    }[]
                }
            }[]
        }[]
    }
}