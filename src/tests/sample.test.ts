import  * as ethers from "ethers";


import { KasuSdk } from "..";
import { SdkConfig } from "../sdk-config";


test('subgraphCall', async () => {

    const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");

    const wallet = new ethers.Wallet("dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd", provider);
    const config = new SdkConfig(
        "https://api.studio.thegraph.com/query/63245/kasu-wip-sepolia/version/latest",
        {
            IKSULocking: "0x529A81c11ab6176c5E88670d293BB771800066a2",
            IKSULockBonus: "0xBBfFd5F744156FFc526df12F5e09dC7b208Be740",
            KSUToken: "0xa0f698Feb9Bc2BeA6E85eb071D5E3F59dc5bC56b",
            UserManager: "0xA788e9223fDd7c9Db91Ef133BbeB73515c174773",
            LendingPoolManager: "0xc074Aaf2565aae18db2c7498ee1387610a809F40",
            KasuAllowList: "0xaE94F9D187c9eA649ADd4966340831F7cc62B69c",
            SystemVariables: "0xB174a3240B23e595e90bC2736A5b8ec674Cba73A",
            UserLoyaltyRewards: "0x259631CE76FD9F65296549Cd81232aa59D53Dd0c",
            KsuPrice: "0x2027192aCFB4810Ad734A212F19d7030F698aCE3",
        },
        "https://kasu-finance.directus.app"
    );
    const sdk = new KasuSdk(config, wallet);

    console.log(await sdk.UserLending.getUserApyBonus("0xef38c432682ab49095e00442aaa354e955ac03a5"));

});
