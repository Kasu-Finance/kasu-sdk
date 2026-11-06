import { Provider } from '@ethersproject/providers';
import { BigNumber, Signer } from 'ethers';
import {
    formatEther,
    formatUnits,
    parseEther,
    parseUnits,
} from 'ethers/lib/utils';
import { GraphQLClient } from 'graphql-request';

import {
    IKasuNFTsAbi,
    IKasuNFTsAbi__factory,
    ISystemVariablesAbi,
    ISystemVariablesAbi__factory,
    IUserLoyaltyRewardsAbi__factory,
} from '../../contracts';
import {
    epochTrancheYield,
    YieldHistoryEntry,
} from '../../domain/yield-history';
import { SdkConfig } from '../../sdk-config';
import { isLiteDeployment } from '../../utils/deployment-mode';
import { DataService } from '../DataService/data-service';
import {
    getAllTrancheConfigurationsQuery,
    getAllTranchesQuery,
} from '../DataService/queries';
import {
    TrancheConfigurationSubgraphResult,
    TrancheSubgraphResult,
} from '../DataService/subgraph-types';
import { PoolOverview } from '../DataService/types';
import { KSULocking } from '../Locking/locking';
import {
    getSystemVariablesQuery,
    lockingSummariesQuery,
} from '../Locking/queries';
import {
    LockingSummarySubgraphResult,
    SystemVariables,
} from '../Locking/types';
import {
    PortfolioUserTrancheBalance,
    UserPoolBalance,
} from '../UserLending/types';
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
import {
    buildYieldHistory,
    clearingStarts,
    fetchYieldHistorySeries,
    isEmptyHistoryError,
    resolveYieldHistoryWindow,
    sharesAtInterest,
    trancheSharesAtInterest,
    validateYieldHistoryOptions,
    YIELD_HISTORY_PAGE_SIZE,
    YieldHistoryOptions,
    yieldHistoryPageQuery,
    YieldHistoryPageResult,
    yieldHistoryPositionsQuery,
    YieldHistoryPositionsResult,
} from './yield-history';

/**
 * How many epochs back the portfolio read pairs a tranche's newest interest
 * with the shares in force at its clearing (`lendingPortfolioQuery`): the last
 * settled epoch and the one before it, so a clearing that ran late is paired
 * too. An older newest interest is paired by the epoch tag.
 */
const RECENT_PAIRING_EPOCHS = 2;

/**
 * The ledger (subgraph) and the chain agree on a pool balance within a cent,
 * or a millionth of it — the rounding of two share-price conversions.
 */
const BALANCE_RECONCILE_TOLERANCE = 0.01;
const BALANCE_RECONCILE_RELATIVE = 1e-6;

export class Portfolio {
    private _lockingService: KSULocking;
    private _dataService: DataService;
    private _userLendingService: UserLending;
    private readonly _graph: GraphQLClient;

    private _systemVariablesAbi: ISystemVariablesAbi;
    private _userLoyaltyRewardsAbi: ReturnType<
        typeof IUserLoyaltyRewardsAbi__factory.connect
    >;
    private _kasuNftContract: IKasuNFTsAbi | null;
    readonly _signerOrProvider: Signer | Provider;
    private _isLiteDeployment: boolean;

    constructor(
        private _kasuConfig: SdkConfig,
        signerOrProvider: Signer | Provider,
    ) {
        this._signerOrProvider = signerOrProvider;
        this._lockingService = new KSULocking(_kasuConfig, signerOrProvider);
        this._dataService = new DataService(_kasuConfig, signerOrProvider);
        this._systemVariablesAbi = ISystemVariablesAbi__factory.connect(
            _kasuConfig.contracts.SystemVariables,
            signerOrProvider,
        );
        this._userLoyaltyRewardsAbi = IUserLoyaltyRewardsAbi__factory.connect(
            _kasuConfig.contracts.UserLoyaltyRewards,
            signerOrProvider,
        );
        this._userLendingService = new UserLending(
            _kasuConfig,
            signerOrProvider,
        );
        this._isLiteDeployment = isLiteDeployment(_kasuConfig);
        this._kasuNftContract = _kasuConfig.contracts.KasuNFTs
            ? IKasuNFTsAbi__factory.connect(
                  _kasuConfig.contracts.KasuNFTs,
                  signerOrProvider,
              )
            : null;
        this._graph = new GraphQLClient(_kasuConfig.subgraphUrl);
    }

