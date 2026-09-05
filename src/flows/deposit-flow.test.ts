/**
 * The headless harness. Fake ports, a fake clock, no framework, no network —
 * the whole point of moving the pipeline out of the applications is that its
 * rules can be driven like this instead of through a rendered dialog.
 *
 * Every scenario kasu-ui's `use-deposit-submit.test.tsx` covers is reproduced
 * here, plus the ones only a headless harness can reach: `reset()` mid-flight,
 * unsubscription, and the exact bytes handed to `approve`.
 */
import { BigNumber, constants } from 'ethers';

import {
    buildLegacyContractRequestMessage,
    buildLoanAgreementSignMessage,
    encodeDepositData,
    GenerateContractResponse,
} from '../domain/loan-contract';
import { DepositParams, KycParams } from '../facade/types';

import {
    CONTRACT_TTL_MS,
    DepositFlow,
    DepositFlowInput,
    DepositPhase,
    DepositPorts,
    GenerateContractRequest,
    KycSignature,
    WaitableTransaction,
} from './deposit-flow';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const USER = '0xAbCdEf0000000000000000000000000000000001' as const;
const LOWER = USER.toLowerCase();
const SPENDER = '0x00000000000000000000000000000000000000Ee';
const POOL = '0xpool';
const TRANCHE = '0xtranche';
/** 1,000 USDC at 6dp. */
const AMOUNT = BigNumber.from('1000000000');
const BASE_NOW = 1_785_313_320_000;

const CONTRACT_MESSAGE = 'I accept the Kasu loan agreement.';

/**
 * A syntactically valid 65-byte signature. `encodeDepositData` ABI-encodes it
 * as `bytes`, so a placeholder like `'0xSIG'` would fail in the coder rather
 * than in the flow — the fake has to be hex.
 */
function fakeSignature(n: number): string {
    return `0x${n.toString(16).padStart(2, '0').repeat(65)}`;
}

const LOAN_AGREEMENT_INPUT: DepositFlowInput = {
    poolId: POOL,
    trancheId: TRANCHE,
    amount: AMOUNT,
    fixedTermConfigId: '0',
    userAddress: USER,
    spender: SPENDER,
    depositAmount: 1000,
    contractMessage: {
        format: 'loan-agreement',
        strategyName: 'Taxation Funding (Tax Pay)',
        region: 'Australia',
        optionName: 'Mezzanine',
        amountLabel: '1,000 USDC',
    },
};

const LEGACY_INPUT: DepositFlowInput = {
    ...LOAN_AGREEMENT_INPUT,
    contractMessage: { format: 'legacy' },
};

const KYC_PARAMS: KycParams = {
    contractAbi: [],
    contractAddress: '0xallowlist',
    functionName: 'verifyUserKyc',
    args: [LOWER],
    userAddress: LOWER,
    chainId: '8453',
};

const KYC_SIGNATURE: KycSignature = {
    signature: '0xKYCSIG',
    blockExpiration: 4242,
};

/** A wallet rejection, in MetaMask's shape. */
function rejection(): Error {
    return Object.assign(new Error('User rejected the request'), { code: 4001 });
}

/** ethers' reverted-gas-estimate shape. */
function revert(): Error {
    return Object.assign(new Error('cannot estimate gas'), {
        code: 'UNPREDICTABLE_GAS_LIMIT',
    });
}

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

interface Harness {
    flow: DepositFlow;
    ports: DepositPorts;
    clock: { now: number };
    signed: string[];
    generateRequests: GenerateContractRequest[];
    approveCalls: { spender: string; amount: BigNumber }[];
    depositCalls: DepositParams[];
    phases: DepositPhase[];
    /** Every state the flow published, in order. */
    states: { phase: DepositPhase; stepIndex: number; stepTotal: number }[];
}

