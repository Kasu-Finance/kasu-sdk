import { Provider } from '@ethersproject/providers';
import { BigNumber, Signer } from 'ethers';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { GraphQLClient } from 'graphql-request';

import {
    IKasuNFTsAbi,
    IKasuNFTsAbi__factory,
    ISystemVariablesAbi,
    ISystemVariablesAbi__factory,
} from '../../contracts';
import { SdkConfig } from '../../sdk-config';
import { DataService } from '../DataService/data-service';
import { PoolOverview } from '../DataService/types';
import { KSULocking } from '../Locking/locking';
import { UserPoolBalance } from '../UserLending/types';
import { UserLending } from '../UserLending/user-lending';

import { lendingPortfolioQuery } from './queries';
import {
    LendingPortfolioQueryResult,
    PortfolioLendingPool,
    PortfolioRewards,
    PortfolioSummary,
    PortfolioTranche,
    PortfolioTrancheDepositDetails,
    UserLendingPoolTrancheFixedTermDepositLock,
} from './types';

export class Portfolio {
    private _lockingService: KSULocking;
    private _dataService: DataService;
    private _userLendingService: UserLending;
    private readonly _graph: GraphQLClient;

    private _systemVariablesAbi: ISystemVariablesAbi;
    private _kasuNftContract: IKasuNFTsAbi;
    readonly _signerOrProvider: Signer | Provider;

    constructor(
        private _kasuConfig: SdkConfig,
        signerOrProvider: Signer | Provider,
    ) {
        this._signerOrProvider = signerOrProvider;
        this._lockingService = new KSULocking(_kasuConfig, signerOrProvider);
        this._dataService = new DataService(_kasuConfig);
        this._systemVariablesAbi = ISystemVariablesAbi__factory.connect(
            _kasuConfig.contracts.SystemVariables,
            signerOrProvider,
        );
        this._userLendingService = new UserLending(
            _kasuConfig,
            signerOrProvider,
        );
        this._kasuNftContract = IKasuNFTsAbi__factory.connect(
            _kasuConfig.contracts.KasuNFTs,
            signerOrProvider,
        );
        this._graph = new GraphQLClient(_kasuConfig.subgraphUrl);
    }

    async getPortfolioRewards(userAddress: string): Promise<PortfolioRewards> {
        const userLockingData =
            await this._lockingService.getUserBonusData(userAddress);
        const lockingRewards =
            await this._lockingService.getLockingRewards(userAddress);
        const ksuLaunchBonus =
            await this._lockingService.getUserTotalBonusAmount(userAddress);
        return {
            bonusYieldEarnings: {
                claimableBalance: {
                    ksuAmount: userLockingData.ksuBonusAndRewards,
                },
                lifeTime: {
                    ksuAmount: userLockingData.ksuBonusAndRewardsLifetime,
                },
            },
            protocolFees: {
                claimableBalance: {
                    usdcAmount: lockingRewards.claimableRewards,
                },
                lifeTime: { usdcAmount: lockingRewards.lifeTimeRewards },
            },
            ksuLaunchBonus: { lifeTime: { ksuAmount: ksuLaunchBonus } },
        };
    }

    async getUserNfts(userAddress: string): Promise<number[]> {
        const usernfts = await this._kasuNftContract.tokensOfOwner(userAddress);

        return usernfts.map((nft) => nft.toNumber());
    }

    async getPortfolioSummary(
        userAddress: string,
        portfolioLendingPools: PortfolioLendingPool[],
    ): Promise<PortfolioSummary> {
        const userLockingData =
            await this._lockingService.getUserBonusData(userAddress);
        let totalInvestments = 0;

        let weightedApy = 0;
        let totalYieldEarned = 0;

        for (const pool of portfolioLendingPools) {
            for (const tranche of pool.tranches) {
                const investedAmount = parseFloat(tranche.investedAmount);

                totalInvestments += investedAmount;
                totalYieldEarned += parseFloat(tranche.yieldEarnings.lifetime);

                weightedApy += parseFloat(tranche.apy) * investedAmount;

                for (const fixedDeposits of tranche.fixedLoans) {
                    const ftdConfig = tranche.fixedTermConfig.find(
                        (ftd) => ftd.configId === fixedDeposits.configId,
                    );

                    if (!ftdConfig) continue;

                    const ftdInvestedAmount = parseFloat(fixedDeposits.amount);

                    totalInvestments += ftdInvestedAmount;
                    totalYieldEarned += parseFloat(
                        fixedDeposits.yieldEarnings.lifetime,
                    );

                    weightedApy +=
                        parseFloat(ftdConfig.apy) * ftdInvestedAmount;
                }
            }
        }

        return {
            current: {
                totalKsuLocked: userLockingData.totalLockedAmount,
                totalLendingPoolInvestments: totalInvestments.toString(),
                weightedAverageApy: (weightedApy / totalInvestments).toString(),
            },
            lifetime: {
                yieldEarnings: totalYieldEarned.toString(),
                ksuBonusRewards: userLockingData.ksuBonusAndRewards,
                protocolFeesEarned: userLockingData.protocolFeesEarned,
            },
        };
    }

