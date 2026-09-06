import {
    classifyWalletFailure,
    isUnpredictableGas,
    isUserRejected,
} from './wallet-errors';

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

    it('detects the "request rejected" wording when it names the user', () => {
        expect(isUserRejected(new Error('Request rejected by user'))).toBe(
            true,
        );
        expect(isUserRejected(new Error('Request rejected by the user'))).toBe(
            true,
        );
    });

    it('detects the "declined" wording, case-insensitively', () => {
        expect(isUserRejected(new Error('The User Declined the signature'))).toBe(
            true,
        );
        expect(isUserRejected({ message: 'signature declined by wallet' })).toBe(
            true,
        );
    });

    it("detects viem's UserRejectedRequestError by name", () => {
        const err = Object.assign(new Error('Something went wrong'), {
            name: 'UserRejectedRequestError',
        });
        expect(isUserRejected(err)).toBe(true);
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

/**
 * The words alone are not the signal.
 *
 * "Declined" and "request rejected" are also what a rate limiter, a risk
 * engine and a KYC decision say, and ethers hands those to us in the same
 * envelope a wallet error arrives in — the upstream body on a nested
 * `error.message`, under a `SERVER_ERROR` / `-32603` of its own. Classifying
 * one of those as "you cancelled in your wallet" tells a lender they refused
 * something they never saw AND discards the real error, which is the one
 * anybody could have acted on.
 */
describe('isUserRejected — the bare words are contextual', () => {
    it('does not fire on an RPC refusal wrapped by ethers', () => {
        expect(
            isUserRejected({
                code: 'SERVER_ERROR',
                reason: 'processing response error',
                error: { message: 'request rejected: rate limit exceeded' },
            }),
        ).toBe(false);
    });

    it('does not fire on a KYC decision that says "Declined"', () => {
        expect(isUserRejected(new Error('KYC status: Declined'))).toBe(false);
    });

    it('does not fire on a backend 4xx whose body says "request rejected"', () => {
        expect(
            isUserRejected({
                status: 403,
                message: 'Request failed with status code 403',
                error: { message: 'request rejected by the risk engine' },
            }),
        ).toBe(false);
    });

    it('does not fire on a bare "declined" or a bare "rejected"', () => {
        expect(isUserRejected(new Error('Transaction Declined'))).toBe(false);
        expect(isUserRejected({ message: 'signature declined' })).toBe(false);
        expect(isUserRejected(new Error('Request rejected'))).toBe(false);
    });

    it('still fires when the same words name the party who did it', () => {
        expect(isUserRejected(new Error('Transaction declined by user'))).toBe(
            true,
        );
        expect(
            isUserRejected({
                code: 'SERVER_ERROR',
                error: { message: 'user rejected the request' },
            }),
        ).toBe(true);
    });
});

/**
 * Parity with kasu-mobile's `features/lending/lib/errors.ts`, the wrapper this
 * predicate exists to delete. Every shape its spec pins as a rejection has to
 * pass here, or removing the wrapper would silently narrow what the app
 * recognises — and a missed rejection tells a lender their deliberate cancel
 * "went wrong".
 */
describe('isUserRejected — every shape kasu-mobile recognised', () => {
    it.each([
        ['EIP-1193 rejection code', { code: 4001 }],
        ['ethers v5 ACTION_REJECTED', { code: 'ACTION_REJECTED' }],
        ['nested provider code', { error: { code: 4001 } }],
        [
            'nested provider ACTION_REJECTED',
            { error: { code: 'ACTION_REJECTED' } },
        ],
        [
            'nested provider message',
            { error: { message: 'User rejected the request' } },
        ],
        ['ethers reason', { reason: 'user rejected transaction' }],
        ['Error: user rejected', new Error('User rejected the request')],
        [
            'Error: user denied',
            new Error('MetaMask Tx Signature: User denied transaction signature.'),
        ],
        ['plain object carrying message', { message: 'User rejected the request' }],
        ['wording: request rejected', new Error('Request rejected by the user')],
        ['wording: declined', new Error('The user declined the signature')],
    ])('recognises %s', (_name, err) => {
        expect(isUserRejected(err)).toBe(true);
    });

    it.each([
        ['a network failure', new Error('network timeout')],
        ['a revert', { code: 'UNPREDICTABLE_GAS_LIMIT' }],
        ['an unrelated nested code', { error: { code: -32000 } }],
        ['null', null],
        ['undefined', undefined],
        ['a bare string', 'something else'],
    ])('does not fire on %s', (_name, err) => {
        expect(isUserRejected(err)).toBe(false);
    });
});

describe('classifyWalletFailure', () => {
    it('calls a wallet rejection cancelled, and carries no error with it', () => {
        expect(
            classifyWalletFailure('approve', { code: 4001 }),
        ).toEqual({ step: 'approve', reason: 'cancelled' });
    });

    it('calls everything else failed, keeping the throw for a crash reporter', () => {
        const boom = new Error('nonce too low');
        expect(classifyWalletFailure('request', boom)).toEqual({
            step: 'request',
            reason: 'failed',
            error: boom,
        });
    });

    it('is generic in the step, so both flows share one implementation', () => {
        expect(classifyWalletFailure('kyc', new Error('x')).step).toBe('kyc');
        expect(classifyWalletFailure('confirm', new Error('x')).step).toBe(
            'confirm',
        );
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
