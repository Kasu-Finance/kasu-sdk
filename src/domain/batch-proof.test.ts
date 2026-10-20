import { BigNumber, constants, utils } from 'ethers';

import { IERC20MetadataAbi__factory } from '../contracts/factories/IERC20MetadataAbi__factory';
import { ILendingPoolManagerAbi__factory } from '../contracts/factories/ILendingPoolManagerAbi__factory';

import {
    DepositBatchCall,
    DepositBatchMismatchError,
    ENTRY_POINT_V07,
    proveDepositInReceipt,
    proveUserOperationInReceipt,
    ReceiptLog,
    validateDepositBatchCalls,
} from './batch-proof';
import { isUserRejected } from './wallet-errors';

// Ported from kasu-ui (one-tx lend) `deposit-relay/__tests__/
// validate-batch-calls.test.ts` and `prove-relayed-deposit.test.ts`, viem →
// ethers v5, plus the amount pin the original proof did not carry. Fixtures
// are ENCODED FROM THE ABIs, never pasted hex, and every address is synthetic.

const LENDER = '0x0000000000000000000000000000000000000001';
const OTHER = '0x0000000000000000000000000000000000000002';
const STABLE = '0x0000000000000000000000000000000000000003';
const LPM = '0x0000000000000000000000000000000000000004';
const POOL = '0x0000000000000000000000000000000000000005';
const TRANCHE = '0x0000000000000000000000000000000000000006';
const PENDING_POOL = '0x0000000000000000000000000000000000000007';
const PAYMASTER = '0x0000000000000000000000000000000000000008';
const USER_OP_HASH = `0x${'00'.repeat(31)}0a`;
const OTHER_OP_HASH = `0x${'00'.repeat(31)}0b`;
const AMOUNT = BigNumber.from(1_000_000_000); // 1,000.00 at 6 decimals
const DNFT_ID = BigNumber.from(42);

const ERC20 = IERC20MetadataAbi__factory.createInterface();
const LPM_IFACE = ILendingPoolManagerAbi__factory.createInterface();
const ENTRY_POINT = new utils.Interface([
    'event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)',
    'event UserOperationRevertReason(bytes32 indexed userOpHash, address indexed sender, uint256 nonce, bytes revertReason)',
    'event BeforeExecution()',
]);
const PENDING = new utils.Interface([
    'event DepositRequested(address indexed user, address indexed tranche, uint256 indexed dNftID, uint256 epochId, uint256 amount)',
]);
const ERC20_EVENTS = new utils.Interface([
    'event Approval(address indexed owner, address indexed spender, uint256 value)',
]);

// ---------------------------------------------------------------------------
// Batch fixtures
// ---------------------------------------------------------------------------

function approveCall(
    amount: BigNumber = AMOUNT,
    spender: string = LPM,
    to: string = STABLE,
): DepositBatchCall {
    return { to, data: ERC20.encodeFunctionData('approve', [spender, amount]) };
}

function depositCall(
    amount: BigNumber = AMOUNT,
    o: {
        to?: string;
        pool?: string;
        tranche?: string;
        swapData?: string;
        fixedTermConfigId?: number;
    } = {},
): DepositBatchCall {
    return {
        to: o.to ?? LPM,
        data: LPM_IFACE.encodeFunctionData('requestDepositWithKyc', [
            o.pool ?? POOL,
            o.tranche ?? TRANCHE,
            amount,
            o.swapData ?? '0x',
            o.fixedTermConfigId ?? 0,
            '0x1234',
            { blockExpiration: 999, signature: '0xabcd' },
        ]),
    };
}

const EXPECTED_BATCH = {
    stableAsset: STABLE,
    spender: LPM,
    poolId: POOL,
    trancheId: TRANCHE,
    amount: AMOUNT,
    fixedTermConfigId: 0,
};

