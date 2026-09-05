import { UserRequestStatus } from '../services/UserLending/subgraph-types';
import {
    UserRequest,
    UserRequestEvent,
} from '../services/UserLending/types';

/**
 * The lending-request view model, as CODES.
 *
 * Lifted verbatim from kasu-ui's `derive-transaction-view.ts` +
 * `request-bundle.ts`, minus every word. kasu-ui's `deriveTransactionView`
 * produces a `TransactionView` that mixes derived FACTS (status code, amounts,
 * kind, ids, submission count, timestamps) with COPY (the status word, the
 * type label, the detail line beneath it, tooltip keys). Only the facts belong
 * in this layer: the copy stays in each application, where the design system,
 * the register and the visitor's language are.
 *
 * The branch ORDER below is the behaviour — cancelled beats forced beats
 * reallocated beats a live withdrawal remainder beats the resolved outcomes
 * beats pending. It reproduces `deriveTransactionView` check for check, so a
 * consumer that renders its own words on top of `statusCode` gets exactly the
 * row kasu-ui has been showing.
 */

/**
 * Stable status code for filters, tests and the caller's own status word.
 * Independent of any user-facing copy — kasu-ui's four-value vocabulary
 * (Queued / Processing / Completed / Cancelled) is a rendering of these seven
 * codes, not a replacement for them.
 */
export type RequestStatusCode =
    | 'pending'
    | 'complete'
    | 'partial'
    | 'rejected'
    | 'reallocated'
    | 'cancelled'
    | 'forced';

/**
 * Direction of value flow into / out of the lender's balance. `neutral`
 * applies when the request was cancelled or fully rejected — nothing moved.
 */
export type RequestKind = 'inflow' | 'outflow' | 'neutral';

/** One derived request row. Every field is a number, a code or an id. */
export interface RequestState {
    /** `UserRequest.id`. */
    id: string;
    /**
     * Id the loan contract is retrieved by — sourced from the `Initiated`
     * event (format `${requestId}-${index}`). The agreements upstream keys
     * contract metadata by EVENT id, not request id; passing `id` returns
     * "Signature data not found". Empty string when there is no `Initiated`
     * event (e.g. a withdrawal).
     */
    contractId: string;
    /** Pool address, lowercased — the filter/join key. */
    poolId: string;
    /**
     * Pool name exactly as it arrived. RAW: splitting it into a strategy name
     * and its borrower-type subheading (kasu-ui's `splitPoolName`) is a
     * display decision and stays in the application.
     */
    poolName: string;
    /**
     * Tranche name exactly as the subgraph reports it. RAW: apps call
     * `getTrancheDisplayName(state.trancheName, { poolName: state.poolName })`
     * at the view boundary. A renamed value must never reach matching or
     * ranking code.
     */
    trancheName: string;
    /** Tranche id — the resolve API re-renders a fixed-term contract against it. */
    trancheId: string;
    /** Fixed-term configId, `'0'` for a variable-rate request. */
    fixedTermConfigId: string;
    requestType: 'Deposit' | 'Withdrawal';
    /** The subgraph status, untouched. Sticky — see `cycleClosed`. */
    rawStatus: UserRequest['status'];
    statusCode: RequestStatusCode;
    kind: RequestKind;
    /**
     * The amount originally asked for, always positive. A cancelled request
     * has its on-request `requestedAmount` zeroed by the subgraph, so the
     * original is recovered from the `Initiated` event (see
     * `initiatedAmount`).
     */
    requestedAmount: number;
    /**
     * The accepted figure as the subgraph reported it, or `null` when it
     * reported none. `null` is NOT zero: an absent figure means "not known",
     * and a caller that renders it as 0 states an outcome the chain has not
     * given. The branch logic below reads `null` as 0 — exactly what kasu-ui's
     * `num()` does — but the distinction survives into the row.
     */
    acceptedAmount: number | null;
    /**
     * `assetAmount` of the `Initiated` event, or `null` when the request
     * carries no `Initiated` event. This is the cancelled-amount recovery:
     * the subgraph resets a cancelled request's `requestedAmount` to 0 (the
     * lender's effective balance is restored) and the original survives only
     * here.
     */
    initiatedAmount: number | null;
    /**
     * The signed figure the row shows, chosen by the same branch logic
     * kasu-ui uses: positive for an inflow, negative for an outflow, 0 for a
     * cancelled or fully-rejected request.
     */
    amount: number;
    /**
     * Submissions bundled into this dNFT-aggregate row (`Initiated` +
     * `Increased`). `> 1` is what drives kasu-ui's inline "(x2)".
     */
    submissionCount: number;
    /**
     * Timestamp of the FIRST submission in the bundle, or `null` when the
     * bundle carries no submission event yet (the `Initiated` event has not
     * indexed). kasu-ui substitutes `request.timestamp` there; that fallback
     * is the application's to choose, so this layer reports the absence.
     */
    firstSubmissionTimestamp: number | null;
    /** Has THIS request's cycle closed? — `!canCancel`. See `isCycleClosed`. */
    cycleClosed: boolean;
    /** The SDK's per-pool cancel signal, passed through. */
    canCancel: boolean;
}

