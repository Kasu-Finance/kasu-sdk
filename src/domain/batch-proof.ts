import { BigNumber, BigNumberish, utils } from 'ethers';

import { IERC20MetadataAbi__factory } from '../contracts/factories/IERC20MetadataAbi__factory';
import { ILendingPoolManagerAbi__factory } from '../contracts/factories/ILendingPoolManagerAbi__factory';

import { decodeRevert } from './revert-errors';

/**
 * The money-path checks around an atomic, sponsored deposit batch — the
 * `approve + requestDepositWithKyc` pair `DepositFlow` hands its
 * `depositBatch` port.
 *
 * Two questions, both PURE:
 *
 * 1. Before anything is signed: is this batch exactly the deposit this run
 *    asked for? (`validateDepositBatchCalls`)
 * 2. After it is mined: did THIS receipt deposit THIS amount, for THIS
 *    lender, into THIS tranche? (`proveDepositInReceipt`)
 *
 * Neither knows a relay, a wallet vendor or a URL; the app's submitter calls
 * them.
 */

/**
 * ERC-4337 EntryPoint v0.7 — the contract a bundler calls `handleOps` on. The
 * proof reads the user operation's outcome from ITS events, and from no other
 * contract's.
 */
export const ENTRY_POINT_V07 = '0x0000000071727De22E5E9d8BAf0edAc6f37da032';

/** EntryPoint v0.7 events (eth-infinitism `IEntryPoint`). */
const ENTRY_POINT_EVENTS = new utils.Interface([
    'event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)',
    'event UserOperationRevertReason(bytes32 indexed userOpHash, address indexed sender, uint256 nonce, bytes revertReason)',
    'event BeforeExecution()',
]);

/** kasu-contracts `IPendingPool` — emitted by the strategy's pending pool. */
const PENDING_POOL_EVENTS = new utils.Interface([
    'event DepositRequested(address indexed user, address indexed tranche, uint256 indexed dNftID, uint256 epochId, uint256 amount)',
]);

const USER_OPERATION_EVENT =
    ENTRY_POINT_EVENTS.getEventTopic('UserOperationEvent');
const USER_OPERATION_REVERT_REASON = ENTRY_POINT_EVENTS.getEventTopic(
    'UserOperationRevertReason',
);
const BEFORE_EXECUTION = ENTRY_POINT_EVENTS.getEventTopic('BeforeExecution');
const DEPOSIT_REQUESTED = PENDING_POOL_EVENTS.getEventTopic('DepositRequested');

const ERC20 = IERC20MetadataAbi__factory.createInterface();
const LENDING_POOL_MANAGER = ILendingPoolManagerAbi__factory.createInterface();

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

/**
 * Case-insensitive address equality; `false` for anything that is not a
 * 20-byte hex address. Checksums are not enforced — an all-lowercase address
 * is the subgraph's own spelling.
 */
function sameAddress(a: unknown, b: unknown): boolean {
    return (
        typeof a === 'string' &&
        typeof b === 'string' &&
        ADDRESS_RE.test(a) &&
        ADDRESS_RE.test(b) &&
        a.toLowerCase() === b.toLowerCase()
    );
}

function isHexData(value: unknown): value is string {
    return typeof value === 'string' && utils.isHexString(value);
}

// ---------------------------------------------------------------------------
// Before signing — the batch is the run's own deposit
// ---------------------------------------------------------------------------

/** One call of a batch, as a submitter receives it. */
export interface DepositBatchCall {
    to: string;
    data: string;
    /** Native value. Absent or zero — neither call may send the native token. */
    value?: BigNumberish;
}

/** What the run asked for. Every field is pinned on the batch. */
export interface DepositBatchExpectation {
    /** The ERC-20 the deposit is paid in — the approval's target. */
    stableAsset: string;
    /** The contract approved AND called: the chain's `LendingPoolManager`. */
    spender: string;
    poolId: string;
    trancheId: string;
    /** The run's amount, in BASE units — approved and deposited, exactly. */
    amount: BigNumberish;
    /**
     * The run's fixed-term config (`'0'` = variable). REQUIRED: a batch that
     * locks the deposit into another term — or unlocks a fixed-term run into
     * variable — is a different deposit, and `DepositFlow` always carries the
     * value, so there is no consumer that genuinely lacks it.
     */
    fixedTermConfigId: BigNumberish;
}

