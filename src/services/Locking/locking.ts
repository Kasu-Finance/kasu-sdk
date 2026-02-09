import { Provider } from '@ethersproject/providers';
import { BigNumber, ContractTransaction, ethers, Signer } from 'ethers';
import { formatEther, formatUnits, parseUnits } from 'ethers/lib/utils';
import { GraphQLClient } from 'graphql-request';

import {
    IERC20MetadataAbi,
    IERC20MetadataAbi__factory,
    IKSULockingAbi,
    IKSULockingAbi__factory,
    IKsuPriceAbi,
    IKsuPriceAbi__factory,
    ISystemVariablesAbi,
    ISystemVariablesAbi__factory,
    IUserLoyaltyRewardsAbi,
    IUserLoyaltyRewardsAbi__factory,
    IUserManagerAbi,
    IUserManagerAbi__factory,
} from '../../contracts';
import { SdkConfig } from '../../sdk-config';
import {
    getAllTrancheConfigurationsQuery,
    getAllTranchesQuery,
} from '../DataService/queries';
import {
    TrancheConfigurationSubgraphResult,
    TrancheSubgraphResult,
} from '../DataService/subgraph-types';

import {
    claimedFeesQuery,
    getSystemVariablesQuery,
    getTotalUserLoyaltsRewardsQuery,
    lockingPeriodsQuery,
    lockingSummariesQuery,
    userEarnedrKsuQuery,
    userLocksQuery,
    userStakedKsuQuery,
    userTotalBonusAmountQuery,
} from './queries';
import {
    GQLClaimedFeesForAddress,
    GQLEarnedRKsuForAddress,
    GQLGetLockingPeriods,
    GQLStakedAmountForAddress,
    GQLTotalBonusAmountForAddress,
    GQLUserLocks,
    LockingSummarySubgraphResult,
    LockPeriod,
    LockPeriodInterface,
    RSVDeadlineValue,
    SystemVariables,
    totalUserLoyaltyRewards,
    UserBonusData,
    UserLock,
} from './types';

export class KSULocking {
    private readonly _contractAbi: IKSULockingAbi;
    private readonly _kasuToken: IERC20MetadataAbi | null;
    private readonly _kasuBonusAddress: string;
    private readonly _graph: GraphQLClient;
    private readonly _userManagerAbi: IUserManagerAbi;
    private readonly _systemVariablesAbi: ISystemVariablesAbi;
    private readonly _ksuPriceAbi: IKsuPriceAbi;
    private readonly _userLoyaltyRewardsAbi: IUserLoyaltyRewardsAbi;
    private readonly _isLiteDeployment: boolean;
    private readonly apyBonuses: number[] = [0, 0.001, 0.002];

    constructor(
        private _kasuConfig: SdkConfig,
        signerOrProvider: Signer | Provider,
    ) {
        this._isLiteDeployment = _kasuConfig.isLiteDeployment;

        this._contractAbi = IKSULockingAbi__factory.connect(
            _kasuConfig.contracts.IKSULocking,
            signerOrProvider,
        );

        // Only initialize KSU token contract if not a Lite deployment and address is provided
        if (!this._isLiteDeployment && _kasuConfig.contracts.KSUToken) {
            this._kasuToken = IERC20MetadataAbi__factory.connect(
                _kasuConfig.contracts.KSUToken,
                signerOrProvider,
            );
        } else {
            this._kasuToken = null;
        }

        this._userManagerAbi = IUserManagerAbi__factory.connect(
            _kasuConfig.contracts.UserManager,
            signerOrProvider,
        );
        this._systemVariablesAbi = ISystemVariablesAbi__factory.connect(
            _kasuConfig.contracts.SystemVariables,
            signerOrProvider,
        );
        this._ksuPriceAbi = IKsuPriceAbi__factory.connect(
            _kasuConfig.contracts.KsuPrice,
            signerOrProvider,
        );
        this._kasuBonusAddress = _kasuConfig.contracts.IKSULockBonus;
        this._graph = new GraphQLClient(_kasuConfig.subgraphUrl);
        this._userLoyaltyRewardsAbi = IUserLoyaltyRewardsAbi__factory.connect(
            _kasuConfig.contracts.UserLoyaltyRewards,
            signerOrProvider,
        );
    }

