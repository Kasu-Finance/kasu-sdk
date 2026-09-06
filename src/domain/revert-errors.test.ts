/**
 * The revert decoder, against the bytes the contracts actually produce.
 *
 * Every protocol fixture is encoded with the GENERATED typechain interface
 * rather than a selector pasted into the test, so a fixture cannot claim a
 * selector the contract does not use — which is the only way a table like this
 * can be wrong and still pass.
 */
import { ethers } from 'ethers';

import { IKasuAllowListAbi__factory } from '../contracts/factories/IKasuAllowListAbi__factory';
import { ILendingPoolManagerAbi__factory } from '../contracts/factories/ILendingPoolManagerAbi__factory';

import { decodeRevert, extractRevertData } from './revert-errors';

const MANAGER = ILendingPoolManagerAbi__factory.createInterface();
const ALLOW_LIST = IKasuAllowListAbi__factory.createInterface();

const POOL = `0x${'11'.repeat(20)}`;
const TRANCHE = `0x${'22'.repeat(20)}`;
const USER = `0x${'33'.repeat(20)}`;
const TOKEN = `0x${'44'.repeat(20)}`;

/** A `require(..., "reason")` revert, as Solidity encodes one. */
function stringRevert(reason: string): string {
    return ethers.utils.hexConcat([
        '0x08c379a0',
        ethers.utils.defaultAbiCoder.encode(['string'], [reason]),
    ]);
}

/** ethers' failed-gas-estimate envelope, with the revert data where a node puts it. */
function gasEstimateRevert(data: string): unknown {
    return Object.assign(new Error('cannot estimate gas'), {
        code: 'UNPREDICTABLE_GAS_LIMIT',
        error: { code: 3, message: 'execution reverted', data },
    });
}

// ---------------------------------------------------------------------------

describe('decodeRevert — the protocol errors a deposit reverts with', () => {
    const cases: [string, string][] = [
        [
            'LendingPoolIsStopped',
            MANAGER.encodeErrorResult('LendingPoolIsStopped', []),
        ],
        [
            'ClearingIsPending',
            MANAGER.encodeErrorResult('ClearingIsPending', []),
        ],
        [
            'InvalidTranche',
            MANAGER.encodeErrorResult('InvalidTranche', [POOL, TRANCHE]),
        ],
        ['UserNotKycd', MANAGER.encodeErrorResult('UserNotKycd', [USER])],
        ['UserBlocked', MANAGER.encodeErrorResult('UserBlocked', [USER])],
        [
            'UserNotInAllowList',
            MANAGER.encodeErrorResult('UserNotInAllowList', [USER]),
        ],
        ['BlockExpired', ALLOW_LIST.encodeErrorResult('BlockExpired', [])],
    ];

    it.each(cases)('names %s', (name, data) => {
        expect(decodeRevert(gasEstimateRevert(data))).toEqual({
            name,
            family: 'protocol',
        });
    });

    it('reads the allow list and the manager from the same table', () => {
        // `BlockExpired` is declared only by the allow list, which the deposit
        // reaches through the manager — a table built from one ABI would miss
        // it and report a lapsed signing window as a shortfall.
        const blockExpired = ALLOW_LIST.encodeErrorResult('BlockExpired', []);
        const stopped = MANAGER.encodeErrorResult('LendingPoolIsStopped', []);
        expect(decodeRevert(gasEstimateRevert(blockExpired))?.name).toBe(
            'BlockExpired',
        );
        expect(decodeRevert(gasEstimateRevert(stopped))?.name).toBe(
            'LendingPoolIsStopped',
        );
    });
});

