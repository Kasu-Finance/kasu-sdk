
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
    ksuLaunchBonus : {
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
}

export interface LendingPortfolioData {
    total: {
        investedAmount: string;
        yieldEarningsLastEpoch: string;
        yieldEarningsLastMonth: string;
        yieldEarningsLastYear: string;
        yieldEarningsLifetime: string;
    }
    average: {
        investedAmount: string;
        yieldEarningsLastEpoch: string;
        yieldEarningsLastMonth: string;
        yieldEarningsLastYear: string;
        yieldEarningsLifetime: string;
        averageWeightedApy: string;
    }
    lendingPools: {
        id: string;
        name: string;
        tranches: {
            name: string;
            id:string;
            apy: string;
            investedAmount:string;
            yieldEarnings:{
                lastEpoch: string;
                lastMonth: string;
                lastYear: string;
                lifetime: string;
            }
        }[]
    }[]
}