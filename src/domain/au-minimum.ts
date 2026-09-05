/**
 * The AU cumulative-lending minimum — the numeric half.
 *
 * RULE: a lender whose verified KYC country is Australia may only lend when
 * their existing deposited position on THIS deployment, plus the amount they
 * are asking for, reaches the deployment's threshold.
 *
 * This is UX PRE-VALIDATION ONLY. kasu-backend enforces the rule
 * authoritatively at contract generation and refuses with HTTP 403
 * `AU_WHOLESALE_MINIMUM_NOT_MET`; a lender who gets past this check is still
 * stopped there. What these helpers exist for is to raise the amount field's
 * minimum so the lender learns the rule while typing rather than at the end.
 *
 * FAIL-OPEN by design: an absent or unknown country is NOT restricted, and an
 * unlisted stable symbol has no threshold. An UNKNOWN existing position is
 * treated as 0 — strict, so the floor is never advertised lower than the
 * backend will accept, and it relaxes once the position loads.
 *
 * Arithmetic is integer bigint in minor units (10^decimals) so no two
 * consumers can disagree at the boundary. Parsing TRUNCATES, never rounds up —
 * a position can never be inflated into passing. `BigInt(...)` calls only, no
 * bigint literals, so consumers on an older target still compile.
 *
 * Lifted from kasu-ui's `features/lending/lib/au-lending-restriction.ts`. The
 * two toast strings that live there are copy and stay in the applications.
 */

type Maybe<T> = T | null | undefined;
type NumLike = string | number | null | undefined;

const ZERO = BigInt(0);

/** ISO 3166-1 alpha-3 for Australia — the collapsed KYC country field. */
export const AU_ALPHA3 = 'AUS';

/**
 * Is this the Australian KYC country? Case-insensitive and
 * whitespace-tolerant. Anything that is not a string — including the
 * `undefined` of an unloaded KYC record — is not restricted (fail-open).
 *
 * The alpha-2 `'AU'` deliberately does NOT match: the KYC country reaching
 * this rule is normalised to alpha-3 upstream, and a bare two-letter code
 * here means something else went wrong.
 */
export function isAustralianKyc(country: Maybe<string>): boolean {
    if (typeof country !== 'string') return false;
    return country.trim().toUpperCase() === AU_ALPHA3;
}

/**
 * Minimum CUMULATIVE position, in WHOLE stable units, keyed on the
 * deployment's stable-asset symbol (a property of the currency, not the
 * chain). Must match kasu-backend's table exactly.
 */
export const AU_MIN_CUMULATIVE_BY_STABLE: Readonly<Record<string, number>> = {
    USDC: 360_000,
    AUDD: 500_000,
};

/**
 * Threshold in whole units, or `undefined` for an unlisted stable — a
 * deployment whose currency has no configured minimum is unrestricted.
 */
export function auThresholdFor(symbol: Maybe<string>): number | undefined {
    if (typeof symbol !== 'string') return undefined;
    return AU_MIN_CUMULATIVE_BY_STABLE[symbol.trim().toUpperCase()];
}

/**
 * Is this wallet released from the minimum entirely, whatever its country,
 * stable or position says?
 *
 * `exemptAddresses` is DEPLOYMENT CONFIGURATION the caller supplies, not a
 * constant of this package. kasu-sdk is published publicly; the exempt list is
 * a compliance carve-out naming particular lender wallets, so it does not
 * belong in a public tarball. Read it from wherever the application keeps its
 * deployment configuration, and keep it identical to kasu-backend's
 * `AU_WHOLESALE_EXEMPT_ADDRESSES` — that is where the rule is actually
 * enforced. An address exempt here but not there sees no raised minimum in the
 * form and is refused at the end, which is worse than not exempting it at all.
 *
 * The address matched must be the CONNECTED wallet — the one that owns the KYC
 * record and signs the agreement request. kasu-backend verifies that signature
 * before the gate, so an exemption cannot be claimed by asserting someone
 * else's address; it takes their private key. Never match a "view as" address.
 *
 * Comparison is case-insensitive and whitespace-tolerant. Anything that is not
 * a string is NOT exempt (fail closed), and so is anything when the list is
 * absent.
 */
export function isAuMinimumExempt(
    address: Maybe<string>,
    exemptAddresses: Maybe<readonly string[]>,
): boolean {
    if (typeof address !== 'string' || !exemptAddresses) return false;
    const needle = address.trim().toLowerCase();
    return exemptAddresses.some((a) => a.trim().toLowerCase() === needle);
}