describe('validateDepositBatchCalls', () => {
    it('accepts exact-amount approve(LPM, A) + requestDepositWithKyc(pool, tranche, A, 0x) and returns the tranche', () => {
        const validated = validateDepositBatchCalls(
            [approveCall(), depositCall()],
            EXPECTED_BATCH,
        );
        expect(validated.tranche.toLowerCase()).toBe(TRANCHE);
        expect(validated.amount.eq(AMOUNT)).toBe(true);
    });

    it('accepts the very batch DepositFlow encodes (an explicit zero value too)', () => {
        const calls = [
            { ...approveCall(), value: 0 },
            { ...depositCall(), value: '0' },
        ];
        expect(() =>
            validateDepositBatchCalls(calls, EXPECTED_BATCH),
        ).not.toThrow();
    });

    it('compares addresses case-insensitively', () => {
        const mixed = '0x000000000000000000000000000000000000AbCd';
        const calls = [
            approveCall(AMOUNT, mixed.toLowerCase(), STABLE),
            depositCall(AMOUNT, { to: mixed.toLowerCase() }),
        ];
        expect(() =>
            validateDepositBatchCalls(calls, {
                ...EXPECTED_BATCH,
                spender: mixed,
            }),
        ).not.toThrow();
    });

    it('pins fixedTermConfigId both ways: another lock, or a lock on a variable run', () => {
        const locked = [
            approveCall(),
            depositCall(AMOUNT, { fixedTermConfigId: 2 }),
        ];
        expect(() =>
            validateDepositBatchCalls(locked, {
                ...EXPECTED_BATCH,
                fixedTermConfigId: 2,
            }),
        ).not.toThrow();
        // A variable-rate run ('0') must not sign a batch that locks it…
        expect(() => validateDepositBatchCalls(locked, EXPECTED_BATCH)).toThrow(
            /fixed-term-config/,
        );
        // …and a fixed-term run must not sign a batch that unlocks it.
        expect(() =>
            validateDepositBatchCalls([approveCall(), depositCall()], {
                ...EXPECTED_BATCH,
                fixedTermConfigId: '2',
            }),
        ).toThrow(/fixed-term-config/);
    });

    const approveData = approveCall().data;
    const cases: [string, DepositBatchCall[], RegExp][] = [
        [
            'an unlimited approval',
            [approveCall(constants.MaxUint256), depositCall()],
            /approve-amount/,
        ],
        [
            'an approval above the deposit',
            [approveCall(AMOUNT.add(1)), depositCall()],
            /approve-amount/,
        ],
        [
            'a deposit above the approval',
            [approveCall(), depositCall(AMOUNT.add(1))],
            /deposit-amount/,
        ],
        [
            'both equal to each other but not to the run',
            [approveCall(AMOUNT.mul(2)), depositCall(AMOUNT.mul(2))],
            /approve-amount/,
        ],
        [
            'a WRONG SPENDER on the approval',
            [approveCall(AMOUNT, OTHER), depositCall()],
            /approve-spender/,
        ],
        [
            'another token',
            [approveCall(AMOUNT, LPM, OTHER), depositCall()],
            /approve-token/,
        ],
        [
            'another deposit target',
            [approveCall(), depositCall(AMOUNT, { to: OTHER })],
            /deposit-target/,
        ],
        [
            'another strategy',
            [approveCall(), depositCall(AMOUNT, { pool: OTHER })],
            /deposit-pool/,
        ],
        [
            'another tranche',
            [approveCall(), depositCall(AMOUNT, { tranche: OTHER })],
            /deposit-tranche/,
        ],
        [
            'swap data',
            [approveCall(), depositCall(AMOUNT, { swapData: '0x01' })],
            /swap-data/,
        ],
        ['one call', [approveCall()], /call-count/],
        ['no calls', [], /call-count/],
        [
            'an EXTRA call',
            [approveCall(), depositCall(), depositCall()],
            /call-count/,
        ],
        [
            'an extra approval',
            [approveCall(), approveCall(), depositCall()],
            /call-count/,
        ],
        ['swapped order', [depositCall(), approveCall()], /approve-token/],
        [
            'non-hex data',
            [{ ...approveCall(), data: 'nope' }, depositCall()],
            /malformed-call/,
        ],
        [
            'a non-address target',
            [{ ...approveCall(), to: 'stable' }, depositCall()],
            /malformed-call/,
        ],
        [
            'native value on the deposit',
            [approveCall(), { ...depositCall(), value: 1 }],
            /native-value/,
        ],
        [
            'native value on the approval',
            [{ ...approveCall(), value: '1' }, depositCall()],
            /native-value/,
        ],
        [
            'an unreadable value',
            [{ ...approveCall(), value: 'lots' }, depositCall()],
            /native-value/,
        ],
        [
            'a transfer in place of the approval',
            [
                {
                    to: STABLE,
                    data: ERC20.encodeFunctionData('transfer', [LPM, AMOUNT]),
                },
                depositCall(),
            ],
            /approve-call/,
        ],
        [
            'another LPM function in place of the deposit',
            [
                approveCall(),
                {
                    to: LPM,
                    data: LPM_IFACE.encodeFunctionData('cancelDepositRequest', [
                        POOL,
                        1,
                    ]),
                },
            ],
            /deposit-call/,
        ],
        [
            'trailing bytes after a valid approval',
            [{ to: STABLE, data: `${approveData}00` }, depositCall()],
            /non-canonical-encoding/,
        ],
        [
            'an unknown selector',
            [{ to: STABLE, data: '0xdeadbeef' }, depositCall()],
            /approve-call/,
        ],
    ];

    it.each(cases)('refuses %s', (_label, calls, code) => {
        expect(() => validateDepositBatchCalls(calls, EXPECTED_BATCH)).toThrow(
            DepositBatchMismatchError,
        );
        expect(() => validateDepositBatchCalls(calls, EXPECTED_BATCH)).toThrow(
            code,
        );
    });

    it('refuses a non-positive run amount outright', () => {
        expect(() =>
            validateDepositBatchCalls(
                [
                    approveCall(BigNumber.from(0)),
                    depositCall(BigNumber.from(0)),
                ],
                { ...EXPECTED_BATCH, amount: 0 },
            ),
        ).toThrow(/non-positive-amount/);
    });

    it('names no party in its message, so it can never read as a user rejection', () => {
        try {
            validateDepositBatchCalls([approveCall()], EXPECTED_BATCH);
            throw new Error('expected a throw');
        } catch (err) {
            expect(err).toBeInstanceOf(DepositBatchMismatchError);
            expect(isUserRejected(err)).toBe(false);
            expect((err as Error).message).not.toMatch(
                /user|wallet|reject|cancel|declin/i,
            );
        }
    });
});

