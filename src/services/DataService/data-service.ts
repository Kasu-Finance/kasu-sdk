import { GraphQLClient } from 'graphql-request';

import { SdkConfig } from '../../sdk-config';
import { PoolData } from '../../types';

export class DataService {
    private readonly _graph: GraphQLClient;

    constructor(kasuConfig: SdkConfig) {
        this._graph = new GraphQLClient(kasuConfig.subgraphUrl);
    }

    getPoolData(id_in: string[]): PoolData[]{
        const fakeData: PoolData[] = [
            {
                id: "1",
                poolName: "name1",
                details: "details1",
                tranches: [
                    {
                        id: "100",
                        maximumDeposit: 100,
                        minimumDeposit: 100,
                        apy: 10,
                        poolCapacity: 10
                    },
                    {
                        id: "200",
                        maximumDeposit: 200,
                        minimumDeposit: 200,
                        apy: 20,
                        poolCapacity: 20
                    }
                ]
            },
            {
                id: "2",
                poolName: "name2",
                details: "details2",
                tranches: [
                    {
                        id: "300",
                        maximumDeposit: 300,
                        minimumDeposit: 300,
                        apy: 30,
                        poolCapacity: 30
                    },
                    {
                        id: "400",
                        maximumDeposit: 400,
                        minimumDeposit: 400,
                        apy: 40,
                        poolCapacity: 40
                    }
                ]
            },
        ]
        if(!id_in.length){
            return fakeData;
        }
        return fakeData.filter(data => id_in.includes(data.id));
    }
}