export interface ValidatedDepositBatch {
    /** The tranche the deposit goes into — what the receipt proof matches. */
    tranche: string;
    /** The exact amount approved and deposited, in base units. */
    amount: BigNumber;
}

/**
 * What `validateDepositBatchCalls` throws. `code` says which pin failed; the
 * message names no party, so a wallet-rejection classifier can never read it
 * as something the lender did.
 */
export class DepositBatchMismatchError extends Error {
    readonly code: string;

    constructor(code: string) {
        super(`Deposit batch does not match the run (${code})`);
        this.name = 'DepositBatchMismatchError';
        this.code = code;
        Object.setPrototypeOf(this, DepositBatchMismatchError.prototype);
    }
}

function mismatch(code: string): never {
    throw new DepositBatchMismatchError(code);
}

function isCallShape(call: unknown): call is DepositBatchCall {
    if (call === null || typeof call !== 'object') return false;
    const { to, data } = call as Record<string, unknown>;
    return typeof to === 'string' && ADDRESS_RE.test(to) && isHexData(data);
}

function isZeroValue(value: BigNumberish | undefined): boolean {
    if (value === undefined) return true;
    try {
        return BigNumber.from(value).isZero();
    } catch {
        return false;
    }
}

function sameAmount(a: unknown, b: BigNumber): boolean {
    return BigNumber.isBigNumber(a) && a.eq(b);
}

/**
 * Decode `data` as a call to `name` on `iface`, and refuse it unless it is
 * the CANONICAL encoding of what it decodes to. The ABI decoder tolerates
 * trailing bytes and non-minimal offsets; a signature over bytes that decode
 * "the same" but are not the bytes the SDK produced is not a signature over
 * this run's deposit.
 */
function decodeCanonical(
    iface: utils.Interface,
    name: string,
    data: string,
    code: string,
): utils.Result {
    let parsed: utils.TransactionDescription;
    try {
        parsed = iface.parseTransaction({ data });
    } catch {
        return mismatch(code);
    }
    if (parsed.name !== name) return mismatch(code);
    let canonical: string;
    try {
        canonical = iface.encodeFunctionData(
            parsed.functionFragment,
            parsed.args,
        );
    } catch {
        return mismatch(code);
    }
    if (canonical.toLowerCase() !== data.toLowerCase()) {
        return mismatch('non-canonical-encoding');
    }
    return parsed.args;
}

/**
 * Pin a deposit batch to the run that produced it — PURE; throws a
 * `DepositBatchMismatchError` on ANY deviation, before the lender's key signs
 * anything.
 *
 * The batch must be exactly two calls, in this order, with no native value:
 *
 * 0. `stableAsset.approve(spender, A)`;
 * 1. `spender.requestDepositWithKyc(poolId, trancheId, A, '0x', fixedTermConfigId, …)`;
 *
 * with `A` the run's own amount in BOTH — never more, never unlimited (house
 * rule: exact-amount approvals) — the run's own fixed-term config, each call
 * the canonical ABI encoding of its arguments, and no swap data. The deposit
 * data and KYC signature are not pinned here: they are signatures the
 * contract and the backend verify.
 *
 * This is the client's half; a relaying backend checks the same shape again.
 */
export function validateDepositBatchCalls(
    calls: readonly DepositBatchCall[],
    expected: DepositBatchExpectation,
): ValidatedDepositBatch {
    const amount = BigNumber.from(expected.amount);
    if (amount.lte(0)) mismatch('non-positive-amount');

    if (!Array.isArray(calls) || calls.length !== 2) mismatch('call-count');
    const [approveCall, depositCall] = calls as [
        DepositBatchCall,
        DepositBatchCall,
    ];
    for (const call of [approveCall, depositCall] as unknown[]) {
        if (!isCallShape(call)) mismatch('malformed-call');
        if (!isZeroValue(call.value)) mismatch('native-value');
    }

    // 0 — the approval.
    if (!sameAddress(approveCall.to, expected.stableAsset)) {
        mismatch('approve-token');
    }
    const [approveSpender, approveAmount] = decodeCanonical(
        ERC20,
        'approve',
        approveCall.data,
        'approve-call',
    );
    if (!sameAddress(approveSpender, expected.spender)) {
        mismatch('approve-spender');
    }

    // 1 — the deposit.
    if (!sameAddress(depositCall.to, expected.spender)) {
        mismatch('deposit-target');
    }
    const [pool, tranche, maxAmount, swapData, fixedTermConfigId] =
        decodeCanonical(
            LENDING_POOL_MANAGER,
            'requestDepositWithKyc',
            depositCall.data,
            'deposit-call',
        );
    if (!sameAddress(pool, expected.poolId)) mismatch('deposit-pool');
    if (!sameAddress(tranche, expected.trancheId)) mismatch('deposit-tranche');
    if (swapData !== '0x') mismatch('swap-data');
    if (
        !sameAmount(
            fixedTermConfigId,
            BigNumber.from(expected.fixedTermConfigId),
        )
    ) {
        mismatch('fixed-term-config');
    }

    // EXACT amount, on both calls, equal to the run's.
    if (!sameAmount(approveAmount, amount)) mismatch('approve-amount');
    if (!sameAmount(maxAmount, amount)) mismatch('deposit-amount');

    return { tranche: tranche as string, amount };
}