    /**
     * Check if this is a Lite deployment (no KSU token functionality)
     */
    get isLiteDeployment(): boolean {
        return this._isLiteDeployment;
    }

    async lockKSUTokens(
        amount: BigNumber,
        lockPeriod: BigNumber,
    ): Promise<ContractTransaction> {
        if (this._isLiteDeployment) {
            throw new Error('Locking is not available on Lite deployments');
        }
        return this._contractAbi.lock(amount, lockPeriod);
    }

    async lockKSUWithPermit(
        amount: number,
        lockPeriod: number,
        permit: RSVDeadlineValue,
    ): Promise<ContractTransaction> {
        if (this._isLiteDeployment) {
            throw new Error('Locking is not available on Lite deployments');
        }

        const amountBN = BigNumber.from(amount);
        const lockPeriodBN = BigNumber.from(lockPeriod);

        const ksuPermit = {
            value: BigNumber.from(permit.value),
            deadline: BigNumber.from(permit.deadline),
            v: BigNumber.from(permit.v),
            r: permit.r,
            s: permit.s,
        };

        return this._contractAbi.lockWithPermit(
            amountBN,
            lockPeriodBN,
            ksuPermit,
        );
    }

    async unlockKSU(
        amount: BigNumber,
        userLockId: BigNumber,
    ): Promise<ContractTransaction> {
        if (this._isLiteDeployment) {
            throw new Error('Locking is not available on Lite deployments');
        }
        return this._contractAbi.unlock(amount, userLockId);
    }

    async claimFees(): Promise<ContractTransaction> {
        if (this._isLiteDeployment) {
            throw new Error('Fee claiming is not available on Lite deployments');
        }
        return await this._contractAbi.claimFees();
    }

    async lockDetails(lockPeriod: BigNumber): Promise<LockPeriodInterface> {
        if (this._isLiteDeployment) {
            return {
                rKsuMultiplier: 0,
                ksuBonusMultiplier: 0,
                isActive: false,
            };
        }
        const result = await this._contractAbi.lockDetails(lockPeriod);
        return {
            rKsuMultiplier: result[0].toNumber(),
            ksuBonusMultiplier: result[1].toNumber(),
            isActive: result[2],
        };
    }

    async userTotalDeposits(userAddress: string): Promise<BigNumber> {
        if (this._isLiteDeployment) {
            return BigNumber.from(0);
        }
        return await this._contractAbi.userTotalDeposits(userAddress);
    }

    async calculateUserLockProjectedProtocolFeeRewards(
        epochId: string,
        KSULocked: number,
        lockPeriod: BigNumber,
    ): Promise<number> {
        if (this._isLiteDeployment || KSULocked === 0) {
            return 0;
        }

        const lockingSummarySubgraph: LockingSummarySubgraphResult =
            await this._graph.request(lockingSummariesQuery);
        const lockingSummary = lockingSummarySubgraph.lockingSummaries[0];
        const totalRKSU = lockingSummary.totalRKsuAmount;

        const lockDetails = await this.lockDetails(lockPeriod);

        const newUserRKSU =
            (KSULocked + KSULocked * lockDetails.ksuBonusMultiplier) *
            lockDetails.rKsuMultiplier;
        const totalRKSUAfterLock = totalRKSU + newUserRKSU;

        const systemVariables: SystemVariables = await this._graph.request(
            getSystemVariablesQuery,
        );
        const performanceFee =
            parseFloat(systemVariables.systemVariables.performanceFee) / 100;
        const ecosystemFee =
            parseFloat(systemVariables.systemVariables.ecosystemFeeRate) / 100;

        let projectedYearlyPlatformInterest = 0;
        const subgraphResults: TrancheSubgraphResult =
            await this._graph.request(getAllTranchesQuery, {
                unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
            });
        const subgraphConfigurationResults: TrancheConfigurationSubgraphResult =
            await this._graph.request(getAllTrancheConfigurationsQuery, {
                unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
                epochId,
            });

        for (const tranche of subgraphResults.lendingPoolTranches) {
            const trancheConfig =
                subgraphConfigurationResults.lendingPoolTrancheConfigurations.find(
                    (r) => r.id == tranche.id,
                );
            if (!trancheConfig) {
                console.warn(
                    "Couldn't find tranche configuration for id: ",
                    tranche.id,
                );
                continue;
            }

            const interestUpdates =
                trancheConfig.lendingPoolTrancheInterestRateUpdates;

            const interestRate = interestUpdates.length
                ? interestUpdates[0].epochInterestRate
                : trancheConfig.interestRate;

            projectedYearlyPlatformInterest +=
                parseFloat(tranche.balance) *
                this.calculateApy(parseFloat(interestRate));
        }

        const totalExpectedEcosystemFees =
            projectedYearlyPlatformInterest * performanceFee * ecosystemFee;
        return (
            (totalExpectedEcosystemFees * newUserRKSU) /
            parseFloat(totalRKSUAfterLock)
        );
    }

