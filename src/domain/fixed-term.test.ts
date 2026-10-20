import fc from 'fast-check';

import { TrancheData } from '../services/DataService/types';

import {
    availableFixedTermConfigs,
    DAYS_PER_EPOCH,
    FixedTermConfig,
    isFixedTermConfigId,
    lockDurationDays,
    lockDurationMonths,
} from './fixed-term';

// Ported from kasu-ui `src/features/lending/lib/__tests__/format-ftd.test.ts`
// (`getAvailableFtdConfigs`, `isFixedTermConfigId`, `lockDurationMonths`, and
// the lock arithmetic behind `formatLockDuration`). The formatters stay in the
// app; the numbers they agree on are pinned here.

const WALLET = '0xAbC0000000000000000000000000000000000001';
const OTHER = '0x0000000000000000000000000000000000000002';

function config(overrides: Partial<FixedTermConfig> = {}): FixedTermConfig {
    return {
        configId: '1',
        apy: '0.16',
        epochLockDuration: '52',
        epochInterestRate: '0.0028',
        fixedTermDepositStatus: 'Everyone',
        fixedTermDepositAllowlist: [],
        ...overrides,
    };
}

function tranche(
    configs: FixedTermConfig[],
): Pick<TrancheData, 'fixedTermConfig'> {
    return { fixedTermConfig: configs };
}

describe('isFixedTermConfigId', () => {
    it('treats 0 / empty / absent as the variable-rate sentinel', () => {
        expect(isFixedTermConfigId('0')).toBe(false);
        expect(isFixedTermConfigId('')).toBe(false);
        expect(isFixedTermConfigId('  ')).toBe(false);
        expect(isFixedTermConfigId(' 0 ')).toBe(false);
        expect(isFixedTermConfigId(undefined)).toBe(false);
        expect(isFixedTermConfigId(null)).toBe(false);
    });

    it('treats any non-zero configId as fixed-term', () => {
        expect(isFixedTermConfigId('1')).toBe(true);
        expect(isFixedTermConfigId('2')).toBe(true);
    });
});

describe('availableFixedTermConfigs', () => {
    it('always includes Everyone configs, with or without a wallet', () => {
        const t = tranche([config({ fixedTermDepositStatus: 'Everyone' })]);
        expect(availableFixedTermConfigs(t, undefined)).toHaveLength(1);
        expect(availableFixedTermConfigs(t, null)).toHaveLength(1);
        expect(availableFixedTermConfigs(t, WALLET)).toHaveLength(1);
    });

    it('includes an AllowlistedOnly config only for an allowlisted wallet', () => {
        const t = tranche([
            config({
                configId: '2',
                fixedTermDepositStatus: 'AllowlistedOnly',
                fixedTermDepositAllowlist: [
                    { isAllowlisted: true, userId: WALLET.toLowerCase() },
                ],
            }),
        ]);
        // Case-insensitive: the subgraph stores lowercase ids.
        expect(availableFixedTermConfigs(t, WALLET)).toHaveLength(1);
        expect(
            availableFixedTermConfigs(
                t,
                WALLET.toUpperCase().replace('0X', '0x'),
            ),
        ).toHaveLength(1);
        expect(availableFixedTermConfigs(t, OTHER)).toHaveLength(0);
        expect(availableFixedTermConfigs(t, undefined)).toHaveLength(0);
        expect(availableFixedTermConfigs(t, null)).toHaveLength(0);
        expect(availableFixedTermConfigs(t, '')).toHaveLength(0);
    });

    it('drops a wallet that was REMOVED from the allowlist', () => {
        // The subgraph keeps the entry and flips `isAllowlisted` to false; the
        // contract refuses that wallet, so the config must not be offered.
        const t = tranche([
            config({
                fixedTermDepositStatus: 'AllowlistedOnly',
                fixedTermDepositAllowlist: [
                    { isAllowlisted: false, userId: WALLET.toLowerCase() },
                ],
            }),
        ]);
        expect(availableFixedTermConfigs(t, WALLET)).toHaveLength(0);
    });

    it('counts an entry that carries no flag by its presence (pre-2.9 reads)', () => {
        const entry = { userId: WALLET.toLowerCase() } as {
            isAllowlisted: boolean;
            userId: string;
        };
        const t = tranche([
            config({
                fixedTermDepositStatus: 'AllowlistedOnly',
                fixedTermDepositAllowlist: [entry],
            }),
        ]);
        expect(availableFixedTermConfigs(t, WALLET)).toHaveLength(1);
    });

    it('keeps the tranche order and filters per config', () => {
        const t = tranche([
            config({ configId: '1' }),
            config({
                configId: '2',
                fixedTermDepositStatus: 'AllowlistedOnly',
                fixedTermDepositAllowlist: [
                    { isAllowlisted: true, userId: OTHER },
                ],
            }),
            config({ configId: '3' }),
        ]);
        expect(
            availableFixedTermConfigs(t, WALLET).map((c) => c.configId),
        ).toEqual(['1', '3']);
        expect(
            availableFixedTermConfigs(t, OTHER).map((c) => c.configId),
        ).toEqual(['1', '2', '3']);
    });

    it('returns [] for an absent tranche', () => {
        expect(availableFixedTermConfigs(undefined, WALLET)).toEqual([]);
        expect(availableFixedTermConfigs(null, WALLET)).toEqual([]);
    });

    it('never offers an AllowlistedOnly config to a wallet not on its list', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        isAllowlisted: fc.boolean(),
                        userId: fc.constantFrom(OTHER, WALLET.toLowerCase()),
                    }),
                ),
                (allowlist) => {
                    const t = tranche([
                        config({
                            fixedTermDepositStatus: 'AllowlistedOnly',
                            fixedTermDepositAllowlist: allowlist,
                        }),
                    ]);
                    const onList = allowlist.some(
                        (e) =>
                            e.isAllowlisted &&
                            e.userId === WALLET.toLowerCase(),
                    );
                    expect(availableFixedTermConfigs(t, WALLET)).toHaveLength(
                        onList ? 1 : 0,
                    );
                },
            ),
        );
    });
});

