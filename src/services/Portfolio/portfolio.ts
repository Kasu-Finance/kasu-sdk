import { Provider } from '@ethersproject/providers';
import { BigNumber, Signer } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import {
    ISystemVariablesAbi,
    ISystemVariablesAbi__factory,
} from '../../contracts';
import { SdkConfig } from '../../sdk-config';
import { DataService } from '../DataService/data-service';
import { PoolOverview } from '../DataService/types';
import { KSULocking } from '../Locking/locking';
import { UserPoolBalance } from '../UserLending/types';
import { UserLending } from '../UserLending/user-lending';

import { lastEpochQuery } from './queries';
import {
    LastEpochQueryResult,
    PortfolioLendingPool,
    PortfolioRewards,
    PortfolioSummary,
    PortfolioTranche,
} from './types';

export class Portfolio {
    private _lockingService: KSULocking;
    private _dataService: DataService;
    private _userLendingService: UserLending;
    private readonly _graph: GraphQLClient;

    private _systemVariablesAbi: ISystemVariablesAbi;
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

    async getPortfolioSummary(
        userAddress: string,
        poolOverviews: PoolOverview[],
    ): Promise<PortfolioSummary> {
        const userLockingData =
            await this._lockingService.getUserBonusData(userAddress);
        let totalInvestments = BigNumber.from(0);
        let totalYieldEarnedLastEpoch = 0;
        // const portfolioLendingPools: PortfolioLendingPool[] = [];
        // const usePoolBalancePromises: Promise<UserPoolBalance>[] = [];
        const currentEpoch =
            await this._systemVariablesAbi.currentEpochNumber();
        const latestEpoch = currentEpoch.sub(BigNumber.from(1));
        const lastEpochData: LastEpochQueryResult = await this._graph.request(
            lastEpochQuery,
            {
                userAddress: userAddress,
                epochId: latestEpoch.toString(),
                unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
            },
        );

        let totalYieldEarned = 0;

        const userPoolBalancePromises: Promise<UserPoolBalance>[] = [];
        for (const poolOverview of poolOverviews) {
            userPoolBalancePromises.push(
                this._userLendingService.getUserPoolBalance(
                    userAddress,
                    poolOverview.id,
                ),
            );
        }

        const userPoolBalances = await Promise.all(userPoolBalancePromises);

        userPoolBalances.forEach((userPoolBalance) => {
            totalInvestments = totalInvestments.add(userPoolBalance.balance);
            totalYieldEarned += userPoolBalance.yieldEarned;
        });

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (lastEpochData.user) {
            for (const lastEpochDatapoint of lastEpochData.user
                .lendingPoolUserDetails) {
                if (
                    lastEpochDatapoint.lendingPoolTrancheUserDetails.length == 0
                )
                    continue;
                const prevTrancheYield =
                    lastEpochDatapoint.lendingPoolTrancheUserDetails[0].tranche
                        .lendingPoolTrancheEpochInterest.length > 0
                        ? parseFloat(
                              lastEpochDatapoint
                                  .lendingPoolTrancheUserDetails[0].tranche
                                  .lendingPoolTrancheEpochInterest[0]
                                  .epochInterestAmount,
                          )
                        : 0;
                const prevUserShares =
                    lastEpochDatapoint.lendingPoolTrancheUserDetails[0]
                        .lendingPoolTrancheUserEpochSharesUpdates.length > 0
                        ? parseFloat(
                              lastEpochDatapoint
                                  .lendingPoolTrancheUserDetails[0]
                                  .lendingPoolTrancheUserEpochSharesUpdates[0]
                                  .shares,
                          )
                        : 0;
                const prevTrancheShares =
                    lastEpochDatapoint.lendingPoolTrancheUserDetails[0].tranche
                        .lendingPoolTrancheShareUpdates.length > 0
                        ? parseFloat(
                              lastEpochDatapoint
                                  .lendingPoolTrancheUserDetails[0].tranche
                                  .lendingPoolTrancheShareUpdates[0].shares,
                          )
                        : 0;
                totalYieldEarnedLastEpoch +=
                    prevTrancheShares != 0
                        ? (prevUserShares * prevTrancheYield) /
                          prevTrancheShares
                        : 0;
            }
        }
        return {
            current: {
                totalKsuLocked: userLockingData.totalLockedAmount,
                totalLendingPoolInvestments: totalInvestments.toString(),
                weightedAverageApy: '0',
            },
            lifetime: {
                yieldEarnings: totalYieldEarned.toString(),
                ksuBonusRewards: userLockingData.ksuBonusAndRewards,
                protocolFeesEarned: userLockingData.protocolFeesEarned,
            },
            lastEpoch: { yieldEarnings: totalYieldEarnedLastEpoch.toString() },
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
                investedAmount: Promise<{
                    balance: string;
                }>;
            })[];
        })[] = [];
        const usePoolBalancePromises: Promise<UserPoolBalance>[] = [];
        const latestEpoch = BigNumber.from(currentEpoch).sub(BigNumber.from(1));

        const lastEpochData: LastEpochQueryResult = await this._graph.request(
            lastEpochQuery,
            {
                userAddress: userAddress,
                epochId: latestEpoch.toString(),
                unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
            },
        );

        if (!lastEpochData.user) return [];

        for (const poolOverview of poolOverviews) {
            usePoolBalancePromises.push(
                this._userLendingService.getUserPoolBalance(
                    userAddress,
                    poolOverview.id,
                ),
            );
        }

        const userPoolBalances = await Promise.all(usePoolBalancePromises);

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
            const yieldEarned = userPoolBalance.yieldEarned;
            const tranches: (Omit<PortfolioTranche, 'investedAmount'> & {
                investedAmount: Promise<{
                    balance: string;
                }>;
            })[] = [];

            const lendingPoolUserDetails =
                lastEpochData.user.lendingPoolUserDetails.find(
                    ({ lendingPool }) => lendingPool.id === poolOverview.id,
                );

            if (!lendingPoolUserDetails) continue;

            const totalSupply =
                lendingPoolUserDetails.lendingPool.tranches.reduce(
                    (acc, tranche) => acc + parseFloat(tranche.shares),
                    0,
                );

            for (const tranche of poolOverview.tranches) {
                const lastEpochUserTrancheDetails =
                    lendingPoolUserDetails.lendingPoolTrancheUserDetails.find(
                        (lendingPool) => lendingPool.tranche.id === tranche.id,
                    );

                if (!lastEpochUserTrancheDetails) {
                    tranches.push({
                        ...tranche,
                        investedAmount: Promise.resolve({ balance: '0' }),
                        yieldEarnings: {
                            lastEpoch: '0',
                            lifetime: '0',
                        },
                        fixedLoans: [],
                    });
                    continue;
                }
                const prevTrancheYield =
                    lastEpochUserTrancheDetails.tranche
                        .lendingPoolTrancheEpochInterest.length > 0
                        ? parseFloat(
                              lastEpochUserTrancheDetails.tranche
                                  .lendingPoolTrancheEpochInterest[0]
                                  .epochInterestAmount,
                          )
                        : 0;
                const prevUserShares =
                    lastEpochUserTrancheDetails
                        .lendingPoolTrancheUserEpochSharesUpdates.length > 0
                        ? parseFloat(
                              lastEpochUserTrancheDetails
                                  .lendingPoolTrancheUserEpochSharesUpdates[0]
                                  .shares,
                          )
                        : 0;
                const prevTrancheShares =
                    lastEpochUserTrancheDetails.tranche
                        .lendingPoolTrancheShareUpdates.length > 0
                        ? parseFloat(
                              lastEpochUserTrancheDetails.tranche
                                  .lendingPoolTrancheShareUpdates[0].shares,
                          )
                        : 0;
                const yieldEarningsLastEpoch =
                    prevTrancheShares != 0
                        ? (prevUserShares * prevTrancheYield) /
                          prevTrancheShares
                        : 0;
                totalYieldEarnedLastEpoch += yieldEarningsLastEpoch;

                const userTrancheBalance =
                    this._userLendingService.getUserTrancheBalance(
                        userAddress,
                        tranche.id,
                    );

                tranches.push({
                    ...tranche,
                    investedAmount: userTrancheBalance,
                    yieldEarnings: {
                        lastEpoch: yieldEarningsLastEpoch.toString(),
                        lifetime: yieldEarned.toString(),
                    },
                    fixedLoans:
                        lastEpochUserTrancheDetails.userLendingPoolTrancheFixedTermDepositLocks.map(
                            (fixedTermDeposits) => {
                                const lockDuration =
                                    parseFloat(
                                        fixedTermDeposits
                                            .lendingPoolTrancheFixedTermConfig
                                            .epochLockDuration,
                                    ) * SECONDS_PER_EPOCH;

                                return {
                                    lockId: fixedTermDeposits.lockId,
                                    epochLockDuration:
                                        fixedTermDeposits
                                            .lendingPoolTrancheFixedTermConfig
                                            .epochLockDuration,
                                    epochLockEnd:
                                        fixedTermDeposits.epochLockEnd,
                                    epochLockStart:
                                        fixedTermDeposits.epochLockStart,
                                    amount: this._userLendingService
                                        .convertSharesToAssets(
                                            fixedTermDeposits.initialTrancheShares,
                                            parseFloat(
                                                lendingPoolUserDetails
                                                    .lendingPool.balance,
                                            ),
                                            totalSupply,
                                        )
                                        .toString(),
                                    endTime:
                                        parseInt(fixedTermDeposits.createdOn) +
                                        lockDuration,
                                    isWithdrawalRequested:
                                        fixedTermDeposits.isWithdrawalRequested,
                                    startTime: parseInt(
                                        fixedTermDeposits.createdOn,
                                    ),
                                };
                            },
                        ),
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
                    pool.tranches.map(async (tranche) => ({
                        ...tranche,
                        investedAmount: (await tranche.investedAmount).balance,
                    })),
                ),
            })),
        );

        return portfolioLendingPools.filter(
            (pool) =>
                !BigNumber.from(pool.totalInvestedAmount).isZero() ||
                !BigNumber.from(pool.totalYieldEarningsLifetime).isZero(),
        );
    }
}