    calculateApy(epochInterestRate: number): number {
        const EPOCHS_IN_YEAR = 52.17857;
        return (1 + epochInterestRate) ^ (EPOCHS_IN_YEAR - 1);
    }

    async getUserLocks(userAddress: string): Promise<UserLock[]> {
        if (this._isLiteDeployment) {
            return [];
        }

        const result: GQLUserLocks = await this._graph.request(userLocksQuery, {
            userAddress: userAddress.toLowerCase(),
        });
        const resultPromises = result.userLocks.map(async (userLock) => {
            const [, id] = userLock.id.split('-');
            const rKSUtoUSDCRatio = await this.getRKSUvsUSDCRatio(
                userLock.rKSUAmount,
                userAddress,
            );
            const loyaltyStatus =
                this.getLoyaltyLevelAndApyBonusFromRatio(rKSUtoUSDCRatio);
            return {
                id: BigNumber.from(id),
                lockedAmount: userLock.ksuAmount,
                rKSUAmount: userLock.rKSUAmount,
                rKSUtoUSDCRatio: rKSUtoUSDCRatio,
                apyBonus: loyaltyStatus.apyBonus,
                loyaltyLevel: loyaltyStatus.loyaltyLevel,
                startTime: parseFloat(userLock.startTimestamp),
                endTime: parseFloat(userLock.endTimestamp),
                lockPeriod: userLock.lockPeriod,
            };
        });

        const results = await Promise.all(resultPromises);
        return results.sort((a, b) => a.endTime - b.endTime);
    }

    async getUserBonusData(userAddress: string): Promise<UserBonusData> {
        if (this._isLiteDeployment) {
            return {
                ksuBonusAndRewards: '0',
                ksuBonusAndRewardsLifetime: '0',
                protocolFeesEarned: '0',
                totalLockedAmount: '0',
            };
        }

        const DECIMALS = 18;

        // Normalized user address
        const normalizedAddress = userAddress.toLowerCase();

        // Fetch data concurrently
        const [
            userLocksData,
            resultLoyaltyRewards,
            protocolFeesEarned,
            userRewards,
        ] = await Promise.all([
            this._graph.request<GQLUserLocks>(userLocksQuery, {
                userAddress: normalizedAddress,
            }),
            this._graph.request<totalUserLoyaltyRewards>(
                getTotalUserLoyaltsRewardsQuery,
                { userAddress: normalizedAddress },
            ),
            this._contractAbi.rewards(userAddress),
            this._userLoyaltyRewardsAbi.userRewards(userAddress),
        ]);

        // Extract data and format with fallback
        const { userLocks } = userLocksData;

        const formattedKsuBonusAndRewards = ethers.utils.formatUnits(
            userRewards,
            DECIMALS,
        );
        const formattedProtocolFeesEarned = ethers.utils.formatUnits(
            protocolFeesEarned,
            DECIMALS,
        );

        const ksuBonusAndRewardsLifetime =
            resultLoyaltyRewards.user === null
                ? '0.0'
                : resultLoyaltyRewards.user.totalUserLoyaltyRewards;

        const totalLockedAmount =
            userLocks.length === 0
                ? '0.0'
                : userLocks[0].userLockDepositsInfo.ksuLockedAmount;

        // Construct response data
        return {
            ksuBonusAndRewards: formattedKsuBonusAndRewards,
            ksuBonusAndRewardsLifetime: ksuBonusAndRewardsLifetime,
            protocolFeesEarned: formattedProtocolFeesEarned,
            totalLockedAmount: totalLockedAmount,
        };
    }