// ---------------------------------------------------------------------------
// After mining — the receipt proves THIS deposit
// ---------------------------------------------------------------------------

/** A mined log, as an ethers (or any) receipt carries it. */
export interface ReceiptLog {
    address: string;
    topics: readonly string[];
    data: string;
}

/** The two receipt fields the proof reads. An ethers v5 receipt fits. */
export interface ReceiptLike {
    logs: readonly ReceiptLog[];
    blockNumber: number;
}

export interface DepositProofExpectation {
    /** The lender — the user operation's `sender`, and the deposit's `user`. */
    lender: string;
    tranche: string;
    /** The exact amount deposited, in base units. */
    amount: BigNumberish;
    /**
     * The user operation hash, when the submitter knows it. With it, only
     * THAT operation counts; without it, the lender's ONLY operation in the
     * bundle does — two of them without a hash is `ambiguous-operation`.
     */
    userOperationHash?: string | null;
    /** Defaults to `ENTRY_POINT_V07`. */
    entryPoint?: string;
    /**
     * The strategy's pending pool. When supplied, a `DepositRequested` counts
     * only if THAT contract emitted it.
     */
    pendingPool?: string;
}

export type DepositProof =
    /** This receipt shows this lender's deposit of this amount, in this tranche. */
    | { kind: 'deposited'; dNftId: BigNumber; blockNumber: number }
    /**
     * The user operation ran and reverted — the account rolled both calls
     * back, nothing was deposited. `revertError` is the protocol error it
     * named, or `''`.
     */
    | { kind: 'reverted'; revertError: string }
    /** The receipt does not show this deposit. NEVER a success, never a failure. */
    | {
          kind: 'unproven';
          reason:
              | 'no-user-operation'
              | 'ambiguous-operation'
              | 'no-deposit-requested'
              | 'malformed-receipt';
      };

/** A log's first topic, lowercased; `undefined` for a log without a topic array. */
function topicOf(log: ReceiptLog): string | undefined {
    return Array.isArray(log.topics as unknown)
        ? log.topics[0]?.toLowerCase()
        : undefined;
}

function parse(
    iface: utils.Interface,
    log: ReceiptLog,
): utils.LogDescription | null {
    try {
        return iface.parseLog({ topics: [...log.topics], data: log.data });
    } catch {
        return null;
    }
}

/**
 * Did THIS receipt deposit for THIS lender? — PURE.
 *
 * A sponsored batch lands as a bundler's `handleOps` transaction, and that
 * transaction's `status` is success even when the user operation inside it
 * reverted: the EntryPoint catches the revert, the account rolls back both
 * calls, nothing is deposited. So `status` decides NOTHING. What does:
 *
 *  1. The EntryPoint's `UserOperationEvent` for OUR operation — emitted BY
 *     the EntryPoint, `sender` = lender, and `userOpHash` = the known hash
 *     when there is one.
 *  2. Its `success` flag. `false` → `reverted`, naming the protocol error
 *     from the matching `UserOperationRevertReason` when it decodes.
 *  3. A `DepositRequested` with `user` = lender, `tranche` = the run's and
 *     `amount` = the run's, INSIDE our operation's execution: the logs after
 *     the previous operation's event (or `BeforeExecution`, which precedes
 *     the first) and before ours. A deposit from another operation in the
 *     same bundle does not count, and neither does one emitted by a contract
 *     that is not the pending pool, when the pending pool is known.
 *
 * Anything short of all three is `unproven`, which a consumer must treat as
 * PENDING — the money may have moved — and never as a failure.
 */
