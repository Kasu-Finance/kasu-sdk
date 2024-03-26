export interface LendingPoolSubgraph {
    id: string;
    totalYieldAmount: string;
    totalLossAmount: string;
    name: string;
    balance: string;
    borrowedAmount: string;
    firstLostCapital: string;
    tranches: TrancheSubgraph[];
}

export interface TrancheSubgraph {
    balance: string;
    id: string;
    totalYieldAmount: string;
    orderId: string;
    lendingPool: {
        id: string;
    }
}

export interface TrancheConfigurationSubgraph {
    lendingPoolTrancheConfigurations: string;
    maxDepositAmount: string;
    minDepositAmount: string;
    interestRate: string;
    id: string;
    desiredRatio: string;
    orderId: string;
}