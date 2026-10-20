import { TrancheData } from '../services/DataService/types';

/**
 * Fixed-term deposits. A fixed-term config locks a deposit for N epochs in
 * exchange for a fixed rate. The configs ride on `TrancheData.fixedTermConfig`;
 * `'0'` is the variable-rate sentinel (no lock) that `requestDepositWithKyc`
 * takes as `fixedTermConfigId`.
 *
 * Numbers only. Turning a lock into "12 months" or "3 weeks" is copy, and
 * stays in each application — what lives here is the arithmetic both of those
 * strings have to agree on, so a selector and a details table can never state
 * one term two ways.
 */

/** One fixed-term config, exactly as `TrancheData` carries it. */
export type FixedTermConfig = TrancheData['fixedTermConfig'][number];

/**
 * One epoch's nominal length in days. A lock is counted in epochs, and the
 * loan-agreement text states its term from the same 7-day epoch.
 */
export const DAYS_PER_EPOCH = 7;

/**
 * The average calendar month, 365.25 / 12. A lock is counted in epochs, so a
 * "12-month" term is 52 epochs = 364 days, and only the average-month divisor
 * lands that on 12 (364 / 30.4375 = 11.96 → 12).
 */
export const DAYS_PER_MONTH = 30.4375;

/**
 * The shortest lock stated in months. Below it a term reads in weeks or days,
 * so nothing may claim a month count for it — a 3-epoch lock is 21 days, which
 * the average-month divisor would otherwise round UP to one month.
 */
export const MIN_DAYS_FOR_MONTHS = 30;

/**
 * `'0'`, empty or absent is the variable-rate sentinel, not a fixed term.
 * Every surface that tags a rate "variable" or "fixed" must derive the tag
 * through this, so no screen can hardcode a tag that contradicts the rate
 * beside it.
 */
export function isFixedTermConfigId(
    configId: string | null | undefined,
): boolean {
    if (configId == null) return false;
    const trimmed = configId.trim();
    return trimmed !== '' && trimmed !== '0';
}

/**
 * The fixed-term configs this wallet may actually select on a tranche: a
 * config open to `Everyone`, or an `AllowlistedOnly` config whose allowlist
 * names the wallet. Anything else is dropped (hide-ineligible): the contract
 * refuses a deposit into an allowlisted config from a wallet that is not on
 * it, so offering one is offering a transaction that reverts.
 *
 * Address matching is case-insensitive. An allowlist entry whose
 * `isAllowlisted` is `false` is a wallet that was REMOVED — the subgraph keeps
 * the entity and flips the flag — so it does not count. An entry that carries
 * no flag at all counts by its presence, which is how every entry read before
 * 2.9.0 arrived (the query did not select the field).
 *
 * `address` `null` / `undefined` — no wallet yet — sees only the `Everyone`
 * configs. Order is the tranche's own.
 */
export function availableFixedTermConfigs(
    tranche: Pick<TrancheData, 'fixedTermConfig'> | null | undefined,
    address: string | null | undefined,
): FixedTermConfig[] {
    if (!tranche) return [];
    const lower = address?.toLowerCase();
    return tranche.fixedTermConfig.filter(
        (config) =>
            config.fixedTermDepositStatus === 'Everyone' ||
            (lower != null &&
                lower !== '' &&
                config.fixedTermDepositAllowlist.some(
                    (entry) =>
                        (entry.isAllowlisted as boolean | undefined) !==
                            false && entry.userId.toLowerCase() === lower,
                )),
    );
}

/**
 * A lock's length in days: `epochLockDuration × 7`.
 *
 * FAILS CLOSED: an unparseable, non-finite, zero or negative epoch count
 * returns `NaN`, never `0` — a zero-day lock is not a term, and a consumer
 * that rendered it would state one.
 *
 * @param epochLockDuration the config's `epochLockDuration`, a decimal string.
 */
export function lockDurationDays(epochLockDuration: string): number {
    const epochs = parseFloat(epochLockDuration);
    if (!Number.isFinite(epochs) || epochs <= 0) return NaN;
    return epochs * DAYS_PER_EPOCH;
}

/**
 * A lock in WHOLE months, or `null` when the epoch count is not a positive
 * number or the lock is shorter than `MIN_DAYS_FOR_MONTHS`.
 *
 * Unlike a year-rounding formatter it never rolls up into years: a 104-epoch
 * lock is 24 months. A consumer that states years does that conversion in its
 * own words.
 */
export function lockDurationMonths(epochLockDuration: string): number | null {
    const days = lockDurationDays(epochLockDuration);
    if (Number.isNaN(days) || days < MIN_DAYS_FOR_MONTHS) return null;
    const months = Math.round(days / DAYS_PER_MONTH);
    return months > 0 ? months : null;
}