const DECIMAL_RE = /^(\d+)?(?:\.(\d*))?$/;

/**
 * Truncating, partial-input-tolerant decimal → minor-unit parse.
 * `'10.'` → `10000000n` · `'1.23456789'` → `1234567n` (truncated at 6dp).
 * `''` / `'abc'` / negative / null → `null`.
 *
 * Tolerant of mid-typing states because it runs on an amount field as the
 * lender types, and truncating because rounding up would let a position that
 * is a fraction short read as passing.
 */
export function parseMinorUnits(
    value: NumLike,
    decimals: number,
): bigint | null {
    if (value === null || value === undefined) return null;
    const raw = typeof value === 'number' ? String(value) : value.trim();
    if (!raw) return null;
    const match = DECIMAL_RE.exec(raw);
    if (!match || (!match[1] && !match[2])) return null;
    // Both capture groups are optional, so either can be absent at runtime.
    // A fractional group that matched EMPTY ('10.') is not absent, and the
    // destructuring defaults leave it alone — only `undefined` takes them.
    const [, whole = '0', fracDigits = ''] = match;
    const frac = fracDigits.slice(0, decimals).padEnd(decimals, '0');
    return BigInt(whole + frac);
}

export interface AuMinimumInput {
    /** Collapsed KYC country (alpha-3). Missing/undefined ⇒ not restricted. */
    country: Maybe<string>;
    /**
     * The CONNECTED wallet (never a "view as" override).
     *
     * REQUIRED KEY, nullable value. A caller with no wallet passes `undefined`
     * and gets the un-exempted behaviour; what it may not do is silently omit
     * the key. Optional would let a refactor of the call site drop it with no
     * compile error — and because a form's own minimum validation refuses a
     * submit below the floor, an exempt lender would then be stopped HERE and
     * never reach the backend that would have let them through.
     */
    address: Maybe<string>;
    /**
     * The deployment's exempt wallets — see `isAuMinimumExempt`. REQUIRED KEY
     * for the same reason `address` is: a caller that has no list passes
     * `undefined` deliberately, and no refactor can drop it by accident.
     */
    exemptAddresses: Maybe<readonly string[]>;
    /** Deployment stable-asset symbol, e.g. `'USDC'` / `'AUDD'`. */
    stableSymbol: Maybe<string>;
    /** Stable-asset decimals (6 on every current deployment). */
    decimals: number;
    /**
     * Existing position (active + pending) on THIS deployment, whole units.
     * Unparseable/undefined ⇒ treated as 0 (strict: the full threshold applies
     * until the position is known).
     */
    existingDeposited: NumLike;
}

/**
 * The amount, in WHOLE stable units, an Australian lender still needs in order
 * to reach the deployment's cumulative minimum. Apply it as the amount field's
 * floor via `max(trancheMin, auMinimumRemaining(...))`.
 *
 * Returns 0 for everyone the rule does not restrict (fail-open), 0 for an
 * exempt address, and 0 once the lender's existing position already satisfies
 * the threshold.
 *
 * The exemption is tested FIRST and unconditionally: an exempt wallet has no
 * minimum whatever its country, stable or position says. kasu-backend
 * deliberately tests country first and the exemption second — the two orders
 * are not in conflict, both return "no minimum" for the same inputs. There,
 * the exemption sets a flag that drives a compliance log, so it must not fire
 * for a lender the rule never engaged for. Here nothing is logged, so
 * exemption-first is preferred: it makes this function right on its own,
 * whatever country a caller happens to pass.
 */
export function auMinimumRemaining(input: AuMinimumInput): number {
    if (isAuMinimumExempt(input.address, input.exemptAddresses)) return 0;
    if (!isAustralianKyc(input.country)) return 0;
    const threshold = auThresholdFor(input.stableSymbol);
    if (threshold === undefined) return 0;
    const { existingDeposited, decimals } = input;
    // A table threshold always parses; `?? ZERO` keeps the rule fail-open
    // rather than asserting, so an unparseable one yields no minimum at all.
    const thresholdMinor = parseMinorUnits(threshold, decimals) ?? ZERO;
    const existingMinor = parseMinorUnits(existingDeposited, decimals) ?? ZERO;
    const remaining = thresholdMinor - existingMinor;
    if (remaining <= ZERO) return 0;
    const base = BigInt('1' + '0'.repeat(decimals));
    return Number(remaining / base) + Number(remaining % base) / Number(base);
}
