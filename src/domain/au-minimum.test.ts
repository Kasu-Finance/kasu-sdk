import {
    AU_ALPHA3,
    AU_MIN_CUMULATIVE_BY_STABLE,
    auMinimumRemaining,
    auThresholdFor,
    isAuMinimumExempt,
    isAustralianKyc,
    parseMinorUnits,
} from './au-minimum';

/**
 * Ported from kasu-ui
 * `src/features/lending/lib/au-lending-restriction.test.ts`, minus the two
 * cases that pin toast copy — those strings stay in the applications.
 *
 * What these pin is the arithmetic: integer bigint minor units and a
 * truncating parse, so no consumer can disagree with another at the
 * 360,000 / 500,000 boundary.
 */

// 6dp on every current deployment (USDC on Base/XDC, AUDD on XDC).
const DP = 6;
const n = (v: string): bigint => BigInt(v);

describe('isAustralianKyc', () => {
    it('accepts the alpha-3 code in any casing, with surrounding whitespace', () => {
        expect(isAustralianKyc('AUS')).toBe(true);
        expect(isAustralianKyc('aus')).toBe(true);
        expect(isAustralianKyc(' AUS ')).toBe(true);
        expect(isAustralianKyc('Aus')).toBe(true);
    });

    it('rejects the alpha-2 code — the collapsed KYC field is alpha-3', () => {
        // Deliberate: a bare 'AU' must NOT restrict. The KYC claim is
        // normalised to alpha-3 before it ever reaches this rule.
        expect(isAustralianKyc('AU')).toBe(false);
    });

    it('rejects near-misses and absent countries (fail-open)', () => {
        expect(isAustralianKyc('AUT')).toBe(false);
        expect(isAustralianKyc('')).toBe(false);
        expect(isAustralianKyc(undefined)).toBe(false);
        expect(isAustralianKyc(null)).toBe(false);
    });

    it('exports the alpha-3 constant it compares against', () => {
        expect(AU_ALPHA3).toBe('AUS');
    });
});

describe('auThresholdFor', () => {
    it('returns the per-stable whole-unit minimum, case-insensitively', () => {
        expect(auThresholdFor('USDC')).toBe(360_000);
        expect(auThresholdFor('usdc')).toBe(360_000);
        expect(auThresholdFor(' USDC ')).toBe(360_000);
        expect(auThresholdFor('AUDD')).toBe(500_000);
        expect(auThresholdFor('audd')).toBe(500_000);
    });

    it('fails open for an unlisted stable or a missing symbol', () => {
        expect(auThresholdFor('DAI')).toBeUndefined();
        expect(auThresholdFor(undefined)).toBeUndefined();
        expect(auThresholdFor(null)).toBeUndefined();
        expect(auThresholdFor('')).toBeUndefined();
    });

    it('exposes the table kasu-backend’s minimums must match', () => {
        expect(AU_MIN_CUMULATIVE_BY_STABLE).toEqual({
            USDC: 360_000,
            AUDD: 500_000,
        });
    });
});

describe('parseMinorUnits (6dp)', () => {
    it('parses whole and partial decimal input', () => {
        expect(parseMinorUnits('0', DP)).toBe(n('0'));
        expect(parseMinorUnits('1', DP)).toBe(n('1000000'));
        // Mid-typing states an amount field really produces.
        expect(parseMinorUnits('10.', DP)).toBe(n('10000000'));
        expect(parseMinorUnits('.5', DP)).toBe(n('500000'));
        expect(parseMinorUnits('1.5', DP)).toBe(n('1500000'));
    });

    it('TRUNCATES excess precision — a position can never be inflated into passing', () => {
        expect(parseMinorUnits('1.23456789', DP)).toBe(n('1234567'));
    });

    it('returns null for empty, non-numeric, negative and absent input', () => {
        expect(parseMinorUnits('', DP)).toBeNull();
        expect(parseMinorUnits('   ', DP)).toBeNull();
        expect(parseMinorUnits('abc', DP)).toBeNull();
        expect(parseMinorUnits('-5', DP)).toBeNull();
        // A lone separator matches the shape but carries no digits.
        expect(parseMinorUnits('.', DP)).toBeNull();
        expect(parseMinorUnits(null, DP)).toBeNull();
        expect(parseMinorUnits(undefined, DP)).toBeNull();
    });

    it('accepts numbers as well as strings', () => {
        expect(parseMinorUnits(360_000, DP)).toBe(n('360000000000'));
        expect(parseMinorUnits(0, DP)).toBe(n('0'));
    });
});