// ---------------------------------------------------------------------------
// Receipt fixtures
// ---------------------------------------------------------------------------

function log(
    address: string,
    encoded: { data: string; topics: string[] },
): ReceiptLog {
    return { address, topics: encoded.topics, data: encoded.data };
}

function beforeExecutionLog(): ReceiptLog {
    return log(
        ENTRY_POINT_V07,
        ENTRY_POINT.encodeEventLog(ENTRY_POINT.getEvent('BeforeExecution'), []),
    );
}

function userOperationEventLog(o: {
    success: boolean;
    hash?: string;
    sender?: string;
    address?: string;
}): ReceiptLog {
    return log(
        o.address ?? ENTRY_POINT_V07,
        ENTRY_POINT.encodeEventLog(ENTRY_POINT.getEvent('UserOperationEvent'), [
            o.hash ?? USER_OP_HASH,
            o.sender ?? LENDER,
            PAYMASTER,
            7,
            o.success,
            1000,
            114_633,
        ]),
    );
}

function revertReasonLog(revertReason: string, sender = LENDER): ReceiptLog {
    return log(
        ENTRY_POINT_V07,
        ENTRY_POINT.encodeEventLog(
            ENTRY_POINT.getEvent('UserOperationRevertReason'),
            [USER_OP_HASH, sender, 7, revertReason],
        ),
    );
}

function depositRequestedLog(
    o: {
        user?: string;
        tranche?: string;
        amount?: BigNumber;
        address?: string;
    } = {},
): ReceiptLog {
    return log(
        o.address ?? PENDING_POOL,
        PENDING.encodeEventLog(PENDING.getEvent('DepositRequested'), [
            o.user ?? LENDER,
            o.tranche ?? TRANCHE,
            DNFT_ID,
            12,
            o.amount ?? AMOUNT,
        ]),
    );
}

/** An ERC-20 `Approval` — present in every successful batch, never proof. */
function approvalLog(): ReceiptLog {
    return log(
        STABLE,
        ERC20_EVENTS.encodeEventLog(ERC20_EVENTS.getEvent('Approval'), [
            LENDER,
            LPM,
            AMOUNT,
        ]),
    );
}

function protocolRevert(signature: string, name: string): string {
    return new utils.Interface([signature]).encodeErrorResult(name, []);
}

