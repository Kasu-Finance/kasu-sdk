import { Provider } from '@ethersproject/providers';
import { BigNumber, ethers, Signer } from 'ethers';

import { SdkConfig } from '../../sdk-config';
import { DataService } from '../DataService/data-service';
import { KSULocking } from '../Locking/locking';
import { UserLending } from '../UserLending/user-lending';

import {
    LendingPortfolioData,
    PortfolioLendingPool,
    PortfolioRewards,
    PortfolioSummary,
    PortfolioTranche,
} from './types';

export class Portfolio {
    private _lockingService: KSULocking;
    private _dataService: DataService;
    private _userLendingService: UserLending;

    readonly _signerOrProvider: Signer | Provider;

    constructor(
        private _kasuConfig: SdkConfig,
        signerOrProvider: Signer | Provider,
    ) {
        this._signerOrProvider = signerOrProvider;
        this._lockingService = new KSULocking(_kasuConfig, signerOrProvider);
        this._dataService = new DataService(_kasuConfig);
        this._userLendingService = new UserLending(_kasuConfig, signerOrProvider);
    }

    async getPortfolioRewards(userAddress: string): Promise<PortfolioRewards> {
        const userLockingData = await this._lockingService.getUserBonusData(userAddress);
        return {
            bonusYieldEarnings: {
                lastEpoch: { ksuAmount: '0', usdcAmount: '0' },
                lifeTime: { ksuAmount: userLockingData.ksuBonusAndRewards, usdcAmount: '0' }
            },
            ksuLaunchBonus: { lastEpoch: { usdcAmount: '0' }, lifeTime: { ksuAmount: '0', usdcAmount: '0' } },
            protocolFees: { lastEpoch: { usdcAmount: '0' }, lifeTime: { usdcAmount: userLockingData.protocolFeesEarned } },
        }
    }

    async getPortfolioSummary(userAddress: string): Promise<PortfolioSummary> {
        const userLockingData = await this._lockingService.getUserBonusData(userAddress);
        const poolOverviews = await this._dataService.getPoolOverview();
        let totalInvestments =  BigNumber.from(0);
        let totalYieldEarned = 0;
        for(const poolOverview of poolOverviews) {
            totalInvestments = totalInvestments.add((await this._userLendingService.getUserPoolBalance(userAddress, poolOverview.id)).balance);
            totalYieldEarned += (await this._userLendingService.getUserPoolBalance(userAddress, poolOverview.id)).yieldEarned;
        }
        return {
            current: { totalKsuLocked: userLockingData.totalLockedAmount, totalLendingPoolInvestments: totalInvestments.toString(), weightedAverageApy: '0' },
            lifetime: { yieldEarnings: totalYieldEarned.toString(), ksuBonusRewards: userLockingData.ksuBonusAndRewards, protocolFeesEarned: userLockingData.protocolFeesEarned },
            lastEpoch: { yieldEarnings: '0'}
        }
    }

    async getPortfolioLendingData(userAddress: string): Promise<LendingPortfolioData> {
        const poolOverviews = await this._dataService.getPoolOverview();
        let totalInvestments =  BigNumber.from(0);
        const portfolioLendingPools: PortfolioLendingPool[] = [];
        for(const poolOverview of poolOverviews) {
            const userPoolBalance = await this._userLendingService.getUserPoolBalance(userAddress, poolOverview.id);
            totalInvestments = userPoolBalance.balance.add(totalInvestments);
            const yieldEarned = userPoolBalance.yieldEarned;
            const tranches: PortfolioTranche[]  = [];
            for (const tranche of poolOverview.tranches) {
                const userTrancheBalance = await this._userLendingService.getUserTrancheBalance(userAddress, tranche.id);
                tranches.push({
                    id: tranche.id,
                    name: tranche.name,
                    apy: tranche.apy,
                    investedAmount: userTrancheBalance.balance.toString(),
                    yieldEarnings: {
                        lastEpoch: '0',
                        lifetime: yieldEarned.toString()
                    }
                })
            }
            portfolioLendingPools.push({
                id: poolOverview.id,
                totalYieldEarningsLastEpoch: '0',
                totalInvestedAmount: userPoolBalance.balance.toString(),
                totalYieldEarningsLifetime: userPoolBalance.yieldEarned.toString(),
                isActive: poolOverview.isActive,
                name: poolOverview.poolName,
                tranches: tranches
            })
        }
        return {
            lendingPools: portfolioLendingPools,
        }
    }
}