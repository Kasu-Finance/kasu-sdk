import { IKSULockingAbi__factory} from "./contracts/factories/IKSULockingAbi__factory"

export class KSULocking {
    public LockKSUTokens() : Promise<void> {
        const factory = new IKSULockingAbi__factory();
        // const abi = IKSULockingAbi__factory.connect()

        // abi.addLockPeriod()
        return Promise.resolve();
    }
    public LockKSUWithPermit() : Promise<void> {

        return Promise.resolve();
    }
    public Unlock() : Promise<void> {
        
        return Promise.resolve();
    }
}