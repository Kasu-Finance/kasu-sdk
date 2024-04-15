export interface UserRequestsSubgraph {
    userRequests: {
        id: string;
        amountRequested: string;
        amountAccepted: string;
        amountRejected: string;
        status: string;
        createdOn: string;
        type: string;
        updatedOn: string;
        lendingPool: {
            id: string;
            tranches: {
                orderId: string;
            }[]
        }
        tranche: {
            orderId: string;
            id: string;
        }
        user: {
            id: string,
        }
        userRequestEvents: {
            assetAmount?: string;
            createdOn: string;
            id: string;
            index: string;
            type: string;
            transactionHash: string;
            sharesAmount: string;
            tranche: {
                id: string;
                orderId: string;
            }
        }[]
    }[]
}

export interface LendingPoolUserDetailsSubgraph {
    lendingPoolUserDetails: {
        id: string;
        totalAcceptedDeposits: string;
        totalAcceptedWithdrawnAmount: string;
    }
}