// `address` and `exemptAddresses` are required keys on AuMinimumInput (a
// refactor must not be able to drop either silently), so the shared fixture
// supplies the un-exempted defaults and the exemption cases override them.
const BASE = {
    stableSymbol: 'USDC',
    decimals: DP,
    address: undefined,
    exemptAddresses: undefined,
} as const;

describe('auMinimumRemaining — fail-open cases return 0 (no raised minimum)', () => {
    it('is 0 when the KYC country is absent', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                country: undefined,
                existingDeposited: '0',
            }),
        ).toBe(0);
        expect(
            auMinimumRemaining({
                ...BASE,
                country: null,
                existingDeposited: '0',
            }),
        ).toBe(0);
    });

    it('is 0 for a non-Australian lender', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'USA',
                existingDeposited: '0',
            }),
        ).toBe(0);
    });

    it('is 0 on a deployment whose stable has no configured threshold', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                stableSymbol: 'DAI',
                country: 'AUS',
                existingDeposited: '0',
            }),
        ).toBe(0);
    });
});

describe('auMinimumRemaining — Australian lender', () => {
    it('demands the FULL threshold while the position is unknown (strict-until-loaded)', () => {
        // `undefined` is not a zero position — it is an unread one. Treating
        // it as 0 keeps the floor at its strictest until the read lands, so
        // the field never advertises a minimum lower than the backend accepts.
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'AUS',
                existingDeposited: undefined,
            }),
        ).toBe(360_000);
    });

    it('is 0 once the existing position exactly meets the threshold (inclusive)', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'AUS',
                existingDeposited: '360000',
            }),
        ).toBe(0);
    });

    it('is 0 once the existing position exceeds the threshold', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'AUS',
                existingDeposited: '400000',
            }),
        ).toBe(0);
    });

    it('returns the remainder for a partial position', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'AUS',
                existingDeposited: '120000',
            }),
        ).toBe(240_000);
    });

    it('keeps sub-unit precision — one minor unit short still demands one minor unit', () => {
        // 359,999.999999 lent → 0.000001 USDC left to reach 360,000. The
        // bigint arithmetic must not round that away into a 0 (unrestricted).
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'AUS',
                existingDeposited: '359999.999999',
            }),
        ).toBe(0.000001);
    });

    it('accepts a numeric existing position, not just a string', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'AUS',
                existingDeposited: 120_000,
            }),
        ).toBe(240_000);
    });

    it('uses the 500,000 threshold on AUDD deployments', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                stableSymbol: 'AUDD',
                country: 'AUS',
                existingDeposited: 0,
            }),
        ).toBe(500_000);
    });
});

// Deployment configuration the caller supplies — see `isAuMinimumExempt`. The
// real list is never shipped in this public package; these are stand-ins.
const EXEMPT_CHECKSUMMED = '0x1111111111111111111111111111111111111111';
const EXEMPT_LOWER = EXEMPT_CHECKSUMMED.toLowerCase();
const OTHER_EXEMPT = '0x2222222222222222222222222222222222222222';
const NOT_EXEMPT = '0x3333333333333333333333333333333333333333';
const LIST: readonly string[] = [EXEMPT_LOWER, OTHER_EXEMPT.toLowerCase()];

