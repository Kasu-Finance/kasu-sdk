import { Provider } from '@ethersproject/providers';
import {
    BigNumber,
    BigNumberish,
    BytesLike,
    ContractTransaction,
    Signer,
} from 'ethers';
import { GraphQLClient } from 'graphql-request';

import {
    IKasuAllowListAbi__factory, ILendingPoolAbi__factory,
    ILendingPoolManagerAbi,
    ILendingPoolManagerAbi__factory, ILendingPoolTrancheAbi__factory,
    IUserManagerAbi,
    IUserManagerAbi__factory,
} from '../../contracts';
import { SdkConfig } from '../../sdk-config';

import { UserRequestsSubgraphResponse } from './subgraph-types';
import { UserBalance, UserRequest } from './types';
import { userRequestsQuery } from './user-lending.query';

export class UserLending {
    private readonly _graph: GraphQLClient;
    private readonly _userManagerAbi: IUserManagerAbi;
    private readonly _lendingPoolManagerAbi: ILendingPoolManagerAbi;
    readonly _signerOrProvider: Signer | Provider;

    constructor(
        private _kasuConfig: SdkConfig,
        signerOrProvider: Signer | Provider,
    ) {
        this._signerOrProvider = signerOrProvider;
        this._graph = new GraphQLClient(_kasuConfig.subgraphUrl);
        this._userManagerAbi = IUserManagerAbi__factory.connect(
            _kasuConfig.contracts.UserManager,
            signerOrProvider,
        );
        this._lendingPoolManagerAbi = ILendingPoolManagerAbi__factory.connect(
            _kasuConfig.contracts.LendingPoolManager,
            signerOrProvider,
        );
    }

    async getUserTotalPendingAndActiveDepositedAmount(
        user: string,
    ): Promise<BigNumber> {
        return await this._userManagerAbi.getUserTotalPendingAndActiveDepositedAmount(
            user,
        );
    }

    async getUserTotalPendingAndActiveDepositedAmountForCurrentEpoch(
        user: string,
    ): Promise<BigNumber> {
        return await this._userManagerAbi.getUserTotalPendingAndActiveDepositedAmountForCurrentEpoch(
            user,
        );
    }

    async hasUserRKSU(user: string): Promise<boolean> {
        return await this._userManagerAbi.hasUserRKSU(user);
    }

    buildKycSignatureParams(userAddress: `0x${string}`, chainId: string) {
        const address = userAddress.toLowerCase() as `0x${string}`;

        return {
            contractAbi: IKasuAllowListAbi__factory.abi,
            contractAddress:
                this._kasuConfig.contracts.KasuAllowList.toLowerCase() as `0x${string}`,
            functionName: 'verifyUserKyc',
            args: [address],
            userAddress: address,
            chainId,
        };
    }

    async requestDepositWithKyc(
        lendingPool: string,
        tranche: string,
        amount: BigNumberish,
        blockExpiration: BigNumberish,
        signature: BytesLike,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestDepositWithKyc(
            lendingPool,
            tranche,
            amount,
            blockExpiration,
            signature,
        );
    }

    async requestDeposit(
        lendingPool: string,
        tranche: string,
        amount: BigNumberish,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestDeposit(
            lendingPool,
            tranche,
            amount,
        );
    }

    async cancelDepositRequest(
        lendingPool: string,
        dNftID: BigNumberish,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.cancelDepositRequest(
            lendingPool,
            dNftID,
        );
    }

    async requestWithdrawal(
        lendingPool: string,
        tranche: string,
        amount: BigNumberish,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestWithdrawal(
            lendingPool,
            tranche,
            amount,
        );
    }

    async cancelWithdrawalRequest(
        lendingPool: string,
        dNftID: BigNumberish,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.cancelWithdrawalRequest(
            lendingPool,
            dNftID,
        );
    }

    async claimRepaidLoss(
        lendingPool: string,
        tranche: string,
        lossId: BigNumberish,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.claimRepaidLoss(
            lendingPool,
            tranche,
            lossId,
        );
    }

    async getUserRequests(): Promise<UserRequest[]> {
        const subgraphResult: UserRequestsSubgraphResponse = await this._graph.request(userRequestsQuery);
        return subgraphResult.userRequests;
    }

    async getUserPoolBalance(user: string, poolId: string): Promise<UserBalance> {
        const lendingPool = ILendingPoolAbi__factory.connect(
            poolId,
            this._signerOrProvider
        )
        return {
            userId: user,
            address: poolId,
            yieldEarned: 0, // TODO do this calculation
            balance: await lendingPool.getUserBalance(user),
        }
    }

    async getUserTrancheBalance(user: string, trancheId: string): Promise<UserBalance> {
        const tranche = ILendingPoolTrancheAbi__factory.connect(
            trancheId,
            this._signerOrProvider
        )
        return {
            userId: user,
            address: trancheId,
            yieldEarned: 0, // TODO do this calculation
            balance: await tranche.getUserActiveAssets(user),
        }
    }
}
