import { BigNumber, utils } from 'ethers';

import {
    ENTRY_POINT_V07,
    ReceiptLike,
    ReceiptLog,
} from '../domain/batch-proof';

import {
    batchOutcomeOf,
    BatchPendingError,
    BatchRevertedError,
    BatchSubmissionError,
    isDefinitivelyNotSubmitted,
} from './batch-errors';
import {
    BatchStatusRead,
    BatchSubmissionPorts,
    checkBatchOutcome,
    DEFAULT_BATCH_POLLING_POLICY,
    submitBatch,
} from './batch-submission';

// Ported from kasu-ui (one-tx lend) `deposit-relay/__tests__/relay-client.test.ts`
// (polling + outcome) and `relay-outcome.test.ts` (settle + one-read check).
// The HTTP half of those suites stays with the app's port.

const LENDER = '0x0000000000000000000000000000000000000001';
const TRANCHE = '0x0000000000000000000000000000000000000006';
const PENDING_POOL = '0x0000000000000000000000000000000000000007';
const PAYMASTER = '0x0000000000000000000000000000000000000008';
const USER_OP_HASH = `0x${'00'.repeat(31)}0a`;
const TX_HASH = `0x${'00'.repeat(31)}1f`;
const TX_ID = 'tx-00000000-0000-4000-8000-000000000001';
const AMOUNT = BigNumber.from(1_000_000_000);
const CALLS = [{ to: LENDER, data: '0x' }];
const EXPECT = { lender: LENDER, tranche: TRANCHE, amount: AMOUNT };

const ENTRY_POINT = new utils.Interface([
    'event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)',
    'event BeforeExecution()',
]);
const PENDING = new utils.Interface([
    'event DepositRequested(address indexed user, address indexed tranche, uint256 indexed dNftID, uint256 epochId, uint256 amount)',
]);

function receipt(
    opts: { success?: boolean; deposit?: boolean } = {},
): ReceiptLike {
    const logs: ReceiptLog[] = [
        {
            address: ENTRY_POINT_V07,
            ...ENTRY_POINT.encodeEventLog(
                ENTRY_POINT.getEvent('BeforeExecution'),
                [],
            ),
        },
    ];
    if (opts.deposit ?? true) {
        logs.push({
            address: PENDING_POOL,
            ...PENDING.encodeEventLog(PENDING.getEvent('DepositRequested'), [
                LENDER,
                TRANCHE,
                42,
                12,
                AMOUNT,
            ]),
        });
    }
    logs.push({
        address: ENTRY_POINT_V07,
        ...ENTRY_POINT.encodeEventLog(
            ENTRY_POINT.getEvent('UserOperationEvent'),
            [
                USER_OP_HASH,
                LENDER,
                PAYMASTER,
                7,
                opts.success ?? true,
                1000,
                1000,
            ],
        ),
    });
    return { logs, blockNumber: 123 };
}

/** A fake clock: `sleep` advances `now`, and records every delay. */
function harness(
    statuses: (BatchStatusRead | Error)[],
    overrides: Partial<BatchSubmissionPorts> = {},
): {
    ports: BatchSubmissionPorts;
    /** The default `post` / `getReceipt` mocks (not any override). */
    post: jest.Mock;
    getReceipt: jest.Mock;
    sleeps: number[];
    statusReads: () => number;
} {
    let clock = 1_000_000;
    const sleeps: number[] = [];
    let reads = 0;
    const post = jest.fn().mockResolvedValue({ transactionId: TX_ID });
    const getReceipt = jest.fn().mockResolvedValue(receipt());
    const ports: BatchSubmissionPorts = {
        post,
        getStatus: jest.fn(() => {
            const next = statuses[Math.min(reads, statuses.length - 1)];
            reads += 1;
            return next instanceof Error
                ? Promise.reject(next)
                : Promise.resolve(next);
        }),
        getReceipt,
        now: () => clock,
        sleep: (ms: number) => {
            sleeps.push(ms);
            clock += ms;
            return Promise.resolve();
        },
        ...overrides,
    };
    return { ports, post, getReceipt, sleeps, statusReads: () => reads };
}

const MINED: BatchStatusRead = {
    kind: 'mined',
    txHash: TX_HASH,
    userOperationHash: USER_OP_HASH,
};
const AGAIN: BatchStatusRead = { kind: 'again' };

async function outcomeOf(promise: Promise<unknown>): Promise<unknown> {
    try {
        await promise;
        return 'resolved';
    } catch (err) {
        return err;
    }
}

