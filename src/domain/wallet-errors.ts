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
 *   - WalletConnect and some Privy paths: `Error('User rejected the request')`
 *   - a provider error WRAPPED by another layer, carrying the real code and
 *     message on a nested `error` — the shape Privy's embedded wallet
 *     surfaces on Expo, where the outer object says nothing useful
 *   - ethers' own `reason` field, which is often the only place the text lands
 *   - wallets that word it "request rejected" or "declined"
 *
 * Previously kasu-ui's implementation verbatim, with kasu-mobile keeping its
 * own superset on top. That is precisely the drift this layer exists to stop —
 * a rejection kasu-mobile recognised and kasu-ui did not was reported to the
 * same lender as a failure on one app and a cancellation on the other. The
 * union lives here; the mobile wrapper goes.
 *
 * Being generous here is the safe direction. Calling a genuine fault a
 * cancellation costs a lender one retry; calling a deliberate rejection a
 * failure sends them to support to report a bug that does not exist.
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
    return (
        lower.includes('user rejected') ||
        lower.includes('user denied') ||
        lower.includes('rejected the request') ||
        lower.includes('request rejected') ||
        lower.includes('declined') ||
        lower.includes('action_rejected')
    );
}

function isRejectionCode(code: unknown): boolean {
    return code === 4001 || code === 'ACTION_REJECTED';
}

/**
 * Every place a wallet might have put the words: the message, ethers' `reason`,
 * and a wrapped error's message. Joined rather than picked, because which one
 * carries the text depends on how many layers wrapped it.
 */
function rejectionText(err: unknown): string {
    if (typeof err !== 'object' || err === null) return String(err);
    const e = err as {
        message?: unknown;
        reason?: unknown;
        error?: { message?: unknown } | null;
    };
    return [e.message, e.reason, e.error?.message]
        .filter((part): part is string => typeof part === 'string')
        .join(' ');
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
