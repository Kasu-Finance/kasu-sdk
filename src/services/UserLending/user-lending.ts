import { Provider } from '@ethersproject/providers';
import {
    BigNumber,
    BigNumberish,
    BytesLike,
    ContractTransaction,
    ethers,
    Signer,
} from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { GraphQLClient } from 'graphql-request';

import {
    IClearingCoordinatorAbi,
    IClearingCoordinatorAbi__factory,
    IKasuAllowListAbi__factory,
    ILendingPoolAbi__factory,
    ILendingPoolManagerAbi,
    ILendingPoolManagerAbi__factory,
    ILendingPoolTrancheAbi,
    ILendingPoolTrancheAbi__factory,
    ISystemVariablesAbi,
    ISystemVariablesAbi__factory,
    IUserLoyaltyRewardsAbi,
    IUserLoyaltyRewardsAbi__factory,
    IUserManagerAbi,
    IUserManagerAbi__factory,
} from '../../contracts';
import { SdkConfig } from '../../sdk-config';

import { mapUserRequestEventType } from './helper';
import {
    currentEpochDepositedAmountQuery,
    lendingPoolUserDetailsQuery,
    totalUserLoyaltyRewardsQuery,
    trancheUserDetailsQuery,
    userRequestsQuery,
} from './queries';
import {
    LendingPoolUserDetailsSubgraph,
    TotalUserLoyaltyRewardsSubgraph,
    TrancheUserDetailsSubgraph,
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
    private readonly _clearingCoordinatorAbi: IClearingCoordinatorAbi;
    private readonly _systemVariablesAbi: ISystemVariablesAbi;

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
        this._clearingCoordinatorAbi = IClearingCoordinatorAbi__factory.connect(
            _kasuConfig.contracts.ClearingCoordinator,
            signerOrProvider,
        );
        this._systemVariablesAbi = ISystemVariablesAbi__factory.connect(
            _kasuConfig.contracts.SystemVariables,
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

    buildDepositSwapData(
        fromToken: string,
        fromAmount: string,
        routerAddress: string,
        swapCallData: string,
        minAmountOut: string,
    ): BytesLike {
        return defaultAbiCoder.encode(
            [
                'tuple(address[], uint256[], (address, address,bytes)[], uint256)',
            ],
            [
                [
                    [fromToken],
                    [fromAmount],
                    [[routerAddress, fromToken, swapCallData]],
                    minAmountOut,
                ],
            ],
        );
    }

    async requestDepositWithKyc(
        lendingPool: string,
        tranche: string,
        maxAmount: BigNumberish,
        swapData: BytesLike,
        fixedTermConfigId: BigNumberish,
        depositData: BytesLike,
        kycData: {
            blockExpiration: BigNumberish;
            signature: BytesLike;
        },
        ethValue: string,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestDepositWithKyc(
            lendingPool,
            tranche,
            maxAmount,
            swapData,
            fixedTermConfigId,
            depositData,
            kycData,
            {
                value: ethValue,
            },
        );
    }

    async requestDeposit(
        lendingPool: string,
        tranche: string,
        amount: BigNumberish,
        swapData: BytesLike,
        fixedTermConfigId: BigNumberish,
        depositData: BytesLike,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestDeposit(
            lendingPool,
            tranche,
            amount,
            swapData,
            fixedTermConfigId,
            depositData,
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
            {
                userAddress: userAddress.toLowerCase(),
                unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
            },
        );

        const retn: UserRequest[] = [];
        for (const userRequest of subgraphResult.userRequests) {
            const trancheName =
                trancheNames[userRequest.lendingPool.tranches.length - 1][
                    parseInt(userRequest.tranche.orderId)
                ];

            const events: UserRequestEvent[] = [];

            const totalSupply = userRequest.lendingPool.tranches.reduce(
                (acc, tranche) => acc + parseFloat(tranche.shares),
                0,
            );

            for (const event of userRequest.userRequestEvents) {
                let totalRequested = 0;
                let totalAccepted = 0;
                let totalRejected = 0;

                const totalAssets = parseFloat(userRequest.lendingPool.balance);

                const eventTrancheId = event.tranche.id;
                const eventTrancheName =
                    trancheNames[userRequest.lendingPool.tranches.length - 1][
                        parseInt(event.tranche.orderId)
                    ];

                if (eventTrancheId !== userRequest.tranche.id) {
                    event.type = 'DepositReallocated';
                }

                if (
                    event.type === 'DepositAccepted' ||
                    event.type === 'WithdrawalAccepted' ||
                    event.type === 'DepositReallocated'
                ) {
                    totalAccepted = event.assetAmount
                        ? parseFloat(event.assetAmount)
                        : this.convertSharesToAssets(
                              event.sharesAmount,
                              totalAssets,
                              totalSupply,
                          );
                }
                if (
                    event.type === 'DepositCancelled' ||
                    event.type === 'WithdrawalCancelled' ||
                    event.type === 'DepositRejected'
                ) {
                    totalRejected = event.assetAmount
                        ? parseFloat(event.assetAmount)
                        : this.convertSharesToAssets(
                              event.sharesAmount,
                              totalAssets,
                              totalSupply,
                          );
                }
                if (
                    event.type === 'DepositInitiated' ||
                    event.type === 'WithdrawalInitiated' ||
                    event.type === 'DepositIncreased' ||
                    event.type === 'WithdrawalIncreased'
                ) {
                    totalRequested = event.assetAmount
                        ? parseFloat(event.assetAmount)
                        : this.convertSharesToAssets(
                              event.sharesAmount,
                              totalAssets,
                              totalSupply,
                          );
                }

                events.push({
                    id: event.id,
                    requestType: mapUserRequestEventType(event.type),
                    timestamp: parseInt(event.createdOn),
                    totalRequested: totalRequested.toString(),
                    totalAccepted: totalAccepted.toString(),
                    totalRejected: totalRejected.toString(),
                    assetAmount:
                        event.assetAmount ??
                        this.convertSharesToAssets(
                            event.sharesAmount,
                            totalAssets,
                            totalSupply,
                        ).toString(),
                    index: parseInt(event.index),
                    transactionHash: event.transactionHash,
                    trancheName: eventTrancheName,
                    trancheId: event.tranche.id,
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
                trancheId: userRequest.tranche.id,
                requestedAmount: userRequest.amountRequested,
                acceptedAmount: userRequest.amountAccepted,
                rejectedAmount: userRequest.amountRejected,
                status: userRequest.status,
                timestamp: parseInt(userRequest.createdOn),
                canCancel: await this.isCancelable(
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

    async getCurrentEpoch(): Promise<string> {
        const currentEpochNumber =
            await this._systemVariablesAbi.currentEpochNumber();

        return currentEpochNumber.toString();
    }

    async getCurrentEpochDepositedAmount(
        lendingPoolId: string,
        trancheId: string,
        userId: string,
    ): Promise<string> {
        const currentRequestEpoch =
            await this._systemVariablesAbi.currentRequestEpoch();

        const userRequestsSubgraph: UserRequestsSubgraph =
            await this._graph.request(currentEpochDepositedAmountQuery, {
                lendingPoolId,
                trancheId,
                userId,
                epochId: currentRequestEpoch.toString(),
            });

        // eslint-disable-next-line
        return userRequestsSubgraph?.userRequests?.[0]?.amountRequested ?? '0';
    }

    convertSharesToAssets(
        sharesAmount: string,
        totalAssets: number,
        totalSupply: number,
    ): number {
        return (parseFloat(sharesAmount) * totalAssets) / totalSupply;
    }

    async isClearingPending(poolId: string): Promise<boolean> {
        return await this._clearingCoordinatorAbi.isLendingPoolClearingPending(
            poolId,
        );
    }

    async isCancelable(
        status: string,
        lendingPoolId: string,
    ): Promise<boolean> {
        if (status === 'Processed') return false;

        const isClearingPending = await this.isClearingPending(lendingPoolId);

        return !isClearingPending;
    }

    async getUserPoolBalance(
        user: string,
        poolId: string,
    ): Promise<UserPoolBalance> {
        const lendingPool = ILendingPoolAbi__factory.connect(
            poolId,
            this._signerOrProvider,
        );

        if (
            this._kasuConfig.UNUSED_LENDING_POOL_IDS.includes(
                poolId.toLowerCase(),
            )
        ) {
            throw new Error('This pool is no longer in used');
        }

        const userDetailsSubgraph: LendingPoolUserDetailsSubgraph =
            await this._graph.request(lendingPoolUserDetailsQuery, {
                userAddress: `${poolId}-${user}`,
            });
        const balance = await lendingPool.userBalance(user);
        const balanceNumber = parseFloat(ethers.utils.formatUnits(balance, 6));
        return {
            userId: user,
            address: poolId,
            yieldEarned:
                userDetailsSubgraph.lendingPoolUserDetails != null
                    ? balanceNumber -
                      parseFloat(
                          userDetailsSubgraph.lendingPoolUserDetails
                              .totalAcceptedDeposits,
                      ) -
                      parseFloat(
                          userDetailsSubgraph.lendingPoolUserDetails
                              .totalAcceptedWithdrawnAmount,
                      )
                    : 0,
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

        const [balance, availableToWithdraw, userDetails] = await Promise.all([
            tranche.userActiveAssets(user),
            tranche.maxWithdraw(user),
            this._graph.request(trancheUserDetailsQuery, {
                userAddress: `${trancheId}-${user}`,
            }),
        ]);

        const balanceNumber = parseFloat(ethers.utils.formatUnits(balance, 6));
        const userDetailsSubgraph = userDetails as TrancheUserDetailsSubgraph;

        let yieldEarned = 0;

        if (userDetailsSubgraph.lendingPoolTrancheUserDetails) {
            const totalAcceptedDeposits = parseFloat(
                userDetailsSubgraph.lendingPoolTrancheUserDetails
                    .totalAcceptedDeposits,
            );

            const totalAcceptedWithdrawals = parseFloat(
                userDetailsSubgraph.lendingPoolTrancheUserDetails
                    .totalAcceptedWithdrawnAmount,
            );

            yieldEarned =
                balanceNumber -
                totalAcceptedDeposits -
                totalAcceptedWithdrawals;
        }

        return {
            userId: user,
            address: trancheId,
            yieldEarned,
            balance: balance,
            availableToWithdraw,
        };
    }

    async getUserApyBonus(user: string): Promise<UserApyBonus> {
        const subgraphResult: TotalUserLoyaltyRewardsSubgraph =
            await this._graph.request(totalUserLoyaltyRewardsQuery, {
                userAddress: user,
            });
        if (!subgraphResult.user) {
            return {
                balance: BigNumber.from(0),
                lifetime: 0,
            };
        }
        const balance = await this._userLoyaltyRewardsAbi.userRewards(user);
        return {
            balance: balance,
            lifetime: parseFloat(subgraphResult.user.totalUserLoyaltyRewards),
        };
    }
}
