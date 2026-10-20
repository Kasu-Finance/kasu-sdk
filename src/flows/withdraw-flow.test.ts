import { BigNumber } from 'ethers';

import {
    encodeCancelDepositCall,
    encodeRequestWithdrawalCall,
    SponsoredCall,
} from '../domain/sponsored-calls';
import { KycParams } from '../facade/types';

import {
    BatchPendingError,
    BatchRevertedError,
    BatchSubmissionError,
} from './batch-errors';
import { WaitableTransaction } from './observable';
import {
    NO_KYC_PARAMS_MESSAGE,
    NO_WITHDRAWAL_ENCODER_MESSAGE,
    NOT_A_WITHDRAWAL_CALL_MESSAGE,
    WithdrawFlow,
    WithdrawPhase,
    WithdrawPorts,
    WithdrawState,
} from './withdraw-flow';

const USER = '0xAbCdEf0000000000000000000000000000000001' as const;
const LOWER = USER.toLowerCase();
const POOL = '0xpool';
const TRANCHE = '0xtranche';
/** 10.077107 USDC at 6dp. */
const AMOUNT = BigNumber.from('10077107');

function rejection(): Error {
    return Object.assign(new Error('User rejected the request'), {
        code: 4001,
    });
}

const KYC_PARAMS: KycParams = {
    contractAbi: [],
    contractAddress: '0xallowlist',
    functionName: 'verifyUserKyc',
    args: [LOWER],
    userAddress: LOWER,
    chainId: '8453',
};

interface Harness {
    flow: WithdrawFlow;
    withdrawCalls: { poolId: string; trancheId: string; amount: BigNumber }[];
    maxCalls: { poolId: string; trancheId: string; userAddress: string }[];
    /** The addresses `buildKycParams` was asked about. */
    kycCalls: string[];
    /** The params handed to the consumer's signing backend. */
    kycSignatureCalls: KycParams[];
    phases: WithdrawPhase[];
}

function makeHarness(overrides: Partial<WithdrawPorts> = {}): Harness {
    const withdrawCalls: Harness['withdrawCalls'] = [];
    const maxCalls: Harness['maxCalls'] = [];
    const kycCalls: string[] = [];
    const kycSignatureCalls: KycParams[] = [];

    const waitable = (): WaitableTransaction => ({
        wait: (): Promise<unknown> => Promise.resolve({ status: 1 }),
    });

    const ports: WithdrawPorts = {
        buildKycParams: (address: `0x${string}`): KycParams => {
            kycCalls.push(address);
            return KYC_PARAMS;
        },
        withdraw: (params): Promise<WaitableTransaction> => {
            withdrawCalls.push(params);
            return Promise.resolve(waitable());
        },
        withdrawMax: (
            poolId: string,
            trancheId: string,
            userAddress: string,
        ): Promise<WaitableTransaction> => {
            maxCalls.push({ poolId, trancheId, userAddress });
            return Promise.resolve(waitable());
        },
        ...overrides,
    };
    if (overrides.getKycSignature) {
        const wrapped = overrides.getKycSignature;
        ports.getKycSignature = (params: KycParams): Promise<unknown> => {
            kycSignatureCalls.push(params);
            return wrapped(params);
        };
    }

    const flow = new WithdrawFlow(ports);
    const phases: WithdrawPhase[] = [];
    flow.subscribe((s) => phases.push(s.phase));

    return {
        flow,
        withdrawCalls,
        maxCalls,
        kycCalls,
        kycSignatureCalls,
        phases,
    };
}

/** Yield to the macrotask queue until `predicate` holds. */
async function until(predicate: () => boolean, label: string): Promise<void> {
    for (let i = 0; i < 500; i += 1) {
        if (predicate()) return;
        await new Promise((resolve) => setImmediate(resolve));
    }
    throw new Error(`timed out waiting for ${label}`);
}

const INPUT = {
    poolId: POOL,
    trancheId: TRANCHE,
    amount: AMOUNT,
    userAddress: USER,
};

function phasePath(phases: WithdrawPhase[]): WithdrawPhase[] {
    return phases.filter((p, i) => p !== phases[i - 1]);
}

