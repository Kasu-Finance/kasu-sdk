import {
    DepositProof,
    DepositProofExpectation,
    proveDepositInReceipt,
    ReceiptLike,
} from '../domain/batch-proof';

import {
    BatchPendingError,
    BatchRevertedError,
    BatchSubmissionError,
} from './batch-errors';
import { WaitableTransaction } from './observable';

/**
 * Submitting a sponsored atomic deposit batch, from the accepted calls to a
 * PROVEN deposit — the polling policy and the outcome taxonomy, and nothing
 * else. No relay vendor, no URL, no wallet: the app's ports do the I/O, and
 * this decides what each answer MEANS.
 *
 * The one rule everything here serves: **an ambiguous result is never
 * reported as failed.** "Failed" tells a lender to try again, and a batch that
 * may already have moved the money must never invite a second deposit.
 */

/** One call of the batch. Structurally `BatchCall`. */
export interface SubmitBatchCall {
    to: string;
    data: string;
}

/**
 * One read of the submitted batch's status, already NORMALISED by the app's
 * port — the vendor's status vocabulary stays in the app.
 */
export type BatchStatusRead =
    /** Mined: a transaction hash exists. */
    | { kind: 'mined'; txHash: string; userOperationHash?: string | null }
    /** The vendor says, definitively, that it reverted: nothing deposited. */
    | { kind: 'reverted' }
    /**
     * Final for the vendor but silent about the deposit, or the status read
     * was refused: stop polling, outcome UNKNOWN (→ pending).
     */
    | { kind: 'unknown'; code: string }
    /** Not there yet, replaced, or a transient failure: ask again. */
    | { kind: 'again'; userOperationHash?: string | null };

export interface BatchSubmissionPorts<R extends ReceiptLike = ReceiptLike> {
    /**
     * Hand the batch to the submitter; resolve with its transaction id once it
     * is ACCEPTED.
     *
     * Throw `BatchRevertedError` when it is known to revert, and
     * `BatchSubmissionError(code, 'failed')` ONLY when nothing was sent — no
     * session, a refusal before broadcast. Any other throw is read as
     * PENDING: this cannot know whether an unrecognised error left before or
     * after the batch was accepted. Resending the same signed request after an
     * ambiguous answer is the port's business (it owns the wire protocol).
     */
    post(calls: readonly SubmitBatchCall[]): Promise<{ transactionId: string }>;
    /** One status read. A throw is treated as `{ kind: 'again' }`. */
    getStatus(transactionId: string): Promise<BatchStatusRead>;
    /**
     * The mined receipt. Bound it with a timeout of your own; a throw is
     * PENDING (`receipt_unavailable`) — the batch was mined, its receipt was
     * just not readable.
     */
    getReceipt(txHash: string): Promise<R>;
    /** ms epoch. */
    now(): number;
    sleep(ms: number): Promise<void>;
}

export interface BatchPollingPolicy {
    /** Delay before the second status read (the first is immediate). */
    initialMs: number;
    /** Ceiling on the delay between reads. */
    maxMs: number;
    /** Multiplier applied to the delay after each read, ≥ 1. */
    backoff: number;
    /** Stop polling — PENDING, never failed — after this long. */
    timeoutMs: number;
}

/**
 * First read at once, then 3 s backing off ×1.5 to a 10 s ceiling, for up to
 * 10 minutes. Running out of time is PENDING: the batch was accepted and may
 * still land.
 */
export const DEFAULT_BATCH_POLLING_POLICY: Readonly<BatchPollingPolicy> =
    Object.freeze({
        initialMs: 3_000,
        maxMs: 10_000,
        backoff: 1.5,
        timeoutMs: 10 * 60 * 1000,
    });

/** A proven deposit: the `deposited` proof and the receipt it was read from. */
export interface ProvenBatch<R extends ReceiptLike = ReceiptLike> {
    proof: Extract<DepositProof, { kind: 'deposited' }>;
    receipt: R;
    txHash: string;
}

/** What `submitBatch` resolves with once the batch is accepted. */
export interface BatchSubmission<R extends ReceiptLike = ReceiptLike>
    extends WaitableTransaction {
    transactionId: string;
    /**
     * Polls to a mined receipt and proves the deposit in it. Resolves ONLY on
     * a proven deposit. Rejects with `BatchRevertedError` when it definitively
     * did not deposit, and with `BatchPendingError` for everything else.
     */
    wait(): Promise<ProvenBatch<R>>;
}

