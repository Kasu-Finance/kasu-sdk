/**
 * The SDK's sponsored-call encoders, cross-checked against the relay that
 * will judge them.
 *
 * The relay (kasu-backend `src/lending-relay/deposit-relay.calls.ts`, kinds
 * added in v2) accepts a single-call request only when the call is EXACTLY
 * `{ to, data }`, `to` is the chain's `LendingPoolManager`, and `data` decodes
 * against ONE function's ABI and re-encodes to the same bytes — plus
 * `shares > 0` for a withdrawal. Its decoder is viem; this file restates that
 * validator in ethers, line for line, with the relay's own function
 * signatures and its own pinned selectors copied below VERBATIM. If the SDK's
 * ABI, the relay's ABI or either side's encoding moves, a spec here goes red.
 *
 * Fixtures are synthetic, low-entropy addresses (`0x…0001`-style) only.
 */
import { BigNumber, constants, utils } from 'ethers';

import { ILendingPoolManagerAbi__factory } from '../contracts/factories/ILendingPoolManagerAbi__factory';

import {
    encodeCancelDepositCall,
    encodeCancelWithdrawalCall,
    encodeRequestWithdrawalCall,
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
};

/** The selectors deposit-relay.kinds.spec.ts pins, as the relay types them. */
const RELAY_PINNED_SELECTORS: Record<SponsoredCallKind, string> = {
    withdrawal: '0x8985646a',
    cancel_deposit: '0xd76cca03',
    cancel_withdrawal: '0x64ea50b6',
    withdraw_at_expiry: '0xf4207218',
};

/** `MAX_CALL_DATA_HEX_CHARS` in deposit-relay.calls.ts. */
const MAX_CALL_DATA_HEX_CHARS = 32_768;
const HEX_DATA_RE = /^0x(?:[0-9a-fA-F]{2})*$/;
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

/**
 * `validateRelayCalls(kind, rawCalls, chain, caller)` for the four single-call
 * kinds, restated: `parseCall` → `sameAddress(to, lpm)` → `decodeExactly` →
 * the kind's own rule. Throws a string reason, as the relay's
 * `InvalidRelayCalls` does.
 */
function relayValidate(
    kind: SponsoredCallKind,
    rawCalls: unknown[],
    lendingPoolManager: string,
): { args: utils.Result } {
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
    if (to.toLowerCase() !== lendingPoolManager.toLowerCase()) {
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
};

/** What each kind's arguments must be, word by word. */
const EXPECTED_WORDS: Record<SponsoredCallKind, string[]> = {
    withdrawal: [addressWord(POOL), addressWord(TRANCHE), uintWord(SHARES)],
    cancel_deposit: [addressWord(POOL), uintWord(NFT_ID)],
    cancel_withdrawal: [addressWord(POOL), uintWord(NFT_ID)],
    withdraw_at_expiry: [addressWord(POOL), uintWord(NFT_ID)],
};

describe('sponsored calls — cross-checked against the relay validator', () => {
    it('names exactly the four single-call LPM kinds, every one a relay kind', () => {
        expect([...SPONSORED_CALL_KINDS]).toEqual([
            'withdrawal',
            'cancel_deposit',
            'cancel_withdrawal',
            'withdraw_at_expiry',
        ]);
        for (const kind of SPONSORED_CALL_KINDS) {
            expect(RELAY_KINDS).toContain(kind);
        }
    });

    it('derives each selector from the ABI, equal to the relay’s pinned one and to its own signature', () => {
        const sdkAbi = ILendingPoolManagerAbi__factory.createInterface();
        for (const kind of SPONSORED_CALL_KINDS) {
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
            expect(encoded.call.to).toBe(LPM);
            expect(encoded.call.data.slice(0, 10)).toBe(
                RELAY_PINNED_SELECTORS[kind],
            );
            // Static arguments only: 4 + 32 × arity bytes, nothing trailing.
            expect(words(encoded.call.data)).toEqual(EXPECTED_WORDS[kind]);
            expect(encoded.call.data.length).toBe(
                2 + 8 + 64 * EXPECTED_WORDS[kind].length,
            );
            expect(() =>
                relayValidate(kind, [encoded.call], LPM),
            ).not.toThrow();
        });

        it(`${kind}: is refused by every OTHER kind's validator`, () => {
            const encoded = ENCODED[kind]();
            for (const other of SPONSORED_CALL_KINDS) {
                if (other === kind) continue;
                expect(() =>
                    relayValidate(other, [encoded.call], LPM),
                ).toThrow();
            }
        });
    }

    it('the restated validator is not vacuous: it refuses what the relay refuses', () => {
        const { call } = ENCODED.withdrawal();
        expect(() => relayValidate('withdrawal', [call], OTHER)).toThrow(
            /not to the LendingPoolManager/,
        );
        expect(() =>
            relayValidate(
                'withdrawal',
                [{ ...call, data: `${call.data}00` }],
                LPM,
            ),
        ).toThrow(/canonical/);
        expect(() =>
            relayValidate('withdrawal', [{ ...call, value: 0 }], LPM),
        ).toThrow(/exactly \{ to, data \}/);
        expect(() => relayValidate('withdrawal', [call, call], LPM)).toThrow(
            /expected 1 call/,
        );
        const zeroShares = new utils.Interface([
            RELAY_ABI.withdrawal.signature,
        ]).encodeFunctionData('requestWithdrawal', [POOL, TRANCHE, 0]);
        expect(() =>
            relayValidate('withdrawal', [{ to: LPM, data: zeroShares }], LPM),
        ).toThrow(/amount is zero/);
    });

    it('`to` compares case-insensitively on the relay; the SDK passes the configured spelling through', () => {
        const mixed = '0x000000000000000000000000000000000000AbCd';
        const encoded = encodeCancelDepositCall(mixed, POOL, NFT_ID);
        expect(encoded.call.to).toBe(mixed);
        expect(() =>
            relayValidate(
                'cancel_deposit',
                [encoded.call],
                mixed.toLowerCase(),
            ),
        ).not.toThrow();
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
                relayValidate('cancel_deposit', [encoded.call], LPM),
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

    it('names no party in its message, so it can never read as a user rejection', () => {
        const err = new SponsoredCallInputError('zero-shares');
        expect(err.message).not.toMatch(/user|wallet|reject|declin|cancel/i);
    });
});
