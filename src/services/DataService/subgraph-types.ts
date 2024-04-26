export interface LendingPoolSubgraph {
    id: string;
    totalUserYieldAmount: string;
    totalLossAmount: string;
    name: string;
    balance: string;
    firstLostCapital: string;
    pendingPool: {
        id: string;
        totalPendingDepositAmounts: string[];
        totalPendingDepositsAmount: string;
        totalPendingWithdrawalShares: string[];
    }
    tranches: TrancheSubgraph[];
}

export interface LendingPoolSubgraphReturn {
    lendingPools: LendingPoolSubgraph[]
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
    lendingPoolTranches: TrancheSubgraph[]
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

export interface LendingPoolConfigurationSubgraph {
    desiredDrawAmount: string;
    drawRecipient: string;
    id: string;
    minimumExcessLiquidityPercentage: string;
    targetExcessLiquidityPercentage: string;
    trancheInterestChangeEpochDelay: string;
    tranchesConfig: {
        maxDepositAmount: string;
        minDepositAmount: string;
        interestRate: string;
        id: string;
        desiredRatio: string;
        orderId: string;
    }[]
}

export interface LendingPoolConfigurationSubgraphReturn {
    lendingPoolConfigurations: LendingPoolConfigurationSubgraph[]
}

export interface LendingPoolWithdrawalAndDepositSubgraph {
    lendingPools: {
        id: string;
        pendingPool: {
            totalPendingDepositAmounts: string[];
            totalPendingDepositsAmount: string;
            totalPendingWithdrawalShares: string[];
        }
        totalDepositsAccepted: string;
        totalWithdrawalsAccepted: string;
    }[]
}