/**
 * Events that represent a lender SUBMISSION into the bundle. A dNFT position
 * aggregates every submission the lender made into the same pool/tranche this
 * cycle: the first is `Initiated`, each subsequent top-up is `Increased`.
 * Everything else on the timeline (Accepted / Rejected / Cancelled /
 * Reallocated / Forced) is an OUTCOME, not a request, and must not be counted.
 */
const SUBMISSION_EVENTS: ReadonlySet<UserRequestEvent['requestType']> = new Set(
    ['Initiated', 'Increased'],
);

/**
 * The submissions bundled into one dNFT-aggregate request row, input order
 * preserved — one loan agreement per submission.
 */
export function submissionEvents<
    T extends Pick<UserRequestEvent, 'requestType'>,
>(events: T[]): T[] {
    return events.filter((e) => SUBMISSION_EVENTS.has(e.requestType));
}

/** Count the submissions bundled into one dNFT-aggregate request row. */
export function countSubmissions(
    events: Pick<UserRequestEvent, 'requestType'>[],
): number {
    return submissionEvents(events).length;
}

/**
 * Timestamp of the FIRST submission in the bundle. Falls back to `fallback`
 * when the `Initiated` event has not indexed yet — the caller decides what
 * that is (kasu-ui passes the request's own timestamp).
 */
export function firstSubmissionTimestamp(
    events: Pick<UserRequestEvent, 'requestType' | 'timestamp'>[],
    fallback: number,
): number {
    const submissions = submissionEvents(events);
    if (submissions.length === 0) return fallback;
    return submissions.reduce(
        (min, e) => (e.timestamp < min ? e.timestamp : min),
        Infinity,
    );
}

/**
 * Has THIS request's cycle closed? — the single open/closed signal behind the
 * status vocabulary and behind Cancel.
 *
 * `request.canCancel` is the SDK's `isCancelable(status, poolId)` —
 * `status !== 'Processed' && !isLendingPoolClearingPending(pool)`. It is
 * per-POOL and reads the same condition the contract enforces on the cancel
 * call — but it reads it ONCE, when the request was fetched. Nothing about
 * this value is live, so a client that holds a request across a cycle close
 * must refetch before acting on it.
 *
 * The raw subgraph `status` must NOT feed this: `'Processing'` is a STICKY
 * historical marker set on the first partial fill and never reset, so gating
 * on it would freeze a partly-filled request in Processing forever. A global
 * settlement clock is equally wrong here — it is blind to whether THIS
 * request's pool is already clearing.
 */
export function isCycleClosed(request: Pick<UserRequest, 'canCancel'>): boolean {
    return !request.canCancel;
}

const isCancelled = (events: UserRequestEvent[]): boolean =>
    events.some((e) => e.requestType === 'Cancelled');

