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
 * `src/features/lending/lib/errors.ts`.
 */

/**
 * Did the lender reject the request in their wallet?
 *
 * Providers surface a rejection in different shapes:
 *   - MetaMask and most EIP-1193 wallets: `code: 4001`
 *   - WalletConnect and some Privy paths: `Error('User rejected the request')`
 *   - ethers v5 wraps it as `ACTION_REJECTED`
 *   - Coinbase Wallet sometimes: `code: 'ACTION_REJECTED'` as a string
 *
 * This is kasu-ui's implementation verbatim. kasu-mobile's copy additionally
 * reads a nested `error.code` / `error.message`, an ethers `reason`, and the
 * words "request rejected" / "declined"; a consumer that needs those shapes
 * should keep its own check on top rather than assume they are covered here.
 */
export function isUserRejected(err: unknown): boolean {
    if (!err) return false;
    if (typeof err === 'object') {
        const code = (err as { code?: unknown }).code;
        if (code === 4001 || code === 'ACTION_REJECTED') return true;
    }
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();
    return (
        lower.includes('user rejected') ||
        lower.includes('user denied') ||
        lower.includes('rejected the request') ||
        lower.includes('action_rejected')
    );
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