    private computeYieldMetrics(
        portfolioLendingPools: PortfolioLendingPool[],
    ): {
        totalInvestments: number;
        totalYieldEarned: number;
        weightedApy: number;
        weeklyYieldEarnings: number;
    } {
        let totalInvestments = 0;
        let totalYieldEarned = 0;
        let weightedApy = 0;
        let weeklyYieldEarnings = 0;

        for (const pool of portfolioLendingPools) {
            for (const tranche of pool.tranches) {
                const investedAmount = parseFloat(tranche.investedAmount);

                totalInvestments += investedAmount;
                totalYieldEarned += parseFloat(tranche.yieldEarnings.lifetime);

                weightedApy += parseFloat(tranche.apy) * investedAmount;

                weeklyYieldEarnings +=
                    investedAmount * parseFloat(tranche.interestRate);

                for (const fixedDeposits of tranche.fixedLoans) {
                    // A matured lock's principal is already inside
                    // `investedAmount`: getPortfolioLendingData subtracts only
                    // the LOCKED loans from the tranche balance. Its lifetime
                    // yield is earned and stays counted (the tranche's own
                    // lifetime had every lock's yield taken out), but its
                    // amount must not be added to the investment, weekly or
                    // APY sums a second time.
                    if (!fixedDeposits.isLocked) {
                        totalYieldEarned += parseFloat(
                            fixedDeposits.yieldEarnings.lifetime,
                        );
                        continue;
                    }

                    const ftdConfig = tranche.fixedTermConfig.find(
                        (ftd) => ftd.configId === fixedDeposits.configId,
                    );

                    if (!ftdConfig) continue;

                    const ftdInvestedAmount = parseFloat(fixedDeposits.amount);

                    totalInvestments += ftdInvestedAmount;
                    totalYieldEarned += parseFloat(
                        fixedDeposits.yieldEarnings.lifetime,
                    );

                    weeklyYieldEarnings +=
                        ftdInvestedAmount *
                        parseFloat(ftdConfig.epochInterestRate);

                    weightedApy +=
                        parseFloat(ftdConfig.apy) * ftdInvestedAmount;
                }
            }
        }

        return {
            totalInvestments,
            totalYieldEarned,
            weightedApy,
            weeklyYieldEarnings,
        };
    }

    /**
     * Calculate aggregate yield metrics for a set of portfolio lending pools.
     * Accepts pre-fetched pool data and returns totals without performing any network calls.
     */
    public calculateYieldMetrics(
        portfolioLendingPools: PortfolioLendingPool[],
    ): {
        totalInvestments: number;
        totalYieldEarned: number;
        weightedApy: number;
        weeklyYieldEarnings: number;
    } {
        return this.computeYieldMetrics(portfolioLendingPools);
    }

