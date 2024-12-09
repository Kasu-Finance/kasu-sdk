import { Provider } from '@ethersproject/providers';
import {
    BigNumber,
    BigNumberish,
    BytesLike,
    ContractTransaction,
    ethers,
    Signer,
} from 'ethers';
import {
    defaultAbiCoder,
    formatEther,
    formatUnits,
    parseEther,
    parseUnits,
} from 'ethers/lib/utils';
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
import { DataService } from '../DataService/data-service';

import { mapUserRequestEventType } from './helper';
import {
    currentEpochDepositedAmountQuery,
    currentEpochFtdAmountQuery,
    currentFtdBalanceQuery,
    lendingPoolUserDetailsQuery,
    totalUserLoyaltyRewardsQuery,
    trancheUserDetailsQuery,
    userRequestsQuery,
} from './queries';
import {
    CurrentEpochDepositedAmountSubgraph,
    CurrentEpochFtdAmountSubgraph,
    CurrentFtdBalanceSubgraph,
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
    UserTrancheBalance,
} from './types';

export class UserLending {
    private readonly _graph: GraphQLClient;
    private _dataService: DataService;
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
        this._dataService = new DataService(_kasuConfig);
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

    async withdrawAtExpiry(
        lendingPool: string,
        fixedTermDepositId: string,
    ): Promise<ContractTransaction> {
        return await this._lendingPoolManagerAbi.requestFixedTermDepositWithdrawal(
            lendingPool,
            fixedTermDepositId,
        );
    }