describe('isAuMinimumExempt', () => {
    it('matches a listed wallet in any casing, with surrounding whitespace', () => {
        expect(isAuMinimumExempt(EXEMPT_CHECKSUMMED, LIST)).toBe(true);
        expect(isAuMinimumExempt(EXEMPT_LOWER, LIST)).toBe(true);
        expect(isAuMinimumExempt(EXEMPT_LOWER.toUpperCase(), LIST)).toBe(true);
        expect(isAuMinimumExempt(`  ${OTHER_EXEMPT}  `, LIST)).toBe(true);
    });

    it('matches a list entry stored in mixed case too', () => {
        // The rule normalises both sides, so a caller that reads its list
        // straight out of configuration cannot be caught out by casing.
        expect(
            isAuMinimumExempt(EXEMPT_LOWER, [EXEMPT_CHECKSUMMED.toUpperCase()]),
        ).toBe(true);
    });

    it('fails CLOSED on anything unlisted or not a string', () => {
        expect(isAuMinimumExempt(NOT_EXEMPT, LIST)).toBe(false);
        expect(isAuMinimumExempt('', LIST)).toBe(false);
        expect(isAuMinimumExempt('   ', LIST)).toBe(false);
        expect(isAuMinimumExempt(undefined, LIST)).toBe(false);
        expect(isAuMinimumExempt(null, LIST)).toBe(false);
        // A prefix of, or an extension to, a listed address is another wallet.
        expect(isAuMinimumExempt(EXEMPT_LOWER.slice(0, -1), LIST)).toBe(false);
        expect(isAuMinimumExempt(`${EXEMPT_LOWER}00`, LIST)).toBe(false);
    });

    it('fails CLOSED when no list was supplied', () => {
        expect(isAuMinimumExempt(EXEMPT_LOWER, undefined)).toBe(false);
        expect(isAuMinimumExempt(EXEMPT_LOWER, null)).toBe(false);
        expect(isAuMinimumExempt(EXEMPT_LOWER, [])).toBe(false);
    });
});

describe('auMinimumRemaining — named-address exemption', () => {
    it('is 0 for an exempt wallet that would otherwise owe the full threshold', () => {
        for (const address of [
            EXEMPT_CHECKSUMMED,
            EXEMPT_LOWER,
            OTHER_EXEMPT,
        ]) {
            expect(
                auMinimumRemaining({
                    ...BASE,
                    country: 'AUS',
                    address,
                    exemptAddresses: LIST,
                    existingDeposited: 0,
                }),
            ).toBe(0);
        }
    });

    it('is 0 on AUDD too, where the threshold is the larger 500,000', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                stableSymbol: 'AUDD',
                country: 'AUS',
                address: EXEMPT_LOWER,
                exemptAddresses: LIST,
                existingDeposited: 0,
            }),
        ).toBe(0);
    });

    it('overrides an UNKNOWN position — the strict full-threshold case', () => {
        // `undefined` is what a caller passes while the on-chain read is in
        // flight, and it normally yields the whole threshold. An exemption
        // outranks it, so an exempt lender never sees a floor that later drops.
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'AUS',
                address: EXEMPT_LOWER,
                exemptAddresses: LIST,
                existingDeposited: undefined,
            }),
        ).toBe(0);
    });

    it('leaves a non-exempt Australian on the full threshold', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'AUS',
                address: NOT_EXEMPT,
                exemptAddresses: LIST,
                existingDeposited: 0,
            }),
        ).toBe(360_000);
    });

    it('treats an absent address, or an absent list, as NOT exempt', () => {
        // Both keys are required; either VALUE may be absent, and when it is
        // the rule applies exactly as it did before exemptions existed.
        for (const address of [undefined, null]) {
            expect(
                auMinimumRemaining({
                    ...BASE,
                    country: 'AUS',
                    address,
                    exemptAddresses: LIST,
                    existingDeposited: 0,
                }),
            ).toBe(360_000);
        }
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'AUS',
                address: EXEMPT_LOWER,
                exemptAddresses: undefined,
                existingDeposited: 0,
            }),
        ).toBe(360_000);
    });

    it('is 0 for a non-Australian at an exempt address, as it always was', () => {
        expect(
            auMinimumRemaining({
                ...BASE,
                country: 'FRA',
                address: EXEMPT_LOWER,
                exemptAddresses: LIST,
                existingDeposited: 0,
            }),
        ).toBe(0);
    });
});
