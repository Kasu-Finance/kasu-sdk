/**
 * Live-network spec for `kasu.loyalty.getStatus` on Base: read-only, OPT-IN
 * (`npm run test:live`, `LIVE_TESTS=1`), so a network problem can never fail a
 * pull request.
 *
 * It names no wallet: the lenders come from `UserManager.allUsers()`. For
 * each, the status must agree with the contract's own level (the facade
 * already refuses a disagreement) and with the inputs read again, one by
 * one, at the block the status reports.
 */
import { utils } from 'ethers';

import {
    IKSULockingAbi__factory,
    IUserManagerAbi__factory,
} from '../contracts';
import { CHAIN_CONFIGS } from '../facade/chain-configs';
import { Kasu } from '../facade/kasu';

const live = process.env.LIVE_TESTS === '1';
const LENDERS_CHECKED = 5;

(live ? describe : describe.skip)('live network — loyalty status', () => {
    it('base: every checked lender matches the contract at the status block', async () => {
        const kasu = Kasu.create({ chain: 'base' });
        const contracts = CHAIN_CONFIGS.base.contracts;
        const userManager = IUserManagerAbi__factory.connect(
            contracts.UserManager,
            kasu.provider,
        );
        const locking = IKSULockingAbi__factory.connect(
            contracts.IKSULocking,
            kasu.provider,
        );
        const users = (await userManager.allUsers()).slice(0, LENDERS_CHECKED);
        expect(users.length).toBeGreaterThan(0);

        for (const user of users) {
            const status = await kasu.loyalty.getStatus(user);
            if (!status.supported) throw new Error('Base must be supported');
            const blockTag = status.blockNumber;
            const [[active, pending], [, level], rKsu] = await Promise.all([
                userManager.userTotalPendingAndActiveDepositedAmountForCurrentEpoch(
                    user,
                    { blockTag },
                ),
                userManager.userLoyaltyLevel(user, { blockTag }),
                locking.balanceOf(user, { blockTag }),
            ]);
            // eslint-disable-next-line no-console
            console.log(
                user.slice(0, 6),
                `level ${String(status.level)}/${String(status.levelCount - 1)}`,
                `lent ${status.lentUsd.total}`,
                `rKSU ${status.rKsu}`,
                `price ${status.ksuPriceUsd}`,
                `next ${status.levels.map((l) => l.additionalKsu ?? 'n/a').join(' / ')}`,
            );

            expect(status.level).toBe(level);
            expect(status.levelCount).toBe(status.thresholdsBps.length + 1);
            expect(status.levels).toHaveLength(status.levelCount);
            expect(status.bonusRatePerLevel).toHaveLength(status.levelCount);
            expect(utils.parseUnits(status.rKsu, 18).eq(rKsu)).toBe(true);
            expect(
                utils
                    .parseUnits(status.lentUsd.total, 6)
                    .eq(active.add(pending)),
            ).toBe(true);
            for (const entry of status.levels) {
                expect(entry.reached).toBe(entry.level <= status.level);
                if (entry.reached) expect(entry.additionalKsu).toBe('0');
            }
        }
    }, 120_000);

    it.each(['xdc', 'xdc-usdc'] as const)(
        '%s: not supported',
        async (chain) => {
            await expect(
                Kasu.create({ chain }).loyalty.getStatus(
                    '0x0000000000000000000000000000000000000001',
                ),
            ).resolves.toEqual({ supported: false, reason: 'lite-deployment' });
        },
    );
});
