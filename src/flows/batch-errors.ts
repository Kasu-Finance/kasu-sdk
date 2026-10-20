/**
 * The errors an atomic-batch submitter throws, in one module both
 * `DepositFlow` and `submitBatch` import — so `instanceof` is one class
 * whichever of them a consumer imports it through.
 */

/**
 * What a `depositBatch` port throws when it KNOWS the batch reverted — from a
 * simulation before sending, from the submitter refusing to broadcast a batch
 * that would revert, or from a mined receipt whose user operation reverted.
 * The run ends `{ step: 'request', reason: 'reverted', revertError }`.
 *
 * `revertError` is the custom error the contract named (`'ClearingIsPending'`,
 * `'UserNotKycd'`, …), exactly as the ABI declares it. Pass `''` when the
 * batch is known to revert but not why: the consumer then renders its generic
 * `reverted` copy, which is what an unknown name gets anyway.
 *
 * A revert is DEFINITIVE — nothing was deposited. Throw it only when that is
 * known; anything less certain is a `BatchPendingError`.
 */
export class BatchRevertedError extends Error {
    readonly revertError: string;

    constructor(revertError: string, message?: string) {
        super(
            message ??
                `DepositFlow: the batch reverted${
                    revertError ? ` with ${revertError}` : ''
                }`,
        );
        this.name = 'BatchRevertedError';
        this.revertError = revertError;
        // Keeps `instanceof` honest under a down-levelled build.
        Object.setPrototypeOf(this, BatchRevertedError.prototype);
    }
}

/**
 * What became of a batch submission that did NOT end in a proven result and is
 * not a known revert:
 *
 * - `failed` — nothing was sent and nothing can land: refused before the
 *   batch left (no session, a validation mismatch, a definitive refusal).
 *   "Please try again" is true.
 * - `pending` — the batch was, or may have been, accepted, and nothing says
 *   whether it deposited. Calling that "failed" invites a second deposit; the
 *   lender is told it may still be processing.
 * - `already-submitted` — an earlier submission has since been proven, so this
 *   one is refused rather than lend twice.
 */
export type BatchSubmissionOutcome = 'failed' | 'pending' | 'already-submitted';

/**
 * Every non-revert failure of a batch submission, carrying its outcome and a
 * short code (`'status_timeout'`, `'receipt_unavailable'`, …).
 *
 * The message is fixed and names no party: the wallet-error classifier reads a
 * thrown error's text for a USER rejection, and a relay outage worded "…wallet
 * refused…" must never reach the lender as something they did.
 */
export class BatchSubmissionError extends Error {
    readonly code: string;
    readonly outcome: BatchSubmissionOutcome;

    constructor(
        code: string,
        outcome: BatchSubmissionOutcome = 'failed',
        options?: { cause?: unknown },
    ) {
        super(`Batch submission ${outcome} (${code})`);
        this.name = 'BatchSubmissionError';
        this.code = code;
        this.outcome = outcome;
        // Set by hand: `Error`'s own `cause` option is ES2022.
        if (options && 'cause' in options) {
            Object.defineProperty(this, 'cause', {
                value: options.cause,
                enumerable: false,
                writable: true,
                configurable: true,
            });
        }
        Object.setPrototypeOf(this, BatchSubmissionError.prototype);
    }
}

/**
 * The ambiguous outcome: the batch may have landed. An instance of
 * `BatchSubmissionError` with `outcome: 'pending'`.
 */
export class BatchPendingError extends BatchSubmissionError {
    constructor(code: string, options?: { cause?: unknown }) {
        super(code, 'pending', options);
        this.name = 'BatchPendingError';
        Object.setPrototypeOf(this, BatchPendingError.prototype);
    }
}

/** The outcome a thrown error stands for, or `null` if it is not a submission error. */
export function batchOutcomeOf(err: unknown): BatchSubmissionOutcome | null {
    return err instanceof BatchSubmissionError ? err.outcome : null;
}

/**
 * Nothing was deposited and nothing can be: a known revert, or a definitive
 * `failed` refusal. Everything else — including an error this SDK did not
 * produce — is NOT proof of that, and a consumer must not invite a retry on it.
 */
export function isDefinitivelyNotSubmitted(err: unknown): boolean {
    return (
        err instanceof BatchRevertedError || batchOutcomeOf(err) === 'failed'
    );
}
