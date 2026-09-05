import { isUnpredictableGas, isUserRejected } from './wallet-errors';

/**
 * `isUserRejected` cases ported from kasu-ui
 * `src/lib/web3/is-user-rejected.test.ts`, plus one per shape kasu-mobile's
 * `features/lending/lib/errors.ts` recognised and kasu-ui did not — the wrapped
 * `error.code` / `error.message`, ethers' `reason`, and the "request rejected"
 * / "declined" wordings. `isUnpredictableGas` had no test in kasu-mobile; one
 * is written here.
 */

describe('isUserRejected', () => {
    it('detects EIP-1193 numeric code 4001', () => {
        expect(isUserRejected({ code: 4001, message: 'whatever' })).toBe(true);
    });

    it('detects ACTION_REJECTED string code (ethers v5)', () => {
        expect(
            isUserRejected({ code: 'ACTION_REJECTED', message: 'rejected' }),
        ).toBe(true);
    });

    it('detects "User rejected" message string', () => {
        expect(isUserRejected(new Error('User rejected the request'))).toBe(
            true,
        );
    });

    it('detects "User denied" message string', () => {
        expect(
            isUserRejected(new Error('User denied transaction signature')),
        ).toBe(true);
    });

    it('detects the ethers ACTION_REJECTED marker in a message', () => {
        expect(
            isUserRejected(new Error('transaction failed: ACTION_REJECTED')),
        ).toBe(true);
    });

    it('is case-insensitive', () => {
        expect(isUserRejected(new Error('user REJECTED the request'))).toBe(
            true,
        );
    });

    it('returns false for unrelated errors', () => {
        expect(isUserRejected(new Error('Network error'))).toBe(false);
        expect(isUserRejected(new Error('Insufficient funds'))).toBe(false);
    });

    it('returns false for null / undefined', () => {
        expect(isUserRejected(null)).toBe(false);
        expect(isUserRejected(undefined)).toBe(false);
    });

    it('handles non-Error throwables', () => {
        expect(isUserRejected('user rejected')).toBe(true);
        expect(isUserRejected('something else')).toBe(false);
    });

    it('is not fooled by a numeric code that only looks like 4001', () => {
        expect(isUserRejected({ code: '4001' })).toBe(false);
        expect(isUserRejected({ code: 4002 })).toBe(false);
    });

    // --- the shapes kasu-mobile carried on top of this, now folded in -------

    it('reads the code off a WRAPPED provider error', () => {
        // Privy's embedded wallet on Expo: the outer object's own code says
        // nothing, and the wallet's is one layer down.
        expect(
            isUserRejected({
                code: -32603,
                message: 'Internal JSON-RPC error.',
                error: { code: 4001, message: 'User rejected the request.' },
            }),
        ).toBe(true);
        expect(isUserRejected({ error: { code: 'ACTION_REJECTED' } })).toBe(
            true,
        );
    });

    it('reads the message off a wrapped provider error', () => {
        expect(
            isUserRejected({
                code: -32000,
                message: 'Request failed',
                error: { message: 'MetaMask Tx Signature: User denied.' },
            }),
        ).toBe(true);
    });

    it("detects the rejection in ethers' `reason` field", () => {
        expect(
            isUserRejected(
                Object.assign(new Error('transaction failed'), {
                    reason: 'user rejected transaction',
                }),
            ),
        ).toBe(true);
    });

    it('detects the "request rejected" wording', () => {
        expect(isUserRejected(new Error('Request rejected by user'))).toBe(
            true,
        );
    });

    it('detects the "declined" wording, case-insensitively', () => {
        expect(isUserRejected(new Error('Transaction Declined'))).toBe(true);
        expect(isUserRejected({ message: 'signature declined' })).toBe(true);
    });

    it('still says no when none of the wrapped fields mention a rejection', () => {
        expect(
            isUserRejected({
                code: -32603,
                message: 'Internal JSON-RPC error.',
                error: { code: -32000, message: 'insufficient funds for gas' },
            }),
        ).toBe(false);
    });
});

describe('isUnpredictableGas', () => {
    it('detects the ethers v5 gas-estimation revert code', () => {
        expect(isUnpredictableGas({ code: 'UNPREDICTABLE_GAS_LIMIT' })).toBe(
            true,
        );
    });

    it('does not fire on a user rejection', () => {
        expect(isUnpredictableGas({ code: 'ACTION_REJECTED' })).toBe(false);
        expect(isUnpredictableGas({ code: 4001 })).toBe(false);
    });

    it('does not fire on the code appearing only in a message', () => {
        // The code is the signal; a message mentioning it is not one, or a
        // logged error string would be mistaken for a revert.
        expect(
            isUnpredictableGas(new Error('UNPREDICTABLE_GAS_LIMIT')),
        ).toBe(false);
        expect(isUnpredictableGas('UNPREDICTABLE_GAS_LIMIT')).toBe(false);
    });

    it('returns false for null / undefined and for unrelated errors', () => {
        expect(isUnpredictableGas(null)).toBe(false);
        expect(isUnpredictableGas(undefined)).toBe(false);
        expect(isUnpredictableGas(new Error('Network error'))).toBe(false);
    });

    it('reads the code off an ethers error object', () => {
        const err = Object.assign(new Error('cannot estimate gas'), {
            code: 'UNPREDICTABLE_GAS_LIMIT',
            reason: 'execution reverted: ERC20: insufficient allowance',
        });
        expect(isUnpredictableGas(err)).toBe(true);
        expect(isUserRejected(err)).toBe(false);
    });
});
