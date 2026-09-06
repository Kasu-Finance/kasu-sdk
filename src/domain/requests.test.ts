import { UserRequestStatus } from '../services/UserLending/subgraph-types';
import {
    UserRequest,
    UserRequestEvent,
} from '../services/UserLending/types';

import {
    countSubmissions,
    deriveRequestState,
    firstSubmissionTimestamp,
    isCycleClosed,
    lastEventTimestamp,
    submissionEvents,
} from './requests';

/**
 * Ported from kasu-ui `src/features/portfolio/lib/derive-transaction-view.test.ts`.
 * The status-word, detail-line, tranche-rename and `splitPoolName` cases stay
 * there — they assert copy and display, which this layer does not own. What
 * comes across is every assertion about codes, kind, amounts, ids and counts,
 * because those are the branch behaviour.
 */

const TRANCHE_ID = '0xtranche-senior';
const OTHER_TRANCHE_ID = '0xtranche-mezzanine';
const POOL_ID = '0xPool-PayFi';
const POOL_NAME = 'Payment Finance (PayFi) - Payment Clearing Houses';

const REQUESTED = UserRequestStatus.REQUESTED;
const PROCESSING = UserRequestStatus.PROCESSING;
const PROCESSED = UserRequestStatus.PROCESSED;

function makeRequest(overrides: Partial<UserRequest> = {}): UserRequest {
    return {
        id: 'req-1',
        userId: '0xuser',
        lendingPool: {
            id: POOL_ID,
            name: POOL_NAME,
            tranches: [{ orderId: '0' }],
        },
        requestType: 'Deposit',
        trancheId: TRANCHE_ID,
        trancheName: 'Senior',
        requestedAmount: '100',
        acceptedAmount: '0',
        rejectedAmount: '0',
        timestamp: 1_700_000_000,
        status: REQUESTED,
        canCancel: true,
        events: [],
        nftId: '',
        apy: '0',
        fixedTermConfig: undefined,
        ...overrides,
    };
}

function event(partial: Partial<UserRequestEvent>): UserRequestEvent {
    return {
        id: 'evt',
        requestType: 'Initiated',
        assetAmount: '0',
        totalRequested: '0',
        totalAccepted: '0',
        totalRejected: '0',
        index: 0,
        timestamp: 1_700_000_000,
        transactionHash: '0x',
        trancheName: 'Senior',
        trancheId: TRANCHE_ID,
        apy: '0',
        epochId: '0',
        ...partial,
    };
}