describe('lockDurationDays', () => {
    it('is seven days an epoch', () => {
        expect(DAYS_PER_EPOCH).toBe(7);
        expect(lockDurationDays('52')).toBe(364);
        expect(lockDurationDays('26')).toBe(182);
        expect(lockDurationDays('13')).toBe(91);
        expect(lockDurationDays('1')).toBe(7);
    });

    it('FAILS CLOSED on a lock that is not a positive number', () => {
        expect(lockDurationDays('0')).toBeNaN();
        expect(lockDurationDays('-4')).toBeNaN();
        expect(lockDurationDays('nope')).toBeNaN();
        expect(lockDurationDays('')).toBeNaN();
        expect(lockDurationDays('Infinity')).toBeNaN();
    });
});

describe('lockDurationMonths', () => {
    it('counts a lock in whole months, past a year too', () => {
        // 52 epochs = 364 days: only the average-month divisor lands it on 12.
        expect(lockDurationMonths('52')).toBe(12);
        expect(lockDurationMonths('26')).toBe(6);
        expect(lockDurationMonths('13')).toBe(3);
        // A year-rounding formatter says "2 years"; this never rolls up.
        expect(lockDurationMonths('104')).toBe(24);
    });

    it('returns null for a non-positive, unparseable or sub-month lock', () => {
        expect(lockDurationMonths('0')).toBeNull();
        expect(lockDurationMonths('-4')).toBeNull();
        expect(lockDurationMonths('nope')).toBeNull();
        // 1 epoch = 7 days rounds to 0 months.
        expect(lockDurationMonths('1')).toBeNull();
        // 3 epochs = 21 days: the divisor would round UP to 1, but below the
        // months band nothing may claim months ("3 weeks" in the selector).
        expect(lockDurationMonths('3')).toBeNull();
        expect(lockDurationMonths('4')).toBeNull();
        // 5 epochs = 35 days is the first lock stated in months.
        expect(lockDurationMonths('5')).toBe(1);
    });

    it('agrees with the month band of the app formatter across a year', () => {
        // kasu-ui's `formatLockDuration` states months exactly when the lock is
        // ≥ 30 days and < 365 days, as `Math.round(days / 30.4375)`.
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 52 }), (epochs) => {
                const days = epochs * 7;
                const expected = days >= 30 ? Math.round(days / 30.4375) : null;
                expect(lockDurationMonths(String(epochs))).toBe(expected);
            }),
        );
    });

    it('never goes backwards as the lock gets longer', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 400 }),
                fc.integer({ min: 1, max: 400 }),
                (a, b) => {
                    const [shorter, longer] = a <= b ? [a, b] : [b, a];
                    expect(
                        lockDurationMonths(String(longer)) ?? 0,
                    ).toBeGreaterThanOrEqual(
                        lockDurationMonths(String(shorter)) ?? 0,
                    );
                },
            ),
        );
    });
});