describe('WithdrawFlow', () => {
    it('submits an exact amount and reaches success', async () => {
        const h = makeHarness();
        await h.flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: AMOUNT,
            userAddress: USER,
        });

        expect(h.flow.state.phase).toBe('success');
        expect(h.flow.state.isMax).toBe(false);
        expect(h.flow.state.failure).toBeNull();
        expect(h.maxCalls).toHaveLength(0);
        expect(h.withdrawCalls).toHaveLength(1);
        expect(h.withdrawCalls[0].amount.eq(AMOUNT)).toBe(true);
        expect(phasePath(h.phases)).toEqual([
            'idle',
            'request-sign',
            'request-confirm',
            'success',
        ]);
    });

    it('routes `max` to the all-shares call, with the lowercased address', async () => {
        const h = makeHarness();
        await h.flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: 'max',
            userAddress: USER,
        });

        expect(h.flow.state.phase).toBe('success');
        expect(h.flow.state.isMax).toBe(true);
        expect(h.withdrawCalls).toHaveLength(0);
        expect(h.maxCalls).toEqual([
            { poolId: POOL, trancheId: TRANCHE, userAddress: LOWER },
        ]);
    });

    it('skips the KYC phase entirely when no getKycSignature port is supplied', async () => {
        const h = makeHarness();
        await h.flow.start(INPUT);
        expect(h.phases).not.toContain('checking-kyc');
        // And nothing was built for a check that never ran.
        expect(h.kycCalls).toHaveLength(0);
    });

    it('runs the KYC pre-check as buildKycParams + getKycSignature, before the wallet', async () => {
        // The same pair the deposit flow uses, and the same pair kasu-mobile's
        // withdraw path hand-wrote: build the Nexera params, exchange them for
        // a signature, and let a lapsed KYC surface here rather than as a
        // revert. The withdrawal call itself never carries the signature.
        const h = makeHarness({
            getKycSignature: (): Promise<unknown> => Promise.resolve(null),
        });
        await h.flow.start(INPUT);

        expect(h.kycCalls).toEqual([USER]);
        expect(h.kycSignatureCalls).toEqual([KYC_PARAMS]);
        expect(phasePath(h.phases)).toEqual([
            'idle',
            'checking-kyc',
            'request-sign',
            'request-confirm',
            'success',
        ]);
    });

    it('stops on the kyc step when the pre-check rejects, without opening the wallet', async () => {
        const boom = new Error('kyc lapsed');
        const h = makeHarness({
            getKycSignature: (): Promise<unknown> => Promise.reject(boom),
        });
        await h.flow.start(INPUT);

        expect(h.flow.state.phase).toBe('error');
        expect(h.flow.state.failure).toEqual({
            step: 'kyc',
            reason: 'failed',
            error: boom,
        });
        expect(h.withdrawCalls).toHaveLength(0);
        expect(h.maxCalls).toHaveLength(0);
    });

    it('never calls a KYC backend refusal a cancellation, whatever it is worded', async () => {
        // The lender's wallet was not involved in an HTTP call. "Declined" is
        // what a KYC decision says, and reporting it as "you cancelled in your
        // wallet" both lies to the lender and discards the only error anyone
        // could act on.
        const declined = new Error('user rejected by the compliance engine');
        const h = makeHarness({
            getKycSignature: (): Promise<unknown> => Promise.reject(declined),
        });
        await h.flow.start(INPUT);

        expect(h.flow.state.failure).toEqual({
            step: 'kyc',
            reason: 'failed',
            error: declined,
        });
    });

    it('fails the kyc step when getKycSignature is supplied without buildKycParams', async () => {
        const h = makeHarness({
            buildKycParams: undefined,
            getKycSignature: (): Promise<unknown> => Promise.resolve(null),
        });
        await h.flow.start(INPUT);

        const failure = h.flow.state.failure;
        expect(failure?.step).toBe('kyc');
        expect(failure?.reason).toBe('failed');
        const error = failure && 'error' in failure ? failure.error : undefined;
        expect((error as Error).message).toBe(NO_KYC_PARAMS_MESSAGE);
        expect(h.withdrawCalls).toHaveLength(0);
    });

    it('reports a wallet rejection as cancelled, not as a failure', async () => {
        const h = makeHarness({
            withdraw: (): Promise<WaitableTransaction> =>
                Promise.reject(rejection()),
        });
        await h.flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: AMOUNT,
            userAddress: USER,
        });

        expect(h.flow.state.failure).toEqual({
            step: 'request',
            reason: 'cancelled',
        });
    });

    it('reports anything else as failed, with the error', async () => {
        const boom = new Error('execution reverted');
        const h = makeHarness({
            withdrawMax: (): Promise<WaitableTransaction> =>
                Promise.reject(boom),
        });
        await h.flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: 'max',
            userAddress: USER,
        });

        expect(h.flow.state.failure).toEqual({
            step: 'request',
            reason: 'failed',
            error: boom,
        });
    });

    it('reports a failure while waiting for the receipt', async () => {
        const boom = new Error('transaction failed');
        const h = makeHarness({
            withdraw: (): Promise<WaitableTransaction> =>
                Promise.resolve({
                    wait: (): Promise<unknown> => Promise.reject(boom),
                }),
        });
        await h.flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: AMOUNT,
            userAddress: USER,
        });

        expect(h.flow.state.failure).toEqual({
            step: 'request',
            reason: 'failed',
            error: boom,
        });
    });

    it('ignores a second start while one run is in flight', async () => {
        let release: (() => void) | undefined;
        const held = new Promise<void>((resolve) => {
            release = resolve;
        });
        const h = makeHarness({
            withdraw: async (params): Promise<WaitableTransaction> => {
                await held;
                return {
                    wait: (): Promise<unknown> => Promise.resolve(params),
                };
            },
        });

        const input = {
            poolId: POOL,
            trancheId: TRANCHE,
            amount: AMOUNT,
            userAddress: USER,
        };
        const first = h.flow.start(input);
        await h.flow.start(input);
        release?.();
        await first;

        expect(h.flow.state.phase).toBe('success');
    });

    it('accepts a start in the SAME tick as a reset', async () => {
        // `reset(); start(...)` is what a consumer writes when the lender
        // closes a sheet and immediately opens another. If reset only
        // abandoned the run's STATE and left the guard held, this start would
        // return at the guard and the second sheet would sit on `idle`
        // forever, with `isRunning` true and nothing on the way.
        const h = makeHarness();
        h.flow.reset();
        await h.flow.start(INPUT);

        expect(h.flow.state.phase).toBe('success');
        expect(h.flow.isRunning).toBe(false);
        expect(h.withdrawCalls).toHaveLength(1);
    });

    it('runs the next flow to completion after a reset out of a hung port', async () => {
        // The first run's submission never settles — a wallet prompt nobody
        // answers. The guard must not be waiting on it.
        let calls = 0;
        const h = makeHarness({
            withdraw: (params): Promise<WaitableTransaction> => {
                calls += 1;
                if (calls === 1)
                    return new Promise<WaitableTransaction>(() => undefined);
                return Promise.resolve({
                    wait: (): Promise<unknown> => Promise.resolve(params),
                });
            },
        });

        const abandoned = h.flow.start(INPUT);
        await until(
            () => h.flow.state.phase === 'request-sign',
            'request-sign',
        );

        h.flow.reset();
        expect(h.flow.isRunning).toBe(false);

        await h.flow.start(INPUT);
        expect(h.flow.state.phase).toBe('success');
        expect(calls).toBe(2);
        // And the abandoned run is still hanging, harmlessly, off to one side.
        expect(h.phases).not.toContain('error');
        void abandoned;
    });

    it('returns to idle on reset and stops publishing to an unsubscribed listener', async () => {
        const h = makeHarness();
        const seen: WithdrawPhase[] = [];
        const stop = h.flow.subscribe((s) => seen.push(s.phase));

        await h.flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: 'max',
            userAddress: USER,
        });
        expect(seen).toContain('success');

        stop();
        const seenAtStop = seen.length;
        h.flow.reset();

        expect(seen).toHaveLength(seenAtStop);
        expect(h.flow.state).toEqual({
            phase: 'idle',
            step: null,
            isMax: false,
            sponsored: false,
            failure: null,
        });
    });
});