describe('deriveRequestState — every branch of the derivation', () => {
    it('deposit just submitted, cycle open → pending · inflow · +requested', () => {
        const state = deriveRequestState(makeRequest());
        expect(state.statusCode).toBe('pending');
        expect(state.kind).toBe('inflow');
        expect(state.amount).toBe(100);
        expect(state.cycleClosed).toBe(false);
        expect(state.canCancel).toBe(true);
    });

    it('deposit while its pool is clearing (canCancel false) → pending, cycle CLOSED', () => {
        const state = deriveRequestState(makeRequest({ canCancel: false }));
        expect(state.statusCode).toBe('pending');
        expect(state.cycleClosed).toBe(true);
    });

    it('a STICKY Processing raw status with an open cycle stays pending and open', () => {
        // The subgraph never resets `status` after a partial fill — `canCancel`
        // alone decides open/closed.
        const state = deriveRequestState(
            makeRequest({ status: PROCESSING, canCancel: true }),
        );
        expect(state.statusCode).toBe('pending');
        expect(state.cycleClosed).toBe(false);
        expect(state.rawStatus).toBe(PROCESSING);
    });

    it('deposit fully accepted → complete · inflow · +accepted', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
            }),
        );
        expect(state.statusCode).toBe('complete');
        expect(state.kind).toBe('inflow');
        expect(state.amount).toBe(100);
    });

    it('deposit partially accepted → partial · inflow · the accepted figure', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '60',
                rejectedAmount: '40',
            }),
        );
        expect(state.statusCode).toBe('partial');
        expect(state.kind).toBe('inflow');
        expect(state.amount).toBe(60);
        expect(state.requestedAmount).toBe(100);
        expect(state.acceptedAmount).toBe(60);
    });

    it('deposit fully rejected → rejected · neutral · 0 — a rejection IS a resolution', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                rejectedAmount: '100',
            }),
        );
        expect(state.statusCode).toBe('rejected');
        expect(state.kind).toBe('neutral');
        expect(state.amount).toBe(0);
    });

    it('deposit cancelled → cancelled · neutral · 0', () => {
        const state = deriveRequestState(
            makeRequest({ events: [event({ requestType: 'Cancelled' })] }),
        );
        expect(state.statusCode).toBe('cancelled');
        expect(state.kind).toBe('neutral');
        expect(state.amount).toBe(0);
    });

    it('a Cancelled event outranks a resolved status', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
                events: [event({ requestType: 'Cancelled' })],
            }),
        );
        expect(state.statusCode).toBe('cancelled');
        expect(state.amount).toBe(0);
    });

    it('deposit reallocated (Accepted into another tranche) → reallocated · inflow', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
                events: [
                    event({
                        requestType: 'Accepted',
                        trancheId: OTHER_TRANCHE_ID,
                        trancheName: 'Mezzanine',
                        assetAmount: '100',
                    }),
                ],
            }),
        );
        expect(state.statusCode).toBe('reallocated');
        expect(state.kind).toBe('inflow');
        expect(state.amount).toBe(100);
    });

    it('an Accepted event into the SAME tranche is not a reallocation', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
                events: [
                    event({
                        requestType: 'Accepted',
                        trancheId: TRANCHE_ID.toUpperCase(),
                        assetAmount: '100',
                    }),
                ],
            }),
        );
        // Tranche ids are compared case-insensitively, so an upper-cased
        // spelling of the same tranche must not read as a move.
        expect(state.statusCode).toBe('complete');
    });

    it('an explicit Reallocated event is a reallocation whatever the tranche', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
                events: [
                    event({
                        requestType: 'Reallocated',
                        assetAmount: '100',
                    }),
                ],
            }),
        );
        expect(state.statusCode).toBe('reallocated');
    });

    it('a withdrawal is never reallocated, whatever its events say', () => {
        const state = deriveRequestState(
            makeRequest({
                requestType: 'Withdrawal',
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
                events: [
                    event({
                        requestType: 'Accepted',
                        trancheId: OTHER_TRANCHE_ID,
                        assetAmount: '100',
                    }),
                ],
            }),
        );
        expect(state.statusCode).toBe('complete');
        expect(state.kind).toBe('outflow');
    });

    it('withdrawal submitted, cycle open → pending · outflow · −requested', () => {
        const state = deriveRequestState(
            makeRequest({ requestType: 'Withdrawal' }),
        );
        expect(state.statusCode).toBe('pending');
        expect(state.kind).toBe('outflow');
        expect(state.amount).toBe(-100);
    });

    it('withdrawal fully filled → complete · −accepted', () => {
        const state = deriveRequestState(
            makeRequest({
                requestType: 'Withdrawal',
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
            }),
        );
        expect(state.statusCode).toBe('complete');
        expect(state.amount).toBe(-100);
    });

    it('withdrawal partly filled with a LIVE remainder → partial while the cycle is open', () => {
        // Realistic shape: the sticky raw status reads Processing, canCancel
        // marks the new cycle open — the request returns to the queue with a
        // live Cancel.
        const state = deriveRequestState(
            makeRequest({
                requestType: 'Withdrawal',
                status: PROCESSING,
                canCancel: true,
                acceptedAmount: '60',
            }),
        );
        expect(state.statusCode).toBe('partial');
        expect(state.kind).toBe('outflow');
        expect(state.amount).toBe(-60);
        expect(state.cycleClosed).toBe(false);
    });

    it('withdrawal partly filled, pool CLEARING → pending with the cycle closed (locked remainder)', () => {
        const state = deriveRequestState(
            makeRequest({
                requestType: 'Withdrawal',
                status: PROCESSING,
                canCancel: false,
                acceptedAmount: '60',
            }),
        );
        expect(state.statusCode).toBe('pending');
        expect(state.cycleClosed).toBe(true);
        expect(state.amount).toBe(-100);
    });

    it('withdrawal partly filled, TERMINAL → partial', () => {
        const state = deriveRequestState(
            makeRequest({
                requestType: 'Withdrawal',
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '60',
            }),
        );
        expect(state.statusCode).toBe('partial');
        expect(state.amount).toBe(-60);
    });

    it('forced withdrawal → forced · outflow · −accepted', () => {
        const state = deriveRequestState(
            makeRequest({
                requestType: 'Withdrawal',
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '80',
                events: [event({ requestType: 'Forced' })],
            }),
        );
        expect(state.statusCode).toBe('forced');
        expect(state.kind).toBe('outflow');
        expect(state.amount).toBe(-80);
    });

    it('a Forced event on a DEPOSIT is not a forced withdrawal', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '80',
                events: [event({ requestType: 'Forced' })],
            }),
        );
        expect(state.statusCode).toBe('complete');
        expect(state.kind).toBe('inflow');
    });

    it('withdrawal cancelled → cancelled · neutral · 0', () => {
        const state = deriveRequestState(
            makeRequest({
                requestType: 'Withdrawal',
                events: [event({ requestType: 'Cancelled' })],
            }),
        );
        expect(state.statusCode).toBe('cancelled');
        expect(state.kind).toBe('neutral');
        expect(state.amount).toBe(0);
    });
});

