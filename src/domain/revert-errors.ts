import { ethers } from 'ethers';

import { IKasuAllowListAbi__factory } from '../contracts/factories/IKasuAllowListAbi__factory';
import { ILendingPoolManagerAbi__factory } from '../contracts/factories/ILendingPoolManagerAbi__factory';

/**
 * Revert decoding — turn the bytes a failed call came back with into the name
 * the contract actually reverted with.
 *
 * `isUnpredictableGas` says only THAT the call would revert. That was enough
 * while the answer was always the same one: a `transferFrom` failing on a
 * balance that cannot cover the deposit. It is not enough any more, because
 * `requestDepositWithKyc` reverts for a whole family of reasons the ABI
 * declares and the lender can do nothing about — the pool is stopped, the pool
 * is mid-clearing, their KYC lapsed, they are not on the allow list, the
 * allow-list signature's block window closed. Every one of those was reported
 * as "insufficient balance", so a fully funded lender was told to top up a
 * wallet that was never short.
 *
 * The revert data carries the answer. This module extracts it from whatever
 * envelope the provider wrapped it in and matches the 4-byte selector against
 * the custom errors the protocol declares.
 *
 * Pure, like everything else in `domain/`: bytes in, a name out. It never
 * decides what a lender is shown — `DepositFlow` maps the name to a code and
 * the application maps the code to its own words.
 */

// ---------------------------------------------------------------------------
// What a decoded revert is
// ---------------------------------------------------------------------------

/**
 * Which family a recognised revert belongs to, because the two are acted on
 * differently.
 *
 * `erc20` is the case `insufficient-balance` was named for and still means:
 * the token transfer itself failed, so the lender genuinely has to fund or
 * re-approve. `protocol` is everything else the protocol declares — a
 * condition of the pool or the lender's standing, which topping up cannot fix.
 */
export type RevertFamily = 'protocol' | 'erc20';

export interface DecodedRevert {
    /** The custom error's name, exactly as the ABI declares it. */
    name: string;
    family: RevertFamily;
    /** The reason of a `require(..., "…")` revert, when it was one. */
    reason?: string;
}

// ---------------------------------------------------------------------------
// The selector tables
// ---------------------------------------------------------------------------

/**
 * OpenZeppelin v5's ERC-20 errors. They are not in either Kasu ABI because no
 * Kasu contract declares them — they arrive from the TOKEN, through the
 * manager's `transferFrom`, and they are the modern spelling of the string
 * reverts below.
 */
const ERC20_ERROR_ABI = [
    'error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)',
    'error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)',
];

/**
 * The protocol errors that mean the ERC-20 transfer failed rather than the
 * protocol refusing.
 *
 * `SafeERC20FailedOperation` is OpenZeppelin's wrapper around a token call
 * that returned false or reverted, which on this path IS the `transferFrom`;
 * `AddressInsufficientBalance` is its native-value sibling. Both belong with
 * the balance case, not with the pool conditions — a lender who sees one of
 * them really does need to fund or re-approve.
 */
const ERC20_FAMILY_NAMES: ReadonlySet<string> = new Set([
    'AddressInsufficientBalance',
    'ERC20InsufficientAllowance',
    'ERC20InsufficientBalance',
    'SafeERC20FailedOperation',
]);

/** Solidity's `Error(string)`, the selector every `require` reason arrives under. */
const STRING_REVERT_SELECTOR = '0x08c379a0';

/**
 * The `require` reasons that are a balance or an allowance, across the token
 * implementations in circulation: OpenZeppelin v4's sentences, and the
 * shorthand the minimal implementations use.
 */
const ERC20_REASON_PATTERNS: readonly RegExp[] = [
    /exceeds\s+balance/,
    /exceeds\s+allowance/,
    /insufficient\s+balance/,
    /insufficient\s+allowance/,
    /transfer_from_failed/,
    /transferfrom\s+failed/,
    /low-level\s+call\s+failed/,
];

/**
 * selector → error name, built once on first use.
 *
 * Lazily, because a consumer that never sees a revert should not pay for three
 * `Interface` constructions at import. The two Kasu tables are the GENERATED
 * typechain ABIs, so this cannot drift from the contracts: regenerate the ABIs
 * and the new errors are recognised with no edit here.
 */
let selectorTable: Map<string, string> | null = null;