export function proveDepositInReceipt(
    receipt: ReceiptLike,
    expected: DepositProofExpectation,
): DepositProof {
    // Typed as an array, but a receipt is foreign data: check before reading.
    if (!Array.isArray(receipt.logs as unknown)) {
        return { kind: 'unproven', reason: 'malformed-receipt' };
    }
    const amount = BigNumber.from(expected.amount);
    const op = locateUserOperation(receipt.logs, {
        sender: expected.lender,
        userOperationHash: expected.userOperationHash,
        entryPoint: expected.entryPoint,
    });
    if (op === null) return { kind: 'unproven', reason: 'no-user-operation' };
    if (op === 'ambiguous') {
        return { kind: 'unproven', reason: 'ambiguous-operation' };
    }

    if (!op.success) {
        return { kind: 'reverted', revertError: op.revertError() };
    }

    for (const log of op.window) {
        if (topicOf(log) !== DEPOSIT_REQUESTED) continue;
        if (
            expected.pendingPool !== undefined &&
            !sameAddress(log.address, expected.pendingPool)
        ) {
            continue;
        }
        const decoded = parse(PENDING_POOL_EVENTS, log);
        if (decoded?.name !== 'DepositRequested') continue;
        if (!sameAddress(decoded.args.user, expected.lender)) continue;
        if (!sameAddress(decoded.args.tranche, expected.tranche)) continue;
        if (!sameAmount(decoded.args.amount, amount)) continue;
        return {
            kind: 'deposited',
            dNftId: decoded.args.dNftID as BigNumber,
            blockNumber: receipt.blockNumber,
        };
    }
    return { kind: 'unproven', reason: 'no-deposit-requested' };
}

export interface UserOperationProofExpectation {
    /** The account that sent the operation — the lender's own wallet. */
    sender: string;
    /**
     * The user operation hash, when the submitter knows it. With it, only
     * THAT operation counts; without it, the sender's ONLY operation in the
     * bundle does — two of them without a hash is `ambiguous-operation`.
     */
    userOperationHash?: string | null;
    /** Defaults to `ENTRY_POINT_V07`. */
    entryPoint?: string;
}

export type UserOperationProof =
    /** The sender's operation ran and SUCCEEDED: every call in it executed. */
    | { kind: 'executed'; blockNumber: number }
    /**
     * The operation ran and reverted — the account rolled its calls back.
     * `revertError` is the protocol error it named, or `''`.
     */
    | { kind: 'reverted'; revertError: string }
    /**
     * The receipt does not show the operation — or, with no hash to go by,
     * shows TWO of the sender's and cannot tell which is ours. NEVER a
     * success, never a failure.
     */
    | {
          kind: 'unproven';
          reason:
              | 'no-user-operation'
              | 'ambiguous-operation'
              | 'malformed-receipt';
      };

/**
 * Did THIS receipt execute the sender's user operation? — PURE. The
 * single-call sibling of `proveDepositInReceipt`, for a sponsored
 * `requestWithdrawal`, a cancel or a fixed-term withdrawal: the same
 * EntryPoint `UserOperationEvent` from the same contract, for the same
 * sender (and hash, when known), read the same way — the `handleOps`
 * transaction's own `status` decides NOTHING, because it is a success even
 * when the operation inside it reverted.
 *
 * `executed` needs the operation's `success` flag. A single-call operation
 * that succeeded executed its one call; there is no event to match beyond
 * that, so pass the `userOperationHash` whenever the submitter reports one —
 * without it, the sender's ONLY operation in the bundle is the one read, and a
 * bundle holding two of theirs is `ambiguous-operation` (pending), never the
 * first one's verdict: with one succeeded and one reverted, "executed" would
 * tell the lender their request is queued when it is not.
 */