// ---------------------------------------------------------------------------
// The sponsored path (2.10.0): encode one call, submit it through submitCall
// ---------------------------------------------------------------------------

describe('WithdrawFlow — sponsored path', () => {
    const LPM = '0x0000000000000000000000000000000000000004';
    const SPOOL = '0x0000000000000000000000000000000000000005';
    const STRANCHE = '0x0000000000000000000000000000000000000006';
    const CALL: SponsoredCall = encodeRequestWithdrawalCall(
        LPM,
        SPOOL,
        STRANCHE,
        AMOUNT,
    );
    const SINPUT = { ...INPUT, poolId: SPOOL, trancheId: STRANCHE };

    interface Deferred<T> {
        promise: Promise<T>;
        resolve(value: T): void;
        reject(err: unknown): void;
    }
    function deferred<T>(): Deferred<T> {
        let resolve!: (value: T) => void;
        let reject!: (err: unknown) => void;
        const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    }

    interface Sponsored extends Harness {
        encodeCalls: unknown[];
        submitted: SponsoredCall[];
        states: WithdrawState[];
    }

    /**
     * A sponsored harness. `encode` / `submit` / `wait` default to immediate
     * success; pass a function to hold or fail any of them.
     */
    function sponsored(
        o: {
            encode?: () => Promise<SponsoredCall>;
            submit?: () => Promise<WaitableTransaction>;
            wait?: () => Promise<unknown>;
            ports?: Partial<WithdrawPorts>;
            noEncoder?: boolean;
        } = {},
    ): Sponsored {
        const encodeCalls: unknown[] = [];
        const submitted: SponsoredCall[] = [];
        const h = makeHarness({
            encodeWithdrawal: o.noEncoder
                ? undefined
                : (params): Promise<SponsoredCall> => {
                      encodeCalls.push(params);
                      return o.encode ? o.encode() : Promise.resolve(CALL);
                  },
            submitCall: (call: SponsoredCall): Promise<WaitableTransaction> => {
                submitted.push(call);
                if (o.submit) return o.submit();
                return Promise.resolve({
                    wait:
                        o.wait ?? ((): Promise<unknown> => Promise.resolve({})),
                });
            },
            ...o.ports,
        });
        const states: WithdrawState[] = [];
        h.flow.subscribe((s) => states.push(s));
        return { ...h, encodeCalls, submitted, states };
    }

    it('reports `sponsored` from the very first state, and false without the port', () => {
        expect(sponsored().flow.state).toEqual({
            phase: 'idle',
            step: null,
            isMax: false,
            sponsored: true,
            failure: null,
        });
        expect(makeHarness().flow.state.sponsored).toBe(false);
    });

    it('encodes the withdrawal, submits exactly that call, and never touches withdraw / withdrawMax', async () => {
        const h = sponsored();
        await h.flow.start(SINPUT);

        expect(h.flow.state.phase).toBe('success');
        expect(h.flow.state.sponsored).toBe(true);
        expect(h.encodeCalls).toEqual([
            {
                poolId: SPOOL,
                trancheId: STRANCHE,
                amount: AMOUNT,
                userAddress: USER,
            },
        ]);
        expect(h.submitted).toEqual([CALL]);
        expect(h.withdrawCalls).toHaveLength(0);
        expect(h.maxCalls).toHaveLength(0);
        expect(phasePath(h.phases)).toEqual([
            'idle',
            'request-sign',
            'request-confirm',
            'success',
        ]);
    });

    it('carries `max` to the encoder as the code, not a number', async () => {
        const h = sponsored();
        await h.flow.start({ ...SINPUT, amount: 'max' });
        expect(h.flow.state.isMax).toBe(true);
        expect((h.encodeCalls[0] as { amount: unknown }).amount).toBe('max');
        expect(h.flow.state.phase).toBe('success');
    });

    it('runs the KYC pre-check first, and a refusal there never encodes or submits', async () => {
        const h = sponsored({
            ports: {
                getKycSignature: (): Promise<unknown> =>
                    Promise.reject(new Error('lapsed')),
            },
        });
        await h.flow.start(SINPUT);
        expect(h.flow.state.failure).toMatchObject({
            step: 'kyc',
            reason: 'failed',
        });
        expect(h.encodeCalls).toHaveLength(0);
        expect(h.submitted).toHaveLength(0);
    });

    describe('before anything is sent — failed, and nothing submitted', () => {
        it('an encoder throw (a share read that failed, zero shares) is failed', async () => {
            const boom = new Error('rpc down');
            const h = sponsored({ encode: () => Promise.reject(boom) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.failure).toEqual({
                step: 'request',
                reason: 'failed',
                error: boom,
            });
            expect(h.submitted).toHaveLength(0);
        });

        it('an encoder that returns another kind of call is failed', async () => {
            const cancel = encodeCancelDepositCall(LPM, SPOOL, 1);
            const h = sponsored({ encode: () => Promise.resolve(cancel) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.failure).toMatchObject({
                step: 'request',
                reason: 'failed',
            });
            expect(
                (h.flow.state.failure as { error: Error }).error.message,
            ).toBe(NOT_A_WITHDRAWAL_CALL_MESSAGE);
            expect(h.submitted).toHaveLength(0);
        });

        it('a submitCall with no encoder is failed, naming the fix', async () => {
            const h = sponsored({ noEncoder: true });
            await h.flow.start(SINPUT);
            expect(
                (h.flow.state.failure as { error: Error }).error.message,
            ).toBe(NO_WITHDRAWAL_ENCODER_MESSAGE);
            expect(h.submitted).toHaveLength(0);
        });

        it('a port’s own BatchSubmissionError(…, "failed") is failed', async () => {
            const refused = new BatchSubmissionError(
                'relay_disabled',
                'failed',
            );
            const h = sponsored({ submit: () => Promise.reject(refused) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.failure).toEqual({
                step: 'request',
                reason: 'failed',
                error: refused,
            });
        });
    });

    describe('an ambiguous outcome is never "failed"', () => {
        it.each([
            ['an unrecognised submitCall throw', 'submit'],
            ['an unrecognised wait() throw', 'wait'],
        ] as const)('%s is pending', async (_label, where) => {
            const boom = new Error('socket hang up');
            const h =
                where === 'submit'
                    ? sponsored({ submit: () => Promise.reject(boom) })
                    : sponsored({ wait: () => Promise.reject(boom) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.phase).toBe('error');
            expect(h.flow.state.failure).toEqual({
                step: 'request',
                reason: 'pending',
                error: boom,
            });
        });

        it('a throw worded as a user rejection is pending, not cancelled — the lender did nothing', async () => {
            const h = sponsored({ wait: () => Promise.reject(rejection()) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.failure).toMatchObject({ reason: 'pending' });
        });

        it('a BatchPendingError is pending, even when its cause carries revert bytes', async () => {
            const revertBytes = {
                data: '0x08c379a0' + '00'.repeat(32),
            };
            const pending = new BatchPendingError('status_timeout', {
                cause: revertBytes,
            });
            const h = sponsored({ wait: () => Promise.reject(pending) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.failure).toEqual({
                step: 'request',
                reason: 'pending',
                error: pending,
            });
        });

        it('already-submitted is carried at its word', async () => {
            const already = new BatchSubmissionError(
                'proven_earlier',
                'already-submitted',
            );
            const h = sponsored({ submit: () => Promise.reject(already) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.failure).toEqual({
                step: 'request',
                reason: 'already-submitted',
                error: already,
            });
        });
    });

    describe('a wallet rejection in submitCall — the lender declined to sign', () => {
        it('is cancelled, as a raw depositBatch rejection is: nothing was posted', async () => {
            const h = sponsored({ submit: () => Promise.reject(rejection()) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.phase).toBe('error');
            expect(h.flow.state.failure).toEqual({
                step: 'request',
                reason: 'cancelled',
            });
        });

        it('but a bare "declined" / "request rejected" from the port is NOT one — it is pending', async () => {
            for (const text of [
                'declined',
                'request rejected: rate limit exceeded',
            ]) {
                const h = sponsored({
                    submit: () => Promise.reject(new Error(text)),
                });
                await h.flow.start(SINPUT);
                expect(h.flow.state.failure).toMatchObject({
                    reason: 'pending',
                });
            }
        });

        it('a typed outcome wins over rejection wording: BatchPendingError stays pending', async () => {
            const pending = new BatchPendingError('post_unknown', {
                cause: rejection(),
            });
            const h = sponsored({ submit: () => Promise.reject(pending) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.failure).toMatchObject({ reason: 'pending' });
        });
    });

    describe('a revert stays a revert', () => {
        it.each([
            ['from submitCall (a simulation)', 'submit'],
            ['from wait() (a mined, reverted operation)', 'wait'],
        ] as const)('%s → reverted, naming the error', async (_l, where) => {
            const reverted = new BatchRevertedError('ClearingIsPending');
            const h =
                where === 'submit'
                    ? sponsored({ submit: () => Promise.reject(reverted) })
                    : sponsored({ wait: () => Promise.reject(reverted) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.failure).toEqual({
                step: 'request',
                reason: 'reverted',
                revertError: 'ClearingIsPending',
                error: reverted,
            });
        });

        it('an unnamed revert is reverted with an empty name, not pending or failed', async () => {
            const reverted = new BatchRevertedError('');
            const h = sponsored({ wait: () => Promise.reject(reverted) });
            await h.flow.start(SINPUT);
            expect(h.flow.state.failure).toMatchObject({
                reason: 'reverted',
                revertError: '',
            });
        });
    });

    describe('abandon / unmount at every phase', () => {
        const IDLE = {
            phase: 'idle',
            step: null,
            isMax: false,
            sponsored: true,
            failure: null,
        };

        it('during checking-kyc: the late KYC answer never encodes or submits', async () => {
            const kyc = deferred<unknown>();
            const h = sponsored({
                ports: { getKycSignature: () => kyc.promise },
            });
            const run = h.flow.start(SINPUT);
            await until(
                () => h.flow.state.phase === 'checking-kyc',
                'checking-kyc',
            );
            h.flow.reset();
            const published = h.states.length;
            kyc.resolve({});
            await run;

            expect(h.flow.state).toEqual(IDLE);
            expect(h.states).toHaveLength(published);
            expect(h.encodeCalls).toHaveLength(0);
            expect(h.submitted).toHaveLength(0);
        });

        it('during the encode (request-sign): the late call is NEVER submitted', async () => {
            const encoded = deferred<SponsoredCall>();
            const h = sponsored({ encode: () => encoded.promise });
            const run = h.flow.start(SINPUT);
            await until(() => h.encodeCalls.length === 1, 'encode');
            expect(h.flow.state.phase).toBe('request-sign');
            h.flow.reset();
            encoded.resolve(CALL);
            await run;

            expect(h.submitted).toHaveLength(0);
            expect(h.flow.state).toEqual(IDLE);
        });

        it('during submitCall (request-sign): a new run starts in the same tick, and the old one’s late answer is dropped', async () => {
            const first = deferred<WaitableTransaction>();
            let calls = 0;
            const h = sponsored({
                submit: () => {
                    calls += 1;
                    return calls === 1
                        ? first.promise
                        : Promise.resolve({
                              wait: (): Promise<unknown> => Promise.resolve({}),
                          });
                },
            });
            const abandoned = h.flow.start(SINPUT);
            await until(() => h.submitted.length === 1, 'first submit');
            h.flow.reset();
            const next = h.flow.start(SINPUT);
            await next;
            expect(h.flow.state.phase).toBe('success');

            // The abandoned submission now fails: the finished run must not
            // be dragged back to an error by it.
            first.reject(new Error('late'));
            await abandoned;
            expect(h.flow.state.phase).toBe('success');
            expect(h.submitted).toHaveLength(2);
        });

        it('during submitCall: once the call has left, an abandoned run never calls wait() — no polling for a view that is gone', async () => {
            const accepted = deferred<WaitableTransaction>();
            let waited = 0;
            const h = sponsored({ submit: () => accepted.promise });
            const run = h.flow.start(SINPUT);
            await until(() => h.submitted.length === 1, 'submit');
            h.flow.reset();
            const published = h.states.length;
            accepted.resolve({
                wait: (): Promise<unknown> => {
                    waited += 1;
                    return Promise.resolve({});
                },
            });
            await run;

            expect(waited).toBe(0);
            expect(h.states).toHaveLength(published);
            expect(h.flow.state).toEqual(IDLE);
        });

        it('during request-confirm: neither a late success nor a late failure drives a view that was left', async () => {
            for (const settle of ['resolve', 'reject'] as const) {
                const receipt = deferred<unknown>();
                const h = sponsored({ wait: () => receipt.promise });
                const run = h.flow.start(SINPUT);
                await until(
                    () => h.flow.state.phase === 'request-confirm',
                    'request-confirm',
                );
                h.flow.reset();
                const published = h.states.length;
                if (settle === 'resolve') receipt.resolve({});
                else
                    receipt.reject(new BatchRevertedError('ClearingIsPending'));
                await run;

                expect(h.flow.state).toEqual(IDLE);
                expect(h.states).toHaveLength(published);
                expect(h.flow.isRunning).toBe(false);
            }
        });

        it('unmount (unsubscribe + reset) mid-confirm: the listener hears nothing more', async () => {
            const receipt = deferred<unknown>();
            const h = sponsored({ wait: () => receipt.promise });
            const seen: WithdrawPhase[] = [];
            const stop = h.flow.subscribe((s) => seen.push(s.phase));
            const run = h.flow.start(SINPUT);
            await until(
                () => h.flow.state.phase === 'request-confirm',
                'request-confirm',
            );
            stop();
            const heard = seen.length;
            h.flow.reset();
            receipt.resolve({});
            await run;
            expect(seen).toHaveLength(heard);
        });

        it('a second start while a sponsored run is in flight submits nothing more', async () => {
            const receipt = deferred<unknown>();
            const h = sponsored({ wait: () => receipt.promise });
            const run = h.flow.start(SINPUT);
            await until(() => h.submitted.length === 1, 'submit');
            await h.flow.start(SINPUT);
            receipt.resolve({});
            await run;
            expect(h.submitted).toHaveLength(1);
            expect(h.encodeCalls).toHaveLength(1);
        });
    });
});