    /**
     * Calculate the user's weekly protocol fee share (in stable asset units) given tranche
     * balances/configs, system variables and locking summary. All inputs are expected to be pre-fetched.
     */
    public calculateWeeklyProtocolFees(params: {
        trancheBalances: TrancheSubgraphResult;
        trancheConfigurations: TrancheConfigurationSubgraphResult;
        systemVariables: SystemVariables;
        lockingSummary: LockingSummarySubgraphResult;
        userRksuAmount: string;
    }): number {
        const {
            trancheBalances,
            trancheConfigurations,
            systemVariables,
            lockingSummary,
            userRksuAmount,
        } = params;

        const totalRKsuAmount = parseFloat(
            lockingSummary.lockingSummaries[0]?.totalRKsuAmount ?? '0',
        );
        const userRKsuAmount = parseFloat(userRksuAmount || '0');

        const performanceFee =
            parseFloat(systemVariables.systemVariables.performanceFee) / 100;
        const ecosystemFeeRate =
            parseFloat(systemVariables.systemVariables.ecosystemFeeRate) / 100;

        if (
            totalRKsuAmount <= 0 ||
            userRKsuAmount <= 0 ||
            performanceFee <= 0 ||
            ecosystemFeeRate <= 0
        ) {
            return 0;
        }

        let totalWeeklyEcosystemFees = 0;

        for (const tranche of trancheBalances.lendingPoolTranches) {
            const trancheConfig =
                trancheConfigurations.lendingPoolTrancheConfigurations.find(
                    (config) => config.id === tranche.id,
                );

            if (!trancheConfig) continue;

            const interestUpdates =
                trancheConfig.lendingPoolTrancheInterestRateUpdates;

            const interestRate = interestUpdates.length
                ? interestUpdates[0].epochInterestRate
                : trancheConfig.interestRate;

            totalWeeklyEcosystemFees +=
                parseFloat(tranche.balance) *
                parseFloat(interestRate) *
                performanceFee *
                ecosystemFeeRate;
        }

        return (totalWeeklyEcosystemFees * userRKsuAmount) / totalRKsuAmount;
    }

