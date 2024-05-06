import { Provider } from '@ethersproject/providers';
import { BigNumber, Signer } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import {
    ILendingPoolManagerAbi, ILendingPoolManagerAbi__factory,
    IUserLoyaltyRewardsAbi, IUserLoyaltyRewardsAbi__factory,
    IUserManagerAbi,
    IUserManagerAbi__factory,
} from '../../contracts';
import { SdkConfig } from '../../sdk-config';

import { LendingPortfolioData, PortfolioRewards, PortfolioSummary } from './types';


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

    getPortfolioRewards(userAddress: string): PortfolioRewards {
        // mock data
        return {
            bonusYieldEarnings: {
                lastEpoch: { ksuAmount: '0', usdcAmount: '0' },
                lifeTime: { ksuAmount: '0', usdcAmount: '0' }
            },
            ksuLaunchBonus: { lastEpoch: { usdcAmount: '0' }, lifeTime: { ksuAmount: '0', usdcAmount: '0' } },
            protocolFees: { lastEpoch: { usdcAmount: '0' }, lifeTime: { usdcAmount: '0' } },
        }
    }

    getPortfolioSummary(userAddress: string): PortfolioSummary {
        return {
            current: { totalKsuLocked: '0', totalLendingPoolInvestments: '0', weightedAverageApy: '0' },
            lifetime: { yieldEarnings: '0', ksuBonusRewards: '0', protocolFeesEarned: '0' }
        }
    }

    getPortfolioLendingData(userAddress: string): LendingPortfolioData {
        return {
            average: {
                averageWeightedApy: '0',
                investedAmount: '0',
                yieldEarningsLastEpoch: '0',
                yieldEarningsLastMonth: '0',
                yieldEarningsLastYear: '0',
                yieldEarningsLifetime: '0'
            },
            lendingPools: [
                {
                    id: '0',
                    name: 'name',
                    tranches: [
                        {
                            name: 'name',
                            id: '0',
                            apy: '0',
                            investedAmount: '0',
                            yieldEarnings: {
                                lastEpoch: '0',
                                lastMonth: '0',
                                lastYear: '0',
                                lifetime: '0'
                            }
                        }
                    ]
                }
            ],
            total: {
                investedAmount: '0',
                yieldEarningsLastEpoch: '0',
                yieldEarningsLastMonth: '0',
                yieldEarningsLastYear: '0',
                yieldEarningsLifetime: '0'
            },
        }
    }
}