    getLoyaltyLevelAndApyBonusFromRatio(rKSUtoUSDCRatio: number): {
        loyaltyLevel: number;
        apyBonus: number;
    } {
        // On Lite deployments, always return level 0 with no bonus
        if (this._isLiteDeployment) {
            return { loyaltyLevel: 0, apyBonus: 0 };
        }

        if (rKSUtoUSDCRatio < 0.01) {
            return { loyaltyLevel: 0, apyBonus: this.apyBonuses[0] };
        } else if (rKSUtoUSDCRatio < 0.05) {
            return { loyaltyLevel: 1, apyBonus: this.apyBonuses[1] };
        }
        return { loyaltyLevel: 2, apyBonus: this.apyBonuses[2] };
    }

    async getRKSUvsUSDCRatio(
        rKSUAmount: string,
        userAddress: string,
    ): Promise<number> {
        if (this._isLiteDeployment) {
            return 0;
        }

        const [depositedAmount, pendingAmount]: [BigNumber, BigNumber] =
            await this._userManagerAbi.userTotalPendingAndActiveDepositedAmountForCurrentEpoch(
                userAddress,
            );
        const ksuPrice: BigNumber =
            await this._systemVariablesAbi.ksuEpochTokenPrice();
        const rKSUAmountBignumber: BigNumber = ethers.utils.parseUnits(
            rKSUAmount,
            18,
        );

        const totalUserUsdcAmount =
            depositedAmount.toNumber() + pendingAmount.toNumber();

        const rKSUInUSDC = rKSUAmountBignumber
            .mul(ksuPrice)
            .div(ethers.utils.parseUnits('1', 18))
            .div(ethers.utils.parseUnits('1', 12));

        return rKSUInUSDC.toNumber() / totalUserUsdcAmount;
    }

    async getClaimableRewards(userAddress: string): Promise<BigNumber> {
        if (this._isLiteDeployment) {
            return BigNumber.from(0);
        }
        const result = await this._contractAbi.rewards(userAddress);
        return result;
    }

    async getKasuTokenPrice(): Promise<{ price: BigNumber; decimals: number }> {
        const decimals = 18;

        // Price can still be queried on Lite deployments (set to 0 or configured value)
        return Promise.resolve({
            price: await this._ksuPriceAbi.ksuTokenPrice(),
            decimals,
        });
    }

    async getKasuEpochTokenPrice(): Promise<{
        price: BigNumber;
        decimals: number;
    }> {
        const decimals = 18;

        return Promise.resolve({
            price: await this._systemVariablesAbi.ksuEpochTokenPrice(),
            decimals,
        });
    }

    async getLifetimeRewards(
        userAddress: string,
        rewardDecimals: number,
        claimableRewards?: BigNumber,
    ): Promise<BigNumber> {
        if (this._isLiteDeployment) {
            return BigNumber.from(0);
        }

        const result: GQLClaimedFeesForAddress = await this._graph.request(
            claimedFeesQuery,
            {
                userAddress: userAddress.toLowerCase(),
            },
        );

        const claimedRewards = result.userLockDepositsInfo?.feesClaimed ?? '0';

        if (!claimableRewards) {
            claimableRewards = await this.getClaimableRewards(userAddress);
        }

        return claimableRewards.add(parseUnits(claimedRewards, rewardDecimals));
    }

    getLaunchBonusAmount(
        lockAmount: BigNumber,
        bonusMultiplier: number,
        bonusTokensLeft: BigNumber,
    ): BigNumber {
        if (this._isLiteDeployment) {
            return BigNumber.from(0);
        }

        const bonusMultiplierBN = ethers.utils.parseUnits(
            bonusMultiplier.toFixed(2),
            2,
        );
        const projectedBonus = lockAmount.mul(bonusMultiplierBN).div(100);

        if (bonusTokensLeft.gt(projectedBonus)) {
            return projectedBonus;
        } else {
            return bonusTokensLeft;
        }
    }

