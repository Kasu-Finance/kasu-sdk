/**
 * The SDK's sponsored-call encoders, cross-checked against the relay that
 * will judge them.
 *
 * The relay (kasu-backend `src/lending-relay/deposit-relay.calls.ts`, kinds
 * added in v2) accepts a single-call request only when the call is EXACTLY
 * `{ to, data }`, `to` is the chain's `LendingPoolManager` (the chain's stable
 * asset for `transfer`), and `data` decodes against ONE function's ABI and
 * re-encodes to the same bytes — plus `shares > 0` for a withdrawal, and for a
 * transfer `amount > 0` and a recipient that is not the zero address, the
 * caller, the stable asset, the `LendingPoolManager` or a precompile
 * (`≤ 0x…ffff`). Its decoder is viem; this file restates that
 * validator in ethers, line for line, with the relay's own function
 * signatures and its own pinned selectors copied below VERBATIM. If the SDK's
 * ABI, the relay's ABI or either side's encoding moves, a spec here goes red.
 *
 * Fixtures are synthetic, low-entropy addresses (`0x…0001`-style) only.
 */
import { BigNumber, constants, utils } from 'ethers';

import { IERC20MetadataAbi__factory } from '../contracts/factories/IERC20MetadataAbi__factory';
import { ILendingPoolManagerAbi__factory } from '../contracts/factories/ILendingPoolManagerAbi__factory';

import {
    encodeCancelDepositCall,
    encodeCancelWithdrawalCall,
    encodeRequestWithdrawalCall,
    encodeStableTransfer,
    encodeWithdrawAtExpiryCall,
    SPONSORED_CALL_KINDS,
    SPONSORED_CALL_SELECTORS,
    SponsoredCall,
    SponsoredCallInputError,
    SponsoredCallKind,
} from './sponsored-calls';

const LPM = '0x0000000000000000000000000000000000000004';
const POOL = '0x0000000000000000000000000000000000000005';
const TRANCHE = '0x0000000000000000000000000000000000000006';
const OTHER = '0x0000000000000000000000000000000000000002';
const STABLE = '0x0000000000000000000000000000000000000007';
/** The relay-bound caller (the guard's wallet, never a body field). */
const CALLER = '0x1111111111111111111111111111111111111111';
/** Above the precompile range, so the relay's static rules let it through. */
const RECIPIENT = '0x2222222222222222222222222222222222222222';
const AMOUNT = BigNumber.from(2_500_000);
/** The relay's chain config and bound caller, as `validateRelayCalls` takes them. */
const CHAIN = { lendingPoolManager: LPM, stableAsset: STABLE, caller: CALLER };
const SHARES = BigNumber.from(1_000_000_000);
const NFT_ID = BigNumber.from(42);

// ---------------------------------------------------------------------------
// The relay's side, copied verbatim
// ---------------------------------------------------------------------------

/** `RELAY_KINDS` in deposit-relay.calls.ts. */
const RELAY_KINDS = [
    'deposit',
    'withdrawal',
    'cancel_deposit',
    'cancel_withdrawal',
    'withdraw_at_expiry',
    'transfer',
];

/**
 * The relay's single-function ABIs (deposit-relay.abi.ts) — ONE function per
 * shape, which is what makes another shape's selector "does not decode".
 */
const RELAY_ABI: Record<
    SponsoredCallKind,
    { signature: string; name: string }
> = {
    withdrawal: {
        signature:
            'function requestWithdrawal(address lendingPool, address tranche, uint256 amount) returns (uint256 wNftID)',
        name: 'requestWithdrawal',
    },
    cancel_deposit: {
        signature:
            'function cancelDepositRequest(address lendingPool, uint256 dNftID)',
        name: 'cancelDepositRequest',
    },
    cancel_withdrawal: {
        signature:
            'function cancelWithdrawalRequest(address lendingPool, uint256 wNftID)',
        name: 'cancelWithdrawalRequest',
    },
    withdraw_at_expiry: {
        signature:
            'function requestFixedTermDepositWithdrawal(address lendingPool, uint256 fixedTermDepositId)',
        name: 'requestFixedTermDepositWithdrawal',
    },
    /** `TRANSFER_CALL_ABI`. */
    transfer: {
        signature:
            'function transfer(address to, uint256 amount) returns (bool)',
        name: 'transfer',
    },
};

/** The selectors deposit-relay.kinds.spec.ts pins, as the relay types them. */
const RELAY_PINNED_SELECTORS: Record<SponsoredCallKind, string> = {
    withdrawal: '0x8985646a',
    cancel_deposit: '0xd76cca03',
    cancel_withdrawal: '0x64ea50b6',
    withdraw_at_expiry: '0xf4207218',
    transfer: '0xa9059cbb',
};

