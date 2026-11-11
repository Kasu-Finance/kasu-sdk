import { BigNumber, providers } from 'ethers';

import { EPOCHS_IN_YEAR } from '../../domain/rates';
import { CHAIN_CONFIGS } from '../../facade/chain-configs';
import { SdkConfig } from '../../sdk-config';

import { KSULocking } from './locking';

// Offline: the constructor only builds contract instances, and the two
// contracts the schedule reads are replaced before it is called.
function locking(
    chain: 'base' | 'xdc',
    thresholds: number[],
    rates: string[],
): { service: KSULocking; rateReads: jest.Mock<Promise<BigNumber>, [number]> } {
    const entry = CHAIN_CONFIGS[chain];
    const config = new SdkConfig({
        subgraphUrl: 'https://example.invalid/subgraph',
        contracts: entry.contracts,
        UNUSED_LENDING_POOL_IDS: [''],
        isLiteDeployment: entry.isLiteDeployment,
    });
    const service = new KSULocking(
        config,
        new providers.StaticJsonRpcProvider(entry.rpcUrls[0], entry.chainId),
    );
    const rateReads = jest.fn((level: number) =>
        Promise.resolve(BigNumber.from(rates[level] ?? '0')),
    );
    const internals = service as unknown as {
        _systemVariablesAbi: unknown;
        _userLoyaltyRewardsAbi: unknown;
    };
    internals._systemVariablesAbi = {
        loyaltyThresholds: () =>
            Promise.resolve(thresholds.map((t) => BigNumber.from(t))),
    };
    internals._userLoyaltyRewardsAbi = { loyaltyEpochRewardRates: rateReads };
    return { service, rateReads };
}

const BASE_RATES = ['0', '19164956034632', '38329912069265'];

describe('KSULocking.getLoyaltySchedule', () => {
    it('reads the thresholds and one rate per level from chain', async () => {
        const { service, rateReads } = locking('base', [100, 500], BASE_RATES);
        const schedule = await service.getLoyaltySchedule();

        expect(schedule.thresholdsBps).toEqual([100, 500]);
        expect(rateReads.mock.calls.map((call) => call[0])).toEqual([0, 1, 2]);
        expect(schedule.apyBonuses[0]).toBe(0);
        expect(schedule.apyBonuses[1]).toBeCloseTo(0.001, 12);
        expect(schedule.apyBonuses[2]).toBeCloseTo(0.002, 12);
        expect(schedule.apyBonuses[1]).toBe(
            (19164956034632 / 1e18) * EPOCHS_IN_YEAR,
        );
    });

    it('follows a third threshold — four levels, four rates', async () => {
        const { service, rateReads } = locking(
            'base',
            [100, 500, 1_000],
            [...BASE_RATES, '57494868103897'],
        );
        const schedule = await service.getLoyaltySchedule();
        expect(schedule.thresholdsBps).toEqual([100, 500, 1_000]);
        expect(rateReads).toHaveBeenCalledTimes(4);
        expect(schedule.apyBonuses).toHaveLength(4);
    });

    it('Lite: no levels, no reads', async () => {
        const { service, rateReads } = locking('xdc', [100], BASE_RATES);
        await expect(service.getLoyaltySchedule()).resolves.toEqual({
            thresholdsBps: [],
            apyBonuses: [0],
        });
        expect(rateReads).not.toHaveBeenCalled();
    });
});

describe('KSULocking.getLoyaltyLevelAndApyBonusFromRatio', () => {
    const today = { thresholdsBps: [100, 500], apyBonuses: [0, 0.001, 0.002] };

    it.each([
        [0, 0, 0],
        [0.0099, 0, 0],
        [0.01, 1, 0.001],
        [0.0499, 1, 0.001],
        [0.05, 2, 0.002],
        [3, 2, 0.002],
    ])('ratio %s → level %s, bonus %s (Base today)', (ratio, level, bonus) => {
        const { service } = locking('base', [], []);
        expect(
            service.getLoyaltyLevelAndApyBonusFromRatio(ratio, today),
        ).toEqual({ loyaltyLevel: level, apyBonus: bonus });
    });

    it('uses the schedule it is given — a 10 % third threshold is level 3', () => {
        const { service } = locking('base', [], []);
        expect(
            service.getLoyaltyLevelAndApyBonusFromRatio(0.2, {
                thresholdsBps: [100, 500, 1_000],
                apyBonuses: [0, 0.001, 0.002, 0.003],
            }),
        ).toEqual({ loyaltyLevel: 3, apyBonus: 0.003 });
        // …and nothing is assumed when the thresholds move.
        expect(
            service.getLoyaltyLevelAndApyBonusFromRatio(0.02, {
                thresholdsBps: [300],
                apyBonuses: [0, 0.01],
            }),
        ).toEqual({ loyaltyLevel: 0, apyBonus: 0 });
    });

    it('Lite: level 0, no bonus', () => {
        const { service } = locking('xdc', [], []);
        expect(service.getLoyaltyLevelAndApyBonusFromRatio(1, today)).toEqual({
            loyaltyLevel: 0,
            apyBonus: 0,
        });
    });
});