describe('decodeRevert — the ERC-20 family stays the balance case', () => {
    it.each([
        'ERC20: transfer amount exceeds balance',
        'ERC20: insufficient allowance',
        'ERC20: transfer amount exceeds allowance',
        'TRANSFER_FROM_FAILED',
        'SafeERC20: low-level call failed',
    ])('reads a plain transferFrom revert (%s) as erc20', (reason) => {
        expect(decodeRevert(gasEstimateRevert(stringRevert(reason)))).toEqual({
            name: 'Error',
            family: 'erc20',
            reason,
        });
    });

    it('reads OpenZeppelin v5 token errors as erc20', () => {
        const iface = new ethers.utils.Interface([
            'error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)',
            'error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)',
        ]);
        expect(
            decodeRevert(
                gasEstimateRevert(
                    iface.encodeErrorResult('ERC20InsufficientBalance', [
                        USER,
                        1,
                        2,
                    ]),
                ),
            ),
        ).toEqual({ name: 'ERC20InsufficientBalance', family: 'erc20' });
        expect(
            decodeRevert(
                gasEstimateRevert(
                    iface.encodeErrorResult('ERC20InsufficientAllowance', [
                        USER,
                        1,
                        2,
                    ]),
                ),
            ),
        ).toEqual({ name: 'ERC20InsufficientAllowance', family: 'erc20' });
    });

    it('keeps the SafeERC20 wrapper with the token, not with the pool', () => {
        // It is the manager's own error, but what it wraps IS the failed
        // `transferFrom`: a lender who sees it does have to fund or re-approve,
        // so it must not be dressed up as a protocol condition.
        const data = MANAGER.encodeErrorResult('SafeERC20FailedOperation', [
            TOKEN,
        ]);
        expect(decodeRevert(gasEstimateRevert(data))).toEqual({
            name: 'SafeERC20FailedOperation',
            family: 'erc20',
        });
    });
});

describe('decodeRevert — nothing to name', () => {
    it('returns null for an undecodable blob', () => {
        expect(decodeRevert(gasEstimateRevert('0xdeadbeef'))).toBeNull();
        expect(
            decodeRevert(gasEstimateRevert(`0xdeadbeef${'00'.repeat(32)}`)),
        ).toBeNull();
    });

    it('returns null for a require string that is not about a balance', () => {
        // The caller keeps whatever it did before rather than inventing a
        // diagnosis: this is a revert, but not one this module can name.
        expect(
            decodeRevert(gasEstimateRevert(stringRevert('Pausable: paused'))),
        ).toBeNull();
    });

    it('returns null when there is no revert data at all', () => {
        expect(
            decodeRevert(
                Object.assign(new Error('cannot estimate gas'), {
                    code: 'UNPREDICTABLE_GAS_LIMIT',
                }),
            ),
        ).toBeNull();
        expect(decodeRevert(new Error('nonce too low'))).toBeNull();
        expect(decodeRevert(null)).toBeNull();
        expect(decodeRevert(undefined)).toBeNull();
        expect(decodeRevert('boom')).toBeNull();
    });
});

describe('extractRevertData — wherever the provider left it', () => {
    const data = MANAGER.encodeErrorResult('ClearingIsPending', []);

    it('finds it on the error itself', () => {
        expect(extractRevertData({ data })).toBe(data);
    });

    it('finds it on a nested provider error', () => {
        expect(extractRevertData({ error: { data } })).toBe(data);
        expect(extractRevertData({ error: { error: { data } } })).toBe(data);
    });

    it('finds it under an originalError, which is where some providers nest it', () => {
        expect(
            extractRevertData({ error: { data: { originalError: { data } } } }),
        ).toBe(data);
    });

    it('finds it inside a SERVER_ERROR body, which arrives as JSON text', () => {
        const err = {
            code: 'SERVER_ERROR',
            error: {
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    error: { code: 3, message: 'execution reverted', data },
                }),
            },
        };
        expect(extractRevertData(err)).toBe(data);
    });

    it('ignores hex that is too short to be a selector', () => {
        expect(extractRevertData({ data: '0x' })).toBeNull();
        expect(extractRevertData({ data: '0x00' })).toBeNull();
    });

    it('ignores an odd-length or non-hex value', () => {
        expect(extractRevertData({ data: '0xabcde' })).toBeNull();
        expect(extractRevertData({ data: 'execution reverted' })).toBeNull();
    });

    it('does not walk forever through a self-referencing error', () => {
        const err: Record<string, unknown> = { message: 'boom' };
        err.error = err;
        expect(extractRevertData(err)).toBeNull();
    });

    it('survives a body that is not JSON', () => {
        expect(
            extractRevertData({ error: { body: '{not json at all' } }),
        ).toBeNull();
    });
});
