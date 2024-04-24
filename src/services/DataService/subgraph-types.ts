import { gql } from 'graphql-request';

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


export interface LendingPoolConfigurationSubgraph {
    lendingPoolConfigurations: {
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
    }[]
}

export interface LendingPoolWithdrawalAndDepositSubgraph {
    lendingPools: {
        id: string;
        pendingPool: {
            totalPendingDepositAmounts: string[];
            totalPendingDepositAmount: string;
            totalPendingWithdrawalShares: string;
        }
        totalDepositsAccepted: string;
        totalWithdrawalsAccepted: string;
    }[]
}