/** `MAX_RESERVED_ADDRESS` in deposit-relay.calls.ts — the precompile range. */
const MAX_RESERVED_ADDRESS = BigInt(0xffff);

/** `MAX_CALL_DATA_HEX_CHARS` in deposit-relay.calls.ts. */
const MAX_CALL_DATA_HEX_CHARS = 32_768;
const HEX_DATA_RE = /^0x(?:[0-9a-fA-F]{2})*$/;
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

/**
 * `validateRelayCalls(kind, rawCalls, chain, caller)` for the single-call
 * kinds, restated: `parseCall` → `sameAddress(to, target)` (the LPM, or the
 * stable asset for `transfer`) → `decodeExactly` → the kind's own rule
 * (`validateTransferCall`'s recipient rules for `transfer`). Throws a string
 * reason, as the relay's `InvalidRelayCalls` / `InvalidTransferRecipient` do.
 */
function relayValidate(
    kind: SponsoredCallKind,
    rawCalls: unknown[],
    chain: { lendingPoolManager: string; stableAsset: string; caller: string },
): { args: utils.Result } {
    const sameAddress = (a: string, b: string): boolean =>
        a.toLowerCase() === b.toLowerCase();
    if (rawCalls.length !== 1) {
        throw new Error(`expected 1 call, got ${rawCalls.length}`);
    }
    const value = rawCalls[0];
    if (
        value === null ||
        typeof value !== 'object' ||
        Object.getPrototypeOf(value) !== Object.prototype
    ) {
        throw new Error('call 0 is not an object');
    }
    const keys = Object.keys(value);
    if (keys.length !== 2 || !['to', 'data'].every((k) => keys.includes(k))) {
        throw new Error('call 0 is not exactly { to, data }');
    }
    const { to, data } = value as { to: unknown; data: unknown };
    if (typeof to !== 'string' || !ADDRESS_RE.test(to)) {
        throw new Error('call 0 has a malformed "to"');
    }
    if (
        typeof data !== 'string' ||
        !HEX_DATA_RE.test(data) ||
        data.length - 2 > MAX_CALL_DATA_HEX_CHARS
    ) {
        throw new Error('call 0 has malformed "data"');
    }
    if (kind === 'transfer') {
        if (!sameAddress(to, chain.stableAsset)) {
            throw new Error('call 0 is not to the stable asset');
        }
    } else if (!sameAddress(to, chain.lendingPoolManager)) {
        throw new Error('call 0 is not to the LendingPoolManager');
    }

    const abi = new utils.Interface([RELAY_ABI[kind].signature]);
    let parsed: utils.TransactionDescription;
    try {
        parsed = abi.parseTransaction({ data: data.toLowerCase() });
    } catch {
        throw new Error('call 0 does not decode');
    }
    if (parsed.name !== RELAY_ABI[kind].name) {
        throw new Error(`call 0 is not ${RELAY_ABI[kind].name}`);
    }
    const reencoded = abi.encodeFunctionData(parsed.name, parsed.args);
    if (reencoded.toLowerCase() !== data.toLowerCase()) {
        throw new Error('call 0 is not the canonical encoding');
    }
    if (kind === 'withdrawal' && (parsed.args[2] as BigNumber).lte(0)) {
        throw new Error('amount is zero');
    }
    if (kind === 'transfer') {
        const recipient = parsed.args[0] as string;
        if ((parsed.args[1] as BigNumber).lte(0)) {
            throw new Error('amount is zero');
        }
        if (sameAddress(recipient, constants.AddressZero)) {
            throw new Error('recipient is the zero address');
        }
        if (sameAddress(recipient, chain.caller)) {
            throw new Error('recipient is the caller');
        }
        if (
            sameAddress(recipient, chain.stableAsset) ||
            sameAddress(recipient, chain.lendingPoolManager)
        ) {
            throw new Error('recipient is a protocol contract');
        }
        if (BigInt(recipient) <= MAX_RESERVED_ADDRESS) {
            throw new Error('recipient is a precompile address');
        }
    }
    return { args: parsed.args };
}

/** The 32-byte words after the selector. */
function words(data: string): string[] {
    const body = data.slice(10);
    const out: string[] = [];
    for (let i = 0; i < body.length; i += 64) out.push(body.slice(i, i + 64));
    return out;
}

const addressWord = (address: string): string =>
    address.slice(2).toLowerCase().padStart(64, '0');
const uintWord = (value: BigNumber): string =>
    value.toHexString().slice(2).padStart(64, '0');

