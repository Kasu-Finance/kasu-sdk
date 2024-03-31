export interface UserRequestsSubgraphResponse {
    userRequests: {
        id: string;
        amountRequested: string;
        amountAccepted: string;
        amountRejected: string;
        status: string;
        createdOn: string;
        updatedOn: string;
        type: string;
        epochId: string;
        user: {
            id: string;
        };
        nftId: string;
        lendingPool: {
            id: string;
        };
        tranche: {
            id: string;
        };
        userRequestEvents: {
            assetAmount: string;
            createdOn: string;
            id: string;
            index: string;
            type: string;
            sharesAmount: string;
            tranche: {
                id: string;
            }
            transactionHash: string;
        }
        userRequestEventsCount: string;
    }[]
}
