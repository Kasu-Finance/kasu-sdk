import { Provider, Signer } from "ethers";
import { SdkConfig } from "./sdk-config";
import { KSULocking } from "./locking";
import { IKSULockingAbi__factory } from "./contracts/factories/IKSULockingAbi__factory";

export class KasuSdk {
    public Locking : KSULocking;
    constructor(config: SdkConfig, signerOrProvider: Provider | Signer) {


        const ksuLocking = IKSULockingAbi__factory.connect(config.contracts.IKSULocking, signerOrProvider);
        this.Locking = new KSULocking();
    }
 
}