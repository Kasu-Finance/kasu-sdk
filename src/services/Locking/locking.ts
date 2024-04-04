import { Provider } from '@ethersproject/providers';
import { BigNumber, ContractTransaction, Signer, ethers } from 'ethers';
import { formatEther, formatUnits, parseUnits } from 'ethers/lib/utils';
import { GraphQLClient, gql } from 'graphql-request';

import {
    IERC20MetadataAbi,
    IERC20MetadataAbi__factory,
    IKSULockingAbi, ISystemVariablesAbi, ISystemVariablesAbi__factory, IUserManagerAbi, IUserManagerAbi__factory,
} from '../../contracts';
import { IKSULockingAbi__factory } from '../../contracts/factories/IKSULockingAbi__factory';
import { SdkConfig } from '../../sdk-config';

import {
    claimedFeesQuery,
    userEarnedrKsuQuery,
    userLocksQuery,
    userStakedKsuQuery,
    userTotalBonusAmountQuery,
} from './locking.query';
import {
    GQLClaimedFeesForAddress,
    GQLEarnedRKsuForAddress,
    GQLGetLockingPeriods,
    GQLStakedAmountForAddress,
    GQLTotalBonusAmountForAddress,
    GQLUserLocks,
    LockPeriod,
    LockPeriodInterface,
    RSVDeadlineValue,
    UserLock,
} from './types';

export class KSULocking {
    private readonly _contractAbi: IKSULockingAbi;
    private readonly _kasuToken: IERC20MetadataAbi;
    private readonly _kasuBonusAddress: string;
    private readonly _graph: GraphQLClient;
    private readonly _userManagerAbi: IUserManagerAbi;
    private readonly _systemVariablesAbi: ISystemVariablesAbi;
    private readonly apyBonuses = [ 0, 0.001, 0.002 ]
    /**
     *
     */
    constructor(kasuConfig: SdkConfig, signerOrProvider: Signer | Provider) {
        this._contractAbi = IKSULockingAbi__factory.connect(
            kasuConfig.contracts.IKSULocking,
            signerOrProvider,
        );
        this._kasuToken = IERC20MetadataAbi__factory.connect(
            kasuConfig.contracts.KSUToken,
            signerOrProvider,
        );
        this._userManagerAbi = IUserManagerAbi__factory.connect(
            kasuConfig.contracts.UserManager,
            signerOrProvider,
        )
        this._systemVariablesAbi = ISystemVariablesAbi__factory.connect(
            kasuConfig.contracts.SystemVariables,
            signerOrProvider,
        )
        this._kasuBonusAddress = kasuConfig.contracts.IKSULockBonus;
        this._graph = new GraphQLClient(kasuConfig.subgraphUrl);
    }

    async lockKSUTokens(
        amount: BigNumber,
        lockPeriod: BigNumber,
    ): Promise<ContractTransaction> {
        return this._contractAbi.lock(amount, lockPeriod);
    }

    async lockKSUWithPermit(
        amount: number,
        lockPeriod: number,
        permit: RSVDeadlineValue,
    ): Promise<ContractTransaction> {
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
        return this._contractAbi.unlock(amount, userLockId);
    }

    async claimFees(): Promise<ContractTransaction> {
        return await this._contractAbi.claimFees();
    }

    async lockDetails(lockPeriod: BigNumber): Promise<LockPeriodInterface> {
        const result = await this._contractAbi.lockDetails(lockPeriod);
        return {
            rKsuMultiplier: result[0].toNumber(),
            ksuBonusMultiplier: result[1].toNumber(),
            isActive: result[2],
        };
    }

    async userTotalDeposits(userAddress: string): Promise<BigNumber> {
        return await this._contractAbi.userTotalDeposits(userAddress);
    }

    async getUserLocks(userAddress: string): Promise<UserLock[]> {
        const result: GQLUserLocks = await this._graph.request(userLocksQuery, {
            userAddress: userAddress.toLowerCase(),
        });

        const resultPromises =  result.userLocks
            .map(async (userLock) => {
                const [, id] = userLock.id.split('-');

                const rKSUtoUSDCRatio = await this.getRKSUvsUSDCRatio(
                    userLock.rKSUAmount,
                    userAddress,
                )
                const loyaltyStatus = this.getLoyaltyLevelAndApyBonusFromRatio(rKSUtoUSDCRatio)
                return {
                    id: BigNumber.from(id),
                    lockedAmount: userLock.ksuAmount,
                    rKSUAmount: userLock.rKSUAmount,
                    rKSUtoUSDCRatio: rKSUtoUSDCRatio,
                    apyBonus: loyaltyStatus.apyBonus,
                    loyaltyLevel: loyaltyStatus.loyaltyLevel,
                    startTime: Number(userLock.startTimestamp),
                    endTime: Number(userLock.endTimestamp),
                    lockPeriod: userLock.lockPeriod,
                };
            })

        const results = await Promise.all(resultPromises);
        return results.sort((a, b) => a.endTime - b.endTime);
    }

