import { BigNumber } from 'ethers';

import { KycParams } from '../facade/types';

import { WaitableTransaction } from './observable';
import {
    NO_KYC_PARAMS_MESSAGE,
    WithdrawFlow,
    WithdrawPhase,
    WithdrawPorts,
} from './withdraw-flow';

const USER = '0xAbCdEf0000000000000000000000000000000001' as const;
const LOWER = USER.toLowerCase();
const POOL = '0xpool';
const TRANCHE = '0xtranche';
/** 10.077107 USDC at 6dp. */
const AMOUNT = BigNumber.from('10077107');

function rejection(): Error {
    return Object.assign(new Error('User rejected the request'), { code: 4001 });
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
        const error =
            failure && 'error' in failure ? failure.error : undefined;
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
                if (calls === 1) return new Promise<WaitableTransaction>(() => undefined);
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
            failure: null,
        });
    });
});
