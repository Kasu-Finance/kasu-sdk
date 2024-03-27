import { Provider } from '@ethersproject/providers';
import { BigNumber, BigNumberish, BytesLike, ContractTransaction, Signer } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import {
    ILendingPoolManagerAbi, ILendingPoolManagerAbi__factory,
    IUserManagerAbi,
    IUserManagerAbi__factory,
} from '../../contracts';
import { SdkConfig } from '../../sdk-config';





export class UserLending {
    private readonly _graph: GraphQLClient;
    private readonly _userManagerAbi: IUserManagerAbi;
    private readonly _lendingPoolManagerAbi: ILendingPoolManagerAbi;
    readonly _signerOrProvider: Signer | Provider;

    constructor(kasuConfig: SdkConfig, signerOrProvider : Signer | Provider) {
        this._signerOrProvider = signerOrProvider;
        this._graph = new GraphQLClient(kasuConfig.subgraphUrl);
        this._userManagerAbi = IUserManagerAbi__factory.connect(
            kasuConfig.contracts.UserManager,
            signerOrProvider
        )
        this._lendingPoolManagerAbi = ILendingPoolManagerAbi__factory.connect(
            kasuConfig.contracts.LendingPoolManager,
            signerOrProvider
        )
    }

    async getUserTotalPendingAndActiveDepositedAmount(user: string): Promise<BigNumber> {
        return await this._userManagerAbi.getUserTotalPendingAndActiveDepositedAmount(user);
    }

    async getUserTotalPendingAndActiveDepositedAmountForCurrentEpoch(user: string): Promise<BigNumber> {
        return await this._userManagerAbi.getUserTotalPendingAndActiveDepositedAmountForCurrentEpoch(user);
    }

    async hasUserRKSU(user: string): Promise<boolean> {
        return await this._userManagerAbi.hasUserRKSU(user);
    }

    async requestDepositWithKyc(lendingPool: string, tranche: string, amount: BigNumberish, blockExpiration: BigNumberish, signature: BytesLike,): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestDepositWithKyc(lendingPool, tranche, amount, blockExpiration, signature);
    }

    async requestDeposit(lendingPool: string, tranche: string, amount: BigNumberish): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestDeposit(lendingPool, tranche, amount);
    }

    async cancelDepositRequest(lendingPool: string, dNftID: BigNumberish): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.cancelDepositRequest(lendingPool, dNftID);
    }

    async requestWithdrawal(lendingPool: string, tranche: string, amount: BigNumberish): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestWithdrawal(lendingPool, tranche, amount);
    }

    async cancelWithdrawalRequest(lendingPool: string, dNftID: BigNumberish): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.cancelWithdrawalRequest(lendingPool, dNftID);
    }

    async claimRepaidLoss(lendingPool: string, tranche: string, lossId: BigNumberish): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.claimRepaidLoss(lendingPool, tranche, lossId);
    }
}