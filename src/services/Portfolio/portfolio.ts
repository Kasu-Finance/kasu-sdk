import { Provider } from '@ethersproject/providers';
import { BigNumber, ethers, Signer } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import {
    ISystemVariablesAbi,
    ISystemVariablesAbi__factory,
} from '../../contracts';
import { SdkConfig } from '../../sdk-config';
import { DataService } from '../DataService/data-service';
import { KSULocking } from '../Locking/locking';
import { UserPoolBalance } from '../UserLending/types';
import { UserLending } from '../UserLending/user-lending';

import { lastEpochQuery } from './queries';
import {
    LastEpochQueryResult,
    LendingPortfolioData,
    PortfolioLendingPool,
    PortfolioRewards,
    PortfolioSummary,
    PortfolioTranche,
} from './types';
import { UNUSED_LENDING_POOL_IDS } from '../../constants';

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

    async getPortfolioSummary(userAddress: string): Promise<PortfolioSummary> {
        const userLockingData =
            await this._lockingService.getUserBonusData(userAddress);
        const poolOverviews = await this._dataService.getPoolOverview();
        let totalInvestments = BigNumber.from(0);
        let totalYieldEarnedLastEpoch = 0;
        const portfolioLendingPools: PortfolioLendingPool[] = [];
        const usePoolBalancePromises: Promise<UserPoolBalance>[] = [];
        const currentEpoch =
            await this._systemVariablesAbi.currentEpochNumber();
        const latestEpoch = currentEpoch.sub(BigNumber.from(1));
        const lastEpochData: LastEpochQueryResult = await this._graph.request(
            lastEpochQuery,
            {
                userAddress: userAddress,
                epochId: latestEpoch.toString(),
                unusedPools: UNUSED_LENDING_POOL_IDS,
            },
        );
        let totalYieldEarned = 0;
        for (const poolOverview of poolOverviews) {
            totalInvestments = totalInvestments.add(
                (
                    await this._userLendingService.getUserPoolBalance(
                        userAddress,
                        poolOverview.id,
                    )
                ).balance,
            );
            totalYieldEarned += (
                await this._userLendingService.getUserPoolBalance(
                    userAddress,
                    poolOverview.id,
                )
            ).yieldEarned;
        }
        for (const lastEpochDatapoint of lastEpochData.user
            .lendingPoolUserDetails) {
            if (lastEpochDatapoint.lendingPoolTrancheUserDetails.length == 0)
                continue;
            const prevTrancheYield =
                lastEpochDatapoint.lendingPoolTrancheUserDetails[0].tranche
                    .lendingPoolTrancheEpochInterest.length > 0
                    ? parseFloat(
                          lastEpochDatapoint.lendingPoolTrancheUserDetails[0]
                              .tranche.lendingPoolTrancheEpochInterest[0]
                              .epochInterestAmount,
                      )
                    : 0;
            const prevUserShares =
                lastEpochDatapoint.lendingPoolTrancheUserDetails[0]
                    .lendingPoolTrancheUserEpochSharesUpdates.length > 0
                    ? parseFloat(
                          lastEpochDatapoint.lendingPoolTrancheUserDetails[0]
                              .lendingPoolTrancheUserEpochSharesUpdates[0]
                              .shares,
                      )
                    : 0;
            const prevTrancheShares =
                lastEpochDatapoint.lendingPoolTrancheUserDetails[0].tranche
                    .lendingPoolTrancheShareUpdates.length > 0
                    ? parseFloat(
                          lastEpochDatapoint.lendingPoolTrancheUserDetails[0]
                              .tranche.lendingPoolTrancheShareUpdates[0].shares,
                      )
                    : 0;
            totalYieldEarnedLastEpoch +=
                prevTrancheShares != 0
                    ? (prevUserShares * prevTrancheYield) / prevTrancheShares
                    : 0;
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
    ): Promise<LendingPortfolioData> {
        const poolOverviews = await this._dataService.getPoolOverview();
        let totalInvestments = BigNumber.from(0);
        let totalYieldEarnedLastEpoch = 0;
        const portfolioLendingPools: PortfolioLendingPool[] = [];
        const usePoolBalancePromises: Promise<UserPoolBalance>[] = [];
        const currentEpoch =
            await this._systemVariablesAbi.currentEpochNumber();
        const latestEpoch = currentEpoch.sub(BigNumber.from(1));
        for (const poolOverview of poolOverviews) {
            usePoolBalancePromises.push(
                this._userLendingService.getUserPoolBalance(
                    userAddress,
                    poolOverview.id,
                ),
            );
        }
        const lastEpochData: LastEpochQueryResult = await this._graph.request(
            lastEpochQuery,
            {
                userAddress: userAddress,
                epochId: latestEpoch.toString(),
                unusedPools: UNUSED_LENDING_POOL_IDS,
            },
        );
        const userPoolBalances = await Promise.all(usePoolBalancePromises);
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
            const tranches: PortfolioTranche[] = [];
            for (const tranche of poolOverview.tranches) {
                const lastEpochDatapoint =
                    lastEpochData.user.lendingPoolUserDetails.find(
                        (l) =>
                            l.lendingPoolTrancheUserDetails[0].tranche.id ==
                            tranche.id,
                    );
                if (
                    !lastEpochDatapoint ||
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
                const yieldEarningsLastEpoch =
                    prevTrancheShares != 0
                        ? (prevUserShares * prevTrancheYield) /
                          prevTrancheShares
                        : 0;
                totalYieldEarnedLastEpoch += yieldEarningsLastEpoch;
                const userTrancheBalance =
                    await this._userLendingService.getUserTrancheBalance(
                        userAddress,
                        tranche.id,
                    );
                tranches.push({
                    id: tranche.id,
                    name: tranche.name,
                    apy: tranche.apy,
                    investedAmount: userTrancheBalance.balance.toString(),
                    yieldEarnings: {
                        lastEpoch: yieldEarningsLastEpoch.toString(),
                        lifetime: yieldEarned.toString(),
                    },
                });
            }
            portfolioLendingPools.push({
                id: poolOverview.id,
                totalYieldEarningsLastEpoch:
                    totalYieldEarnedLastEpoch.toString(),
                totalInvestedAmount: userPoolBalance.balance.toString(),
                totalYieldEarningsLifetime:
                    userPoolBalance.yieldEarned.toString(),
                isActive: poolOverview.isActive,
                name: poolOverview.poolName,
                tranches: tranches,
            });
        }
        return {
            lendingPools: portfolioLendingPools.filter(
                (pool) =>
                    !BigNumber.from(pool.totalInvestedAmount).isZero() ||
                    !BigNumber.from(pool.totalYieldEarningsLifetime).isZero(),
            ),
        };
    }
}
