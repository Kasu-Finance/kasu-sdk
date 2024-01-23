import  * as ethers from "ethers";


import { KasuSdk } from "..";
import { SdkConfig } from "../sdk-config";


test('subgraphCall', async () => {
    
    const provider = new ethers.providers.JsonRpcProvider("https://goerli.base.org");

const wallet = new ethers.Wallet("dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd", provider);
const config = new SdkConfig(
    "https://api.studio.thegraph.com/query/63245/kasu-testnet/version/latest", 
{
    IKSULocking: "0xc8f16b0CCBe8009c11CcC7C8DC1779907a79c846",
    IKSULockBonus: "0x07baFe0dE4BD63508459c53d9Cde8099f4cB201F",
    KSUToken: "0x35281D21C6755cd3360031fAe526A0Dc9290E845"
});
    const sdk = new KasuSdk(config, wallet);


    const periods = await sdk.Locking.getActiveLockPeriods();
    console.table(periods);

    console.log(sdk.Locking.getNextEpochDate());

    
    console.log(await sdk.Locking.getLifetimeRewards("0x63546ff6d7586a3db4d3676f34106e7583d33c24"));
    
});