function receiptOf(logs: ReceiptLog[]): {
    logs: ReceiptLog[];
    blockNumber: number;
    status: number;
} {
    // `status` is 1 on EVERY receipt here — the bundler's `handleOps`
    // succeeded. That status is exactly what must not decide anything.
    return { logs, blockNumber: 123, status: 1 };
}

const EXPECTED = {
    lender: LENDER,
    tranche: TRANCHE,
    amount: AMOUNT,
    userOperationHash: USER_OP_HASH,
};

describe('proveDepositInReceipt', () => {
    it('proves a deposit: our operation succeeded and emitted DepositRequested for the lender, tranche and amount', () => {
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                approvalLog(),
                depositRequestedLog(),
                userOperationEventLog({ success: true }),
            ]),
            EXPECTED,
        );
        expect(proof.kind).toBe('deposited');
        if (proof.kind !== 'deposited') return;
        expect(proof.dNftId.eq(DNFT_ID)).toBe(true);
        expect(proof.blockNumber).toBe(123);
    });

    it('matches on sender = lender when the submitter knows no operation hash', () => {
        const receipt = receiptOf([
            beforeExecutionLog(),
            depositRequestedLog(),
            userOperationEventLog({ success: true, hash: OTHER_OP_HASH }),
        ]);
        expect(
            proveDepositInReceipt(receipt, {
                ...EXPECTED,
                userOperationHash: null,
            }).kind,
        ).toBe('deposited');
        expect(
            proveDepositInReceipt(receipt, {
                lender: LENDER,
                tranche: TRANCHE,
                amount: AMOUNT,
            }).kind,
        ).toBe('deposited');
    });

    it('a REVERTED user operation (success == false) is reverted, never deposited', () => {
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                // Even a deposit event inside a failed op cannot count: the
                // account rolled it back.
                depositRequestedLog(),
                userOperationEventLog({ success: false }),
            ]),
            EXPECTED,
        );
        expect(proof).toEqual({ kind: 'reverted', revertError: '' });
    });

    it('a malformed log beside the revert reason does not turn a revert into unproven', () => {
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                // An EntryPoint log with no topic array at all.
                {
                    address: ENTRY_POINT_V07,
                    topics: undefined as unknown as string[],
                    data: '0x',
                },
                revertReasonLog(
                    protocolRevert(
                        'error ClearingIsPending()',
                        'ClearingIsPending',
                    ),
                ),
                userOperationEventLog({ success: false }),
            ]),
            EXPECTED,
        );
        expect(proof).toEqual({
            kind: 'reverted',
            revertError: 'ClearingIsPending',
        });
    });

    it('names the protocol error from UserOperationRevertReason when it decodes', () => {
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                revertReasonLog(
                    protocolRevert(
                        'error ClearingIsPending()',
                        'ClearingIsPending',
                    ),
                ),
                userOperationEventLog({ success: false }),
            ]),
            EXPECTED,
        );
        expect(proof).toEqual({
            kind: 'reverted',
            revertError: 'ClearingIsPending',
        });
    });

    it('passes no name for an Error(string) or undecodable revert reason', () => {
        // `Error(string)` = selector 0x08c379a0 + an ABI-encoded string.
        const stringRevert = `0x08c379a0${utils.defaultAbiCoder
            .encode(['string'], ['nope'])
            .slice(2)}`;
        for (const reason of [stringRevert, '0xdeadbeef']) {
            const proof = proveDepositInReceipt(
                receiptOf([
                    beforeExecutionLog(),
                    revertReasonLog(reason),
                    userOperationEventLog({ success: false }),
                ]),
                EXPECTED,
            );
            expect(proof).toEqual({ kind: 'reverted', revertError: '' });
        }
    });

    it('ignores a revert reason another sender emitted', () => {
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                revertReasonLog(
                    protocolRevert(
                        'error ClearingIsPending()',
                        'ClearingIsPending',
                    ),
                    OTHER,
                ),
                userOperationEventLog({ success: false }),
            ]),
            EXPECTED,
        );
        expect(proof).toEqual({ kind: 'reverted', revertError: '' });
    });

    it('no DepositRequested for the lender → unproven', () => {
        expect(
            proveDepositInReceipt(
                receiptOf([
                    beforeExecutionLog(),
                    approvalLog(),
                    userOperationEventLog({ success: true }),
                ]),
                EXPECTED,
            ),
        ).toEqual({ kind: 'unproven', reason: 'no-deposit-requested' });
    });

    it('a DepositRequested for ANOTHER LENDER does not count', () => {
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                depositRequestedLog({ user: OTHER }),
                userOperationEventLog({ success: true }),
            ]),
            EXPECTED,
        );
        expect(proof.kind).toBe('unproven');
    });

    it('a DepositRequested for another tranche does not count', () => {
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                depositRequestedLog({ tranche: OTHER }),
                userOperationEventLog({ success: true }),
            ]),
            EXPECTED,
        );
        expect(proof.kind).toBe('unproven');
    });

    it('a DepositRequested for ANOTHER AMOUNT does not count, either way', () => {
        for (const amount of [
            AMOUNT.sub(1),
            AMOUNT.add(1),
            BigNumber.from(0),
        ]) {
            const proof = proveDepositInReceipt(
                receiptOf([
                    beforeExecutionLog(),
                    depositRequestedLog({ amount }),
                    userOperationEventLog({ success: true }),
                ]),
                EXPECTED,
            );
            expect(proof.kind).toBe('unproven');
        }
    });

    it('finds the matching DepositRequested among non-matching ones', () => {
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                depositRequestedLog({ user: OTHER }),
                depositRequestedLog({ amount: AMOUNT.sub(1) }),
                depositRequestedLog(),
                userOperationEventLog({ success: true }),
            ]),
            EXPECTED,
        );
        expect(proof.kind).toBe('deposited');
    });

    it('a DepositRequested from ANOTHER OPERATION in the same bundle does not count', () => {
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                depositRequestedLog(),
                userOperationEventLog({
                    success: true,
                    hash: OTHER_OP_HASH,
                    sender: OTHER,
                }),
                // Ours: no deposit inside its own execution window.
                userOperationEventLog({ success: true }),
            ]),
            EXPECTED,
        );
        expect(proof.kind).toBe('unproven');
    });

    it('a DepositRequested AFTER our operation event is outside our window', () => {
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                userOperationEventLog({ success: true }),
                depositRequestedLog(),
            ]),
            EXPECTED,
        );
        expect(proof.kind).toBe('unproven');
    });

    it('no UserOperationEvent for our hash → unproven, even with a deposit log present', () => {
        expect(
            proveDepositInReceipt(
                receiptOf([
                    beforeExecutionLog(),
                    depositRequestedLog(),
                    userOperationEventLog({
                        success: true,
                        hash: OTHER_OP_HASH,
                    }),
                ]),
                EXPECTED,
            ),
        ).toEqual({ kind: 'unproven', reason: 'no-user-operation' });
    });

    it('a UserOperationEvent emitted by a contract that is not the EntryPoint is ignored', () => {
        expect(
            proveDepositInReceipt(
                receiptOf([
                    depositRequestedLog(),
                    userOperationEventLog({ success: true, address: OTHER }),
                ]),
                EXPECTED,
            ).kind,
        ).toBe('unproven');
    });

    it('honours a non-default entry point, and only that one', () => {
        const receipt = receiptOf([
            depositRequestedLog(),
            userOperationEventLog({ success: true, address: OTHER }),
        ]);
        expect(
            proveDepositInReceipt(receipt, { ...EXPECTED, entryPoint: OTHER })
                .kind,
        ).toBe('deposited');
    });

    it('our hash but another sender is not ours', () => {
        expect(
            proveDepositInReceipt(
                receiptOf([
                    beforeExecutionLog(),
                    depositRequestedLog(),
                    userOperationEventLog({ success: true, sender: OTHER }),
                ]),
                EXPECTED,
            ).kind,
        ).toBe('unproven');
    });

    it('with the pending pool known, a DepositRequested from any other emitter does not count', () => {
        const spoofed = receiptOf([
            beforeExecutionLog(),
            depositRequestedLog({ address: OTHER }),
            userOperationEventLog({ success: true }),
        ]);
        expect(
            proveDepositInReceipt(spoofed, {
                ...EXPECTED,
                pendingPool: PENDING_POOL,
            }).kind,
        ).toBe('unproven');
        const real = receiptOf([
            beforeExecutionLog(),
            depositRequestedLog(),
            userOperationEventLog({ success: true }),
        ]);
        expect(
            proveDepositInReceipt(real, {
                ...EXPECTED,
                pendingPool: PENDING_POOL,
            }).kind,
        ).toBe('deposited');
    });

    it('a log with garbage data under a known topic is skipped, not trusted', () => {
        const good = depositRequestedLog();
        const proof = proveDepositInReceipt(
            receiptOf([
                beforeExecutionLog(),
                { ...good, data: '0x' },
                userOperationEventLog({ success: true }),
            ]),
            EXPECTED,
        );
        expect(proof.kind).toBe('unproven');
    });

    it('an empty or malformed receipt is unproven', () => {
        expect(proveDepositInReceipt(receiptOf([]), EXPECTED).kind).toBe(
            'unproven',
        );
        expect(
            proveDepositInReceipt(
                { logs: null as unknown as ReceiptLog[], blockNumber: 1 },
                EXPECTED,
            ),
        ).toEqual({ kind: 'unproven', reason: 'malformed-receipt' });
    });
});

