import { Provider } from "@ethersproject/providers";
import { BigNumber, BigNumberish, ContractTransaction, Signer, errors, ethers } from "ethers";
import { GraphQLClient, gql } from "graphql-request";

import { IERC20MetadataAbi, IERC20MetadataAbi__factory, IKSULockingAbi, KSULockBonusAbi, KSULockBonusAbi__factory } from "./contracts";
import { IKSULockingAbi__factory} from "./contracts/factories/IKSULockingAbi__factory"
import { SdkConfig } from "./sdk-config";
import { GQLClaimedFeesForAddress, GQLGetLockingPeriods, LockPeriod, LockPeriodInterface, RSVDeadlineValue, UserLock } from "./types";


export class KSULocking {
    private readonly _contractAbi : IKSULockingAbi;
    private readonly _kasuToken : IERC20MetadataAbi;
    private readonly _kasuBonusAddress: string;
    private readonly _graph: GraphQLClient;
    /**
     *
     */
    constructor(kasuConfig : SdkConfig, signerOrProvider: Signer | Provider) {
        this._contractAbi = IKSULockingAbi__factory.connect(kasuConfig.contracts.IKSULocking, signerOrProvider);
        this._kasuToken = IERC20MetadataAbi__factory.connect(kasuConfig.contracts.KSUToken, signerOrProvider);
        this._kasuBonusAddress = kasuConfig.contracts.IKSULockBonus;
        this._graph = new GraphQLClient(kasuConfig.subgraphUrl);
    }

    async lockKSUTokens(amount: BigNumber, lockPeriod: BigNumber) : Promise<ContractTransaction> {

        return this._contractAbi.lock(amount, lockPeriod);
    }

    async lockKSUWithPermit(amount: number, lockPeriod: number, permit: RSVDeadlineValue ) : Promise<ContractTransaction> {

        const amountBN = BigNumber.from(amount);
        const lockPeriodBN = BigNumber.from(lockPeriod);

        const ksuPermit = {
            value: BigNumber.from(permit.value),
            deadline: BigNumber.from(permit.deadline),
            v: BigNumber.from(permit.v),
            r: permit.r,
            s: permit.s,
        };
        
        return this._contractAbi.lockWithPermit(amountBN, lockPeriodBN, ksuPermit);
    }

    async unlockKSU(amount: BigNumber, userLockId: BigNumber) : Promise<ContractTransaction> {
        return this._contractAbi.unlock(amount,userLockId);
    }

    async claimFees() : Promise<ContractTransaction>{
        return await this._contractAbi.claimFees();
    }

    async lockDetails(lockPeriod: BigNumber) : Promise<LockPeriodInterface> {

        
        const result = await this._contractAbi.lockDetails(lockPeriod);
        return {
            rKsuMultiplier: result[0].toNumber(),
            ksuBonusMultiplier: result[1].toNumber(),
            isActive: result[2]
        }
    }

    async userTotalDeposits(address: string) : Promise<BigNumber> {
        return await this._contractAbi.userTotalDeposits(address)
    }

    async userLocks(address: string, userLockId: BigNumber) : Promise<UserLock> {
        const result = await this._contractAbi.userLock(address, userLockId)
    
        const ret : UserLock = {
            amount: result[0],
            rKSUAmount: result[1],
            rKSUMultiplier: result[2],
            startTime: result[3].toNumber(),
            lockPeriod: result[4]
        };

        return ret;
    }


    async getClaimableRewards(address:string) : Promise<BigNumber> {
        const result = await this._contractAbi.getRewards(address);
        return result;
    }

    
    async getKasuTokenPrice(): Promise<{ price: BigNumber, decimals: number}> {

        const d = 6;
        return Promise.resolve( {
            price: ethers.utils.parseUnits("1.5", d),
            decimals:d,
        });
    }
    async getLifetimeRewards(address:string): Promise<BigNumber> {
        const getClaimedFeesForAddress = gql`
            query getClaimedFeesForAddress($address: String!) {
                userLockDepositsInfos(where: {id: $address}) {
                    feesClaimed
                }
            }`;

        const result: GQLClaimedFeesForAddress = await this._graph.request(
            getClaimedFeesForAddress,
            {
                address: address.toLowerCase()
            },
        );
        
        let sumAlreadyClaimed = ethers.constants.Zero;
        const mappedToBigNumber = result.userLockDepositsInfos.map(m => BigNumber.from(m.feesClaimed));
        mappedToBigNumber.forEach(element => {
            sumAlreadyClaimed = sumAlreadyClaimed.add(element);
        });
    
        const claimableRewards = await this.getClaimableRewards(address);
   
        return claimableRewards.add(sumAlreadyClaimed);
    }

    getlaunchBonusAmount(lockAmount: BigNumber,
         bonusMultiplier: number, 
         bonusTokensLeft: BigNumber) : BigNumber {        
        const bonusMultiplierBN = ethers.utils.parseUnits(bonusMultiplier.toFixed(2), 2);
        const projectedBonus = lockAmount.mul(bonusMultiplierBN).div(100);

        
        if(bonusTokensLeft.gt(projectedBonus)) {
            return projectedBonus;
        }
        else {
            return projectedBonus;
        }        
    }

    async getTotalKsuStaked() : Promise<BigNumber> {
        return Promise.resolve(ethers.constants.Zero);
    }

    async ksuBonusAvailable() : Promise<BigNumber> {
        return await this._kasuToken.balanceOf(this._kasuBonusAddress)
    }

    async ksuTokenBalance(address: string) : Promise<BigNumber> {
        return await this._kasuToken.balanceOf(address.toLowerCase())
    }
    
    getNextEpochDate() : number {
        const epoch = new Date();
        epoch.setUTCDate(epoch.getDate() + (-1-epoch.getDay() + 7) % 7 + 1);
        epoch.setUTCHours(0,0,1,0);
        return epoch.getTime();
    }

    async getActiveLockPeriods() : Promise<LockPeriod[]> {
        const getLockingPeriods = gql`
            query {
                lockPeriods(orderBy: lockPeriod, where: {isActive: true}) {
                rKSUMultiplier
                lockPeriod
                ksuBonusMultiplier
                isActive
                id
                }
            }`;

        const data : GQLGetLockingPeriods = await this._graph.request(getLockingPeriods);

        const results : LockPeriod[] = data.lockPeriods.map(m =>  {
            return {
                rKsuMultiplier: new Number(m.ksuBonusMultiplier),
                lockPeriod: BigNumber.from(m.lockPeriod),
                ksuBonusMultiplier: new Number(m.ksuBonusMultiplier),
                id: BigNumber.from(m.id)
            } as LockPeriod
        });
        
        return results;
    }
}