// ---------------------------------------------------------------------------

const ENCODED: Record<SponsoredCallKind, () => SponsoredCall> = {
    withdrawal: () => encodeRequestWithdrawalCall(LPM, POOL, TRANCHE, SHARES),
    cancel_deposit: () => encodeCancelDepositCall(LPM, POOL, NFT_ID),
    cancel_withdrawal: () => encodeCancelWithdrawalCall(LPM, POOL, NFT_ID),
    withdraw_at_expiry: () => encodeWithdrawAtExpiryCall(LPM, POOL, NFT_ID),
    transfer: () =>
        encodeStableTransfer({
            stableAsset: STABLE,
            to: RECIPIENT,
            amount: AMOUNT,
        }),
};

/** Where each kind's call must go. */
const TARGET: Record<SponsoredCallKind, string> = {
    withdrawal: LPM,
    cancel_deposit: LPM,
    cancel_withdrawal: LPM,
    withdraw_at_expiry: LPM,
    transfer: STABLE,
};

/** What each kind's arguments must be, word by word. */
const EXPECTED_WORDS: Record<SponsoredCallKind, string[]> = {
    withdrawal: [addressWord(POOL), addressWord(TRANCHE), uintWord(SHARES)],
    cancel_deposit: [addressWord(POOL), uintWord(NFT_ID)],
    cancel_withdrawal: [addressWord(POOL), uintWord(NFT_ID)],
    withdraw_at_expiry: [addressWord(POOL), uintWord(NFT_ID)],
    transfer: [addressWord(RECIPIENT), uintWord(AMOUNT)],
};

describe('sponsored calls — cross-checked against the relay validator', () => {
    it('names exactly the four single-call LPM kinds and transfer, every one a relay kind', () => {
        expect([...SPONSORED_CALL_KINDS]).toEqual([
            'withdrawal',
            'cancel_deposit',
            'cancel_withdrawal',
            'withdraw_at_expiry',
            'transfer',
        ]);
        // Every relay kind but the two-call deposit is an SDK single-call kind.
        expect(RELAY_KINDS.filter((k) => k !== 'deposit')).toEqual([
            ...SPONSORED_CALL_KINDS,
        ]);
        for (const kind of SPONSORED_CALL_KINDS) {
            expect(RELAY_KINDS).toContain(kind);
        }
    });

    it('derives each selector from the ABI, equal to the relay’s pinned one and to its own signature', () => {
        const lpmAbi = ILendingPoolManagerAbi__factory.createInterface();
        const erc20Abi = IERC20MetadataAbi__factory.createInterface();
        for (const kind of SPONSORED_CALL_KINDS) {
            const sdkAbi = kind === 'transfer' ? erc20Abi : lpmAbi;
            const relay = new utils.Interface([RELAY_ABI[kind].signature]);
            expect(SPONSORED_CALL_SELECTORS[kind]).toBe(
                RELAY_PINNED_SELECTORS[kind],
            );
            expect(SPONSORED_CALL_SELECTORS[kind]).toBe(
                relay.getSighash(RELAY_ABI[kind].name),
            );
            expect(SPONSORED_CALL_SELECTORS[kind]).toBe(
                sdkAbi.getSighash(RELAY_ABI[kind].name),
            );
        }
    });

    for (const kind of SPONSORED_CALL_KINDS) {
        it(`${kind}: the SDK's call passes the relay validator, with the layout it expects`, () => {
            const encoded = ENCODED[kind]();
            expect(encoded.kind).toBe(kind);
            // Exactly `{ to, data }`: the relay refuses any other key.
            expect(Object.keys(encoded.call).sort()).toEqual(['data', 'to']);
            expect(encoded.call.to).toBe(TARGET[kind]);
            expect(encoded.call.data.slice(0, 10)).toBe(
                RELAY_PINNED_SELECTORS[kind],
            );
            // Static arguments only: 4 + 32 × arity bytes, nothing trailing.
            expect(words(encoded.call.data)).toEqual(EXPECTED_WORDS[kind]);
            expect(encoded.call.data.length).toBe(
                2 + 8 + 64 * EXPECTED_WORDS[kind].length,
            );
            expect(() =>
                relayValidate(kind, [encoded.call], CHAIN),
            ).not.toThrow();
        });

        it(`${kind}: is refused by every OTHER kind's validator`, () => {
            const encoded = ENCODED[kind]();
            for (const other of SPONSORED_CALL_KINDS) {
                if (other === kind) continue;
                expect(() =>
                    relayValidate(other, [encoded.call], CHAIN),
                ).toThrow();
            }
        });
    }

    it('the restated validator is not vacuous: it refuses what the relay refuses', () => {
        const { call } = ENCODED.withdrawal();
        expect(() =>
            relayValidate('withdrawal', [call], {
                ...CHAIN,
                lendingPoolManager: OTHER,
            }),
        ).toThrow(/not to the LendingPoolManager/);
        expect(() =>
            relayValidate(
                'withdrawal',
                [{ ...call, data: `${call.data}00` }],
                CHAIN,
            ),
        ).toThrow(/canonical/);
        expect(() =>
            relayValidate('withdrawal', [{ ...call, value: 0 }], CHAIN),
        ).toThrow(/exactly \{ to, data \}/);
        expect(() => relayValidate('withdrawal', [call, call], CHAIN)).toThrow(
            /expected 1 call/,
        );
        const zeroShares = new utils.Interface([
            RELAY_ABI.withdrawal.signature,
        ]).encodeFunctionData('requestWithdrawal', [POOL, TRANCHE, 0]);
        expect(() =>
            relayValidate('withdrawal', [{ to: LPM, data: zeroShares }], CHAIN),
        ).toThrow(/amount is zero/);
    });

    it('`to` compares case-insensitively on the relay; the SDK passes the configured spelling through', () => {
        const mixed = '0x000000000000000000000000000000000000AbCd';
        const encoded = encodeCancelDepositCall(mixed, POOL, NFT_ID);
        expect(encoded.call.to).toBe(mixed);
        expect(() =>
            relayValidate('cancel_deposit', [encoded.call], {
                ...CHAIN,
                lendingPoolManager: mixed.toLowerCase(),
            }),
        ).not.toThrow();
    });
});