    async lockDepositForFixedTerm(
        lendingPool: string,
        tranche: string,
        amount: BigNumberish,
        fixedTermConfigId: BigNumberish,
    ): Promise<ContractTransaction> {
        const trancheContract: ILendingPoolTrancheAbi =
            ILendingPoolTrancheAbi__factory.connect(
                tranche,
                this._signerOrProvider,
            );

        const shareAmount = await trancheContract.convertToShares(amount);

        return await this._lendingPoolManagerAbi.lockDepositForFixedTerm(
            lendingPool,
            tranche,
            shareAmount,
            fixedTermConfigId,
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

    async getUserRequests(
        userAddress: `0x${string}`,
        epochId: string,
    ): Promise<UserRequest[]> {
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
                epochId,
            },
        );

        const retn: UserRequest[] = [];

        for (const userRequest of subgraphResult.userRequests) {
            const trancheName =
                trancheNames[userRequest.lendingPool.tranches.length - 1][
                    parseInt(userRequest.tranche.orderId)
                ];

            const events: UserRequestEvent[] = [];

            for (const event of userRequest.userRequestEvents) {
                let totalRequested = '0';
                let totalAccepted = '0';
                let totalRejected = '0';

                const eventTrancheId = event.tranche.id;
                const eventTrancheName =
                    trancheNames[userRequest.lendingPool.tranches.length - 1][
                        parseInt(event.tranche.orderId)
                    ];

                if (eventTrancheId !== userRequest.tranche.id) {
                    event.type = 'DepositReallocated';
                }

                const assetAmount =
                    event.assetAmount ??
                    this.convertSharesToAssets(
                        event.sharesAmount,
                        userRequest.tranche.balance,
                        userRequest.tranche.shares,
                    ).toString();

                switch (event.type) {
                    case 'DepositAccepted':
                    case 'WithdrawalAccepted':
                    case 'DepositReallocated':
                        totalAccepted = assetAmount;
                        break;
                    case 'DepositCancelled':
                    case 'WithdrawalCancelled':
                    case 'DepositRejected':
                        totalRejected = assetAmount;
                        break;

                    case 'DepositInitiated':
                    case 'WithdrawalInitiated':
                    case 'DepositIncreased':
                    case 'WithdrawalIncreased':
                        totalRequested = assetAmount;

                        break;
                }

                events.push({
                    id: event.id,
                    requestType: mapUserRequestEventType(event.type),
                    timestamp: parseInt(event.createdOn),
                    totalRequested,
                    totalAccepted,
                    totalRejected,
                    assetAmount,
                    index: parseInt(event.index),
                    transactionHash: event.transactionHash,
                    trancheName: eventTrancheName,
                    trancheId: event.tranche.id,
                });
            }

            const tranche =
                userRequest.lendingPool.configuration.tranchesConfig.find(
                    (trancheConfig) =>
                        trancheConfig.id === userRequest.tranche.id,
                );

            // shouldn't be possible, just adding type checking here
            if (!tranche) continue;

            const interestRate = tranche.lendingPoolTrancheInterestRateUpdates
                .length
                ? tranche.lendingPoolTrancheInterestRateUpdates[0]
                      .epochInterestRate
                : tranche.interestRate;

            const baseApy =
                this._dataService.calculateApyForTranche(interestRate);

            const ftdConfig = tranche.lendingPoolTrancheFixedTermConfigs.find(
                (config) => config.configId === userRequest.fixedTermConfigId,
            );

            let fixedTermConfig: UserRequest['fixedTermConfig'];

            if (ftdConfig) {
                const fixedTermApy = this._dataService.calculateApyForTranche(
                    ftdConfig.epochInterestRate,
                );

                fixedTermConfig = {
                    configId: ftdConfig.configId,
                    apy: fixedTermApy.toString(),
                    epochLockDuration: ftdConfig.epochLockDuration,
                    epochInterestRate: ftdConfig.epochInterestRate,
                };
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
                requestedAmount: this.convertSharesToAssets(
                    userRequest.amountRequested,
                    userRequest.tranche.balance,
                    userRequest.tranche.shares,
                ).toString(),
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
                fixedTermConfig,
                apy: baseApy.toString(),
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

    async getCurrentFtdBalance(
        poolId: string,
        userId: string,
    ): Promise<Map<string, number[]>> {
        const currentFtdBalance: CurrentFtdBalanceSubgraph =
            await this._graph.request(currentFtdBalanceQuery, {
                userId: userId.toLowerCase(),
                poolId: poolId.toLowerCase(),
            });

        const trancheMap = new Map<string, number[]>();

        for (const userFTD of currentFtdBalance.userLendingPoolTrancheFixedTermDepositLocks) {
            const ftdID = parseFloat(
                userFTD.lendingPoolTrancheFixedTermConfig.configId,
            );

            const trancheID =
                userFTD.lendingPoolTrancheFixedTermConfig.lendingPoolTranche.id.toLowerCase();

            const totalSupply = userFTD.lendingPool.tranches.reduce(
                (total, cur) => total.add(parseEther(cur.shares)),
                BigNumber.from(0),
            );

            const amount = this.convertSharesToAssets(
                userFTD.trancheShares,
                userFTD.lendingPool.balance,
                formatEther(totalSupply),
            );

            const item = trancheMap.get(trancheID) ?? [];

            if (item[ftdID]) {
                item[ftdID] += parseFloat(amount);
            } else {
                item[ftdID] = parseFloat(amount);
            }

            trancheMap.set(trancheID, item);
        }

        return trancheMap;
    }

    async getCurrentEpochFtdAmount(
        poolId: string,
        userId: string,
        currentEpoch: string,
    ): Promise<Map<string, string[]>> {
        const currentEpochFtdAmountRes: CurrentEpochFtdAmountSubgraph =
            await this._graph.request(currentEpochFtdAmountQuery, {
                userId: userId.toLowerCase(),
                poolId: poolId.toLowerCase(),
                currentEpoch: parseFloat(currentEpoch),
            });

        const currentEpochFtdAmounts = new Map<string, string[]>();

        for (const userRequest of currentEpochFtdAmountRes.userRequests) {
            const ftdID = parseFloat(userRequest.fixedTermConfigId);

            const item = currentEpochFtdAmounts.get(userRequest.tranche.id);

            const amountRequested = this.convertSharesToAssets(
                userRequest.amountRequested,
                userRequest.tranche.balance,
                userRequest.tranche.shares,
            );

            if (item) {
                const clonedItem = [...item];

                clonedItem[ftdID] = amountRequested;

                currentEpochFtdAmounts.set(userRequest.tranche.id, clonedItem);

                continue;
            }
            const ftdAmounts: string[] = [];

            ftdAmounts[ftdID] = amountRequested;

            currentEpochFtdAmounts.set(userRequest.tranche.id, ftdAmounts);
        }

        return currentEpochFtdAmounts;
    }

    async getCurrentEpochDepositedAmount(
        lendingPoolId: string,
        userId: string,
    ): Promise<Map<string, string>> {
        const currentEpochDepositedAmountRes: CurrentEpochDepositedAmountSubgraph =
            await this._graph.request(currentEpochDepositedAmountQuery, {
                id: `${lendingPoolId}-${userId}`,
            });

        const amountMap = new Map<string, string>();

        if (!currentEpochDepositedAmountRes.lendingPoolUserDetails)
            return amountMap;

        const { lendingPoolTrancheUserDetails } =
            currentEpochDepositedAmountRes.lendingPoolUserDetails;

        for (const {
            tranche,
            totalPendingDepositAmount,
        } of lendingPoolTrancheUserDetails) {
            amountMap.set(tranche.id.toLowerCase(), totalPendingDepositAmount);
        }

        return amountMap;
    }

    convertSharesToAssets(
        sharesAmount: string,
        totalAssets: string,
        totalSupply: string,
    ): string {
        return formatUnits(
            parseUnits(sharesAmount)
                .mul(parseUnits(totalAssets.toString()))
                .div(parseUnits(totalSupply.toString())),
        );
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
        poolId: string,
        trancheId: string,
    ): Promise<UserTrancheBalance> {
        const tranche = ILendingPoolTrancheAbi__factory.connect(
            trancheId,
            this._signerOrProvider,
        );

        const [availableToWithdraw, userDetails] = await Promise.all([
            tranche.maxWithdraw(user),
            this._graph.request(trancheUserDetailsQuery, {
                userAddress: `${poolId}-${user}-${trancheId}`,
            }),
        ]);

        const userDetailsSubgraph = userDetails as TrancheUserDetailsSubgraph;

        let yieldEarned = 0;

        let userBalance = '0';

        if (userDetailsSubgraph.lendingPoolTrancheUserDetails) {
            userBalance = this.convertSharesToAssets(
                userDetailsSubgraph.lendingPoolTrancheUserDetails.shares,
                userDetailsSubgraph.lendingPoolTrancheUserDetails.tranche
                    .balance,
                userDetailsSubgraph.lendingPoolTrancheUserDetails.tranche
                    .shares,
            );

            const totalAcceptedDeposits = parseFloat(
                userDetailsSubgraph.lendingPoolTrancheUserDetails
                    .totalAcceptedDeposits,
            );

            const totalAcceptedWithdrawals = parseFloat(
                userDetailsSubgraph.lendingPoolTrancheUserDetails
                    .totalAcceptedWithdrawnAmount,
            );

            yieldEarned =
                parseFloat(userBalance) -
                totalAcceptedDeposits -
                totalAcceptedWithdrawals;
        }

        return {
            userId: user,
            address: trancheId,
            yieldEarned,
            balance: userBalance,
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