const isForced = (events: UserRequestEvent[]): boolean =>
    events.some((e) => e.requestType === 'Forced');

const initiatedEvent = (
    events: UserRequestEvent[],
): UserRequestEvent | undefined =>
    events.find((e) => e.requestType === 'Initiated');

/**
 * Subgraph behaviour: when a request is cancelled, the on-request
 * `requestedAmount` field is reset to 0 (the lender's effective balance is
 * restored). The original amount survives on the `Initiated` event's
 * `assetAmount`. Recover from there so cancelled rows still carry the amount
 * the lender originally asked for.
 */
const initiatedAmountOf = (events: UserRequestEvent[]): number => {
    const initiated = initiatedEvent(events);
    return initiated ? Number(initiated.assetAmount || '0') : 0;
};

/**
 * A deposit is REALLOCATED when the timeline carries a `Reallocated` event, or
 * an `Accepted` event into a tranche other than the one requested.
 */
const findReallocation = (
    events: UserRequestEvent[],
    originalTrancheId: string,
): UserRequestEvent | undefined =>
    events.find(
        (e) =>
            e.requestType === 'Reallocated' ||
            (e.requestType === 'Accepted' &&
                e.trancheId.toLowerCase() !==
                    originalTrancheId.toLowerCase()),
    );

/** kasu-ui's `num`: an absent or unparseable figure reads as 0. */
const num = (str: string | undefined): number => {
    const n = Number(str ?? '0');
    return Number.isFinite(n) ? n : 0;
};

/** The same parse, keeping "the subgraph reported nothing" distinct from 0. */
const numOrNull = (str: string | null | undefined): number | null => {
    if (str === undefined || str === null || str.trim() === '') return null;
    const n = Number(str);
    return Number.isFinite(n) ? n : null;
};

/**
 * Convert a `UserRequest` into a `RequestState`. Pure — no clock, no network,
 * no copy.
 *
 * BRANCH ORDER (this IS the behaviour; it reproduces kasu-ui's
 * `deriveTransactionView` check for check):
 *
 *   1. a `Cancelled` event                      → `cancelled`, neutral, 0
 *   2. a withdrawal with a `Forced` event       → `forced`, outflow, −accepted
 *   3. a reallocated deposit                    → `reallocated`, inflow, +accepted
 *   4. a withdrawal partly filled with a LIVE
 *      remainder (cycle still open)             → `partial`, outflow, −accepted
 *   5. resolved (`status === 'Processed'`):
 *        withdrawal, partly filled              → `partial`, outflow, −accepted
 *        withdrawal, fully filled               → `complete`, outflow, −accepted
 *        deposit, nothing accepted              → `rejected`, neutral, 0
 *        deposit, part rejected                 → `partial`, inflow, +accepted
 *        deposit, fully accepted                → `complete`, inflow, +accepted
 *   6. otherwise                                → `pending`, ±requested
 *
 * `cancelled` is reachable ONLY from branch 1 — a Cancelled EVENT. No
 * processing or resolved state can derive it.
 *
 * Branch 4 is checked BEFORE the resolved branch and gates on `isCycleClosed`
 * (i.e. `canCancel`), never on the sticky raw status: a withdrawal that was
 * partly filled returns to the queue with a live Cancel, and reading the raw
 * status would strand it.
 *
 * WHAT THE APPLICATION STILL OWNS: the status word and the detail line beneath
 * it; the tranche display rename (`getTrancheDisplayName` on `trancheName`,
 * and on the reallocation destination read off `request.events`); the pool-name
 * split; the amount format. The "view loan agreement" affordance is a fact, and
 * it follows from two fields already here —
 * `requestType === 'Deposit' && statusCode !== 'cancelled' && statusCode !== 'rejected'`
 * — because neither a cancelled nor a fully-rejected deposit ever issued one,
 * and withdrawals sign no agreement at all.
 */
