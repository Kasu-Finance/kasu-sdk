import { Provider } from '@ethersproject/providers';
import {
    BigNumber,
    BigNumberish,
    BytesLike,
    ContractTransaction, ethers,
    Signer,
} from 'ethers';
import { GraphQLClient } from 'graphql-request';

import {
    IKasuAllowListAbi__factory,
    ILendingPoolAbi__factory,
    ILendingPoolManagerAbi,
    ILendingPoolManagerAbi__factory,
    ILendingPoolTrancheAbi,
    ILendingPoolTrancheAbi__factory, IUserLoyaltyRewardsAbi, IUserLoyaltyRewardsAbi__factory,
    IUserManagerAbi,
    IUserManagerAbi__factory,
} from '../../contracts';
import { SdkConfig } from '../../sdk-config';

import { mapUserRequestEventType } from './helper';
import {
    lendingPoolUserDetailsQuery, totalUserLoyaltyRewardsQuery, trancheUserDetailsQuery,
    userRequestsQuery,
} from './queries';
import {
    LendingPoolUserDetailsSubgraph, TotalUserLoyaltyRewardsSubgraph, TrancheUserDetailsSubgraph,
    UserRequestsSubgraph,
} from './subgraph-types';
import {
    UserApyBonus,
    UserPoolBalance,
    UserRequest,
    UserRequestEvent,
    UserRequestType,
    UserTrancheBalance,
} from './types';

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
        );
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

    buildKycSignatureParams(
        userAddress: `0x${string}`,
        chainId: string,
    ): {
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
        swapData: BytesLike,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestDeposit(
            lendingPool,
            tranche,
            amount,
            swapData,
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
        const trancheContract: ILendingPoolTrancheAbi =
            ILendingPoolTrancheAbi__factory.connect(
                tranche,
                this._signerOrProvider,
            );
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
        user: string,
    ): Promise<ContractTransaction> {
        const trancheContract: ILendingPoolTrancheAbi =
            ILendingPoolTrancheAbi__factory.connect(
                tranche,
                this._signerOrProvider,
            );
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

    async getUserRequests(userAddress: `0x${string}`): Promise<UserRequest[]> {
        const trancheNames: string[][] = [
            ['Senior'],
            ['Junior', 'Senior'],
            ['Junior', 'Mezzanine', 'Senior'],
        ];

        const subgraphResult: UserRequestsSubgraph = await this._graph.request(
            userRequestsQuery,
            { userAddress: userAddress.toLowerCase() },
        );
        const retn: UserRequest[] = [];
        const totalAssets = 1000; // TODO
        const totalSupply = 1000;
        for (const userRequest of subgraphResult.userRequests) {
            const trancheName =
                trancheNames[userRequest.lendingPool.tranches.length - 1][
                    parseInt(userRequest.tranche.orderId)
                    ];
            const events: UserRequestEvent[] = [];
            const totalRequested = '0';
            const totalAccepted = '0';
            const totalRejected = '0';
            for (const event of userRequest.userRequestEvents) {
                if(event.tranche.id != userRequest.tranche.id){
                    event.type = 'DepositReallocated';
                }
                events.push({
                    id: event.id,
                    requestType: mapUserRequestEventType(event.type),
                    timestamp: parseInt(event.createdOn),
                    totalRequested: totalRequested,
                    totalAccepted: totalAccepted,
                    totalRejected: totalRejected,
                    assetAmount:
                        event.assetAmount ??
                        this.convertSharesToAssets(
                            event.sharesAmount,
                            totalAssets,
                            totalSupply,
                        ).toString(),
                    index: parseInt(event.index),
                    transactionHash: event.transactionHash,
                });
            }
            const userRequestBase: UserRequest = {
                id: userRequest.id,
                userId: userRequest.user.id,
                lendingPool: {
                    id: userRequest.lendingPool.id,
                    name: userRequest.lendingPool.name,
                    tranches: userRequest.lendingPool.tranches,
                },
                requestType:
                    userRequest.type === 'DepositRequest'
                        ? 'Deposit'
                        : 'Withdrawal',
                trancheName: trancheName,
                requestedAmount: userRequest.amountRequested,
                acceptedAmount: userRequest.amountAccepted,
                rejectedAmount: userRequest.amountRejected,
                status: userRequest.status,
                timestamp: parseInt(userRequest.createdOn),
                canCancel: this.isCancelable(
                    userRequest.type,
                    userRequest.status,
                    userRequest.lendingPool.id,
                ),
                nftId: userRequest.nftId,
                events: events,
            };
            retn.push(userRequestBase);
        }
        return retn;
    }
    convertSharesToAssets(
        sharesAmount: string,
        totalAssets: number,
        totalSupply: number,
    ): number {
        return (parseFloat(sharesAmount) * totalAssets) / totalSupply;
    }
    isCancelable(type: string, status: string, lendingPoolId: string): boolean {
        // TODO ugly
        if (
            type === (UserRequestType.DEPOSIT as string) &&
            status != 'Processed'
        ) {
            return true;
        }
        // TODO
        return false;
    }

    async getUserPoolBalance(
        user: string,
        poolId: string,
    ): Promise<UserPoolBalance> {
        const lendingPool = ILendingPoolAbi__factory.connect(
            poolId,
            this._signerOrProvider,
        );
        const userDetailsSubgraph: LendingPoolUserDetailsSubgraph =
            await this._graph.request(lendingPoolUserDetailsQuery, {
                userAddress: `${poolId}-${user}`,
            });
        const balance = await lendingPool.userBalance(user);
        const balanceNumber = parseFloat(ethers.utils.formatUnits(balance,6));
        return {
            userId: user,
            address: poolId,
            yieldEarned: userDetailsSubgraph.lendingPoolUserDetails != null ? balanceNumber - parseFloat(userDetailsSubgraph.lendingPoolUserDetails.totalAcceptedDeposits) - parseFloat(userDetailsSubgraph.lendingPoolUserDetails.totalAcceptedWithdrawnAmount) : 0,
            balance: balance,
        };
    }

    async getUserTrancheBalance(
        user: string,
        trancheId: string,
    ): Promise<UserTrancheBalance> {
        const tranche = ILendingPoolTrancheAbi__factory.connect(
            trancheId,
            this._signerOrProvider,
        );

        const balance = await tranche.userActiveAssets(user);
        const balanceNumber = parseFloat(ethers.utils.formatUnits(balance,6));
        const userDetailsSubgraph: TrancheUserDetailsSubgraph =
            await this._graph.request(trancheUserDetailsQuery, {
                userAddress: `${trancheId}-${user}`,
            });
        return {
            userId: user,
            address: trancheId,
            yieldEarned: userDetailsSubgraph.lendingPoolTrancheUserDetails != null ? balanceNumber - parseFloat(userDetailsSubgraph.lendingPoolTrancheUserDetails.totalAcceptedDeposits) - parseFloat(userDetailsSubgraph.lendingPoolTrancheUserDetails.totalAcceptedWithdrawnAmount) : 0,
            balance: balance,
            availableToWithdraw: await tranche.maxWithdraw(user),
    };

    }

    async getUserApyBonus(user: string): Promise<UserApyBonus> {
        const subgraphResult: TotalUserLoyaltyRewardsSubgraph = await this._graph.request(totalUserLoyaltyRewardsQuery, { userAddress: user });
        if(!subgraphResult.user) {
            return {
                balance: BigNumber.from(0),
                lifetime: 0
            }
        }
        const balance = await this._userLoyaltyRewardsAbi.userRewards(user);
        return {
            balance: balance,
            lifetime: parseFloat(subgraphResult.user.totalUserLoyaltyRewards),
        }
    }
}