describe('deriveRequestState — the cancelled-amount recovery', () => {
    it('recovers a zeroed requestedAmount from the Initiated event', () => {
        const state = deriveRequestState(
            makeRequest({
                requestedAmount: '0',
                events: [
                    event({ requestType: 'Initiated', assetAmount: '250' }),
                    event({ requestType: 'Cancelled', index: 1 }),
                ],
            }),
        );
        expect(state.requestedAmount).toBe(250);
        expect(state.initiatedAmount).toBe(250);
    });

    it('falls back to 0 when the cancelled request has no Initiated event', () => {
        const state = deriveRequestState(
            makeRequest({
                requestedAmount: '0',
                events: [event({ requestType: 'Cancelled' })],
            }),
        );
        expect(state.requestedAmount).toBe(0);
        expect(state.initiatedAmount).toBeNull();
    });

    it('does not recover for a request that was NOT cancelled', () => {
        // A live request with a genuinely zero requested amount keeps it; only
        // the cancelled branch reaches for the Initiated event.
        const state = deriveRequestState(
            makeRequest({
                requestedAmount: '0',
                events: [
                    event({ requestType: 'Initiated', assetAmount: '250' }),
                ],
            }),
        );
        expect(state.requestedAmount).toBe(0);
        expect(state.initiatedAmount).toBe(250);
    });
});

