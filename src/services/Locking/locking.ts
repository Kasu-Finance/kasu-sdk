import { Provider } from '@ethersproject/providers';
import { BigNumber, ContractTransaction, Signer, ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { GraphQLClient, gql } from 'graphql-request';

import {
    IERC20MetadataAbi,
    IERC20MetadataAbi__factory,
    IKSULockingAbi,
} from '../../contracts';
import { IKSULockingAbi__factory } from '../../contracts/factories/IKSULockingAbi__factory';
import { SdkConfig } from '../../sdk-config';
import {
    GQLClaimedFeesForAddress,
    GQLGetLockingPeriods,
    GQLUserLockDepositsInfo,
    GQLUserLocks,
    LockPeriod,
    LockPeriodInterface,
    RSVDeadlineValue,
    UserLock,
} from '../../types';

import {
    claimedFeesQuery,
    userLocksQuery,
    userStakedKsuQuery,
} from './locking.query';

export class KSULocking {
    private readonly _contractAbi: IKSULockingAbi;
    private readonly _kasuToken: IERC20MetadataAbi;
    private readonly _kasuBonusAddress: string;
    private readonly _graph: GraphQLClient;
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

        return result.userLocks
            .map((userLock) => ({
                lockedAmount: userLock.ksuAmount,
                rKSUAmount: userLock.rKSUAmount,
                startTime: Number(userLock.startTimestamp),
                endTime: Number(userLock.endTimestamp),
            }))
            .sort((a, b) => a.endTime - b.endTime);
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
        claimableRewards?: BigNumber,
    ): Promise<BigNumber> {
        const result: GQLClaimedFeesForAddress = await this._graph.request(
            claimedFeesQuery,
            {
                address: userAddress.toLowerCase(),
            },
        );

        let sumAlreadyClaimed = ethers.constants.Zero;

        const mappedToBigNumber = result.userLockDepositsInfos.map((m) =>
            BigNumber.from(m.feesClaimed),
        );
        mappedToBigNumber.forEach((element) => {
            sumAlreadyClaimed = sumAlreadyClaimed.add(element);
        });

        if (!claimableRewards) {
            claimableRewards = await this.getClaimableRewards(userAddress);
        }

        return claimableRewards.add(sumAlreadyClaimed);
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
        const result: GQLUserLockDepositsInfo = await this._graph.request(
            userStakedKsuQuery,
            {
                address: userAddress.toLowerCase(),
            },
        );

        return result.userLockDepositsInfo.ksuLockedAmount;
    }

    async getLockingRewards(
        userAddress: string,
    ): Promise<{ claimableRewards: string; lifeTimeRewards: string }> {
        const claimableRewards = await this.getClaimableRewards(userAddress);

        const lifeTimeRewards = await this.getLifetimeRewards(
            userAddress,
            claimableRewards,
        );

        return {
            claimableRewards: claimableRewards.toString(),
            lifeTimeRewards: lifeTimeRewards.toString(),
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

        const results: LockPeriod[] = data.lockPeriods.map((m) => {
            return {
                rKsuMultiplier: new Number(m.ksuBonusMultiplier),
                lockPeriod: BigNumber.from(m.lockPeriod),
                ksuBonusMultiplier: new Number(m.ksuBonusMultiplier),
                id: BigNumber.from(m.id),
            } as LockPeriod;
        });

        return results;
    }

    getProjectedApy(): string {
        return '10.00';
    }

    getProjectedUSDC(): string {
        return '20.00';
    }
}