function makeHarness(
    overrides: Partial<DepositPorts> = {},
    opts?: { contractTtlMs?: number },
): Harness {
    const clock = { now: BASE_NOW };
    const signed: string[] = [];
    const generateRequests: GenerateContractRequest[] = [];
    const approveCalls: { spender: string; amount: BigNumber }[] = [];
    const depositCalls: DepositParams[] = [];

    const waitable = (): WaitableTransaction => ({
        wait: (): Promise<unknown> => Promise.resolve({ status: 1 }),
    });

    const ports: DepositPorts = {
        signMessage: (message: string): Promise<string> => {
            signed.push(message);
            return Promise.resolve(fakeSignature(signed.length));
        },
        generateContract: (
            req: GenerateContractRequest,
        ): Promise<GenerateContractResponse> => {
            generateRequests.push(req);
            return Promise.resolve<GenerateContractResponse>({
                fullName: 'A Lender',
                contractMessage: CONTRACT_MESSAGE,
                formattedMessage: JSON.stringify({}),
                contractType: 'retail',
                contractVersion: 1,
                timestamp: clock.now,
            });
        },
        buildKycParams: (): KycParams => KYC_PARAMS,
        getKycSignature: (): Promise<KycSignature> =>
            Promise.resolve(KYC_SIGNATURE),
        // Wide open by default, so the approve step is out of scope unless a
        // test says otherwise — the same default kasu-ui's suite uses.
        readAllowance: (): Promise<BigNumber> =>
            Promise.resolve(constants.MaxUint256),
        approve: (
            spender: string,
            amount: BigNumber,
        ): Promise<WaitableTransaction> => {
            approveCalls.push({ spender, amount });
            return Promise.resolve(waitable());
        },
        deposit: (params: DepositParams): Promise<WaitableTransaction> => {
            depositCalls.push(params);
            return Promise.resolve(waitable());
        },
        now: (): number => clock.now,
        ...overrides,
    };

    const flow = new DepositFlow(ports, opts);
    const phases: DepositPhase[] = [];
    const states: Harness['states'] = [];
    flow.subscribe((s) => {
        phases.push(s.phase);
        states.push({
            phase: s.phase,
            stepIndex: s.stepIndex,
            stepTotal: s.stepTotal,
        });
    });

    return {
        flow,
        ports,
        clock,
        signed,
        generateRequests,
        approveCalls,
        depositCalls,
        phases,
        states,
    };
}

/** Yield to the macrotask queue until `predicate` holds. */
async function until(
    predicate: () => boolean,
    label: string,
): Promise<void> {
    for (let i = 0; i < 500; i += 1) {
        if (predicate()) return;
        await new Promise((resolve) => setImmediate(resolve));
    }
    throw new Error(`timed out waiting for ${label}`);
}

/** Start, wait for the agreement, accept it, wait for the run to finish. */
async function runAccepting(
    h: Harness,
    input: DepositFlowInput = LOAN_AGREEMENT_INPUT,
): Promise<void> {
    const running = h.flow.start(input);
    await until(
        () => h.flow.state.phase === 'awaiting-accept',
        'awaiting-accept',
    );
    await h.flow.acceptContract();
    await running;
}

/** Drop the repeated phases so a sequence assertion reads as a path. */
function phasePath(phases: DepositPhase[]): DepositPhase[] {
    return phases.filter((p, i) => p !== phases[i - 1]);
}

// ---------------------------------------------------------------------------
// Happy paths
// ---------------------------------------------------------------------------

