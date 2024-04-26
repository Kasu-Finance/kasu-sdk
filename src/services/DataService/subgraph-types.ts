export interface LendingPoolSubgraph {
    lendingPools: {
        id: string;
        totalUserYieldAmount: string;
        totalLossAmount: string;
        name: string;
        balance: string;
        firstLostCapital: string;
        tranches: TrancheSubgraph[];
    }[]
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
export interface TrancheSubgraphResult {
    lendingPoolTranches: TrancheSubgraph[];
}

export interface TrancheConfigurationSubgraph {
    lendingPoolTrancheConfigurations: {
        maxDepositAmount: string;
        minDepositAmount: string;
        interestRate: string;
        id: string;
        desiredRatio: string;
        orderId: string;
    }[]
}