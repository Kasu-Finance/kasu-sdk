/**
 * Epochs in a year — the single source of truth for every rate conversion in
 * the SDK and in every consumer that undoes one.
 *
 * The subgraph carries a per-epoch `interestRate`; `epochRateToApy` compounds
 * it into an APY and `apyToEpochRate` inverts exactly that. A second copy of
 * this number anywhere would recover a different weekly rate and every derived
 * figure — displayed APYs, net rates, projected interest — would be wrong, so
 * `DataService.calculateApyForTranche` and `KSULocking.calculateApy` both read
 * it from here rather than declaring their own.
 */
export const EPOCHS_IN_YEAR = 52.17857;

/**
 * A per-epoch interest rate compounded into an annual rate.
 *
 * ```
 * apy = (1 + r)^E − 1
 * ```
 *
 * This is the exact expression `DataService.calculateApyForTranche` has always
 * used, kept in its literal `**` form rather than rewritten through
 * `expm1`/`log1p`: it is the SDK's OWN definition of `tranche.apy`, so its
 * float behaviour is part of the contract every consumer already calibrated
 * against. `apyToEpochRate` is the one that must be numerically careful,
 * because it runs on the result.
 *
 * @param epochRate the per-epoch rate as a 0..1 fraction (e.g. `0.003`).
 * @returns the compounded annual rate as a 0..1 fraction.
 */
export function epochRateToApy(epochRate: number): number {
    return (1 + epochRate) ** EPOCHS_IN_YEAR - 1;
}

/**
 * The inverse of `epochRateToApy` — the per-epoch rate an APY was compounded
 * from.
 *
 * `expm1`/`log1p` rather than the literal `(1 + apy) ** (1 / E) - 1`.
 * Algebraically identical, but the direct form computes a double just above 1
 * and subtracts 1 from it, discarding the low bits of a result that is itself
 * ~1e-3 for a realistic rate. These two never form the intermediate near-1
 * value.
 *
 * @param apy the compounded annual rate as a 0..1 fraction.
 * @returns the per-epoch rate as a 0..1 fraction.
 */
export function apyToEpochRate(apy: number): number {
    return Math.expm1(Math.log1p(apy) / EPOCHS_IN_YEAR);
}

/**
 * The NET Effective Interest Rate — the compounded annual rate a lender
 * actually earns, after the platform performance fee.
 *
 * ```
 * r   = (1 + grossApy)^(1/E) − 1                 // the gross per-epoch rate
 * net = (1 + r · (1 − feePercent/100))^E − 1     // fee taken each epoch, then compounded
 * ```
 *
 * `LendingPool._applyTrancheInterest` mints the lender
 * `interest × (1 − performanceFee)` at every epoch close, and it is that NET
 * amount which capitalises and earns interest in the following epoch. So the
 * fee is applied per epoch and the result is re-compounded — not deducted from
 * the annual figure.
 *
 * ⚠️ UNITS — the one thing that must not be got wrong.
 * `feePercent` is a PERCENTAGE IN 0..100, **not** a 0..1 fraction.
 * `DataService.getPerformanceFee()` (and `StrategiesFacade.getPerformanceFeePercent()`)
 * returns the subgraph's `integerToPercentage2(1000)` = `10`, meaning **ten
 * percent**. It is NOT `0.10`. Treating it as a fraction computes
 * `r · (1 − 10)` = `−9r` and yields a nonsense negative rate that would render
 * as a plausible-looking `-…%`, which is why `feePercent > 100` and
 * `feePercent < 0` both return `NaN` and why the parameter is named
 * `feePercent` and never `fee`.
 *
 * This returns a NUMBER and nothing else. Rendering it — the 2dp convention,
 * the ` p.a.` suffix, and the fail-closed em-dash for a `NaN` or non-positive
 * result — is the consumer's job: kasu-ui does it in
 * `src/features/lending/lib/interest-rate.ts` (`formatEffectiveRate`,
 * `RATE_UNAVAILABLE`), which now wraps this function instead of restating it.
 *
 * @param grossApy compounded GROSS APY as a 0..1 fraction (e.g. `0.22` for
 *   22%), exactly as the SDK carries it on `tranche.apy` / `tranche.maxApy`.
 * @param feePercent the chain's performance fee as a percentage, `0..100`
 *   (e.g. `10` for the live 10% fee).
 * @returns the net compounded annual rate as a 0..1 fraction, or `NaN` when
 *   either input is outside its domain. Callers render `NaN` as "—".
 */
export function netEffectiveApy(grossApy: number, feePercent: number): number {
    if (!Number.isFinite(grossApy) || grossApy < 0) return NaN;
    if (!Number.isFinite(feePercent) || feePercent < 0 || feePercent > 100) {
        return NaN;
    }
    // The lender's share of each epoch's interest. Short-circuiting on `=== 1`
    // (rather than on `feePercent === 0`) also covers a fee small enough to
    // underflow the multiplier: if it cannot change the epoch rate, the net
    // rate IS the gross rate, and it must be returned unchanged rather than
    // round-tripped through the de-compound/re-compound pair below — which is
    // exact in algebra but not in floating point (0.22 comes back as
    // 0.22000000000000663 in the naive form). If the fee is ever set to zero
    // on-chain, the displayed rate must equal the SDK's APY exactly.
    const lenderShare = 1 - feePercent / 100;
    if (lenderShare === 1) return grossApy;
    // `expm1`/`log1p` rather than the literal `(1 + x) ** n - 1`. Algebraically
    // identical, but the direct form computes `(1 + grossApy) ** (1 / E) - 1`
    // by subtracting 1 from a double just above 1, discarding the low bits of a
    // result that is itself ~1e-8 for a realistic rate. The ~1e-8 relative
    // error that survives is enough to push the net rate ABOVE the gross one;
    // these two never form the intermediate near-1 value.
    const grossEpochRate = apyToEpochRate(grossApy);
    const netEpochRate = grossEpochRate * lenderShare;
    const net = Math.expm1(EPOCHS_IN_YEAR * Math.log1p(netEpochRate));
    // `net ≤ grossApy` for every `lenderShare ≤ 1` is a theorem, but at the
    // last ULP it is not a float identity — a fee of 1e-14 percent leaves a
    // `lenderShare` one ULP below 1 and the round trip can land one ULP above
    // `grossApy`. Clamping enforces the proven bound rather than letting a
    // rounding artefact put a net rate above the gross rate it came from.
    return Math.min(net, grossApy);
}