function resolvePolicy(
    policy: Partial<BatchPollingPolicy> | undefined,
): BatchPollingPolicy {
    const resolved: BatchPollingPolicy = {
        initialMs: policy?.initialMs ?? DEFAULT_BATCH_POLLING_POLICY.initialMs,
        maxMs: policy?.maxMs ?? DEFAULT_BATCH_POLLING_POLICY.maxMs,
        backoff: policy?.backoff ?? DEFAULT_BATCH_POLLING_POLICY.backoff,
        timeoutMs: policy?.timeoutMs ?? DEFAULT_BATCH_POLLING_POLICY.timeoutMs,
    };
    const { initialMs, maxMs, backoff, timeoutMs } = resolved;
    if (
        !(Number.isFinite(initialMs) && initialMs > 0) ||
        !(Number.isFinite(maxMs) && maxMs >= initialMs) ||
        !(Number.isFinite(backoff) && backoff >= 1) ||
        !(Number.isFinite(timeoutMs) && timeoutMs > 0)
    ) {
        throw new TypeError('submitBatch: invalid polling policy');
    }
    return resolved;
}

/**
 * Submit `calls` and return once the submitter ACCEPTED them; `wait()` then
 * polls and proves. Use it as the body of a `DepositFlow` `depositBatch`
 * port, after `validateDepositBatchCalls` and the app's own signing:
 *
 * ```ts
 * depositBatch: (calls) => {
 *     const { tranche, amount } = validateDepositBatchCalls(calls, expected);
 *     return submitBatch(
 *         // `pendingPool`: the strategy's pending pool, so only ITS
 *         // `DepositRequested` can prove the deposit.
 *         { calls, expect: { lender, tranche, amount, pendingPool } },
 *         { post, getStatus, getReceipt, now: Date.now, sleep },
 *     );
 * },
 * ```
 *
 * | what happened                                        | outcome                                  |
 * | ---------------------------------------------------- | ---------------------------------------- |
 * | `post` throws `BatchRevertedError`                   | rethrown — reverted, nothing deposited   |
 * | `post` throws `BatchSubmissionError`                 | rethrown with its own outcome            |
 * | `post` throws anything else                          | `BatchPendingError('post_unknown')`      |
 * | `post` resolves without a transaction id             | `BatchPendingError('malformed_answer')`  |
 * | status `reverted`                                    | `BatchRevertedError('')`                 |
 * | status `unknown`                                     | `BatchPendingError(code)`                |
 * | polling runs out of time                             | `BatchPendingError('status_timeout')`    |
 * | receipt unreadable                                   | `BatchPendingError('receipt_unavailable')` |
 * | receipt: user operation reverted                     | `BatchRevertedError(revertError)`        |
 * | receipt: this deposit not shown                      | `BatchPendingError('deposit_unproven')`  |
 * | receipt: this lender's deposit, tranche and amount   | resolves `ProvenBatch`                   |
 *
 * Nothing on this path ever produces a `failed` outcome: by the time a batch
 * has been posted, only a revert proves that nothing was deposited.
 */
export async function submitBatch<R extends ReceiptLike = ReceiptLike>(
    input: {
        calls: readonly SubmitBatchCall[];
        /** What the receipt must show — see `proveDepositInReceipt`. */
        expect: Omit<DepositProofExpectation, 'userOperationHash'>;
    },
    ports: BatchSubmissionPorts<R>,
    policy?: Partial<BatchPollingPolicy>,
): Promise<BatchSubmission<R>> {
    const resolved = resolvePolicy(policy);

    let accepted: { transactionId: string };
    try {
        accepted = await ports.post(input.calls);
    } catch (err) {
        if (err instanceof BatchRevertedError) throw err;
        if (err instanceof BatchSubmissionError) throw err;
        throw new BatchPendingError('post_unknown', { cause: err });
    }
    const transactionId = (accepted as { transactionId?: unknown } | null)
        ?.transactionId;
    if (typeof transactionId !== 'string' || transactionId === '') {
        throw new BatchPendingError('malformed_answer');
    }

    let settled: Promise<ProvenBatch<R>> | null = null;
    return {
        transactionId,
        // Memoised: a second `wait()` reads the same outcome instead of
        // polling the submitter twice.
        wait: (): Promise<ProvenBatch<R>> =>
            (settled ??= settle(transactionId, input.expect, ports, resolved)),
    };
}

