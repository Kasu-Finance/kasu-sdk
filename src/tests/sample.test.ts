/**
 * Live-network spec. It talks to a real subgraph and a real RPC, so it is
 * OPT-IN: it runs only under `LIVE_TESTS=1` (`npm run test:live`) and is
 * skipped by `npm test` and `npm run test:unit`. A network problem must never
 * be able to fail a pull request that did not touch the network.
 *
 * Known state: the stack it points at (`kasu-wip-sepolia` on The Graph Studio,
 * with Base Sepolia addresses) is decommissioned, so `npm run test:live` fails
 * on a missing deployment. That is pre-existing and unrelated to the gate; the
 * spec needs retargeting at a live deployment before it means anything.
 */
import * as ethers from 'ethers';

import { KasuSdk } from '..';
import { SdkConfig } from '../sdk-config';

const live = process.env.LIVE_TESTS === '1';

(live ? describe : describe.skip)('live network — subgraph read', () => {
    it('reads a user APY bonus through the subgraph', async () => {
        const provider = new ethers.providers.JsonRpcProvider(
            'https://sepolia.base.org',
        );

        // Generated per run. This spec only reads, so the wallet never needs
        // funds or a key that outlives the process — and a public repository
        // must never carry one.
        const wallet = ethers.Wallet.createRandom().connect(provider);

        const config = new SdkConfig({
            subgraphUrl:
                'https://api.studio.thegraph.com/query/63245/kasu-wip-sepolia/version/latest',
            contracts: {
                IKSULocking: '0x529A81c11ab6176c5E88670d293BB771800066a2',
                IKSULockBonus: '0xBBfFd5F744156FFc526df12F5e09dC7b208Be740',
                // The allow below is for a public Base Sepolia contract
                // address, not a secret: the generic-api-key rule fires on a
                // "Token" key name sitting next to a long hex literal.
                KSUToken: '0xa0f698Feb9Bc2BeA6E85eb071D5E3F59dc5bC56b', // gitleaks:allow
                UserManager: '0xA788e9223fDd7c9Db91Ef133BbeB73515c174773',
                LendingPoolManager: '0xc074Aaf2565aae18db2c7498ee1387610a809F40',
                KasuAllowList: '0xaE94F9D187c9eA649ADd4966340831F7cc62B69c',
                SystemVariables: '0xB174a3240B23e595e90bC2736A5b8ec674Cba73A',
                UserLoyaltyRewards:
                    '0x259631CE76FD9F65296549Cd81232aa59D53Dd0c',
                KsuPrice: '0x2027192aCFB4810Ad734A212F19d7030F698aCE3',
                ClearingCoordinator:
                    '0x2027192aCFB4810Ad734A212F19d7030F698aCE3',
                KasuNFTs: '0x0000000000000000000000000000000000000000',
                ExternalTVL: '0x0000000000000000000000000000000000000000',
            },
            directusUrl: 'https://kasu-finance.directus.app',
            UNUSED_LENDING_POOL_IDS: [''],
        });
        const sdk = new KasuSdk(config, wallet);

        const bonus = await sdk.UserLending.getUserApyBonus(
            '0xef38c432682ab49095e00442aaa354e955ac03a5',
        );

        expect(bonus).toBeDefined();
    });
});