    async getUserStakedKsu(userAddress: string): Promise<string> {
        if (this._isLiteDeployment) {
            return '0';
        }

        const result: GQLStakedAmountForAddress = await this._graph.request(
            userStakedKsuQuery,
            {
                userAddress: userAddress.toLowerCase(),
            },
        );
        if (result.userLockDepositsInfo == null) {
            return '0';
        }
        return result.userLockDepositsInfo.ksuLockedAmount;
    }

    async getUserEarnedrKsu(userAddress: string): Promise<string> {
        if (this._isLiteDeployment) {
            return '0';
        }

        const result: GQLEarnedRKsuForAddress = await this._graph.request(
            userEarnedrKsuQuery,
            {
                userAddress: userAddress.toLowerCase(),
            },
        );
        if (result.userLockDepositsInfo == null) {
            return '0';
        }

        return result.userLockDepositsInfo.rKSUAmount;
    }

    async getUserTotalBonusAmount(userAddress: string): Promise<string> {
        if (this._isLiteDeployment) {
            return '0';
        }

        const result: GQLTotalBonusAmountForAddress = await this._graph.request(
            userTotalBonusAmountQuery,
            {
                userAddress: userAddress.toLowerCase(),
            },
        );
        if (result.userLockDepositsInfo == null) {
            return '0';
        }

        return result.userLockDepositsInfo.totalKsuBonusAmount;
    }

    async getLockingRewards(
        userAddress: string,
    ): Promise<{ claimableRewards: string; lifeTimeRewards: string }> {
        if (this._isLiteDeployment) {
            return {
                claimableRewards: '0',
                lifeTimeRewards: '0',
            };
        }

        const rewardDecimals = 6;

        const claimableRewards = await this.getClaimableRewards(userAddress);

        const lifeTimeRewards = await this.getLifetimeRewards(
            userAddress,
            rewardDecimals,
            claimableRewards,
        );

        return {
            claimableRewards: formatUnits(claimableRewards, rewardDecimals),
            lifeTimeRewards: formatUnits(lifeTimeRewards, rewardDecimals),
        };
    }

    async getTotalKsuStaked(): Promise<string> {
        return Promise.resolve(ethers.constants.Zero.toString());
    }

    async getAvailableKsuBonus(): Promise<string> {
        if (this._isLiteDeployment || !this._kasuToken) {
            return '0';
        }

        const amount = await this._kasuToken.balanceOf(this._kasuBonusAddress);
        return formatEther(amount);
    }

    async getUserKsuBalance(userAddress: string): Promise<string> {
        if (this._isLiteDeployment || !this._kasuToken) {
            return '0';
        }

        const balance = await this._kasuToken.balanceOf(
            userAddress.toLowerCase(),
        );

        return formatEther(balance);
    }

    async getNextEpochDate(): Promise<EpochTimeStamp> {
        return (
            await this._systemVariablesAbi.nextEpochStartTimestamp()
        ).toNumber();
    }

    async getNextClearingPeriodDate(): Promise<EpochTimeStamp> {
        const nextEpochDate = await this.getNextEpochDate();

        const clearingPeriodLength =
            await this._systemVariablesAbi.clearingPeriodLength();

        const nextClearingPeriod = BigNumber.from(nextEpochDate)
            .sub(clearingPeriodLength)
            .toNumber();

        const nowUnix = Date.now() / 1000;

        if (nowUnix >= nextClearingPeriod) {
            const oneWeek = 604800; // in seconds

            return nextClearingPeriod + oneWeek;
        }

        return nextClearingPeriod;
    }

    async getActiveLockPeriods(): Promise<LockPeriod[]> {
        if (this._isLiteDeployment) {
            return [];
        }

        const data: GQLGetLockingPeriods =
            await this._graph.request(lockingPeriodsQuery);
        return data.lockPeriods;
    }

    getProjectedApy(): string {
        return '10.00';
    }

    getProjectedUSDC(): string {
        return '20.00';
    }
}