function selectors(): Map<string, string> {
    if (selectorTable) return selectorTable;
    const table = new Map<string, string>();
    const interfaces = [
        // The manager the deposit is called against, and the allow list it
        // delegates the KYC and block-window checks to.
        ILendingPoolManagerAbi__factory.createInterface(),
        IKasuAllowListAbi__factory.createInterface(),
        new ethers.utils.Interface(ERC20_ERROR_ABI),
    ];
    for (const iface of interfaces) {
        for (const fragment of Object.values(iface.errors)) {
            // First writer wins: the same name declared by both ABIs is the
            // same selector, so the duplicate would be a no-op anyway.
            const sighash = iface.getSighash(fragment);
            if (!table.has(sighash)) table.set(sighash, fragment.name);
        }
    }
    selectorTable = table;
    return table;
}

// ---------------------------------------------------------------------------
// Getting the bytes out of the envelope
// ---------------------------------------------------------------------------

/**
 * How deep to look for the revert data. Providers nest it differently —
 * ethers' own error wraps the provider's, which wraps the RPC body — and a
 * bound is what keeps a self-referencing error object from being walked
 * forever.
 */
const MAX_DEPTH = 6;

/** The keys ethers and the providers under it put a wrapped error on. */
const NESTED_KEYS = [
    'data',
    'error',
    'originalError',
    'info',
    'cause',
    'body',
] as const;

/** At least a 4-byte selector, and a whole number of bytes. */
function isRevertData(value: string): boolean {
    return (
        value.length >= 10 &&
        value.length % 2 === 0 &&
        /^0x[0-9a-fA-F]+$/.test(value)
    );
}

/**
 * Find the revert data on an error, wherever the provider left it.
 *
 * ethers v5 raises `UNPREDICTABLE_GAS_LIMIT` with the provider's own error
 * attached, and each provider nests the bytes one layer differently:
 * `error.data`, `error.error.data`, `error.data.originalError.data`, or only
 * inside the JSON `body` of a `SERVER_ERROR`. Rather than enumerate the
 * products, walk a fixed set of keys to a fixed depth and take the first value
 * that is shaped like revert data.
 */
export function extractRevertData(err: unknown): string | null {
    return walk(err, 0);
}

function walk(node: unknown, depth: number): string | null {
    if (node == null || depth > MAX_DEPTH) return null;
    if (typeof node === 'string') {
        if (isRevertData(node)) return node;
        // A `SERVER_ERROR`'s body: the RPC's JSON reply, verbatim.
        if (!node.startsWith('{')) return null;
        try {
            return walk(JSON.parse(node), depth + 1);
        } catch {
            return null;
        }
    }
    if (typeof node !== 'object') return null;
    const record = node as Record<string, unknown>;
    for (const key of NESTED_KEYS) {
        const found = walk(record[key], depth + 1);
        if (found) return found;
    }
    return null;
}

// ---------------------------------------------------------------------------
// Decoding
// ---------------------------------------------------------------------------

/**
 * Decode a failed call's revert into the error the contract named, or `null`
 * when there is nothing recognisable to name.
 *
 * `null` is the honest answer for an unknown selector, an unrelated `require`
 * string, or an error with no revert data at all — the caller keeps whatever
 * it did before rather than inventing a diagnosis from bytes it cannot read.
 */
export function decodeRevert(err: unknown): DecodedRevert | null {
    const data = extractRevertData(err);
    if (!data) return null;
    const selector = data.slice(0, 10).toLowerCase();

    if (selector === STRING_REVERT_SELECTOR) {
        const reason = decodeStringRevert(data);
        if (reason === null) return null;
        return isErc20Reason(reason)
            ? { name: 'Error', family: 'erc20', reason }
            : null;
    }

    const name = selectors().get(selector);
    if (!name) return null;
    return {
        name,
        family: ERC20_FAMILY_NAMES.has(name) ? 'erc20' : 'protocol',
    };
}

function decodeStringRevert(data: string): string | null {
    try {
        const [reason] = ethers.utils.defaultAbiCoder.decode(
            ['string'],
            `0x${data.slice(10)}`,
        ) as [string];
        return reason;
    } catch {
        return null;
    }
}

function isErc20Reason(reason: string): boolean {
    const lower = reason.toLowerCase();
    return ERC20_REASON_PATTERNS.some((pattern) => pattern.test(lower));
}
