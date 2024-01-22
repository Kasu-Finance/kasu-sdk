import { Provider } from "@ethersproject/providers";
import { BigNumber, BigNumberish, ContractTransaction, Signer, errors, ethers } from "ethers";

import { IERC20MetadataAbi, IERC20MetadataAbi__factory, IKSULockingAbi, KSULockBonusAbi, KSULockBonusAbi__factory } from "./contracts";
import { IKSULockingAbi__factory} from "./contracts/factories/IKSULockingAbi__factory"
import { SdkConfig } from "./sdk-config";
import { LockPeriod, LockPeriodInterface, RSVDeadlineValue, UserLock } from "./types";
import { GraphQLClient, gql } from "graphql-request";

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

    
    async getLifetimeRewards(address:string): Promise<BigNumber> {

        
        const claimableRewards = await this.getClaimableRewards(address);
        // todo:
        // const getDepositInfo = gql`
        // query GetLockingPeriods()  {
        //     lockPeriods(orderBy: lockPeriod) {
        //     rKSUMultiplier
        //     lockPeriod
        //     ksuBonusMultiplier
        //     isActive
        //     id
        //     }
        // }
        // `;

        // this._contractAbi.getRewards + userLockDepositsInfo
        return claimableRewards;
    }

    async getlaunchBonusAmount(lockAmount: BigNumber,
         bonusMultiplier: number, 
         bonusTokensLeft: BigNumber){


        
        const bonusMultiplierBN = ethers.utils.parseUnits(bonusMultiplier.toFixed(2), 2);
        const projectedBonus = lockAmount.mul(bonusMultiplierBN).div(100);

        
        if(bonusTokensLeft.gt(projectedBonus)) {
            return projectedBonus;
        }
        else {
            return projectedBonus;
        }        
    }


    async ksuBonusAvailable(address:string) : Promise<BigNumber> {

        return await this._kasuToken.balanceOf(this._kasuBonusAddress)
        
        // balanceof KSULockBonus

        // math.Min(ksuBonusMultiplier  * locked amound,  balanceof KSULockBonus)
        // this._contractAbi.getRewards + userLockDepositsInfo
    }

    
    

    async getLockPeriods() : Promise<LockPeriod[]> {
        // const getLockingPeriods = gql`
        //     query GetLockingPeriods()  {
        //         lockPeriods(orderBy: lockPeriod) {
        //         rKSUMultiplier
        //         lockPeriod
        //         ksuBonusMultiplier
        //         isActive
        //         id
        //         }
        //     }
        //     `;

        // const data = await this._graph.request(getLockingPeriods);

        
        throw new Error("not implemented");
        
    }
}