describe('transfer — cross-checked against validateTransferCall', () => {
    const transferData = (to: string, amount: BigNumber | number): string =>
        new utils.Interface([RELAY_ABI.transfer.signature]).encodeFunctionData(
            'transfer',
            [to, amount],
        );

    it('the SDK call is exactly the bytes the relay ABI encodes for the same arguments', () => {
        const { call } = encodeStableTransfer({
            stableAsset: STABLE,
            to: RECIPIENT,
            amount: AMOUNT,
        });
        expect(call).toEqual({
            to: STABLE,
            data: transferData(RECIPIENT, AMOUNT),
        });
        const { args } = relayValidate('transfer', [call], CHAIN);
        expect(String(args[0]).toLowerCase()).toBe(RECIPIENT);
        expect((args[1] as BigNumber).eq(AMOUNT)).toBe(true);
    });

    it('is not to the LendingPoolManager — the relay refuses a transfer sent anywhere but the stable asset', () => {
        const { call } = ENCODED.transfer();
        expect(() =>
            relayValidate('transfer', [{ ...call, to: LPM }], CHAIN),
        ).toThrow(/not to the stable asset/);
        expect(() =>
            relayValidate('transfer', [call], { ...CHAIN, stableAsset: OTHER }),
        ).toThrow(/not to the stable asset/);
    });

    it('the restated recipient rules are not vacuous: each refuses what the relay refuses', () => {
        const at =
            (to: string, amount: BigNumber | number = AMOUNT) =>
            (): unknown =>
                relayValidate(
                    'transfer',
                    [{ to: STABLE, data: transferData(to, amount) }],
                    CHAIN,
                );
        expect(at(RECIPIENT, 0)).toThrow(/amount is zero/);
        expect(at(constants.AddressZero)).toThrow(/zero address/);
        expect(at(CALLER)).toThrow(/is the caller/);
        expect(at(CALLER.toUpperCase().replace('0X', '0x'))).toThrow(
            /is the caller/,
        );
        expect(at(STABLE)).toThrow(/protocol contract/);
        expect(at(LPM)).toThrow(/protocol contract/);
        expect(at('0x000000000000000000000000000000000000ffff')).toThrow(
            /precompile/,
        );
        expect(at('0x0000000000000000000000000000000000010000')).not.toThrow();
    });

    it('a transfer is not a transferFrom, an approve or a trailing-byte variant', () => {
        const erc20 = IERC20MetadataAbi__factory.createInterface();
        const transferFrom = erc20.encodeFunctionData('transferFrom', [
            CALLER,
            RECIPIENT,
            AMOUNT,
        ]);
        const approve = erc20.encodeFunctionData('approve', [
            RECIPIENT,
            AMOUNT,
        ]);
        for (const data of [
            transferFrom,
            approve,
            `${ENCODED.transfer().call.data}00`,
        ]) {
            expect(() =>
                relayValidate('transfer', [{ to: STABLE, data }], CHAIN),
            ).toThrow();
        }
    });
});