    getLoyaltyLevelAndApyBonusFromRatio(rKSUtoUSDCRatio: number): {loyaltyLevel: number, apyBonus: number} {
        if (rKSUtoUSDCRatio < 0.01) {
           return {loyaltyLevel: 0, apyBonus: this.apyBonuses[0]};
        }
        else if (rKSUtoUSDCRatio < 0.05) {
            return {loyaltyLevel: 1, apyBonus: this.apyBonuses[1]};
        }
        return {loyaltyLevel: 2, apyBonus: this.apyBonuses[2]};
    }

    async getRKSUvsUSDCRatio(rKSUAmount: string, userAddress: string): Promise<number> {
        const usdcAmount: BigNumber = await this._userManagerAbi.getUserTotalPendingAndActiveDepositedAmountForCurrentEpoch(userAddress);
        const ksuPrice: BigNumber = await this._systemVariablesAbi.ksuEpochTokenPrice();
        const rKSUAmountBignumber: BigNumber = BigNumber.from(rKSUAmount);
        const rKSUInUSDC = rKSUAmountBignumber.mul(ksuPrice).div(Math.pow(10, 18)).div(Math.pow(10,12));
        return rKSUInUSDC.div(usdcAmount).toNumber();
    }

    async getClaimableRewards(userAddress: string): Promise<BigNumber> {
        const result = await this._contractAbi.getRewards(userAddress);
        return result;
    }

    async getKasuTokenPrice(): Promise<{ price: BigNumber; decimals: number }> {
        const decimals = 6;

        return Promise.resolve({
            price: ethers.utils.parseUnits('1.5', decimals),
            decimals,
        });
    }

    async getLifetimeRewards(
        userAddress: string,
        rewardDecimals: number,
        claimableRewards?: BigNumber,
    ): Promise<BigNumber> {
        const result: GQLClaimedFeesForAddress = await this._graph.request(
            claimedFeesQuery,
            {
                userAddress: userAddress.toLowerCase(),
            },
        );

        const claimedRewards = result?.userLockDepositsInfo?.feesClaimed ?? '0';

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
        const bonusMultiplierBN = ethers.utils.parseUnits(
            bonusMultiplier.toFixed(2),
            2,
        );
        const projectedBonus = lockAmount.mul(bonusMultiplierBN).div(100);

        if (bonusTokensLeft.gt(projectedBonus)) {
            return projectedBonus;
        } else {
            return projectedBonus;
        }
    }

    async getUserStakedKsu(userAddress: string): Promise<string> {
        const result: GQLStakedAmountForAddress = await this._graph.request(
            userStakedKsuQuery,
            {
                userAddress: userAddress.toLowerCase(),
            },
        );
        if(result.userLockDepositsInfo == null) {
            return "0";
        }
        return result.userLockDepositsInfo.ksuLockedAmount;
    }

    async getUserEarnedrKsu(userAddress: string): Promise<string> {
        const result: GQLEarnedRKsuForAddress = await this._graph.request(
            userEarnedrKsuQuery,
            {
                userAddress: userAddress.toLowerCase(),
            },
        );
        if(result.userLockDepositsInfo == null) {
            return "0";
        }

        return result.userLockDepositsInfo.rKSUAmount;
    }

    async getUserTotalBonusAmount(userAddress: string): Promise<string> {
        const result: GQLTotalBonusAmountForAddress = await this._graph.request(
            userTotalBonusAmountQuery,
            {
                userAddress: userAddress.toLowerCase(),
            },
        );
        if(result.userLockDepositsInfo == null) {
            return "0";
        }

        return result.userLockDepositsInfo.totalKsuBonusAmount;
    }

    async getLockingRewards(
        userAddress: string,
    ): Promise<{ claimableRewards: string; lifeTimeRewards: string }> {
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
        const amount = await this._kasuToken.balanceOf(this._kasuBonusAddress);

        return formatEther(amount);
    }

    async getUserKsuBalance(userAddress: string): Promise<string> {
        const balance = await this._kasuToken.balanceOf(
            userAddress.toLowerCase(),
        );

        return formatEther(balance);
    }

    getNextEpochDate(): EpochTimeStamp {
        const epoch = new Date();
        epoch.setUTCDate(epoch.getDate() + ((-1 - epoch.getDay() + 7) % 7) + 1);
        epoch.setUTCHours(0, 0, 1, 0);
        return epoch.getTime();
    }

    async getActiveLockPeriods(): Promise<LockPeriod[]> {
        const getLockingPeriods = gql`
            query {
                lockPeriods(orderBy: lockPeriod, where: { isActive: true }) {
                    rKSUMultiplier
                    lockPeriod
                    ksuBonusMultiplier
                    isActive
                    id
                }
            }
        `;

        const data: GQLGetLockingPeriods =
            await this._graph.request(getLockingPeriods);

        return data.lockPeriods;
    }

    getProjectedApy(): string {
        return '10.00';
    }

    getProjectedUSDC(): string {
        return '20.00';
    }
}