describe('deriveRequestState — ids, counts and pass-through fields', () => {
    it('takes contractId from the Initiated EVENT, not the request id', () => {
        const state = deriveRequestState(
            makeRequest({
                events: [
                    event({ requestType: 'Initiated', id: 'req-1-0' }),
                    event({
                        requestType: 'Increased',
                        id: 'req-1-1',
                        index: 1,
                    }),
                ],
            }),
        );
        expect(state.contractId).toBe('req-1-0');
        expect(state.id).toBe('req-1');
    });

    it('leaves contractId empty when nothing was Initiated', () => {
        expect(deriveRequestState(makeRequest()).contractId).toBe('');
    });

    it('lowercases the pool id and leaves the pool name raw', () => {
        const state = deriveRequestState(makeRequest());
        expect(state.poolId).toBe(POOL_ID.toLowerCase());
        expect(state.poolName).toBe(POOL_NAME);
    });

    it('leaves the tranche name RAW — the display rename is the app’s', () => {
        // An Apxium pool: kasu-ui shows "Upper Mezzanine" here, this layer must
        // not, or a renamed name would reach matching code.
        const state = deriveRequestState(
            makeRequest({
                lendingPool: {
                    id: '0xpool-apxium',
                    name: 'Taxation Funding (Tax Pay) - Diversified Businesses',
                    tranches: [{ orderId: '0' }],
                },
            }),
        );
        expect(state.trancheName).toBe('Senior');
    });

    it('defaults fixedTermConfigId to "0" for a variable-rate request', () => {
        expect(deriveRequestState(makeRequest()).fixedTermConfigId).toBe('0');
    });

    it('passes a fixed-term configId through', () => {
        const state = deriveRequestState(
            makeRequest({
                fixedTermConfig: {
                    configId: '7',
                    apy: '0.1',
                    epochLockDuration: '4',
                    epochInterestRate: '0.002',
                },
            }),
        );
        expect(state.fixedTermConfigId).toBe('7');
    });

    it('counts only submissions into submissionCount and takes the earliest one', () => {
        const state = deriveRequestState(
            makeRequest({
                events: [
                    event({
                        requestType: 'Initiated',
                        timestamp: 1_700_000_500,
                    }),
                    event({
                        requestType: 'Increased',
                        timestamp: 1_700_000_100,
                        index: 1,
                    }),
                    event({
                        requestType: 'Accepted',
                        timestamp: 1_700_000_900,
                        index: 2,
                    }),
                ],
            }),
        );
        expect(state.submissionCount).toBe(2);
        expect(state.firstSubmissionTimestamp).toBe(1_700_000_100);
    });

    it('reports a null first-submission timestamp before the Initiated event indexes', () => {
        const state = deriveRequestState(makeRequest());
        expect(state.submissionCount).toBe(0);
        expect(state.firstSubmissionTimestamp).toBeNull();
    });

    it('keeps "the subgraph reported nothing" distinct from a reported zero', () => {
        expect(deriveRequestState(makeRequest()).acceptedAmount).toBe(0);
        expect(
            deriveRequestState(makeRequest({ acceptedAmount: '' }))
                .acceptedAmount,
        ).toBeNull();
        expect(
            deriveRequestState(
                makeRequest({
                    acceptedAmount: undefined as unknown as string,
                }),
            ).acceptedAmount,
        ).toBeNull();
    });
});

/**
 * The transition rule: `cancelled` is reachable only from a Cancelled EVENT,
 * and every derivation lands on exactly one of the seven codes.
 */
describe('deriveRequestState — permitted transitions', () => {
    const FIXTURES: Partial<UserRequest>[] = [
        {},
        { canCancel: false },
        { status: PROCESSING, canCancel: true },
        { status: PROCESSED, canCancel: false, acceptedAmount: '100' },
        { status: PROCESSED, canCancel: false, rejectedAmount: '100' },
        {
            requestType: 'Withdrawal',
            status: PROCESSING,
            canCancel: true,
            acceptedAmount: '60',
        },
        {
            requestType: 'Withdrawal',
            status: PROCESSED,
            canCancel: false,
            acceptedAmount: '60',
        },
        { events: [event({ requestType: 'Cancelled' })] },
    ];

    const CODES = [
        'pending',
        'complete',
        'partial',
        'rejected',
        'reallocated',
        'cancelled',
        'forced',
    ];

    it('every derivation lands on exactly one known code', () => {
        for (const overrides of FIXTURES) {
            expect(CODES).toContain(
                deriveRequestState(makeRequest(overrides)).statusCode,
            );
        }
    });

    it('cancelled derives ONLY from a Cancelled event', () => {
        for (const overrides of FIXTURES) {
            const hasCancelEvent = (overrides.events ?? []).some(
                (e) => e.requestType === 'Cancelled',
            );
            const state = deriveRequestState(makeRequest(overrides));
            expect(state.statusCode === 'cancelled').toBe(hasCancelEvent);
        }
    });

    it('the loan-agreement affordance follows from requestType + statusCode', () => {
        // kasu-ui's `canViewContract`, reconstructed from the two fields this
        // layer exposes: deposits have an agreement unless nothing was ever
        // issued (cancelled / fully rejected); withdrawals sign none.
        const canView = (s: {
            requestType: string;
            statusCode: string;
        }): boolean =>
            s.requestType === 'Deposit' &&
            s.statusCode !== 'cancelled' &&
            s.statusCode !== 'rejected';

        expect(canView(deriveRequestState(makeRequest()))).toBe(true);
        expect(
            canView(
                deriveRequestState(
                    makeRequest({ events: [event({ requestType: 'Cancelled' })] }),
                ),
            ),
        ).toBe(false);
        expect(
            canView(
                deriveRequestState(
                    makeRequest({
                        status: PROCESSED,
                        canCancel: false,
                        rejectedAmount: '100',
                    }),
                ),
            ),
        ).toBe(false);
        expect(
            canView(
                deriveRequestState(
                    makeRequest({ requestType: 'Withdrawal' }),
                ),
            ),
        ).toBe(false);
    });
});