export function proveUserOperationInReceipt(
    receipt: ReceiptLike,
    expected: UserOperationProofExpectation,
): UserOperationProof {
    if (!Array.isArray(receipt.logs as unknown)) {
        return { kind: 'unproven', reason: 'malformed-receipt' };
    }
    const op = locateUserOperation(receipt.logs, expected);
    if (op === null) return { kind: 'unproven', reason: 'no-user-operation' };
    if (op === 'ambiguous') {
        return { kind: 'unproven', reason: 'ambiguous-operation' };
    }
    if (!op.success) {
        return { kind: 'reverted', revertError: op.revertError() };
    }
    return { kind: 'executed', blockNumber: receipt.blockNumber };
}

/**
 * The sender's user operation in a `handleOps` receipt — its `success` flag
 * and its execution window — `null` when the receipt does not show one, or
 * `'ambiguous'` when no hash was given and it shows more than one of theirs.
 *
 *  - The `UserOperationEvent` must be emitted BY the EntryPoint, with
 *    `sender` = the expected sender and, when one is known, `userOpHash` =
 *    the expected hash. Without a hash the sender must have exactly ONE
 *    operation in the bundle: a bundler may pack two of theirs (sequential
 *    nonces, or parallel nonce keys), and reading the first would attribute
 *    the other one's verdict to this call.
 *  - The window is the logs after the previous operation's event (or
 *    `BeforeExecution`, which precedes the first) and before ours: what our
 *    operation's calls emitted, and nothing another operation in the same
 *    bundle did.
 */
function locateUserOperation(
    logs: readonly ReceiptLog[],
    expected: UserOperationProofExpectation,
):
    | {
          success: boolean;
          window: readonly ReceiptLog[];
          revertError: () => string;
      }
    | null
    | 'ambiguous' {
    const entryPoint = expected.entryPoint ?? ENTRY_POINT_V07;
    const wantedHash = expected.userOperationHash?.toLowerCase() ?? null;
    const fromEntryPoint = (log: ReceiptLog): boolean =>
        sameAddress(log.address, entryPoint);

    let opIndex = -1;
    let success = false;
    for (let i = 0; i < logs.length; i += 1) {
        const log = logs[i];
        if (!fromEntryPoint(log) || topicOf(log) !== USER_OPERATION_EVENT) {
            continue;
        }
        const decoded = parse(ENTRY_POINT_EVENTS, log);
        if (decoded?.name !== 'UserOperationEvent') continue;
        const userOpHash = String(decoded.args.userOpHash).toLowerCase();
        if (wantedHash !== null && userOpHash !== wantedHash) continue;
        if (!sameAddress(decoded.args.sender, expected.sender)) continue;
        // A second operation of this sender, and no hash to tell them apart.
        if (opIndex >= 0) return 'ambiguous';
        opIndex = i;
        success = decoded.args.success === true;
        // A hash names exactly one operation; without one, keep scanning so
        // a second operation of the sender is noticed.
        if (wantedHash !== null) break;
    }
    if (opIndex < 0) return null;

    // Our operation's execution window.
    let windowStart = 0;
    for (let i = opIndex - 1; i >= 0; i -= 1) {
        const log = logs[i];
        const topic = topicOf(log);
        if (
            fromEntryPoint(log) &&
            (topic === USER_OPERATION_EVENT || topic === BEFORE_EXECUTION)
        ) {
            windowStart = i + 1;
            break;
        }
    }
    const window = logs.slice(windowStart, opIndex);
    return {
        success,
        window,
        revertError: (): string =>
            revertErrorIn(window, expected.sender, fromEntryPoint),
    };
}

/**
 * The protocol error a reverted operation named, or `''`. Only a PROTOCOL
 * error is passed on: an `Error(string)` or an ERC-20 failure is not a name a
 * consumer has words for.
 */
function revertErrorIn(
    window: readonly ReceiptLog[],
    lender: string,
    fromEntryPoint: (log: ReceiptLog) => boolean,
): string {
    for (const log of window) {
        if (!fromEntryPoint(log)) continue;
        // Through the same guard as the main loop: a malformed log beside the
        // revert reason must not turn a DEFINITIVE revert into "pending".
        if (topicOf(log) !== USER_OPERATION_REVERT_REASON) continue;
        const decoded = parse(ENTRY_POINT_EVENTS, log);
        if (decoded?.name !== 'UserOperationRevertReason') continue;
        if (!sameAddress(decoded.args.sender, lender)) continue;
        const revert = decodeRevert(decoded.args.revertReason);
        return revert?.family === 'protocol' ? revert.name : '';
    }
    return '';
}
