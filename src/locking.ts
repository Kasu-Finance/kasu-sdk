import { Provider } from "@ethersproject/providers";
import { BigNumber, ContractTransaction, Signer } from "ethers";

import { IKSULockingAbi } from "./contracts";
import { IKSULockingAbi__factory} from "./contracts/factories/IKSULockingAbi__factory"
import { SdkConfig } from "./sdk-config";
import { LockPeriodInterface, RSVDeadlineValue } from "./types";

export class KSULocking {
    private _contractAbi : IKSULockingAbi;

    /**
     *
     */
    constructor(kasuConfig : SdkConfig, signerOrProvider: Signer | Provider) {
        this._contractAbi = IKSULockingAbi__factory.connect(kasuConfig.contracts.IKSULocking, signerOrProvider); 
        
        
    }

    async LockKSUTokens(amount: number, lockPeriod: number) : Promise<ContractTransaction> {
        const amountBN = BigNumber.from(amount);
        const lockPeriodBN = BigNumber.from(lockPeriod);

        return this._contractAbi.lock(amountBN, lockPeriodBN);
    }
    async LockKSUWithPermit(amount: number, lockPeriod: number, permit: RSVDeadlineValue ) : Promise<ContractTransaction> {

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
    async UnlockKSU(amount: number, userLockId: number) : Promise<ContractTransaction> {
        const amountBN = BigNumber.from(amount);
        const userLockIdBN = BigNumber.from(userLockId);

        return this._contractAbi.unlock(amountBN,userLockIdBN);
    }

    async LockDetails(lockPeriod: number) : Promise<LockPeriodInterface> {

        const lockPeriodBN = BigNumber.from(lockPeriod);

        const result = await this._contractAbi.lockDetails(lockPeriodBN);
        return {
            rKsuMultiplier: result[0].toNumber(),
            ksuBonusMultiplier: result[1].toNumber(),
            isActive: result[2]
        }
    }
}