describe('submissionEvents / countSubmissions', () => {
    const events = [
        event({ requestType: 'Initiated' }),
        event({ requestType: 'Accepted', index: 1 }),
        event({ requestType: 'Increased', index: 2 }),
        event({ requestType: 'Rejected', index: 3 }),
        event({ requestType: 'Cancelled', index: 4 }),
        event({ requestType: 'Reallocated', index: 5 }),
        event({ requestType: 'Forced', index: 6 }),
    ];

    it('keeps only Initiated + Increased, in input order', () => {
        expect(submissionEvents(events).map((e) => e.requestType)).toEqual([
            'Initiated',
            'Increased',
        ]);
    });

    it('counts them', () => {
        expect(countSubmissions(events)).toBe(2);
        expect(countSubmissions([])).toBe(0);
    });
});

describe('firstSubmissionTimestamp', () => {
    it('returns the earliest submission timestamp, ignoring outcome events', () => {
        expect(
            firstSubmissionTimestamp(
                [
                    event({ requestType: 'Initiated', timestamp: 300 }),
                    event({ requestType: 'Increased', timestamp: 200 }),
                    event({ requestType: 'Accepted', timestamp: 100 }),
                ],
                999,
            ),
        ).toBe(200);
    });

    it('falls back when the bundle carries no submission yet', () => {
        expect(firstSubmissionTimestamp([], 42)).toBe(42);
        expect(
            firstSubmissionTimestamp(
                [event({ requestType: 'Accepted', timestamp: 1 })],
                42,
            ),
        ).toBe(42);
    });
});

describe('isCycleClosed', () => {
    it('is the inverse of the SDK per-pool cancel signal', () => {
        expect(isCycleClosed({ canCancel: true })).toBe(false);
        expect(isCycleClosed({ canCancel: false })).toBe(true);
    });
});

