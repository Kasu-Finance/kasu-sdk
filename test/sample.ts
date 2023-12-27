import { Wallet } from "ethers";
import { KasuSdk } from "../src";
import { SdkConfig } from "../src/sdk-config";

const wallet = new Wallet("key");

const sdk = new KasuSdk(new SdkConfig("www.a.com", {
    IKSULocking: "0x123"
}), wallet);


await sdk.Locking.Unlock();