describe('DepositFlow — happy path', () => {
    it('reaches success without an approve when the allowance already covers the amount', async () => {
        const h = makeHarness();
        await runAccepting(h);

        expect(h.flow.state.phase).toBe('success');
        expect(h.flow.state.failure).toBeNull();
        expect(h.approveCalls).toHaveLength(0);
        expect(h.depositCalls).toHaveLength(1);
        expect(h.generateRequests).toHaveLength(1);
        // Two signatures: the auth message and the acceptance.
        expect(h.signed).toHaveLength(2);
        expect(phasePath(h.phases)).toEqual([
            'idle',
            'generating-sign',
            'generating-fetch',
            'awaiting-accept',
            'accepting-sign',
            'request-sign',
            'request-confirm',
            'success',
        ]);
    });

    it('reaches success through the approve step when the allowance is short', async () => {
        const h = makeHarness({
            readAllowance: (): Promise<BigNumber> =>
                Promise.resolve(BigNumber.from(0)),
        });
        await runAccepting(h);

        expect(h.flow.state.phase).toBe('success');
        expect(h.approveCalls).toHaveLength(1);
        expect(phasePath(h.phases)).toEqual([
            'idle',
            'generating-sign',
            'generating-fetch',
            'awaiting-accept',
            'accepting-sign',
            'approve',
            'request-sign',
            'request-confirm',
            'success',
        ]);
    });

    it('approves the EXACT deposit amount and never an unlimited allowance', async () => {
        const h = makeHarness({
            readAllowance: (): Promise<BigNumber> =>
                Promise.resolve(BigNumber.from(0)),
        });
        await runAccepting(h);

        expect(h.approveCalls).toHaveLength(1);
        const call = h.approveCalls[0];
        expect(call.spender).toBe(SPENDER);
        // Byte-for-byte the deposit amount — not rounded up, not padded.
        expect(call.amount.eq(AMOUNT)).toBe(true);
        expect(call.amount.eq(constants.MaxUint256)).toBe(false);
        expect(call.amount.toString()).toBe(AMOUNT.toString());
        // And the deposit spends exactly what was approved.
        expect(BigNumber.from(h.depositCalls[0].amount).eq(call.amount)).toBe(
            true,
        );
    });

    it('drops the badge total by one when the approve step is out of scope', async () => {
        const withApprove = makeHarness({
            readAllowance: (): Promise<BigNumber> =>
                Promise.resolve(BigNumber.from(0)),
        });
        await runAccepting(withApprove);
        expect(withApprove.flow.state.stepTotal).toBe(4);
        expect(withApprove.flow.state.stepIndex).toBe(4);
        expect(
            withApprove.states.find((s) => s.phase === 'approve'),
        ).toEqual({ phase: 'approve', stepIndex: 3, stepTotal: 4 });

        const skipped = makeHarness();
        await runAccepting(skipped);
        expect(skipped.flow.state.stepTotal).toBe(3);
        expect(skipped.flow.state.stepIndex).toBe(3);
        expect(skipped.states.find((s) => s.phase === 'awaiting-accept')).toEqual(
            { phase: 'awaiting-accept', stepIndex: 2, stepTotal: 3 },
        );
    });

    it('reads the allowance live, and a failed read assumes an approve is needed', async () => {
        const h = makeHarness({
            readAllowance: (): Promise<BigNumber> =>
                Promise.reject(new Error('rpc down')),
        });
        await runAccepting(h);

        expect(h.flow.state.approvalRequired).toBe(true);
        expect(h.approveCalls).toHaveLength(1);
        expect(h.flow.state.phase).toBe('success');
    });

    it('submits the deposit with the encoded acceptance signature and the KYC signature', async () => {
        const h = makeHarness();
        await runAccepting(h);

        const call = h.depositCalls[0];
        expect(call.poolId).toBe(POOL);
        expect(call.trancheId).toBe(TRANCHE);
        expect(call.fixedTermConfigId).toBe('0');
        expect(call.kycSignature).toEqual({
            signature: KYC_SIGNATURE.signature,
            blockExpiration: KYC_SIGNATURE.blockExpiration,
        });
        // The acceptance signature is the SECOND one the wallet produced.
        expect(call.depositData).toBe(
            encodeDepositData({
                signature: fakeSignature(2),
                timestamp: BASE_NOW,
                contractVersion: 1,
                contractType: 'retail',
            }),
        );
    });
});

// ---------------------------------------------------------------------------
// The signed messages
// ---------------------------------------------------------------------------

describe('DepositFlow — the generate request', () => {
    it('signs the human-readable message and posts the four fields with the same timestamp', async () => {
        const h = makeHarness();
        await runAccepting(h);

        const req = h.generateRequests[0];
        expect(req).toMatchObject({
            address: LOWER,
            timestamp: BASE_NOW,
            depositAmount: 1000,
            strategyName: 'Taxation Funding (Tax Pay)',
            region: 'Australia',
            optionName: 'Mezzanine',
            amountLabel: '1,000 USDC',
            poolId: POOL,
            trancheId: TRANCHE,
            fixedTermConfigId: '0',
        });
        // Byte-identical to the protocol builder, on the timestamp that was
        // posted — kasu-backend rebuilds one from the other.
        expect(h.signed[0]).toBe(
            buildLoanAgreementSignMessage({
                strategyName: 'Taxation Funding (Tax Pay)',
                region: 'Australia',
                optionName: 'Mezzanine',
                amountLabel: '1,000 USDC',
                timestamp: req.timestamp,
            }),
        );
        expect(req.signedMessage).toBe(h.signed[0]);
        expect(req.signature).toBe(fakeSignature(1));
    });

    it('signs the legacy message, lowercased, and posts no display fields', async () => {
        const h = makeHarness();
        await runAccepting(h, LEGACY_INPUT);

        const req = h.generateRequests[0];
        expect(h.signed[0]).toBe(
            buildLegacyContractRequestMessage(LOWER, req.timestamp),
        );
        expect(h.signed[0]).toContain(LOWER);
        expect(req.strategyName).toBeUndefined();
        expect(req.region).toBeUndefined();
        expect(req.optionName).toBeUndefined();
        expect(req.amountLabel).toBeUndefined();
    });

    it('signs the agreement text the backend returned, not a text of its own', async () => {
        const h = makeHarness();
        await runAccepting(h);
        expect(h.signed[1]).toBe(CONTRACT_MESSAGE);
    });
});