describe('submitBatch — post', () => {
    it('resolves with the transaction id once the batch is accepted, before any status read', async () => {
        const { ports, post, statusReads } = harness([MINED]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        expect(submission.transactionId).toBe(TX_ID);
        expect(post).toHaveBeenCalledWith(CALLS);
        expect(statusReads()).toBe(0);
    });

    it('rethrows a known revert from post unchanged', async () => {
        const reverted = new BatchRevertedError('ClearingIsPending');
        const { ports } = harness([MINED], {
            post: jest.fn().mockRejectedValue(reverted),
        });
        await expect(
            submitBatch({ calls: CALLS, expect: EXPECT }, ports),
        ).rejects.toBe(reverted);
    });

    it('rethrows a typed submission error with its own outcome', async () => {
        for (const outcome of [
            'failed',
            'pending',
            'already-submitted',
        ] as const) {
            const err = new BatchSubmissionError('no_session', outcome);
            const { ports } = harness([MINED], {
                post: jest.fn().mockRejectedValue(err),
            });
            const thrown = await outcomeOf(
                submitBatch({ calls: CALLS, expect: EXPECT }, ports),
            );
            expect(thrown).toBe(err);
            expect(batchOutcomeOf(thrown)).toBe(outcome);
        }
    });

    it('reads ANY other post failure as PENDING — never failed', async () => {
        for (const raw of [
            new Error('network down'),
            new TypeError('fetch failed'),
            // A message that LOOKS like a user rejection must not become one.
            Object.assign(new Error('user rejected the request'), {
                code: 4001,
            }),
            'a string',
            null,
        ]) {
            const { ports } = harness([MINED], {
                post: jest.fn().mockRejectedValue(raw),
            });
            const thrown = await outcomeOf(
                submitBatch({ calls: CALLS, expect: EXPECT }, ports),
            );
            expect(thrown).toBeInstanceOf(BatchPendingError);
            expect(batchOutcomeOf(thrown)).toBe('pending');
            expect((thrown as BatchPendingError).code).toBe('post_unknown');
            expect(isDefinitivelyNotSubmitted(thrown)).toBe(false);
        }
    });

    it('reads an accepted answer without a transaction id as PENDING', async () => {
        for (const answer of [
            {},
            { transactionId: '' },
            { transactionId: 7 },
            null,
        ]) {
            const { ports } = harness([MINED], {
                post: jest.fn().mockResolvedValue(answer),
            });
            const thrown = await outcomeOf(
                submitBatch({ calls: CALLS, expect: EXPECT }, ports),
            );
            expect(thrown).toBeInstanceOf(BatchPendingError);
            expect((thrown as BatchPendingError).code).toBe('malformed_answer');
        }
    });

    it('refuses an invalid polling policy before posting anything', async () => {
        for (const policy of [
            { initialMs: 0 },
            { backoff: 0.5 },
            { maxMs: 1 },
            { timeoutMs: Number.NaN },
        ]) {
            const { ports, post } = harness([MINED]);
            await expect(
                submitBatch({ calls: CALLS, expect: EXPECT }, ports, policy),
            ).rejects.toThrow(TypeError);
            expect(post).not.toHaveBeenCalled();
        }
    });
});

describe('submitBatch — wait', () => {
    it('resolves a PROVEN deposit, with the dNFT id from the receipt', async () => {
        const { ports, getReceipt } = harness([MINED]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        const proven = await submission.wait();
        expect(proven.txHash).toBe(TX_HASH);
        expect(proven.proof.kind).toBe('deposited');
        expect(proven.proof.dNftId.eq(42)).toBe(true);
        expect(getReceipt).toHaveBeenCalledWith(TX_HASH);
    });

    it('reads at once, then backs off 3 s ×1.5 to a 10 s ceiling', async () => {
        const { ports, sleeps } = harness([
            AGAIN,
            AGAIN,
            AGAIN,
            AGAIN,
            AGAIN,
            MINED,
        ]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        await submission.wait();
        expect(sleeps).toEqual([3000, 4500, 6750, 10000, 10000]);
    });

    it('honours a custom policy', async () => {
        const { ports, sleeps } = harness([AGAIN, AGAIN, AGAIN, MINED]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
            { initialMs: 100, backoff: 2, maxMs: 300 },
        );
        await submission.wait();
        expect(sleeps).toEqual([100, 200, 300]);
    });

    it('runs out of time as PENDING, never failed, and never sleeps past the deadline', async () => {
        const { ports, getReceipt, sleeps } = harness([AGAIN]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        const thrown = await outcomeOf(submission.wait());
        expect(thrown).toBeInstanceOf(BatchPendingError);
        expect((thrown as BatchPendingError).code).toBe('status_timeout');
        const total = sleeps.reduce((a, b) => a + b, 0);
        expect(total).toBeLessThanOrEqual(
            DEFAULT_BATCH_POLLING_POLICY.timeoutMs,
        );
        expect(getReceipt).not.toHaveBeenCalled();
    });

    it('treats a throwing status read as "again", not as an outcome', async () => {
        const { ports } = harness([
            new Error('502'),
            new Error('timeout'),
            MINED,
        ]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        await expect(submission.wait()).resolves.toMatchObject({
            txHash: TX_HASH,
        });
    });

    it('a "mined" read without a hash is not an answer — it keeps polling', async () => {
        const { ports } = harness([{ kind: 'mined', txHash: '' }, MINED]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        await expect(submission.wait()).resolves.toMatchObject({
            txHash: TX_HASH,
        });
    });

    it('a vendor revert is a revert', async () => {
        const { ports } = harness([AGAIN, { kind: 'reverted' }]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        const thrown = await outcomeOf(submission.wait());
        expect(thrown).toBeInstanceOf(BatchRevertedError);
        expect(isDefinitivelyNotSubmitted(thrown)).toBe(true);
    });

    it('an unknown final status is PENDING', async () => {
        const { ports } = harness([
            { kind: 'unknown', code: 'provider_error' },
        ]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        const thrown = await outcomeOf(submission.wait());
        expect(thrown).toBeInstanceOf(BatchPendingError);
        expect((thrown as BatchPendingError).code).toBe('provider_error');
    });

    it('carries an operation hash learned while polling into the proof', async () => {
        const { ports } = harness([
            { kind: 'again', userOperationHash: USER_OP_HASH },
            { kind: 'mined', txHash: TX_HASH },
        ]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        await expect(submission.wait()).resolves.toMatchObject({
            txHash: TX_HASH,
        });
    });

    it('an unreadable receipt is PENDING — the batch WAS mined', async () => {
        const { ports } = harness([MINED], {
            getReceipt: jest.fn().mockRejectedValue(new Error('timeout')),
        });
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        const thrown = await outcomeOf(submission.wait());
        expect(thrown).toBeInstanceOf(BatchPendingError);
        expect((thrown as BatchPendingError).code).toBe('receipt_unavailable');
    });

    it('a REVERTED user operation in the receipt is a revert', async () => {
        const { ports } = harness([MINED], {
            getReceipt: jest
                .fn()
                .mockResolvedValue(receipt({ success: false })),
        });
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        await expect(submission.wait()).rejects.toBeInstanceOf(
            BatchRevertedError,
        );
    });

    it('a receipt that does not show THIS deposit is PENDING, never deposited', async () => {
        for (const expect_ of [
            EXPECT,
            { ...EXPECT, amount: AMOUNT.add(1) },
            { ...EXPECT, lender: TRANCHE },
        ]) {
            const { ports } = harness([MINED], {
                getReceipt: jest
                    .fn()
                    .mockResolvedValue(
                        receipt({ deposit: expect_ !== EXPECT ? true : false }),
                    ),
            });
            const submission = await submitBatch(
                { calls: CALLS, expect: expect_ },
                ports,
            );
            const thrown = await outcomeOf(submission.wait());
            expect(thrown).toBeInstanceOf(BatchPendingError);
            // The code carries the proof's own reason, so an operator can
            // tell "the hash was not our operation" from "our operation ran
            // and shows no deposit".
            expect((thrown as BatchPendingError).code).toBe(
                expect_.lender === TRANCHE
                    ? 'deposit_unproven:no-user-operation'
                    : 'deposit_unproven:no-deposit-requested',
            );
        }
    });

    it('a garbage receipt is PENDING', async () => {
        const { ports } = harness([MINED], {
            getReceipt: jest
                .fn()
                .mockResolvedValue({ logs: 'nope', blockNumber: 1 }),
        });
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        await expect(submission.wait()).rejects.toBeInstanceOf(
            BatchPendingError,
        );
    });

    it('memoises wait(): a second call does not poll again', async () => {
        const { ports, statusReads } = harness([MINED]);
        const submission = await submitBatch(
            { calls: CALLS, expect: EXPECT },
            ports,
        );
        const [a, b] = await Promise.all([
            submission.wait(),
            submission.wait(),
        ]);
        expect(a).toBe(b);
        expect(statusReads()).toBe(1);
    });

    it('NEVER produces a `failed` outcome once the batch was posted, whatever the answers', async () => {
        // Exhaustive over the shapes a status port can produce, in sequence.
        const reads: (BatchStatusRead | Error)[] = [
            AGAIN,
            new Error('flaky'),
            { kind: 'unknown', code: 'x' },
            { kind: 'reverted' },
            MINED,
        ];
        for (const first of reads) {
            for (const second of reads) {
                const { ports } = harness([first, second]);
                const submission = await submitBatch(
                    { calls: CALLS, expect: EXPECT },
                    ports,
                );
                const thrown = await outcomeOf(submission.wait());
                if (thrown === 'resolved') continue;
                expect(batchOutcomeOf(thrown) === 'failed').toBe(false);
                expect(
                    thrown instanceof BatchRevertedError ||
                        thrown instanceof BatchPendingError,
                ).toBe(true);
            }
        }
    });
});

describe('checkBatchOutcome', () => {
    it('deposited when mined and proven', async () => {
        const { ports } = harness([MINED]);
        await expect(checkBatchOutcome(TX_ID, EXPECT, ports)).resolves.toBe(
            'deposited',
        );
    });

    it('not-deposited on a vendor revert or a reverted operation', async () => {
        expect(
            await checkBatchOutcome(
                TX_ID,
                EXPECT,
                harness([{ kind: 'reverted' }]).ports,
            ),
        ).toBe('not-deposited');
        const reverted = harness([MINED], {
            getReceipt: jest
                .fn()
                .mockResolvedValue(receipt({ success: false })),
        });
        expect(await checkBatchOutcome(TX_ID, EXPECT, reverted.ports)).toBe(
            'not-deposited',
        );
    });

    it('unknown for everything else — one read, no polling', async () => {
        for (const read of [
            AGAIN,
            { kind: 'unknown', code: 'x' } as const,
            new Error('down'),
        ]) {
            const h = harness([read]);
            expect(await checkBatchOutcome(TX_ID, EXPECT, h.ports)).toBe(
                'unknown',
            );
            expect(h.statusReads()).toBe(1);
        }
        const unreadable = harness([MINED], {
            getReceipt: jest.fn().mockRejectedValue(new Error('timeout')),
        });
        expect(await checkBatchOutcome(TX_ID, EXPECT, unreadable.ports)).toBe(
            'unknown',
        );
        const unproven = harness([MINED], {
            getReceipt: jest
                .fn()
                .mockResolvedValue(receipt({ deposit: false })),
        });
        expect(await checkBatchOutcome(TX_ID, EXPECT, unproven.ports)).toBe(
            'unknown',
        );
    });
});

describe('batch errors', () => {
    it('BatchPendingError is a pending BatchSubmissionError, and keeps its cause', () => {
        const cause = new Error('inner');
        const err = new BatchPendingError('status_timeout', { cause });
        expect(err).toBeInstanceOf(BatchSubmissionError);
        expect(err).toBeInstanceOf(Error);
        expect(err.outcome).toBe('pending');
        expect(err.name).toBe('BatchPendingError');
        expect((err as { cause?: unknown }).cause).toBe(cause);
    });

    it('only a revert or a `failed` outcome is definitive', () => {
        expect(isDefinitivelyNotSubmitted(new BatchRevertedError(''))).toBe(
            true,
        );
        expect(
            isDefinitivelyNotSubmitted(
                new BatchSubmissionError('no_session', 'failed'),
            ),
        ).toBe(true);
        expect(isDefinitivelyNotSubmitted(new BatchPendingError('x'))).toBe(
            false,
        );
        expect(
            isDefinitivelyNotSubmitted(
                new BatchSubmissionError('x', 'already-submitted'),
            ),
        ).toBe(false);
        expect(isDefinitivelyNotSubmitted(new Error('anything'))).toBe(false);
        expect(batchOutcomeOf(new Error('anything'))).toBeNull();
    });

    it('names no party in its message', () => {
        for (const outcome of [
            'failed',
            'pending',
            'already-submitted',
        ] as const) {
            expect(new BatchSubmissionError('c', outcome).message).not.toMatch(
                /user|wallet|reject|cancel|declin/i,
            );
        }
    });
});
