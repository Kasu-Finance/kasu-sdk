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
    EpochTrancheYield,
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
import { UserLending } from '../UserLending/user-lending';

import { lendingPortfolioQuery } from './queries';
import {
    LedgerMismatch,
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
    positionEpochYield,
    positionSeriesFrom,
    resolveYieldHistoryWindow,
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
 * six settled epochs, so a pool whose clearings run late or lag a few weeks
 * behind the others (Base has one) is paired too. An older newest interest —
 * a pool that stopped clearing — is paired by the epoch tag. The extra rows
 * are a few per lender and tranche.
 */
const RECENT_PAIRING_EPOCHS = 6;

/**
 * The ledger (subgraph) and the chain agree on a balance AT THE SAME BLOCK
 * within a cent, or a millionth of it — the rounding of two share-price
 * conversions.
 */
const BALANCE_RECONCILE_TOLERANCE = 0.01;
const BALANCE_RECONCILE_RELATIVE = 1e-6;

function ledgerAgrees(ledger: number, chain: number): boolean {
    return (
        Math.abs(ledger - chain) <=
        Math.max(
            BALANCE_RECONCILE_TOLERANCE,
            Math.abs(chain) * BALANCE_RECONCILE_RELATIVE,
        )
    );
}

/**
 * A list read with `first: $first` that comes back FULL may have been cut:
 * refuse it rather than price from a truncated read.
 */
function refuseTruncated(data: LendingPortfolioQueryResult): void {
    const full = (rows: readonly unknown[] | undefined): boolean =>
        (rows?.length ?? 0) >= YIELD_HISTORY_PAGE_SIZE;
    const lists: [string, boolean][] = [
        ['lendingPoolClearings', full(data.lendingPoolClearings)],
        ['recentWithdrawalsAccepted', full(data.recentWithdrawalsAccepted)],
    ];
    for (const pool of data.user?.lendingPoolUserDetails ?? []) {
        for (const position of pool.lendingPoolTrancheUserDetails) {
            lists.push(
                [
                    'recentUserShareUpdates',
                    full(position.recentUserShareUpdates),
                ],
                [
                    'recentTrancheShareUpdates',
                    full(position.tranche.recentTrancheShareUpdates),
                ],
                ...position.userLendingPoolTrancheFixedTermDepositLocks.map(
                    (lock): [string, boolean] => [
                        'lockSharesRecent',
                        full(lock.lockSharesRecent),
                    ],
                ),
            );
        }
    }
    const cut = lists.find(([, isFull]) => isFull);
    if (cut) {
        throw new Error(
            `getPortfolioLendingData: ${cut[0]} reached ${String(YIELD_HISTORY_PAGE_SIZE)} rows; refusing a possibly truncated read`,
        );
    }
}

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

        const unused = new Set(
            this._kasuConfig.UNUSED_LENDING_POOL_IDS.map((id) =>
                id.toLowerCase(),
            ),
        );
        const listedPools = poolOverviews.filter(
            ({ id }) => !unused.has(id.toLowerCase()),
        );

        const lastEpochData =
            await this._graph.request<LendingPortfolioQueryResult>(
                lendingPortfolioQuery,
                {
                    userAddress: userAddress.toLowerCase(),
                    epochId: parseFloat(currentEpoch),
                    lastEpochId: previousEpoch.toNumber(),
                    recentEpoch,
                    lockRecentEpoch: Math.max(0, recentEpoch - 1),
                    unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
                    poolIds: listedPools.map(({ id }) => id.toLowerCase()),
                    trancheIds: listedPools.flatMap(({ tranches }) =>
                        tranches.map(({ id }) => id.toLowerCase()),
                    ),
                    first: YIELD_HISTORY_PAGE_SIZE,
                },
            );

        if (!lastEpochData.user) return [];
        refuseTruncated(lastEpochData);

        // The pools the lender has a ledger in AND that are listed: the only
        // ones read on chain, and the only ones reported.
        const userPools = listedPools.flatMap((overview) => {
            const details = lastEpochData.user?.lendingPoolUserDetails.find(
                ({ lendingPool }) =>
                    lendingPool.id.toLowerCase() === overview.id.toLowerCase(),
            );
            return details ? [{ overview, details }] : [];
        });

        const recentStarts = clearingStarts(lastEpochData.lendingPoolClearings);
        const recentExits = new Map<
            string,
            LendingPortfolioQueryResult['recentWithdrawalsAccepted']
        >();
        for (const exit of lastEpochData.recentWithdrawalsAccepted) {
            const list = recentExits.get(exit.tranche.id) ?? [];
            list.push(exit);
            recentExits.set(exit.tranche.id, list);
        }

        const [chain, staleYields] = await Promise.all([
            this.readChainAt(lastEpochData._meta?.block.number, (blockTag) =>
                this._userLendingService.getUserPoolBalancesAt(
                    userAddress,
                    userPools.map(({ overview }) => overview.id),
                    provider,
                    blockTag,
                ),
            ),
            this.staleLastEpochYields(
                userPools.flatMap(({ overview, details }) =>
                    details.lendingPoolTrancheUserDetails.map((position) => ({
                        poolId: overview.id,
                        position,
                    })),
                ),
                recentEpoch,
            ),
        ]);

        const reconciled = await Promise.all(
            userPools.map(({ overview, details }, index) =>
                this.reconcilePool(
                    userAddress,
                    overview,
                    details,
                    chain.values[index] ?? BigNumber.from(0),
                    chain.blockTag,
                    provider,
                ),
            ),
        );

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

        for (const [
            poolIndex,
            { overview: poolOverview, details },
        ] of userPools.entries()) {
            const pool = reconciled[poolIndex];

            const tranches: (Omit<PortfolioTranche, 'investedAmount'> & {
                investedAmount: {
                    balance: string;
                    yieldEarned: number;
                };
            })[] = [];

            let poolYieldEarnedLastEpoch = 0;

            // A ledger crediting shares the wallet does not hold earns
            // nothing we can vouch for: its last-cycle figures are withheld.
            const withheld = pool.mismatch?.kind === 'ledger-exceeds-chain';

            for (const tranche of poolOverview.tranches) {
                const lastEpochUserTrancheDetails =
                    details.lendingPoolTrancheUserDetails.find(
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

                // The tranche's newest interest (epoch E), priced with the
                // shares in force when clearing E applied it — the one
                // selection `getYieldHistory` makes (`positionEpochYield`).
                // Inside the recent window the candidates below are complete;
                // an older E was priced from a history read of its own.
                const newestInterest =
                    lastEpochUserTrancheDetails.tranche
                        .lendingPoolTrancheEpochInterest?.[0];
                const interestEpoch =
                    newestInterest?.epochId === undefined
                        ? undefined
                        : Number(newestInterest.epochId);

                const fixedTermDeposits =
                    lastEpochUserTrancheDetails.userLendingPoolTrancheFixedTermDepositLocks;

                const noYield: EpochTrancheYield = {
                    total: 0,
                    variable: 0,
                    locks: fixedTermDeposits.map(() => 0),
                };
                let lastEpochYield = noYield;
                if (interestEpoch !== undefined && !withheld) {
                    lastEpochYield =
                        interestEpoch >= recentEpoch
                            ? positionEpochYield(
                                  {
                                      trancheBalanceNow: parseFloat(
                                          lastEpochUserTrancheDetails.tranche
                                              .balance,
                                      ),
                                      trancheSharesNow: parseFloat(
                                          lastEpochUserTrancheDetails.tranche
                                              .shares,
                                      ),
                                      userUpdates: [
                                          ...(lastEpochUserTrancheDetails.lendingPoolTrancheUserEpochSharesUpdates ??
                                              []),
                                          ...(lastEpochUserTrancheDetails.recentUserShareUpdates ??
                                              []),
                                      ],
                                      trancheUpdates: [
                                          ...(lastEpochUserTrancheDetails
                                              .tranche
                                              .lendingPoolTrancheShareUpdates ??
                                              []),
                                          ...(lastEpochUserTrancheDetails
                                              .tranche
                                              .recentTrancheShareUpdates ?? []),
                                      ],
                                      exits: recentExits.get(tranche.id) ?? [],
                                      locks: fixedTermDeposits.map((lock) => ({
                                          ...lock,
                                          updates: [
                                              ...(lock.lockSharesBase ?? []),
                                              ...(lock.lockSharesRecent ?? []),
                                          ],
                                      })),
                                  },
                                  interestEpoch,
                                  parseFloat(
                                      newestInterest?.epochInterestAmount ??
                                          '0',
                                  ),
                                  recentStarts
                                      .get(poolOverview.id.toLowerCase())
                                      ?.get(interestEpoch),
                              ).yield
                            : (staleYields.get(
                                  lastEpochUserTrancheDetails.id,
                              ) ?? noYield);
                }

                const ledger = pool.tranches.get(tranche.id);
                const userTrancheBalance = {
                    balance: ledger?.balance ?? '0',
                    yieldEarned: ledger?.yieldEarned ?? 0,
                };

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
                totalInvestedAmount: pool.chainBalance.toString(),
                totalYieldEarningsLifetime: pool.lifetime.toString(),
                ...(pool.mismatch ? { ledgerMismatch: pool.mismatch } : {}),
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
                    // amount is a ledger the chain does not back (the pool
                    // carries `ledgerMismatch`), not money owed — flagged.
                    const variableBalance = parseEther(
                        trancheBalance.balance,
                    ).sub(lockedAmount);
                    const floored = variableBalance.isNegative();

                    return {
                        ...tranche,
                        investedAmount: formatEther(
                            floored ? BigNumber.from(0) : variableBalance,
                        ),
                        ...(floored
                            ? { investedAmountFloored: true as const }
                            : {}),
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
     * per epoch — alongside one `LendingPool.userBalance` call per pool at
     * the subgraph's block. A pool whose ledger credits more than the wallet
     * holds at that block (shares moved away outside a withdrawal) is left
     * out; if the node cannot serve that block, nothing is.
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

            const [{ rows }, chain] = await Promise.all([
                fetchYieldHistorySeries(
                    (variables) =>
                        this._graph.request<YieldHistoryPageResult>(
                            yieldHistoryPageQuery,
                            variables,
                        ),
                    { pools, tranches: [...tranches], userTranches, locks },
                    window,
                ),
                this.readChainAt(positions._meta?.block.number, (blockTag) =>
                    this._userLendingService.getUserPoolBalancesAt(
                        userAddress,
                        pools,
                        undefined,
                        blockTag,
                    ),
                ),
            ]);

            // A pool whose ledger credits shares the wallet does not hold at
            // the same block (shares moved away outside a withdrawal) has no
            // history we can vouch for: it is left out. Unpinned, nothing is.
            const decimals = this._kasuConfig.stableAssetDecimals;
            const withheld = new Set<string>();
            if (chain.blockTag !== undefined) {
                positions.user.lendingPoolUserDetails.forEach((pool, index) => {
                    const ledger = pool.lendingPoolTrancheUserDetails.reduce(
                        (sum, position) =>
                            sum +
                            parseFloat(
                                this._userLendingService.convertSharesToAssets(
                                    position.shares ?? '0',
                                    position.tranche.balance,
                                    position.tranche.shares,
                                ),
                            ),
                        0,
                    );
                    const held = parseFloat(
                        formatUnits(
                            chain.values[index] ?? BigNumber.from(0),
                            decimals,
                        ),
                    );
                    if (ledger > held && !ledgerAgrees(ledger, held)) {
                        withheld.add(pool.lendingPool.id.toLowerCase());
                    }
                });
            }

            return buildYieldHistory({ positions, ...rows }, window, {
                epochZeroStart: epochZeroStart.toNumber(),
                epochDuration: epochDuration.toNumber(),
            }).filter((entry) => !withheld.has(entry.poolId.toLowerCase()));
        } catch (error) {
            if (isEmptyHistoryError(error, this._isLiteDeployment)) return [];
            throw error;
        }
    }

    /**
     * Read the chain at the subgraph's block, so the chain and the ledger
     * describe the same state: after every clearing the subgraph runs a few
     * blocks behind, and a `latest` read would then disagree with an
     * honest ledger (interest moved every balance, deposits were accepted)
     * and book that difference as a ledger fault. If the node cannot serve
     * that block (pruned, or behind the subgraph), it falls back to `latest`
     * and says so (`blockTag: undefined`): unpinned figures are then never
     * compared with the ledger.
     */
    private async readChainAt<T>(
        block: number | undefined,
        read: (blockTag: number | undefined) => Promise<T>,
    ): Promise<{ values: T; blockTag: number | undefined }> {
        if (block !== undefined) {
            try {
                return { values: await read(block), blockTag: block };
            } catch {
                // Fall through to `latest`, unpinned.
            }
        }
        return { values: await read(undefined), blockTag: undefined };
    }

    /**
     * One pool's balances: the ledger's (the subgraph counts a lender's
     * shares as accepted deposits − accepted withdrawals ± top-ups) checked
     * against the chain's `LendingPool.userBalance` at the SAME block.
     *
     * The ledger does not follow shares that move between wallets any other
     * way (an administrative move of a position is the case seen on chain):
     * the receiving wallet goes negative as it withdraws, the sending one
     * keeps shares it no longer holds. Where the two disagree at that block —
     * or any ledger balance is negative — the tranche balances are read from
     * the chain at that block (`userActiveAssets`, one call per tranche), the
     * tranche's ledger `yieldEarned` moves by the same difference, and the
     * pool carries `ledgerMismatch`. Unpinned (the node could not serve the
     * block), only a negative ledger balance is corrected. A pool that agrees
     * — every ordinary lender — costs nothing extra.
     *
     * Lifetime figures stay ledger figures: they cannot tell moved principal
     * from interest.
     */
    private async reconcilePool(
        userAddress: string,
        overview: PoolOverview,
        details: NonNullable<
            LendingPortfolioQueryResult['user']
        >['lendingPoolUserDetails'][number],
        chainBalance: BigNumber,
        blockTag: number | undefined,
        provider?: Provider,
    ): Promise<{
        chainBalance: BigNumber;
        lifetime: number;
        tranches: Map<string, { balance: string; yieldEarned: number }>;
        mismatch?: LedgerMismatch;
    }> {
        const decimals = this._kasuConfig.stableAssetDecimals;
        const chainTotal = parseFloat(formatUnits(chainBalance, decimals));
        const lifetime =
            chainTotal -
            parseFloat(details.totalAcceptedDeposits) +
            parseFloat(details.totalAcceptedWithdrawnAmount);

        const tranches = new Map<
            string,
            { balance: string; yieldEarned: number }
        >();
        for (const position of details.lendingPoolTrancheUserDetails) {
            const balance = this._userLendingService.convertSharesToAssets(
                position.shares,
                position.tranche.balance,
                position.tranche.shares,
            );
            tranches.set(position.tranche.id, {
                balance,
                yieldEarned:
                    parseFloat(balance) -
                    parseFloat(position.totalAcceptedDeposits) +
                    parseFloat(position.totalAcceptedWithdrawnAmount),
            });
        }

        const ledgerTotal = [...tranches.values()].reduce(
            (sum, { balance }) => sum + parseFloat(balance),
            0,
        );
        const negative = [...tranches.values()].some(
            ({ balance }) => parseFloat(balance) < 0,
        );
        const disagrees =
            blockTag !== undefined && !ledgerAgrees(ledgerTotal, chainTotal);
        if (!negative && !disagrees) {
            return { chainBalance, lifetime, tranches };
        }

        const trancheIds = [
            ...new Set([
                ...overview.tranches.map(({ id }) => id),
                ...tranches.keys(),
            ]),
        ];
        const onChain =
            await this._userLendingService.getUserTrancheActiveAssets(
                userAddress,
                trancheIds,
                provider,
                blockTag,
            );

        let phantom = false;
        const reconciled = new Map<
            string,
            { balance: string; yieldEarned: number }
        >();
        for (const [index, trancheId] of trancheIds.entries()) {
            const fromLedger = tranches.get(trancheId);
            const ledgerBalance = parseFloat(fromLedger?.balance ?? '0');
            const balance = formatUnits(
                onChain[index] ?? BigNumber.from(0),
                decimals,
            );
            if (
                blockTag !== undefined &&
                ledgerBalance > parseFloat(balance) &&
                !ledgerAgrees(ledgerBalance, parseFloat(balance))
            ) {
                phantom = true;
            }
            reconciled.set(trancheId, {
                balance,
                yieldEarned:
                    (fromLedger?.yieldEarned ?? 0) +
                    parseFloat(balance) -
                    ledgerBalance,
            });
        }

        return {
            chainBalance,
            lifetime,
            tranches: reconciled,
            mismatch: {
                kind: phantom ? 'ledger-exceeds-chain' : 'chain-exceeds-ledger',
                ledgerBalance: String(ledgerTotal),
                chainBalance: String(chainTotal),
            },
        };
    }

    /**
     * The last-epoch figures of positions whose newest interest is OLDER than
     * the recent window (a pool that stopped clearing): priced from a history
     * read of just those positions over just those epochs, through the same
     * `positionEpochYield`. Costs nothing when there is none.
     */
    private async staleLastEpochYields(
        positions: {
            poolId: string;
            position: NonNullable<
                LendingPortfolioQueryResult['user']
            >['lendingPoolUserDetails'][number]['lendingPoolTrancheUserDetails'][number];
        }[],
        recentEpoch: number,
    ): Promise<Map<string, EpochTrancheYield>> {
        const stale = positions.flatMap(({ poolId, position }) => {
            const interest =
                position.tranche.lendingPoolTrancheEpochInterest?.[0];
            if (interest?.epochId === undefined) return [];
            const epoch = Number(interest.epochId);
            return epoch < recentEpoch
                ? [{ poolId, position, epoch, interest }]
                : [];
        });
        const yields = new Map<string, EpochTrancheYield>();
        if (stale.length === 0) return yields;

        const lockId = (
            poolId: string,
            lock: { id?: string; lockId: string },
        ): string => lock.id ?? `${poolId.toLowerCase()}-${lock.lockId}`;

        const { rows } = await fetchYieldHistorySeries(
            (variables) =>
                this._graph.request<YieldHistoryPageResult>(
                    yieldHistoryPageQuery,
                    variables,
                ),
            {
                pools: [...new Set(stale.map(({ poolId }) => poolId))].map(
                    (id) => id.toLowerCase(),
                ),
                tranches: [
                    ...new Set(
                        stale.map(({ position }) => position.tranche.id),
                    ),
                ],
                userTranches: stale.map(({ position }) => position.id),
                locks: stale.flatMap(({ poolId, position }) =>
                    position.userLendingPoolTrancheFixedTermDepositLocks.map(
                        (lock) => lockId(poolId, lock),
                    ),
                ),
            },
            {
                fromEpoch: Math.min(...stale.map(({ epoch }) => epoch)),
                toEpoch: Math.max(...stale.map(({ epoch }) => epoch)),
            },
        );
        const starts = clearingStarts(rows.clearings);

        for (const { poolId, position, epoch, interest } of stale) {
            const series = positionSeriesFrom(rows, {
                ...position,
                userLendingPoolTrancheFixedTermDepositLocks:
                    position.userLendingPoolTrancheFixedTermDepositLocks.map(
                        (lock) => ({ ...lock, id: lockId(poolId, lock) }),
                    ),
            });
            yields.set(
                position.id,
                positionEpochYield(
                    series,
                    epoch,
                    parseFloat(interest.epochInterestAmount),
                    starts.get(poolId.toLowerCase())?.get(epoch),
                ).yield,
            );
        }
        return yields;
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
