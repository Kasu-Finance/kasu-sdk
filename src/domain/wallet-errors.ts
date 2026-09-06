/**
 * Wallet and RPC error predicates — pure functions over `unknown`.
 *
 * Every consumer has to tell three things apart when a write fails: the lender
 * changed their mind, the call would revert, and everything else. The first
 * two must never be reported as a failure the lender should retry or contact
 * support about, and each wallet spells them differently, so the shapes are
 * enumerated once here.
 *
 * Lifted from kasu-ui's `src/lib/web3/is-user-rejected.ts` and kasu-mobile's
 * `src/features/lending/lib/errors.ts` — and now the UNION of the two, so
 * neither app has to keep a wrapper on top of this one.
 */

/**
 * Did the lender reject the request in their wallet?
 *
 * Providers surface a rejection in different shapes, and the union of them is
 * the point of this function existing once:
 *   - MetaMask and most EIP-1193 wallets: `code: 4001`
 *   - Coinbase Wallet and ethers v5: `code: 'ACTION_REJECTED'`
 *   - viem: a `UserRejectedRequestError` name
 *   - WalletConnect and some Privy paths: `Error('User rejected the request')`
 *   - a provider error WRAPPED by another layer, carrying the real code and
 *     message on a nested `error` — the shape Privy's embedded wallet
 *     surfaces on Expo, where the outer object says nothing useful
 *   - ethers' own `reason` field, which is often the only place the text lands
 *   - a PLAIN OBJECT carrying `message`, which `String(err)` would read as
 *     `"[object Object]"`
 *
 * Previously kasu-ui's implementation verbatim, with kasu-mobile keeping its
 * own superset on top. That is precisely the drift this layer exists to stop —
 * a rejection kasu-mobile recognised and kasu-ui did not was reported to the
 * same lender as a failure on one app and a cancellation on the other. The
 * union lives here; the mobile wrapper goes.
 *
 * ## The text is read for a SUBJECT, not for a keyword
 *
 * The words alone are not the signal. "Declined" and "request rejected" are
 * also what a rate limiter, a risk engine and a KYC decision say, and those
 * arrive wrapped in exactly the same envelope a wallet error does — ethers'
 * `SERVER_ERROR` around `-32603` carries the upstream body on a nested
 * `error.message`, so `{ error: { message: 'request rejected: rate limit
 * exceeded' } }` is an RPC refusing to serve us, not a lender refusing to
 * sign. Reporting one as the other tells a lender they cancelled something
 * they never saw, and DROPS the real error on the floor.
 *
 * So a rejection is a machine-readable wallet code, or a sentence that names
 * the party who did it: "user rejected", "declined by the user", "cancelled by
 * the wallet". A bare "declined" is not a rejection, whatever else is on the
 * envelope.
 *
 * Within that rule, being generous is the safe direction: calling a genuine
 * fault a cancellation costs a lender one retry, while calling a deliberate
 * rejection a failure sends them to support to report a bug that does not
 * exist.
 */
export function isUserRejected(err: unknown): boolean {
    if (!err) return false;
    if (typeof err === 'object') {
        const e = err as {
            code?: unknown;
            error?: { code?: unknown } | null;
        };
        if (isRejectionCode(e.code)) return true;
        // A wrapped provider error: the outer layer's code is its own, the
        // inner one is the wallet's.
        if (isRejectionCode(e.error?.code)) return true;
    }
    const lower = rejectionText(err).toLowerCase();
    return USER_REJECTION_PATTERNS.some((pattern) => pattern.test(lower));
}

function isRejectionCode(code: unknown): boolean {
    return code === 4001 || code === 'ACTION_REJECTED';
}

/**
 * The wordings that name the wallet or the person at it.
 *
 * Each one carries a SUBJECT — the identifier a wallet library uses, or the
 * verb with the party who performed it. That is what separates a lender
 * pressing Reject from a server declining to answer, and it is why none of
 * these is a bare "declined" or "rejected".
 */
const USER_REJECTION_PATTERNS: readonly RegExp[] = [
    // Machine-readable markers that only a wallet layer emits, arriving as
    // text because something in between stringified the error.
    /action_rejected/,
    /user_rejected/,
    /userrejectedrequest/,
    // "the user did it", in the orders the wallets write it.
    /user\s+(?:has\s+)?(?:rejected|denied|declined|refused|cancell?ed)/,
    /(?:rejected|denied|declined|refused|cancell?ed)\s+by\s+(?:the\s+)?(?:user|wallet|signer|owner)/,
    // The wallet as the subject, which is how some embedded wallets word it.
    /(?:wallet|signer)\s+(?:rejected|denied|declined|refused)/,
];

/**
 * Every place a wallet might have put the words: the message, ethers' `reason`,
 * the error's `name` (viem puts the whole signal there), and a wrapped error's
 * own three. Joined rather than picked, because which one carries the text
 * depends on how many layers wrapped it.
 *
 * A separator is used rather than a bare space: two fields must not be able to
 * form a phrase across the join that neither of them said.
 */
function rejectionText(err: unknown): string {
    if (typeof err !== 'object' || err === null) return String(err);
    const e = err as {
        message?: unknown;
        reason?: unknown;
        name?: unknown;
        error?: {
            message?: unknown;
            reason?: unknown;
            name?: unknown;
        } | null;
    };
    return [
        e.message,
        e.reason,
        e.name,
        e.error?.message,
        e.error?.reason,
        e.error?.name,
    ]
        .filter((part): part is string => typeof part === 'string')
        .join(' | ');
}

/**
 * Did the wallet or RPC signal that the on-chain call would revert?
 *
 * ethers v5 raises `UNPREDICTABLE_GAS_LIMIT` when gas estimation reverts —
 * most often an underlying `transferFrom` failing on an insufficient balance
 * or allowance. Distinct from a rejection: nothing was refused by the lender,
 * the transaction simply cannot succeed as composed, so the caller should
 * re-check its preconditions rather than invite a retry.
 */
export function isUnpredictableGas(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    return (err as { code?: unknown }).code === 'UNPREDICTABLE_GAS_LIMIT';
}

/** A step that failed, as a code plus whether the lender chose it. */
export type WalletFailure<Step> =
    | { step: Step; reason: 'cancelled' }
    | { step: Step; reason: 'failed'; error: unknown };

/**
 * The `cancelled` / `failed` split, for a WALLET call on any step of any flow.
 *
 * A lender who pressed Reject is not a fault. Reporting one as the other is
 * how a support queue fills with people who did exactly what they meant to.
 *
 * Generic in the step so both flows share one implementation — it was
 * duplicated byte-for-byte in each of them, which is the same drift this
 * layer exists to stop, one level up.
 *
 * Only pass it an error a WALLET produced. An HTTP port's throw is always a
 * `failed`: the lender's wallet was not involved in it, so a backend that
 * happens to word a refusal "declined" must never be shown to them as
 * something they did.
 */
export function classifyWalletFailure<Step>(
    step: Step,
    err: unknown,
): WalletFailure<Step> {
    return isUserRejected(err)
        ? { step, reason: 'cancelled' }
        : { step, reason: 'failed', error: err };
}