describe('deriveRequestState — the reported figures', () => {
    it('carries the rejected figure through, parsed the same way as the rest', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '60',
                rejectedAmount: '40',
            }),
        );
        expect(state.statusCode).toBe('partial');
        expect(state.acceptedAmount).toBe(60);
        expect(state.rejectedAmount).toBe(40);
        // The three add up: what was asked for, what was taken, what was not.
        expect((state.acceptedAmount ?? 0) + state.rejectedAmount).toBe(
            state.requestedAmount,
        );
    });

    it('reads an absent or unparseable rejected figure as 0, never as null', () => {
        // Unlike `acceptedAmount`, this one feeds the partial-vs-complete
        // branch, where "no figure" and "nothing rejected" mean the same.
        expect(deriveRequestState(makeRequest()).rejectedAmount).toBe(0);
        expect(
            deriveRequestState(makeRequest({ rejectedAmount: 'not a number' }))
                .rejectedAmount,
        ).toBe(0);
    });

    it('reports the reallocation amount and its RAW destination tranche name', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
                events: [
                    event({
                        requestType: 'Accepted',
                        trancheId: OTHER_TRANCHE_ID,
                        trancheName: 'Mezzanine',
                        assetAmount: '100',
                    }),
                ],
            }),
        );
        expect(state.statusCode).toBe('reallocated');
        expect(state.reallocatedOutAmount).toBe(100);
        // RAW, like `trancheName`: the app renames at the view boundary, and a
        // renamed value reaching matching code would reorder the waterfall.
        expect(state.reallocationTargetTrancheName).toBe('Mezzanine');
    });

    it('reports the amount that LEFT the tranche, which need not be the accepted total', () => {
        const state = deriveRequestState(
            makeRequest({
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
                events: [
                    event({
                        requestType: 'Reallocated',
                        trancheId: OTHER_TRANCHE_ID,
                        trancheName: 'Mezzanine',
                        assetAmount: '30',
                    }),
                ],
            }),
        );
        expect(state.reallocatedOutAmount).toBe(30);
        expect(state.acceptedAmount).toBe(100);
    });

    it('leaves both reallocation fields empty when there was no reallocation', () => {
        const state = deriveRequestState(makeRequest());
        expect(state.reallocatedOutAmount).toBe(0);
        expect(state.reallocationTargetTrancheName).toBeNull();
    });

    it('never reads a reallocation off a WITHDRAWAL', () => {
        // `findReallocation` is gated on the request being a deposit; a
        // withdrawal accepted into another tranche is not a thing.
        const state = deriveRequestState(
            makeRequest({
                requestType: 'Withdrawal',
                status: PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
                events: [
                    event({
                        requestType: 'Accepted',
                        trancheId: OTHER_TRANCHE_ID,
                        trancheName: 'Mezzanine',
                        assetAmount: '100',
                    }),
                ],
            }),
        );
        expect(state.statusCode).toBe('complete');
        expect(state.reallocatedOutAmount).toBe(0);
        expect(state.reallocationTargetTrancheName).toBeNull();
    });

    it('reports the LATEST event as lastTimestamp, alongside the FIRST submission', () => {
        const state = deriveRequestState(
            makeRequest({
                timestamp: 100,
                events: [
                    event({ requestType: 'Initiated', timestamp: 200 }),
                    event({ requestType: 'Increased', timestamp: 300 }),
                    event({ requestType: 'Accepted', timestamp: 400 }),
                ],
            }),
        );
        // One says when the lender asked, the other when anything last
        // happened to the request.
        expect(state.firstSubmissionTimestamp).toBe(200);
        expect(state.lastTimestamp).toBe(400);
    });

    it('falls back to the request timestamp when the timeline is empty', () => {
        const state = deriveRequestState(makeRequest({ timestamp: 12345 }));
        expect(state.lastTimestamp).toBe(12345);
        expect(state.firstSubmissionTimestamp).toBeNull();
    });
});

describe('lastEventTimestamp', () => {
    it('returns the latest timestamp on the timeline', () => {
        expect(
            lastEventTimestamp(
                [
                    event({ timestamp: 100 }),
                    event({ timestamp: 300 }),
                    event({ timestamp: 200 }),
                ],
                1,
            ),
        ).toBe(300);
    });

    it('returns the fallback for an empty timeline', () => {
        expect(lastEventTimestamp([], 42)).toBe(42);
    });

    it('never goes BEHIND the fallback, because the fallback seeds the reduction', () => {
        // `request.timestamp` is a fact about the request. An event indexed
        // with an earlier clock must not make the row look older than the
        // request it belongs to.
        expect(
            lastEventTimestamp([event({ timestamp: 5 })], 999),
        ).toBe(999);
    });

    // Counts every event, not just submissions — that is the difference from
    // `firstSubmissionTimestamp`, which filters outcomes out.
    it('counts outcome events too', () => {
        expect(
            lastEventTimestamp(
                [
                    event({ requestType: 'Initiated', timestamp: 100 }),
                    event({ requestType: 'Cancelled', timestamp: 900 }),
                ],
                0,
            ),
        ).toBe(900);
        expect(
            firstSubmissionTimestamp(
                [
                    event({ requestType: 'Initiated', timestamp: 100 }),
                    event({ requestType: 'Cancelled', timestamp: 900 }),
                ],
                0,
            ),
        ).toBe(100);
    });
});