export function deriveRequestState(request: UserRequest): RequestState {
    const isWithdrawal = request.requestType === 'Withdrawal';
    const cancelled = isCancelled(request.events);
    // Cancelled requests have `requestedAmount` zeroed on the request itself;
    // pull the original value from the Initiated event so the row still
    // carries "100 cancelled" instead of "0 cancelled".
    const requested = cancelled
        ? num(request.requestedAmount) || initiatedAmountOf(request.events)
        : num(request.requestedAmount);
    const accepted = num(request.acceptedAmount);
    const rejected = num(request.rejectedAmount);
    const forced = isWithdrawal && isForced(request.events);
    const reallocation =
        !isWithdrawal && findReallocation(request.events, request.trancheId);

    const initiated = initiatedEvent(request.events);

    const base = {
        id: request.id,
        contractId: initiated?.id ?? '',
        poolId: request.lendingPool.id.toLowerCase(),
        poolName: request.lendingPool.name,
        trancheName: request.trancheName,
        trancheId: request.trancheId,
        fixedTermConfigId: request.fixedTermConfig?.configId ?? '0',
        requestType: request.requestType,
        rawStatus: request.status,
        requestedAmount: requested,
        acceptedAmount: numOrNull(request.acceptedAmount),
        initiatedAmount: initiated
            ? initiatedAmountOf(request.events)
            : null,
        submissionCount: countSubmissions(request.events),
        // `firstSubmissionTimestamp` needs a fallback it will never use here:
        // the bundle is non-empty on every path that reaches the call.
        firstSubmissionTimestamp:
            countSubmissions(request.events) === 0
                ? null
                : firstSubmissionTimestamp(request.events, 0),
        cycleClosed: isCycleClosed(request),
        canCancel: request.canCancel,
    };

    // 1. Cancelled wins over everything — the ONLY path to `cancelled`.
    if (cancelled) {
        return { ...base, kind: 'neutral', amount: 0, statusCode: 'cancelled' };
    }

    // 2. Forced withdrawal (credit originator returned funds early).
    if (forced) {
        return {
            ...base,
            kind: 'outflow',
            amount: -accepted,
            statusCode: 'forced',
        };
    }

    // 3. Reallocated deposit (accepted into a different lending option).
    if (reallocation) {
        return {
            ...base,
            kind: 'inflow',
            amount: accepted,
            statusCode: 'reallocated',
        };
    }

    // 4. Withdrawal partly filled with a LIVE remainder: the request returns
    // to the queue with a live Cancel. Checked BEFORE the resolved branch and
    // via `isCycleClosed`, never via the sticky raw status.
    if (
        isWithdrawal &&
        accepted > 0 &&
        accepted < requested &&
        !isCycleClosed(request)
    ) {
        return {
            ...base,
            kind: 'outflow',
            amount: -accepted,
            statusCode: 'partial',
        };
    }

    // 5. Resolved — a rejection IS a resolution.
    if (request.status === UserRequestStatus.PROCESSED) {
        if (isWithdrawal) {
            const partly = accepted < requested;
            return {
                ...base,
                kind: 'outflow',
                amount: -accepted,
                statusCode: partly ? 'partial' : 'complete',
            };
        }

        // Deposit: full reject vs partial vs full accept.
        if (accepted === 0) {
            return {
                ...base,
                kind: 'neutral',
                amount: 0,
                statusCode: 'rejected',
            };
        }
        if (rejected > 0) {
            return {
                ...base,
                kind: 'inflow',
                amount: accepted,
                statusCode: 'partial',
            };
        }
        return {
            ...base,
            kind: 'inflow',
            amount: accepted,
            statusCode: 'complete',
        };
    }

    // 6. Unresolved. `cycleClosed` tells the caller whether to render its
    // "queued" or its "processing" word; the code is the same either way.
    return {
        ...base,
        kind: isWithdrawal ? 'outflow' : 'inflow',
        amount: isWithdrawal ? -requested : requested,
        statusCode: 'pending',
    };
}