// ---------------------------------------------------------------------------
// Cancellations — one per step
// ---------------------------------------------------------------------------

describe('DepositFlow — wallet cancellation', () => {
    it('reports a cancel on the generate step', async () => {
        const h = makeHarness({
            signMessage: (): Promise<string> => Promise.reject(rejection()),
        });
        await h.flow.start(LOAN_AGREEMENT_INPUT);

        expect(h.flow.state.phase).toBe('error');
        expect(h.flow.state.failure).toEqual({
            step: 'generate',
            reason: 'cancelled',
        });
        expect(h.generateRequests).toHaveLength(0);
    });

    it('reports a cancel on the confirm step', async () => {
        let calls = 0;
        const h = makeHarness({
            signMessage: (): Promise<string> => {
                calls += 1;
                if (calls === 1) return Promise.resolve(fakeSignature(1));
                return Promise.reject(rejection());
            },
        });
        await runAccepting(h);

        expect(h.flow.state.phase).toBe('error');
        expect(h.flow.state.failure).toEqual({
            step: 'confirm',
            reason: 'cancelled',
        });
        expect(h.depositCalls).toHaveLength(0);
    });

    it('reports a cancel on the approve step', async () => {
        const h = makeHarness({
            readAllowance: (): Promise<BigNumber> =>
                Promise.resolve(BigNumber.from(0)),
            approve: (): Promise<WaitableTransaction> =>
                Promise.reject(rejection()),
        });
        await runAccepting(h);

        expect(h.flow.state.failure).toEqual({
            step: 'approve',
            reason: 'cancelled',
        });
        expect(h.depositCalls).toHaveLength(0);
    });

    it('reports a cancel on the request step', async () => {
        const h = makeHarness({
            deposit: (): Promise<WaitableTransaction> =>
                Promise.reject(rejection()),
        });
        await runAccepting(h);

        expect(h.flow.state.failure).toEqual({
            step: 'request',
            reason: 'cancelled',
        });
        expect(h.flow.state.stepIndex).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// Failures
// ---------------------------------------------------------------------------

describe('DepositFlow — failures', () => {
    it('reports a backend failure on the generate step, with the error', async () => {
        const boom = new Error('502 Bad Gateway');
        const h = makeHarness({
            generateContract: (): Promise<GenerateContractResponse> =>
                Promise.reject(boom),
        });
        await h.flow.start(LOAN_AGREEMENT_INPUT);

        expect(h.flow.state.failure).toEqual({
            step: 'generate',
            reason: 'failed',
            error: boom,
        });
        expect(phasePath(h.phases)).toEqual([
            'idle',
            'generating-sign',
            'generating-fetch',
            'error',
        ]);
    });

    it('never calls a backend failure a cancellation, whatever the body says', async () => {
        // The lender's wallet was not involved in an HTTP call. A backend that
        // happens to echo "user rejected" must not be reported to them as
        // something they did.
        const h = makeHarness({
            generateContract: (): Promise<GenerateContractResponse> =>
                Promise.reject(new Error('user rejected by the risk engine')),
        });
        await h.flow.start(LOAN_AGREEMENT_INPUT);

        expect(h.flow.state.failure?.reason).toBe('failed');
    });

    it('reports a revert on the request step as insufficient balance', async () => {
        const err = revert();
        const h = makeHarness({
            deposit: (): Promise<WaitableTransaction> => Promise.reject(err),
        });
        await runAccepting(h);

        expect(h.flow.state.failure).toEqual({
            step: 'request',
            reason: 'insufficient-balance',
            error: err,
        });
    });

    it('reports any other request failure as failed, with the error', async () => {
        const boom = new Error('nonce too low');
        const h = makeHarness({
            deposit: (): Promise<WaitableTransaction> => Promise.reject(boom),
        });
        await runAccepting(h);

        expect(h.flow.state.failure).toEqual({
            step: 'request',
            reason: 'failed',
            error: boom,
        });
    });

    it('reports a failure while waiting for the receipt on the request step', async () => {
        const boom = new Error('transaction failed');
        const h = makeHarness({
            deposit: (): Promise<WaitableTransaction> =>
                Promise.resolve({
                    wait: (): Promise<unknown> => Promise.reject(boom),
                }),
        });
        await runAccepting(h);

        expect(h.flow.state.phase).toBe('error');
        expect(h.flow.state.failure).toEqual({
            step: 'request',
            reason: 'failed',
            error: boom,
        });
    });

    it('reports a KYC signature failure on the request step', async () => {
        const boom = new Error('kyc expired');
        const h = makeHarness({
            getKycSignature: (): Promise<KycSignature> => Promise.reject(boom),
        });
        await runAccepting(h);

        expect(h.flow.state.failure).toEqual({
            step: 'request',
            reason: 'failed',
            error: boom,
        });
        expect(h.depositCalls).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// Decline, TTL, re-entrancy, reset
// ---------------------------------------------------------------------------

describe('DepositFlow — decline', () => {
    it('ends on declined, with no failure and nothing submitted', async () => {
        const h = makeHarness();
        const running = h.flow.start(LOAN_AGREEMENT_INPUT);
        await until(
            () => h.flow.state.phase === 'awaiting-accept',
            'awaiting-accept',
        );
        h.flow.declineContract();
        await running;

        expect(h.flow.state.phase).toBe('declined');
        // Backing out is a choice, not a fault.
        expect(h.flow.state.failure).toBeNull();
        expect(h.depositCalls).toHaveLength(0);
        expect(h.approveCalls).toHaveLength(0);
        // The agreement stays on the state so the consumer can re-show it.
        expect(h.flow.state.contract?.contractMessage).toBe(CONTRACT_MESSAGE);
    });

    it('ignores accept and decline when nothing is parked', async () => {
        const h = makeHarness();
        h.flow.declineContract();
        await h.flow.acceptContract();
        expect(h.flow.state.phase).toBe('idle');
        expect(h.signed).toHaveLength(0);
    });
});

describe('DepositFlow — the 5-minute TTL guard', () => {
    it('refuses an agreement that expired while the lender read it', async () => {
        const h = makeHarness();
        const running = h.flow.start(LOAN_AGREEMENT_INPUT);
        await until(
            () => h.flow.state.phase === 'awaiting-accept',
            'awaiting-accept',
        );
        h.clock.now = BASE_NOW + CONTRACT_TTL_MS + 1;
        await h.flow.acceptContract();
        await running;

        expect(h.flow.state.failure).toEqual({
            step: 'request',
            reason: 'contract-expired',
        });
        // Never a doomed transaction, and never an approval for one.
        expect(h.depositCalls).toHaveLength(0);
        expect(h.approveCalls).toHaveLength(0);
    });

    it('accepts an agreement that is exactly at the boundary', async () => {
        const h = makeHarness();
        const running = h.flow.start(LOAN_AGREEMENT_INPUT);
        await until(
            () => h.flow.state.phase === 'awaiting-accept',
            'awaiting-accept',
        );
        h.clock.now = BASE_NOW + CONTRACT_TTL_MS;
        await h.flow.acceptContract();
        await running;

        expect(h.flow.state.phase).toBe('success');
    });

    it('honours a custom TTL', async () => {
        const h = makeHarness({}, { contractTtlMs: 1000 });
        const running = h.flow.start(LOAN_AGREEMENT_INPUT);
        await until(
            () => h.flow.state.phase === 'awaiting-accept',
            'awaiting-accept',
        );
        h.clock.now = BASE_NOW + 1001;
        await h.flow.acceptContract();
        await running;

        expect(h.flow.state.failure).toEqual({
            step: 'request',
            reason: 'contract-expired',
        });
    });
});

describe('DepositFlow — re-entrancy', () => {
    it('ignores a second start while one run is in flight', async () => {
        const h = makeHarness();
        const first = h.flow.start(LOAN_AGREEMENT_INPUT);
        const second = h.flow.start(LOAN_AGREEMENT_INPUT);
        await second;

        await until(
            () => h.flow.state.phase === 'awaiting-accept',
            'awaiting-accept',
        );
        await h.flow.acceptContract();
        await first;

        // One pipeline, not two: a double-tap must never fire two deposits.
        expect(h.generateRequests).toHaveLength(1);
        expect(h.depositCalls).toHaveLength(1);
        expect(h.flow.state.phase).toBe('success');
    });

    it('runs again cleanly after a terminal phase', async () => {
        const h = makeHarness();
        await runAccepting(h);
        expect(h.flow.state.phase).toBe('success');

        await runAccepting(h);
        expect(h.flow.state.phase).toBe('success');
        expect(h.depositCalls).toHaveLength(2);
    });
});

describe('DepositFlow — reset', () => {
    it('abandons a run parked on the agreement and returns to idle', async () => {
        const h = makeHarness();
        const running = h.flow.start(LOAN_AGREEMENT_INPUT);
        await until(
            () => h.flow.state.phase === 'awaiting-accept',
            'awaiting-accept',
        );

        h.flow.reset();
        await running;

        expect(h.flow.state).toEqual({
            phase: 'idle',
            step: null,
            stepIndex: 0,
            stepTotal: 4,
            approvalRequired: true,
            contract: null,
            failure: null,
        });
        expect(h.depositCalls).toHaveLength(0);
        // The abandoned run never resurfaces as an error.
        expect(h.phases).not.toContain('error');
        expect(h.flow.isRunning).toBe(false);
    });

    it('lets a fresh run start after a mid-flight reset', async () => {
        const h = makeHarness();
        const running = h.flow.start(LOAN_AGREEMENT_INPUT);
        await until(
            () => h.flow.state.phase === 'awaiting-accept',
            'awaiting-accept',
        );
        h.flow.reset();
        await running;

        await runAccepting(h);
        expect(h.flow.state.phase).toBe('success');
        expect(h.depositCalls).toHaveLength(1);
    });

    it('drops the transitions of a run abandoned mid-request', async () => {
        let release: (() => void) | undefined;
        const held = new Promise<void>((resolve) => {
            release = resolve;
        });
        const h = makeHarness({
            deposit: async (
                params: DepositParams,
            ): Promise<WaitableTransaction> => {
                h.depositCalls.push(params);
                await held;
                return { wait: (): Promise<unknown> => Promise.resolve(null) };
            },
        });

        const running = h.flow.start(LOAN_AGREEMENT_INPUT);
        await until(
            () => h.flow.state.phase === 'awaiting-accept',
            'awaiting-accept',
        );
        await h.flow.acceptContract();
        await until(
            () => h.flow.state.phase === 'request-sign',
            'request-sign',
        );

        h.flow.reset();
        release?.();
        await running;

        // The submission was already in flight and cannot be recalled — but it
        // must not drive the abandoned view back to `success`.
        expect(h.depositCalls).toHaveLength(1);
        expect(h.flow.state.phase).toBe('idle');
        expect(h.phases).not.toContain('success');
    });
});

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

describe('DepositFlow — subscribe', () => {
    it('publishes every transition and stops on unsubscribe', async () => {
        const h = makeHarness();
        const seen: DepositPhase[] = [];
        const stop = h.flow.subscribe((s) => seen.push(s.phase));

        const running = h.flow.start(LOAN_AGREEMENT_INPUT);
        await until(
            () => h.flow.state.phase === 'awaiting-accept',
            'awaiting-accept',
        );
        stop();
        const seenAtStop = seen.length;

        await h.flow.acceptContract();
        await running;

        expect(seen).toContain('generating-sign');
        expect(seen).toContain('awaiting-accept');
        expect(seen).toHaveLength(seenAtStop);
        expect(seen).not.toContain('success');
        // The flow itself carried on — only this listener stopped hearing.
        expect(h.flow.state.phase).toBe('success');
        expect(h.phases).toContain('success');
    });

    it('keeps running when a listener throws', async () => {
        const h = makeHarness();
        h.flow.subscribe(() => {
            throw new Error('render blew up');
        });
        await runAccepting(h);
        expect(h.flow.state.phase).toBe('success');
    });

    it('unsubscribing twice is harmless', () => {
        const h = makeHarness();
        const stop = h.flow.subscribe(() => undefined);
        stop();
        stop();
        expect(h.flow.state.phase).toBe('idle');
    });
});