    async getPortfolioLendingData(
        userAddress: string,
        poolOverviews: PoolOverview[],
        currentEpoch: string,
    ): Promise<PortfolioLendingPool[]> {
        const SECONDS_PER_EPOCH = 604_800; // seconds in a week

        const portfolioLendingPoolsPromise: (Omit<
            PortfolioLendingPool,
            'tranches'
        > & {
            tranches: (Omit<PortfolioTranche, 'investedAmount'> & {
                investedAmount: {
                    balance: string;
                    yieldEarned: number;
                };
            })[];
        })[] = [];
        const userPoolBalancePromises: Promise<UserPoolBalance>[] = [];
        const previousEpoch = BigNumber.from(currentEpoch).sub(
            BigNumber.from(1),
        );

        const [lastEpochData, portfolioUserTrancheBalances] = await Promise.all(
            [
                this._graph.request<LendingPortfolioQueryResult>(
                    lendingPortfolioQuery,
                    {
                        userAddress: userAddress.toLowerCase(),
                        epochId: parseFloat(currentEpoch),
                        lastEpochId: previousEpoch.toNumber(),
                        unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
                    },
                ),
                this._userLendingService.getPortfolioUserTrancheBalances(
                    userAddress,
                ),
            ],
        );

        if (!lastEpochData.user) return [];

        const userRequestsMap = new Map<
            string,
            Record<string, PortfolioTrancheDepositDetails[] | undefined>
        >();

        for (const userRequest of lastEpochData.userRequests) {
            const trancheId = userRequest.tranche.id;

            const ftdId = userRequest.fixedTermConfigId;

            let remainingAcceptedAmount = parseFloat(
                userRequest.amountAccepted,
            );

            for (const userRequestEvent of userRequest.userRequestEvents) {
                const mappedUserRequest = userRequestsMap.get(trancheId);

                const assetAmount = parseFloat(userRequestEvent.assetAmount);

                const acceptedAmount =
                    remainingAcceptedAmount > assetAmount
                        ? assetAmount
                        : remainingAcceptedAmount;

                remainingAcceptedAmount -= acceptedAmount;

                const userRequestFtdItem: PortfolioTrancheDepositDetails = {
                    id: userRequestEvent.id,
                    depositAmount: userRequestEvent.assetAmount,
                    acceptedAmount: acceptedAmount.toString(),
                    timestamp: parseInt(userRequest.createdOn),
                };

                if (!mappedUserRequest) {
                    userRequestsMap.set(trancheId, {
                        [ftdId]: [userRequestFtdItem],
                    });
                    continue;
                }

                userRequestsMap.set(trancheId, {
                    ...mappedUserRequest,
                    [ftdId]: [
                        ...(mappedUserRequest[ftdId] ?? []),
                        userRequestFtdItem,
                    ],
                });
            }
        }

        for (const poolOverview of poolOverviews) {
            userPoolBalancePromises.push(
                this._userLendingService.getUserPoolBalance(
                    userAddress,
                    poolOverview.id,
                ),
            );
        }

        const userPoolBalances = await Promise.all(userPoolBalancePromises);

        let totalInvestments = BigNumber.from(0);
        let totalYieldEarnedLastEpoch = 0;

        for (const poolOverview of poolOverviews) {
            const userPoolBalance = userPoolBalances.find(
                (u) => u.address === poolOverview.id,
            );
            if (!userPoolBalance) {
                console.warn(
                    `Could not find user pool balance for ${poolOverview.id}`,
                );
                continue;
            }
            totalInvestments = userPoolBalance.balance.add(totalInvestments);
            const tranches: (Omit<PortfolioTranche, 'investedAmount'> & {
                investedAmount: {
                    balance: string;
                    yieldEarned: number;
                };
            })[] = [];

            const lendingPoolUserDetails =
                lastEpochData.user.lendingPoolUserDetails.find(
                    ({ lendingPool }) => lendingPool.id === poolOverview.id,
                );

            if (!lendingPoolUserDetails) continue;

            const portfolioUserTrancheBalance =
                portfolioUserTrancheBalances.get(poolOverview.id);

            for (const tranche of poolOverview.tranches) {
                const lastEpochUserTrancheDetails =
                    lendingPoolUserDetails.lendingPoolTrancheUserDetails.find(
                        (lendingPool) => lendingPool.tranche.id === tranche.id,
                    );

                const userRequest = userRequestsMap.get(tranche.id);

                const depositDetails = userRequest?.['0'] ?? [];

                if (!lastEpochUserTrancheDetails) {
                    tranches.push({
                        ...tranche,
                        investedAmount: {
                            balance: '0',
                            yieldEarned: 0,
                        },
                        yieldEarnings: {
                            lastEpoch: '0',
                            lifetime: '0',
                        },
                        depositDetails,
                        fixedLoans: [],
                    });
                    continue;
                }
                const lastEpochTotalYield = parseFloat(
                    lastEpochUserTrancheDetails.tranche
                        .lendingPoolTrancheEpochInterest?.[0]
                        ?.epochInterestAmount ?? '0',
                );

                const lastEpochUserShares = parseFloat(
                    lastEpochUserTrancheDetails
                        .lendingPoolTrancheUserEpochSharesUpdates?.[0]
                        ?.shares ?? '0',
                );

                const lastEpochTotalShares = parseFloat(
                    lastEpochUserTrancheDetails.tranche
                        .lendingPoolTrancheShareUpdates?.[0]?.shares ?? '0',
                );

                const currentTotalAmount = parseFloat(
                    lastEpochUserTrancheDetails.tranche.balance,
                );
                const currentTotalShares = parseFloat(
                    lastEpochUserTrancheDetails.tranche.shares,
                );

                const lastEpochTotalBaseYield =
                    lastEpochTotalShares === 0
                        ? 0
                        : (lastEpochTotalYield * lastEpochUserShares) /
                          lastEpochTotalShares;

                const userTrancheBalance = {
                    balance: '0',
                    yieldEarned: 0,
                };

                if (portfolioUserTrancheBalance) {
                    const portfolioUserTranche =
                        portfolioUserTrancheBalance.find(
                            ({ trancheId }) => trancheId === tranche.id,
                        );

                    if (portfolioUserTranche) {
                        userTrancheBalance.balance =
                            portfolioUserTranche.userBalance;
                        userTrancheBalance.yieldEarned =
                            portfolioUserTranche.yieldEarned;
                    }
                }

                let totalLifetimeFtdYield = 0;

                let lastEpochVariableBaseYield = lastEpochTotalBaseYield;

                const fixedLoans: PortfolioTranche['fixedLoans'] =
                    lastEpochUserTrancheDetails.userLendingPoolTrancheFixedTermDepositLocks.map(
                        (fixedTermDeposit) => {
                            const fixedLoanDepositDetails =
                                userRequest?.[
                                    fixedTermDeposit
                                        .lendingPoolTrancheFixedTermConfig
                                        .configId
                                ] ?? [];

                            let lastEpochYieldEarned = 0;
                            let lifetimeYieldEarned = 0;

                            if (
                                parseFloat(fixedTermDeposit.epochLockStart) <
                                    previousEpoch.toNumber() &&
                                parseFloat(fixedTermDeposit.epochLockEnd) >=
                                    previousEpoch.toNumber() &&
                                Boolean(
                                    lastEpochUserTrancheDetails
                                        .lendingPoolTrancheUserEpochSharesUpdates
                                        ?.length,
                                )
                            ) {
                                const currentEpochFtdShares = parseFloat(
                                    fixedTermDeposit.trancheShares,
                                );

                                const lastEpochFtdShares = parseFloat(
                                    fixedTermDeposit
                                        .userLendingPoolTrancheFixedTermDepositLockShareUpdate?.[0]
                                        ?.shares ?? '0',
                                );

                                const additionalFtdYield =
                                    ((currentEpochFtdShares -
                                        lastEpochFtdShares) *
                                        currentTotalAmount) /
                                    currentTotalShares;

                                const lastEpochFtdBaseYield =
                                    (lastEpochTotalBaseYield *
                                        lastEpochFtdShares) /
                                    lastEpochUserShares;

                                lastEpochVariableBaseYield -=
                                    lastEpochFtdBaseYield;

                                lastEpochYieldEarned =
                                    lastEpochFtdBaseYield + additionalFtdYield;
                            }

                            lifetimeYieldEarned =
                                this.calculateFixedTermDepositEarnings(
                                    fixedTermDeposit,
                                    lastEpochUserTrancheDetails.tranche.balance,
                                    lastEpochUserTrancheDetails.tranche.shares,
                                );

                            totalLifetimeFtdYield += lifetimeYieldEarned;

                            totalYieldEarnedLastEpoch += lastEpochYieldEarned;

                            const lockDuration =
                                parseFloat(
                                    fixedTermDeposit
                                        .lendingPoolTrancheFixedTermConfig
                                        .epochLockDuration,
                                ) * SECONDS_PER_EPOCH;

                            return {
                                lockId: fixedTermDeposit.lockId,
                                configId:
                                    fixedTermDeposit
                                        .lendingPoolTrancheFixedTermConfig
                                        .configId,
                                epochLockDuration:
                                    fixedTermDeposit
                                        .lendingPoolTrancheFixedTermConfig
                                        .epochLockDuration,
                                epochLockEnd: fixedTermDeposit.epochLockEnd,
                                epochLockStart: fixedTermDeposit.epochLockStart,
                                amount: this._userLendingService
                                    .convertSharesToAssets(
                                        fixedTermDeposit.trancheShares,
                                        lastEpochUserTrancheDetails.tranche
                                            .balance,
                                        lastEpochUserTrancheDetails.tranche
                                            .shares,
                                    )
                                    .toString(),
                                endTime:
                                    parseInt(fixedTermDeposit.createdOn) +
                                    lockDuration,
                                isLocked: fixedTermDeposit.isLocked,
                                isWithdrawalRequested:
                                    fixedTermDeposit.isWithdrawalRequested,
                                startTime: parseInt(fixedTermDeposit.createdOn),
                                yieldEarnings: {
                                    lastEpoch: lastEpochYieldEarned.toString(),
                                    lifetime:
                                        this.precisionToString(
                                            lifetimeYieldEarned,
                                        ),
                                },
                                depositDetails: fixedLoanDepositDetails,
                            };
                        },
                    );

                totalYieldEarnedLastEpoch += lastEpochTotalBaseYield;

                tranches.push({
                    ...tranche,
                    investedAmount: userTrancheBalance,
                    yieldEarnings: {
                        lastEpoch: lastEpochVariableBaseYield.toString(),
                        lifetime: this.precisionToString(totalLifetimeFtdYield), // passing in total FTD yield to be subtracted by total trache lifetime later down
                    },
                    fixedLoans,
                    depositDetails,
                });
            }

            portfolioLendingPoolsPromise.push({
                ...poolOverview,
                totalYieldEarningsLastEpoch:
                    totalYieldEarnedLastEpoch.toString(),
                totalInvestedAmount: userPoolBalance.balance.toString(),
                totalYieldEarningsLifetime:
                    userPoolBalance.yieldEarned.toString(),
                tranches,
            });
        }

        const portfolioLendingPools: PortfolioLendingPool[] = await Promise.all(
            portfolioLendingPoolsPromise.map(async (pool) => ({
                ...pool,
                tranches: await Promise.all(
                    pool.tranches.map((tranche) => {
                        const trancheBalance = tranche.investedAmount;

                        const lockedAmount = tranche.fixedLoans.reduce(
                            (total, cur) => {
                                if (!cur.isLocked) return total;

                                return total.add(parseEther(cur.amount));
                            },
                            BigNumber.from(0),
                        );

                        const totalTrancheYieldEarned =
                            trancheBalance.yieldEarned.toFixed(6);
                        const totalTrancheFtdYieldEarned = parseFloat(
                            tranche.yieldEarnings.lifetime,
                        ).toFixed(6);

                        return {
                            ...tranche,
                            investedAmount: formatEther(
                                parseEther(trancheBalance.balance).sub(
                                    lockedAmount,
                                ),
                            ),
                            yieldEarnings: {
                                ...tranche.yieldEarnings,
                                lifetime: this.precisionToString(
                                    parseFloat(totalTrancheYieldEarned) -
                                        parseFloat(totalTrancheFtdYieldEarned),
                                ),
                            },
                        };
                    }),
                ),
            })),
        );

        return portfolioLendingPools.filter(
            (pool) =>
                !BigNumber.from(pool.totalInvestedAmount).isZero() ||
                !BigNumber.from(pool.totalYieldEarningsLifetime).isZero(),
        );
    }

    precisionToString(val: number): string {
        if (val < 0 && val > -0.0001) {
            return '0';
        }

        return val.toString();
    }

    calculateFixedTermDepositEarnings(
        fixedTermDepositLock: UserLendingPoolTrancheFixedTermDepositLock,
        totalTrancheBalance: string,
        totalTrancheShares: string,
    ): number {
        const { isLocked, unlockAmount, initialAmount, trancheShares } =
            fixedTermDepositLock;

        let yieldEarned = 0;

        if (!isLocked && unlockAmount) {
            yieldEarned = parseFloat(unlockAmount) - parseFloat(initialAmount);
        } else {
            const currentUsdAmount =
                this._userLendingService.convertSharesToAssets(
                    trancheShares,
                    totalTrancheBalance,
                    totalTrancheShares,
                );

            yieldEarned =
                parseFloat(currentUsdAmount) - parseFloat(initialAmount);
        }

        return yieldEarned;
    }
}