async function readStatus<R extends ReceiptLike>(
    ports: BatchSubmissionPorts<R>,
    transactionId: string,
): Promise<BatchStatusRead> {
    try {
        return await ports.getStatus(transactionId);
    } catch {
        return { kind: 'again' };
    }
}

/** Poll until a mined hash, or a typed reason there will not be one. */
async function waitForMined<R extends ReceiptLike>(
    transactionId: string,
    ports: BatchSubmissionPorts<R>,
    policy: BatchPollingPolicy,
): Promise<{ txHash: string; userOperationHash: string | null }> {
    const deadline = ports.now() + policy.timeoutMs;
    let userOperationHash: string | null = null;
    let delay = policy.initialMs;

    for (;;) {
        const read = await readStatus(ports, transactionId);
        switch (read.kind) {
            case 'mined':
                if (typeof read.txHash !== 'string' || read.txHash === '') {
                    break; // a malformed "mined" is not an answer; ask again
                }
                return {
                    txHash: read.txHash,
                    userOperationHash:
                        read.userOperationHash ?? userOperationHash,
                };
            case 'reverted':
                throw new BatchRevertedError('');
            case 'unknown':
                throw new BatchPendingError(read.code);
            case 'again':
                if (read.userOperationHash) {
                    userOperationHash = read.userOperationHash;
                }
                break;
            default:
                // A read the port did not normalise: not an answer.
                break;
        }
        if (ports.now() + delay > deadline) {
            throw new BatchPendingError('status_timeout');
        }
        await ports.sleep(delay);
        delay = Math.min(policy.maxMs, Math.round(delay * policy.backoff));
    }
}

async function settle<R extends ReceiptLike>(
    transactionId: string,
    expect: Omit<DepositProofExpectation, 'userOperationHash'>,
    ports: BatchSubmissionPorts<R>,
    policy: BatchPollingPolicy,
): Promise<ProvenBatch<R>> {
    const mined = await waitForMined(transactionId, ports, policy);
    let receipt: R;
    try {
        receipt = await ports.getReceipt(mined.txHash);
    } catch (err) {
        throw new BatchPendingError('receipt_unavailable', { cause: err });
    }
    let proof: DepositProof;
    try {
        proof = proveDepositInReceipt(receipt, {
            ...expect,
            userOperationHash: mined.userOperationHash,
        });
    } catch (err) {
        // A receipt the proof cannot even read proves nothing either way.
        throw new BatchPendingError('deposit_unproven', { cause: err });
    }
    if (proof.kind === 'reverted')
        throw new BatchRevertedError(proof.revertError);
    if (proof.kind === 'unproven')
        throw new BatchPendingError('deposit_unproven');
    return { proof, receipt, txHash: mined.txHash };
}

/**
 * What became of an earlier submission that ended PENDING — ONE status read,
 * no polling — for an app's guard against lending twice:
 *
 * - `deposited` — mined, and the receipt proves the deposit;
 * - `not-deposited` — definitively reverted (vendor status or the user
 *   operation's own flag);
 * - `unknown` — anything else, including a read or receipt that failed.
 *
 * Only `not-deposited` may let a new lend proceed unprompted; `deposited`
 * means the lender is told the earlier one landed (`already-submitted`).
 */
export async function checkBatchOutcome<R extends ReceiptLike = ReceiptLike>(
    transactionId: string,
    expect: Omit<DepositProofExpectation, 'userOperationHash'>,
    ports: Pick<BatchSubmissionPorts<R>, 'getStatus' | 'getReceipt'>,
): Promise<'deposited' | 'not-deposited' | 'unknown'> {
    let read: BatchStatusRead;
    try {
        read = await ports.getStatus(transactionId);
    } catch {
        return 'unknown';
    }
    if (read.kind === 'reverted') return 'not-deposited';
    if (read.kind !== 'mined' || typeof read.txHash !== 'string') {
        return 'unknown';
    }
    try {
        const receipt = await ports.getReceipt(read.txHash);
        const proof = proveDepositInReceipt(receipt, {
            ...expect,
            userOperationHash: read.userOperationHash ?? null,
        });
        if (proof.kind === 'deposited') return 'deposited';
        if (proof.kind === 'reverted') return 'not-deposited';
        return 'unknown';
    } catch {
        return 'unknown';
    }
}