describe('sponsored-call encoders — what they refuse', () => {
    const refusal = (fn: () => unknown): string => {
        try {
            fn();
        } catch (err) {
            expect(err).toBeInstanceOf(SponsoredCallInputError);
            return (err as SponsoredCallInputError).code;
        }
        throw new Error('expected a SponsoredCallInputError');
    };

    it('refuses zero shares — the contract reverts and the relay refuses it', () => {
        expect(
            refusal(() => encodeRequestWithdrawalCall(LPM, POOL, TRANCHE, 0)),
        ).toBe('zero-shares');
    });

    it('refuses negative, fractional, non-numeric and above-uint256 values', () => {
        expect(
            refusal(() => encodeRequestWithdrawalCall(LPM, POOL, TRANCHE, -1)),
        ).toBe('shares');
        expect(refusal(() => encodeCancelDepositCall(LPM, POOL, 1.5))).toBe(
            'nft-id',
        );
        expect(refusal(() => encodeCancelWithdrawalCall(LPM, POOL, 'x'))).toBe(
            'nft-id',
        );
        expect(
            refusal(() =>
                encodeWithdrawAtExpiryCall(
                    LPM,
                    POOL,
                    constants.MaxUint256.add(1),
                ),
            ),
        ).toBe('lock-id');
    });

    it('accepts the uint256 edges: id 0 and MaxUint256', () => {
        for (const id of [0, constants.MaxUint256]) {
            const encoded = encodeCancelDepositCall(LPM, POOL, id);
            expect(() =>
                relayValidate('cancel_deposit', [encoded.call], CHAIN),
            ).not.toThrow();
        }
    });

    it('refuses a malformed LendingPoolManager, pool or tranche address', () => {
        expect(
            refusal(() => encodeCancelDepositCall('0xpool', POOL, NFT_ID)),
        ).toBe('lending-pool-manager');
        expect(
            refusal(() => encodeCancelDepositCall(LPM, '0x12', NFT_ID)),
        ).toBe('pool');
        expect(
            refusal(() =>
                encodeRequestWithdrawalCall(LPM, POOL, 'tranche', SHARES),
            ),
        ).toBe('tranche');
    });

    it('transfer: refuses a zero, negative, fractional or above-uint256 amount', () => {
        const transfer = (amount: unknown) => (): SponsoredCall =>
            encodeStableTransfer({
                stableAsset: STABLE,
                to: RECIPIENT,
                amount: amount as BigNumber,
            });
        expect(refusal(transfer(0))).toBe('zero-amount');
        expect(refusal(transfer('0'))).toBe('zero-amount');
        expect(refusal(transfer(-1))).toBe('amount');
        expect(refusal(transfer(1.5))).toBe('amount');
        expect(refusal(transfer('ten'))).toBe('amount');
        expect(refusal(transfer(constants.MaxUint256.add(1)))).toBe('amount');
        expect(() => transfer(1)()).not.toThrow();
        expect(() => transfer(constants.MaxUint256)()).not.toThrow();
    });

    it('transfer: refuses a malformed or zero recipient and a malformed stable asset', () => {
        const transfer =
            (stableAsset: string, to: string) => (): SponsoredCall =>
                encodeStableTransfer({ stableAsset, to, amount: AMOUNT });
        expect(refusal(transfer(STABLE, '0x12'))).toBe('recipient');
        expect(refusal(transfer(STABLE, 'account'))).toBe('recipient');
        expect(refusal(transfer(STABLE, `${RECIPIENT} `))).toBe('recipient');
        expect(refusal(transfer(STABLE, constants.AddressZero))).toBe(
            'zero-recipient',
        );
        expect(refusal(transfer('0xusdc', RECIPIENT))).toBe('stable-asset');
    });

    it('transfer: leaves recipient POLICY to the relay — self, the token and the manager still encode', () => {
        // The relay owns these refusals (and the contract-code read it alone
        // can make); restating a subset here would be a second policy that
        // drifts. They encode, and the relay validator above refuses them.
        for (const to of [CALLER, STABLE, LPM]) {
            const { call } = encodeStableTransfer({
                stableAsset: STABLE,
                to,
                amount: AMOUNT,
            });
            expect(() => relayValidate('transfer', [call], CHAIN)).toThrow();
        }
    });

    it('names no party in its message, so it can never read as a user rejection', () => {
        const err = new SponsoredCallInputError('zero-shares');
        expect(err.message).not.toMatch(/user|wallet|reject|declin|cancel/i);
    });
});
