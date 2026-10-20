import { BigNumber, BigNumberish, constants, utils } from 'ethers';

import { ILendingPoolManagerAbi__factory } from '../contracts/factories/ILendingPoolManagerAbi__factory';

/**
 * The single-call `LendingPoolManager` requests a sponsored relay may carry,
 * encoded by the SDK so no application hand-builds calldata or hand-maps the
 * relay's `kind` for them.
 *
 * Every function here is PURE: addresses and ids in, `{ kind, call }` out.
 * Reading the chain (the shares a withdrawal is for) is the facade's job —
 * `kasu.calls` — and sending is the application's.
 *
 * Each call is `{ to, data }` and nothing else: no `value` (none of these
 * functions is payable), no `from` (the manager acts for `msg.sender`, the
 * lender's own account, which is why none of them takes a user argument).
 * `data` is ethers' ABI encoding, which is canonical by construction — the
 * relay re-encodes what it decodes and refuses anything that differs, so a
 * hand-tweaked blob never gets through, and an SDK-built one always matches.
 */

/**
 * The relay's name for each shape. Carried beside the call so the app posts
 * `kind` from the SDK, never from a table of its own — a request declaring the
 * wrong kind is refused (`invalid_calls`), so a hand-mapped table that drifts
 * turns into a lender who cannot withdraw.
 */
export const SPONSORED_CALL_KINDS = [
    /** `LendingPoolManager.requestWithdrawal(pool, tranche, shares)`. */
    'withdrawal',
    /** `LendingPoolManager.cancelDepositRequest(pool, dNftID)`. */
    'cancel_deposit',
    /** `LendingPoolManager.cancelWithdrawalRequest(pool, wNftID)`. */
    'cancel_withdrawal',
    /** `LendingPoolManager.requestFixedTermDepositWithdrawal(pool, lockId)`. */
    'withdraw_at_expiry',
] as const;

export type SponsoredCallKind = (typeof SPONSORED_CALL_KINDS)[number];

/** One encoded call and the relay `kind` that names its shape. */
export interface SponsoredCall {
    kind: SponsoredCallKind;
    /**
     * Exactly `{ to, data }` — structurally the flows' `BatchCall`. Post it as
     * the relay's single call; do not add keys to it.
     */
    call: { to: string; data: string };
}

/**
 * Widened to the plain `Interface`: the typechain one overloads
 * `encodeFunctionData` per literal name, and the name here comes from
 * `FUNCTION_OF`.
 */
const LENDING_POOL_MANAGER: utils.Interface =
    ILendingPoolManagerAbi__factory.createInterface();

/** The `LendingPoolManager` function behind each kind. */
const FUNCTION_OF: Readonly<Record<SponsoredCallKind, string>> = Object.freeze({
    withdrawal: 'requestWithdrawal',
    cancel_deposit: 'cancelDepositRequest',
    cancel_withdrawal: 'cancelWithdrawalRequest',
    withdraw_at_expiry: 'requestFixedTermDepositWithdrawal',
});

/**
 * The 4-byte selector of each kind's function, DERIVED from the generated
 * `ILendingPoolManager` ABI — never typed in by hand, so an ABI change moves
 * it and the cross-check spec against the relay's own pins goes red.
 */
export const SPONSORED_CALL_SELECTORS: Readonly<
    Record<SponsoredCallKind, string>
> = Object.freeze({
    withdrawal: LENDING_POOL_MANAGER.getSighash(FUNCTION_OF.withdrawal),
    cancel_deposit: LENDING_POOL_MANAGER.getSighash(FUNCTION_OF.cancel_deposit),
    cancel_withdrawal: LENDING_POOL_MANAGER.getSighash(
        FUNCTION_OF.cancel_withdrawal,
    ),
    withdraw_at_expiry: LENDING_POOL_MANAGER.getSighash(
        FUNCTION_OF.withdraw_at_expiry,
    ),
});

/**
 * What an encoder throws for an input it will not encode. `code` names the
 * argument; the message names no party, so a wallet-rejection classifier can
 * never read it as something the lender did. Nothing has been sent when this
 * is thrown.
 */
export class SponsoredCallInputError extends Error {
    readonly code: string;