describe('proveUserOperationInReceipt — one sponsored call', () => {
    const SENDER = { sender: LENDER, userOperationHash: USER_OP_HASH };

    it('executed: the sender’s operation succeeded', () => {
        const proof = proveUserOperationInReceipt(
            receiptOf([
                beforeExecutionLog(),
                userOperationEventLog({ success: true }),
            ]),
            SENDER,
        );
        expect(proof).toEqual({ kind: 'executed', blockNumber: 123 });
    });

    it('reverted: success == false, naming the protocol error — the receipt status (1) decides nothing', () => {
        const proof = proveUserOperationInReceipt(
            receiptOf([
                beforeExecutionLog(),
                revertReasonLog(
                    protocolRevert(
                        'error ClearingIsPending()',
                        'ClearingIsPending',
                    ),
                ),
                userOperationEventLog({ success: false }),
            ]),
            SENDER,
        );
        expect(proof).toEqual({
            kind: 'reverted',
            revertError: 'ClearingIsPending',
        });
    });

    it('reverted with an unnamed reason is still reverted, with an empty name', () => {
        expect(
            proveUserOperationInReceipt(
                receiptOf([
                    beforeExecutionLog(),
                    userOperationEventLog({ success: false }),
                ]),
                SENDER,
            ),
        ).toEqual({ kind: 'reverted', revertError: '' });
    });

    it('unproven when the only operation is another sender’s, another hash’s, or not from the EntryPoint', () => {
        for (const event of [
            userOperationEventLog({ success: true, sender: OTHER }),
            userOperationEventLog({ success: true, hash: OTHER_OP_HASH }),
            userOperationEventLog({ success: true, address: OTHER }),
        ]) {
            expect(
                proveUserOperationInReceipt(
                    receiptOf([beforeExecutionLog(), event]),
                    SENDER,
                ),
            ).toEqual({ kind: 'unproven', reason: 'no-user-operation' });
        }
    });

    it('with a known hash, reads THAT operation — not a succeeding one of the same sender before it', () => {
        const proof = proveUserOperationInReceipt(
            receiptOf([
                beforeExecutionLog(),
                userOperationEventLog({ success: true, hash: OTHER_OP_HASH }),
                userOperationEventLog({ success: false }),
            ]),
            SENDER,
        );
        expect(proof.kind).toBe('reverted');
    });

    it('without a hash, reads the sender’s FIRST operation', () => {
        expect(
            proveUserOperationInReceipt(
                receiptOf([
                    beforeExecutionLog(),
                    userOperationEventLog({
                        success: true,
                        hash: OTHER_OP_HASH,
                    }),
                ]),
                { sender: LENDER },
            ).kind,
        ).toBe('executed');
    });

    it('unproven on a receipt whose logs are not an array, and on one with no logs', () => {
        expect(
            proveUserOperationInReceipt(
                { logs: null as unknown as ReceiptLog[], blockNumber: 1 },
                SENDER,
            ),
        ).toEqual({ kind: 'unproven', reason: 'malformed-receipt' });
        expect(proveUserOperationInReceipt(receiptOf([]), SENDER)).toEqual({
            kind: 'unproven',
            reason: 'no-user-operation',
        });
    });
});