    /**
     * Calculate the user's weekly KASU bonus rewards (KASU) based on current deposits,
     * loyalty level, reward rate, and KSU epoch price. Inputs should be pre-fetched.
     */
    public async calculateWeeklyKsuBonusRewards(params: {
        userAddress: string;
        userRksuAmount: string;
        userDepositAmounts: [BigNumber, BigNumber];
        ksuEpochPrice: { price: BigNumber; decimals: number };
    }): Promise<number> {
        const {
            userAddress,
            userRksuAmount,
            userDepositAmounts,
            ksuEpochPrice,
        } = params;

        const totalUserDeposits = userDepositAmounts[0].add(
            userDepositAmounts[1],
        );

        if (totalUserDeposits.isZero()) return 0;

        const rKSUtoStableRatio =
            await this._lockingService.getRKSUvsStableRatio(
                userRksuAmount,
                userAddress,
            );
        const { loyaltyLevel } =
            this._lockingService.getLoyaltyLevelAndApyBonusFromRatio(
                rKSUtoStableRatio,
            );

        const loyaltyRewardRate =
            await this._userLoyaltyRewardsAbi.loyaltyEpochRewardRates(
                loyaltyLevel,
            );

        if (loyaltyRewardRate.isZero() || ksuEpochPrice.price.isZero()) {
            return 0;
        }

        const reward = totalUserDeposits
            .mul(loyaltyRewardRate)
            .mul(BigNumber.from(10).pow(12))
            .div(ksuEpochPrice.price);

        return parseFloat(formatEther(reward));
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
                    stableAmount: lockingRewards.claimableRewards,
                },
                lifeTime: { stableAmount: lockingRewards.lifeTimeRewards },
            },
            ksuLaunchBonus: { lifeTime: { ksuAmount: ksuLaunchBonus } },
        };
    }

    async getUserNfts(userAddress: string): Promise<number[]> {
        // NFTs are not available on Lite deployments
        if (this._isLiteDeployment || !this._kasuNftContract) {
            return [];
        }

        const usernfts = await this._kasuNftContract.tokensOfOwner(userAddress);

        return usernfts.map((nft) => nft.toNumber());
    }

    async getPortfolioSummary(
        userAddress: string,
        portfolioLendingPools: PortfolioLendingPool[],
        currentEpoch: string,
    ): Promise<PortfolioSummary> {
        const epochId = currentEpoch.toString();
        const [
            userLockingData,
            userRksuAmount,
            lockingSummary,
            systemVariables,
            trancheBalances,
            trancheConfigurations,
            userDepositAmounts,
            ksuEpochPrice,
        ] = await Promise.all([
            this._lockingService.getUserBonusData(userAddress),
            this._lockingService.getUserEarnedrKsu(userAddress),
            this._graph.request<LockingSummarySubgraphResult>(
                lockingSummariesQuery,
            ),
            this._graph.request<SystemVariables>(getSystemVariablesQuery),
            this._graph.request<TrancheSubgraphResult>(getAllTranchesQuery, {
                unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
            }),
            this._graph.request<TrancheConfigurationSubgraphResult>(
                getAllTrancheConfigurationsQuery,
                {
                    unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
                    epochId,
                },
            ),
            this._userLendingService.getUserTotalPendingAndActiveDepositedAmountForCurrentEpoch(
                userAddress,
            ),
            this._lockingService.getKasuEpochTokenPrice(),
        ]);
        const {
            totalInvestments,
            totalYieldEarned,
            weightedApy,
            weeklyYieldEarnings,
        } = this.computeYieldMetrics(portfolioLendingPools);

        const weeklyProtocolFeesEarned = this.calculateWeeklyProtocolFees({
            trancheBalances,
            trancheConfigurations,
            systemVariables,
            lockingSummary,
            userRksuAmount,
        });

        const weeklyKsuBonusRewards = await this.calculateWeeklyKsuBonusRewards(
            {
                userAddress,
                userRksuAmount,
                userDepositAmounts,
                ksuEpochPrice,
            },
        );

        return {
            current: {
                totalKsuLocked: userLockingData.totalLockedAmount,
                totalLendingPoolInvestments: totalInvestments.toString(),
                weightedAverageApy:
                    totalInvestments === 0
                        ? '0'
                        : (weightedApy / totalInvestments).toString(),
            },
            daily: {
                yieldEarnings: (weeklyYieldEarnings / 7).toString(),
            },
            weekly: {
                yieldEarnings: weeklyYieldEarnings.toString(),
                protocolFeesEarned: weeklyProtocolFeesEarned.toString(),
                ksuBonusRewards: weeklyKsuBonusRewards.toString(),
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
        provider?: Provider,
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

        const previousEpoch = BigNumber.from(currentEpoch).sub(
            BigNumber.from(1),
        );
        const recentEpoch = Math.max(
            0,
            previousEpoch.toNumber() - (RECENT_PAIRING_EPOCHS - 1),
        );

        const [lastEpochData, subgraphTrancheBalances, userPoolBalances] =
            await Promise.all([
                this._graph.request<LendingPortfolioQueryResult>(
                    lendingPortfolioQuery,
                    {
                        userAddress: userAddress.toLowerCase(),
                        epochId: parseFloat(currentEpoch),
                        lastEpochId: previousEpoch.toNumber(),
                        recentEpoch,
                        unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
                        first: YIELD_HISTORY_PAGE_SIZE,
                    },
                ),
                this._userLendingService.getPortfolioUserTrancheBalances(
                    userAddress,
                ),
                this._userLendingService.getUserPoolBalance(
                    userAddress,
                    poolOverviews.map(({ id }) => id),
                    provider,
                ),
            ]);

        if (!lastEpochData.user) return [];

        const portfolioUserTrancheBalances =
            await this.reconcileTrancheBalances(
                userAddress,
                poolOverviews,
                subgraphTrancheBalances,
                userPoolBalances,
                provider,
            );

        const recentStarts = clearingStarts(lastEpochData.lendingPoolClearings);
        const recentWithdrawals = new Map<
            string,
            LendingPortfolioQueryResult['recentWithdrawalsAccepted']
        >();
        for (const withdrawal of lastEpochData.recentWithdrawalsAccepted) {
            const list = recentWithdrawals.get(withdrawal.tranche.id) ?? [];
            list.push(withdrawal);
            recentWithdrawals.set(withdrawal.tranche.id, list);
        }

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

        let totalInvestments = BigNumber.from(0);

        for (const poolOverview of poolOverviews) {
            const userPoolBalance = userPoolBalances.find(
                ({ poolId }) => poolId === poolOverview.id,
            );
            if (!userPoolBalance) {
                continue;
            }
            totalInvestments = userPoolBalance.balance.add(totalInvestments);
            const tranches: (Omit<PortfolioTranche, 'investedAmount'> & {
                investedAmount: {
                    balance: string;
                    yieldEarned: number;
                };
            })[] = [];

            let poolYieldEarnedLastEpoch = 0;

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
                const lastEpoch = previousEpoch.toNumber();

                // The shares this tranche's newest interest (epoch E) was
                // spread over: those in force when clearing E applied it,
                // the selection `getYieldHistory` makes. With E inside the
                // recent window the candidates below are complete (every
                // snapshot tagged before it is older than the base one);
                // otherwise — a pool that stopped clearing — no start is
                // read, and the epoch tag pairs it, up to the last epoch.
                const newestInterest =
                    lastEpochUserTrancheDetails.tranche
                        .lendingPoolTrancheEpochInterest?.[0];
                const interestEpoch =
                    newestInterest?.epochId === undefined
                        ? undefined
                        : Number(newestInterest.epochId);
                const clearingStart =
                    interestEpoch !== undefined && interestEpoch >= recentEpoch
                        ? recentStarts
                              .get(poolOverview.id.toLowerCase())
                              ?.get(interestEpoch)
                        : undefined;
                const pairingEpoch =
                    clearingStart !== undefined && interestEpoch !== undefined
                        ? interestEpoch
                        : lastEpoch;

                const userSnapshot = sharesAtInterest(
                    [
                        ...(lastEpochUserTrancheDetails.lendingPoolTrancheUserEpochSharesUpdates ??
                            []),
                        ...(lastEpochUserTrancheDetails.recentUserShareUpdates ??
                            []),
                    ],
                    pairingEpoch,
                    clearingStart,
                );
                const userHasLastEpochShares = userSnapshot !== undefined;

                const fixedTermDeposits =
                    lastEpochUserTrancheDetails.userLendingPoolTrancheFixedTermDepositLocks;

                // The one per-epoch formula `getYieldHistory` runs too, with
                // the same share selection — so the last bar of a history
                // equals these figures.
                const lastEpochYield = epochTrancheYield({
                    epochInterest: parseFloat(
                        newestInterest?.epochInterestAmount ?? '0',
                    ),
                    userShares: parseFloat(userSnapshot?.shares ?? '0'),
                    trancheShares: trancheSharesAtInterest(
                        [
                            ...(lastEpochUserTrancheDetails.tranche
                                .lendingPoolTrancheShareUpdates ?? []),
                            ...(lastEpochUserTrancheDetails.tranche
                                .recentTrancheShareUpdates ?? []),
                        ],
                        recentWithdrawals.get(tranche.id) ?? [],
                        pairingEpoch,
                        clearingStart,
                    ),
                    trancheBalanceNow: parseFloat(
                        lastEpochUserTrancheDetails.tranche.balance,
                    ),
                    trancheSharesNow: parseFloat(
                        lastEpochUserTrancheDetails.tranche.shares,
                    ),
                    locks: fixedTermDeposits.map((fixedTermDeposit) => ({
                        active:
                            parseFloat(fixedTermDeposit.epochLockStart) <
                                lastEpoch &&
                            parseFloat(fixedTermDeposit.epochLockEnd) >=
                                lastEpoch &&
                            userHasLastEpochShares,
                        // No snapshot = the lock's opening shares, exactly
                        // as `getYieldHistory` reads it: a lock made after
                        // clearing E starts at E with its first update
                        // tagged E + 1. Never the CURRENT shares, which
                        // would carry a top-up from a clearing that ran
                        // after the last settled epoch.
                        sharesAtEpoch: parseFloat(
                            fixedTermDeposit.lockSharesAtLastEpoch?.[0]
                                ?.shares ??
                                fixedTermDeposit.initialTrancheShares,
                        ),
                        sharesBeforeEpoch: parseFloat(
                            fixedTermDeposit
                                .userLendingPoolTrancheFixedTermDepositLockShareUpdate?.[0]
                                ?.shares ??
                                fixedTermDeposit.initialTrancheShares,
                        ),
                    })),
                });

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

                const fixedLoans: PortfolioTranche['fixedLoans'] =
                    fixedTermDeposits.map((fixedTermDeposit, lockIndex) => {
                        const fixedLoanDepositDetails =
                            userRequest?.[
                                fixedTermDeposit
                                    .lendingPoolTrancheFixedTermConfig.configId
                            ] ?? [];

                        const lastEpochYieldEarned =
                            lastEpochYield.locks[lockIndex] ?? 0;

                        const lifetimeYieldEarned =
                            this.calculateFixedTermDepositEarnings(
                                fixedTermDeposit,
                                lastEpochUserTrancheDetails.tranche.balance,
                                lastEpochUserTrancheDetails.tranche.shares,
                            );

                        totalLifetimeFtdYield += lifetimeYieldEarned;

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
                                    .lendingPoolTrancheFixedTermConfig.configId,
                            epochLockDuration:
                                fixedTermDeposit
                                    .lendingPoolTrancheFixedTermConfig
                                    .epochLockDuration,
                            epochLockEnd: fixedTermDeposit.epochLockEnd,
                            epochInterestRate:
                                fixedTermDeposit
                                    .lendingPoolTrancheFixedTermConfig
                                    .epochInterestRate,
                            epochLockStart: fixedTermDeposit.epochLockStart,
                            amount: this._userLendingService
                                .convertSharesToAssets(
                                    fixedTermDeposit.trancheShares,
                                    lastEpochUserTrancheDetails.tranche.balance,
                                    lastEpochUserTrancheDetails.tranche.shares,
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
                                lastEpoch:
                                    this.precisionToString(
                                        lastEpochYieldEarned,
                                    ),
                                lifetime:
                                    this.precisionToString(lifetimeYieldEarned),
                            },
                            depositDetails: fixedLoanDepositDetails,
                        };
                    });

                // This POOL's last-epoch total: the tranche totals summed, the
                // locks counted once (inside `total`).
                poolYieldEarnedLastEpoch += lastEpochYield.total;

                tranches.push({
                    ...tranche,
                    investedAmount: userTrancheBalance,
                    yieldEarnings: {
                        lastEpoch: this.precisionToString(
                            lastEpochYield.variable,
                        ),
                        lifetime: this.precisionToString(totalLifetimeFtdYield), // passing in total FTD yield to be subtracted by total trache lifetime later down
                    },
                    fixedLoans,
                    depositDetails,
                });
            }

            portfolioLendingPoolsPromise.push({
                ...poolOverview,
                totalYieldEarningsLastEpoch: this.precisionToString(
                    poolYieldEarnedLastEpoch,
                ),
                totalInvestedAmount: userPoolBalance.balance.toString(),
                totalYieldEarningsLifetime:
                    userPoolBalance.yieldEarned.toString(),
                tranches,
            });
        }

        const portfolioLendingPools: PortfolioLendingPool[] =
            portfolioLendingPoolsPromise.map((pool) => ({
                ...pool,
                tranches: pool.tranches.map((tranche) => {
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

                    // Never negative: a variable balance below the locked
                    // amount is a ledger the chain does not back (see
                    // `reconcileTrancheBalances`), not money owed.
                    const variableBalance = parseEther(
                        trancheBalance.balance,
                    ).sub(lockedAmount);

                    return {
                        ...tranche,
                        investedAmount: formatEther(
                            variableBalance.isNegative()
                                ? BigNumber.from(0)
                                : variableBalance,
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
            }));

        return portfolioLendingPools.filter(
            (pool) =>
                !parseUnits(pool.totalInvestedAmount).isZero() ||
                !parseUnits(pool.totalYieldEarningsLifetime).isZero(),
        );
    }

    /**
     * The lender's settled yield per cycle (epoch), per pool and tranche —
     * what the chain credited at each close, NET of the performance fee
     * (`domain/yield-history.ts`), in the deployment's own stable token. Each
     * entry runs the same `epochTrancheYield` as `getPortfolioLendingData`'s
     * last-epoch figures: a tranche's `yieldEarnings.lastEpoch` plus its
     * locks' equals its entry for the epoch of the tranche's most recently
     * APPLIED interest (older than the last cycle for a pool that has not
     * cleared since; no entry, and a figure of 0, when the lender held
     * nothing at that epoch).
     *
     * Sum entries with `aggregateYieldHistory` (all strategies, or one with
     * `{ poolId }`). Only epochs in which the lender held shares appear — a
     * new lender gets `[]`. Pools in `UNUSED_LENDING_POOL_IDS` are left out,
     * as in `lendingPortfolioQuery`; Directus enablement is NOT applied.
     *
     * Cost: three parallel `SystemVariables` reads and the positions query in
     * one round, then one subgraph request per page of the longest series
     * (1000 rows a page) — normally two subgraph round trips in all, never one
     * per epoch.
     *
     * On a LITE deployment, a subgraph that lacks the entities (a validation
     * error naming them) yields `[]`; on a full deployment that error throws,
     * like every other failure (`isEmptyHistoryError`).
     *
     * @throws RangeError on a malformed `fromEpoch` / `count`, before any
     * network read.
     */
    async getYieldHistory(
        userAddress: string,
        options: YieldHistoryOptions = {},
    ): Promise<YieldHistoryEntry[]> {
        validateYieldHistoryOptions(options);

        try {
            const [currentEpoch, epochZeroStart, epochDuration, positions] =
                await Promise.all([
                    this._systemVariablesAbi.currentEpochNumber(),
                    this._systemVariablesAbi.epochStartTimestamp(0),
                    this._systemVariablesAbi.epochDuration(),
                    this._graph.request<YieldHistoryPositionsResult>(
                        yieldHistoryPositionsQuery,
                        {
                            userAddress: userAddress.toLowerCase(),
                            unusedPools:
                                this._kasuConfig.UNUSED_LENDING_POOL_IDS,
                            first: YIELD_HISTORY_PAGE_SIZE,
                        },
                    ),
                ]);

            const window = resolveYieldHistoryWindow(
                options,
                currentEpoch.toNumber(),
            );
            if (!window || !positions.user) return [];

            const userTranches: string[] = [];
            const tranches = new Set<string>();
            const locks: string[] = [];
            const pools: string[] = [];
            for (const pool of positions.user.lendingPoolUserDetails) {
                pools.push(pool.lendingPool.id);
                for (const position of pool.lendingPoolTrancheUserDetails) {
                    userTranches.push(position.id);
                    tranches.add(position.tranche.id);
                    for (const lock of position.userLendingPoolTrancheFixedTermDepositLocks) {
                        locks.push(lock.id);
                    }
                }
            }
            if (userTranches.length === 0) return [];

            const { rows } = await fetchYieldHistorySeries(
                (variables) =>
                    this._graph.request<YieldHistoryPageResult>(
                        yieldHistoryPageQuery,
                        variables,
                    ),
                { pools, tranches: [...tranches], userTranches, locks },
                window,
            );

            return buildYieldHistory({ positions, ...rows }, window, {
                epochZeroStart: epochZeroStart.toNumber(),
                epochDuration: epochDuration.toNumber(),
            });
        } catch (error) {
            if (isEmptyHistoryError(error, this._isLiteDeployment)) return [];
            throw error;
        }
    }

    /**
     * The subgraph's per-tranche balances, checked against the chain.
     *
     * The subgraph counts a lender's shares as a LEDGER — accepted deposits
     * minus accepted withdrawals, plus fixed-term top-ups — and does not
     * follow shares that move between wallets any other way (an
     * administrative move of a position from one wallet to another is the
     * case seen on chain). The receiving wallet then withdraws more than the
     * ledger credited it and goes negative; the sending wallet keeps shares
     * it no longer owns. The chain's `LendingPool.userBalance` (the sum of
     * each tranche's `userActiveAssets`) is what the wallet holds.
     *
     * So for each pool whose ledger balances do not add up to the chain's
     * pool balance — or where any is negative — the tranche balances are read
     * from the chain (`UserLending.getUserTrancheActiveAssets`), one call per
     * tranche, and each tranche's ledger `yieldEarned` moves by the same
     * difference, so tranche and pool figures agree with each other. A pool
     * that agrees (every ordinary lender) costs nothing extra.
     *
     * The ledger lifetime of such a wallet still cannot separate the moved
     * principal from interest: a receiving wallet's lifetime includes what it
     * received, a sending wallet's is short by what it sent.
     */
    private async reconcileTrancheBalances(
        userAddress: string,
        poolOverviews: PoolOverview[],
        subgraphBalances: PortfolioUserTrancheBalance,
        poolBalances: UserPoolBalance[],
        provider?: Provider,
    ): Promise<PortfolioUserTrancheBalance> {
        const decimals = this._kasuConfig.stableAssetDecimals;
        const reconciled: PortfolioUserTrancheBalance = new Map(
            subgraphBalances,
        );

        await Promise.all(
            poolBalances.map(async ({ poolId, balance }) => {
                const ledger = subgraphBalances.get(poolId) ?? [];
                const ledgerTotal = ledger.reduce(
                    (sum, tranche) => sum + parseFloat(tranche.userBalance),
                    0,
                );
                const chainTotal = parseFloat(formatUnits(balance, decimals));
                const agrees =
                    ledger.every(
                        (tranche) => parseFloat(tranche.userBalance) >= 0,
                    ) &&
                    Math.abs(ledgerTotal - chainTotal) <=
                        Math.max(
                            BALANCE_RECONCILE_TOLERANCE,
                            chainTotal * BALANCE_RECONCILE_RELATIVE,
                        );
                if (agrees) return;

                const overview = poolOverviews.find(
                    ({ id }) => id.toLowerCase() === poolId.toLowerCase(),
                );
                const trancheIds = [
                    ...new Set([
                        ...(overview?.tranches ?? []).map(({ id }) => id),
                        ...ledger.map(({ trancheId }) => trancheId),
                    ]),
                ];
                const onChain =
                    await this._userLendingService.getUserTrancheActiveAssets(
                        userAddress,
                        trancheIds,
                        provider,
                    );

                reconciled.set(
                    poolId,
                    trancheIds.map((trancheId, index) => {
                        const fromLedger = ledger.find(
                            (tranche) => tranche.trancheId === trancheId,
                        );
                        const userBalance = formatUnits(
                            onChain[index] ?? BigNumber.from(0),
                            decimals,
                        );
                        return {
                            trancheId,
                            userBalance,
                            yieldEarned:
                                (fromLedger?.yieldEarned ?? 0) +
                                parseFloat(userBalance) -
                                parseFloat(fromLedger?.userBalance ?? '0'),
                        };
                    }),
                );
            }),
        );

        return reconciled;
    }

    /**
     * A money figure as a plain decimal string. Below a millionth of a token
     * (the stable asset's own precision) is float noise, never money, so it
     * is `'0'` — not `'1e-7'`, which `parseUnits` rejects, nor `'-3e-12'`. A
     * small negative remainder (above −0.0001) is `'0'` as well.
     */
    precisionToString(val: number): string {
        if (Math.abs(val) < 1e-6) return '0';

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