    constructor(code: string) {
        super(`Sponsored call input refused (${code})`);
        this.name = 'SponsoredCallInputError';
        this.code = code;
        Object.setPrototypeOf(this, SponsoredCallInputError.prototype);
    }
}

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function assertAddress(value: unknown, code: string): asserts value is string {
    if (typeof value !== 'string' || !ADDRESS_RE.test(value)) {
        throw new SponsoredCallInputError(code);
    }
}

/** A uint256 — an NFT or lock id. Zero is a valid id as far as encoding goes. */
function toUint256(value: BigNumberish, code: string): BigNumber {
    let parsed: BigNumber;
    try {
        parsed = BigNumber.from(value);
    } catch {
        throw new SponsoredCallInputError(code);
    }
    if (parsed.isNegative() || parsed.gt(constants.MaxUint256)) {
        throw new SponsoredCallInputError(code);
    }
    return parsed;
}

function encode(
    kind: SponsoredCallKind,
    lendingPoolManager: string,
    args: readonly unknown[],
): SponsoredCall {
    return {
        kind,
        call: {
            to: lendingPoolManager,
            data: LENDING_POOL_MANAGER.encodeFunctionData(
                FUNCTION_OF[kind],
                args,
            ),
        },
    };
}

/**
 * `requestWithdrawal(poolId, trancheId, shares)` — `withdrawal`.
 *
 * `shares` are tranche SHARES, not assets: `kasu.calls.requestWithdrawal`
 * converts an asset amount (or `'max'`) into them exactly as
 * `UserLending.requestWithdrawalInAsset` / `requestWithdrawalMax` do. Zero
 * shares is refused here: the contract reverts on it
 * (`RequestWithdrawSharesAreZero`) and the relay refuses it before that.
 */
export function encodeRequestWithdrawalCall(
    lendingPoolManager: string,
    poolId: string,
    trancheId: string,
    shares: BigNumberish,
): SponsoredCall {
    assertAddress(lendingPoolManager, 'lending-pool-manager');
    assertAddress(poolId, 'pool');
    assertAddress(trancheId, 'tranche');
    const amount = toUint256(shares, 'shares');
    if (amount.isZero()) throw new SponsoredCallInputError('zero-shares');
    return encode('withdrawal', lendingPoolManager, [
        poolId,
        trancheId,
        amount,
    ]);
}

/** `cancelDepositRequest(poolId, dNftId)` — `cancel_deposit`. */
export function encodeCancelDepositCall(
    lendingPoolManager: string,
    poolId: string,
    dNftId: BigNumberish,
): SponsoredCall {
    assertAddress(lendingPoolManager, 'lending-pool-manager');
    assertAddress(poolId, 'pool');
    return encode('cancel_deposit', lendingPoolManager, [
        poolId,
        toUint256(dNftId, 'nft-id'),
    ]);
}

/** `cancelWithdrawalRequest(poolId, wNftId)` — `cancel_withdrawal`. */
export function encodeCancelWithdrawalCall(
    lendingPoolManager: string,
    poolId: string,
    wNftId: BigNumberish,
): SponsoredCall {
    assertAddress(lendingPoolManager, 'lending-pool-manager');
    assertAddress(poolId, 'pool');
    return encode('cancel_withdrawal', lendingPoolManager, [
        poolId,
        toUint256(wNftId, 'nft-id'),
    ]);
}

/**
 * `requestFixedTermDepositWithdrawal(poolId, fixedTermDepositId)` —
 * `withdraw_at_expiry`. The contract function takes the pool and the LOCK id
 * only (no tranche): the manager forwards to the fixed-term contract on the
 * lender's behalf, which knows the lock's tranche.
 */
export function encodeWithdrawAtExpiryCall(
    lendingPoolManager: string,
    poolId: string,
    fixedTermDepositId: BigNumberish,
): SponsoredCall {
    assertAddress(lendingPoolManager, 'lending-pool-manager');
    assertAddress(poolId, 'pool');
    return encode('withdraw_at_expiry', lendingPoolManager, [
        poolId,
        toUint256(fixedTermDepositId, 'lock-id'),
    ]);
}
