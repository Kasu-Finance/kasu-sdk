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
    IKasuAllowListAbi__factory,
    ILendingPoolAbi__factory,
    ILendingPoolManagerAbi,
    ILendingPoolManagerAbi__factory,
    ILendingPoolTrancheAbi,
    ILendingPoolTrancheAbi__factory, IUserLoyaltyRewardsAbi,
    IUserLoyaltyRewardsAbi__factory,
    IUserManagerAbi,
    IUserManagerAbi__factory,
} from '../../contracts';
import { SdkConfig } from '../../sdk-config';

import {
    LendingPoolUserDetailsSubgraph,
    TotalUserLoyaltyRewardsSubgraph,
    UserRequestsSubgraph,
} from './subgraph-types';
import { UserApyBonus, UserInvestment, UserPoolBalance, UserRequest, UserTrancheBalance } from './types';
import { lendingPoolUserDetailsQuery, totalUserLoyaltyRewardsQuery, userRequestsQuery } from './user-lending.query';

export class UserLending {
    private readonly _graph: GraphQLClient;
    private readonly _userManagerAbi: IUserManagerAbi;
    private readonly _lendingPoolManagerAbi: ILendingPoolManagerAbi;
    private readonly _userLoyaltyRewardsAbi: IUserLoyaltyRewardsAbi;
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
        this._userLoyaltyRewardsAbi = IUserLoyaltyRewardsAbi__factory.connect(
            _kasuConfig.contracts.UserLoyaltyRewards,
            signerOrProvider,
        )
    }

    async getUserTotalPendingAndActiveDepositedAmount(
        user: string,
    ): Promise<[BigNumber, BigNumber]> {
        return await this._userManagerAbi.userTotalPendingAndActiveDepositedAmount(
            user,
        );
    }

    async getUserTotalPendingAndActiveDepositedAmountForCurrentEpoch(
        user: string,
    ): Promise<[BigNumber, BigNumber]> {
        return await this._userManagerAbi.userTotalPendingAndActiveDepositedAmountForCurrentEpoch(
            user,
        );
    }

    async hasUserRKSU(user: string): Promise<boolean> {
        return await this._userManagerAbi.hasUserRKSU(user);
    }

    buildKycSignatureParams(userAddress: `0x${string}`, chainId: string): {
        contractAbi: IKasuAllowListAbi__factory;
        contractAddress: string;
        functionName: string;
        args: BytesLike[];
        userAddress: string;
        chainId: string;
    } {
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
        swapData: BytesLike,
        blockExpiration: BigNumberish,
        signature: BytesLike,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestDepositWithKyc(
            lendingPool,
            tranche,
            amount,
            swapData,
            blockExpiration,
            signature,
        );
    }

    async requestDeposit(
        lendingPool: string,
        tranche: string,
        amount: BigNumberish,
        swapData: BytesLike
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestDeposit(
            lendingPool,
            tranche,
            amount,
            swapData
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

    async requestWithdrawalInUSDC(
        lendingPool: string,
        tranche: string,
        usdcAmount: BigNumberish,
    ): Promise<ContractTransaction> {
        const trancheContract: ILendingPoolTrancheAbi = ILendingPoolTrancheAbi__factory.connect(tranche, this._signerOrProvider);
        const shareAmount = await trancheContract.convertToShares(usdcAmount);

        return await this._lendingPoolManagerAbi.requestWithdrawal(
            lendingPool,
            tranche,
            shareAmount,
        );
    }

    async requestWithdrawalMax(
        lendingPool: string,
        tranche: string,
        user: string
    ): Promise<ContractTransaction> {
        const trancheContract: ILendingPoolTrancheAbi = ILendingPoolTrancheAbi__factory.connect(tranche, this._signerOrProvider);
        const userShares = await trancheContract['balanceOf(address)'](user);

        return await this._lendingPoolManagerAbi.requestWithdrawal(
            lendingPool,
            tranche,
            userShares,
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
        const subgraphResult: UserRequestsSubgraph = await this._graph.request(userRequestsQuery);
        return subgraphResult.userRequests;
    }

    async getUserPoolBalance(user: string, poolId: string): Promise<UserPoolBalance> {
        const lendingPool = ILendingPoolAbi__factory.connect(
            poolId,
            this._signerOrProvider
        )
        const balance = await lendingPool.userBalance(user)
        return {
            userId: user,
            address: poolId,
            yieldEarned: 0, // TODO do this calculation
            balance: balance,
        }
    }

    async getUserTrancheBalance(user: string, trancheId: string): Promise<UserTrancheBalance> {
        const tranche = ILendingPoolTrancheAbi__factory.connect(
            trancheId,
            this._signerOrProvider
        );
        const userDetailsSubgraph: LendingPoolUserDetailsSubgraph = await this._graph.request(lendingPoolUserDetailsQuery, { userAddress: user })
        const balance = await tranche.userActiveAssets(user);
        return {
            userId: user,
            address: trancheId,
            yieldEarned: 0, // TODO do this calculation
            balance: balance,
            availableToWithdraw: await tranche.maxWithdraw(user)
        }
    }

    async getUserApyBonus(user: string): Promise<UserApyBonus> {
        const subgraphResult: TotalUserLoyaltyRewardsSubgraph = await this._graph.request(totalUserLoyaltyRewardsQuery, { userAddress: user });
        const balance = await this._userLoyaltyRewardsAbi.userRewards(user);
        return {
            balance: balance,
            lifetime: parseFloat(subgraphResult.user.totalUserLoyaltyRewards),
        }
    }
}
