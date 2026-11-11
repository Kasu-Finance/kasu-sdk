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
import { epochRateToApy, EPOCHS_IN_YEAR } from '../../domain/rates';
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
    LoyaltySchedule,
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

    /**
     * A per-epoch interest rate compounded into an APY.
     *
     * This used to read `(1 + epochInterestRate) ^ (EPOCHS_IN_YEAR - 1)`.
     * `^` is JavaScript's BITWISE XOR, not exponentiation: both operands were
     * coerced to int32, so for a realistic epoch rate of ~0.003 it computed
     * `1 ^ 51` and returned the constant 50 — a 5000% APY — for every tranche,
     * regardless of its rate. Its only caller,
     * `calculateUserLockProjectedProtocolFeeRewards`, multiplied that by each
     * tranche balance, so its projection was nonsense rather than merely
     * imprecise.
     *
     * Now the same compounding every other rate in the SDK uses.
     */
    calculateApy(epochInterestRate: number): number {
        return epochRateToApy(epochInterestRate);
    }

    async getUserLocks(userAddress: string): Promise<UserLock[]> {
        if (this._isLiteDeployment) {
            return [];
        }

        const [result, schedule] = await Promise.all([
            this._graph.request<GQLUserLocks>(userLocksQuery, {
                userAddress: userAddress.toLowerCase(),
            }),
            this.getLoyaltySchedule(),
        ]);
        const resultPromises = result.userLocks.map(async (userLock) => {
            const [, id] = userLock.id.split('-');
            const rKSUtoStableRatio = await this.getRKSUvsStableRatio(
                userLock.rKSUAmount,
                userAddress,
            );
            const loyaltyStatus = this.getLoyaltyLevelAndApyBonusFromRatio(
                rKSUtoStableRatio,
                schedule,
            );
            return {
                id: BigNumber.from(id),
                lockedAmount: userLock.ksuAmount,
                rKSUAmount: userLock.rKSUAmount,
                rKSUtoStableRatio: rKSUtoStableRatio,
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

    /**
     * The loyalty thresholds and each level's KSU bonus, read from chain:
     * `SystemVariables.loyaltyThresholds()` and
     * `UserLoyaltyRewards.loyaltyEpochRewardRates(level)` for every level.
     * Both are admin-settable, so nothing here is hard-coded. Lite has no
     * levels: `{ thresholdsBps: [], apyBonuses: [0] }`.
     *
     * For one lender's full status (level, requirements, one block), use
     * `kasu.loyalty.getStatus`.
     */
    async getLoyaltySchedule(): Promise<LoyaltySchedule> {
        if (this._isLiteDeployment) {
            return { thresholdsBps: [], apyBonuses: [0] };
        }
        const thresholds = await this._systemVariablesAbi.loyaltyThresholds();
        const rates = await Promise.all(
            Array.from({ length: thresholds.length + 1 }, (_, level) =>
                this._userLoyaltyRewardsAbi.loyaltyEpochRewardRates(level),
            ),
        );
        return {
            thresholdsBps: thresholds.map((t) => t.toNumber()),
            apyBonuses: rates.map(
                (rate) => parseFloat(formatUnits(rate, 18)) * EPOCHS_IN_YEAR,
            ),
        };
    }

    /**
     * The level a ratio reaches under `schedule` (from `getLoyaltySchedule`):
     * how many thresholds it meets, in order, stopping at the first miss —
     * `UserManager._userLoyaltyLevel`'s rule — and that level's annual KSU
     * bonus as a fraction (`0.001` = 0.1 %).
     *
     * @param rKSUtoStableRatio a 0..1 fraction (`getRKSUvsStableRatio`).
     * A float ratio can land either side of a threshold the contract decides
     * in integers; for a level to show a lender, use `kasu.loyalty.getStatus`,
     * which computes it exactly and checks it against the contract.
     */
    getLoyaltyLevelAndApyBonusFromRatio(
        rKSUtoStableRatio: number,
        schedule: LoyaltySchedule,
    ): {
        loyaltyLevel: number;
        apyBonus: number;
    } {
        // On Lite deployments, always return level 0 with no bonus
        if (this._isLiteDeployment) {
            return { loyaltyLevel: 0, apyBonus: 0 };
        }

        const ratioBps = rKSUtoStableRatio * 10_000;
        let loyaltyLevel = 0;
        for (const threshold of schedule.thresholdsBps) {
            if (ratioBps >= threshold) loyaltyLevel++;
            else break;
        }
        return {
            loyaltyLevel,
            apyBonus: schedule.apyBonuses[loyaltyLevel] ?? 0,
        };
    }

    async getRKSUvsStableRatio(
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
        // The price the contract's own level read uses: the epoch snapshot,
        // or the spot price while the snapshot is stale.
        const ksuPrice: BigNumber =
            await this._systemVariablesAbi.ksuEpochTokenPriceFresh();
        const rKSUAmountBignumber: BigNumber = ethers.utils.parseUnits(
            rKSUAmount,
            18,
        );

        const totalUserStableAmount =
            depositedAmount.toNumber() + pendingAmount.toNumber();

        // Convert rKSU value to stable asset units: rKSU * ksuPrice / 1e18 / 1e(18 - stableDecimals)
        const decimalDiff = 18 - this._kasuConfig.stableAssetDecimals;
        const rKSUInStable = rKSUAmountBignumber
            .mul(ksuPrice)
            .div(ethers.utils.parseUnits('1', 18))
            .div(ethers.utils.parseUnits('1', decimalDiff));

        return rKSUInStable.toNumber() / totalUserStableAmount;
    }

    /** @deprecated Use `getRKSUvsStableRatio` instead. */
    async getRKSUvsUSDCRatio(
        rKSUAmount: string,
        userAddress: string,
    ): Promise<number> {
        return this.getRKSUvsStableRatio(rKSUAmount, userAddress);
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

        const rewardDecimals = this._kasuConfig.stableAssetDecimals;

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

    /**
     * Unix SECONDS at which epoch 0 started:
     * `SystemVariables.epochStartTimestamp(0)`. The contract writes this once,
     * at initialisation, so it never changes for a deployment and may be cached
     * for the life of the app. Every epoch boundary follows from it —
     * `epochEndTimestamp(initial, epoch)` and `epochAccrual` in the domain
     * layer.
     *
     * Available on every deployment, Full and Lite. A failed read rejects; the
     * caller validates the value (a positive integer) before using it.
     */
    async getInitialEpochStartTimestamp(): Promise<number> {
        return (
            await this._systemVariablesAbi.epochStartTimestamp(0)
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

    getProjectedStableAmount(): string {
        return '20.00';
    }

    /** @deprecated Use `getProjectedStableAmount` instead. */
    getProjectedUSDC(): string {
        return this.getProjectedStableAmount();
    }
}
