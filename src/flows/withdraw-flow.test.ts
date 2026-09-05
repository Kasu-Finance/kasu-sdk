import { BigNumber } from 'ethers';

import { WaitableTransaction } from './deposit-flow';
import {
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

interface Harness {
    flow: WithdrawFlow;
    withdrawCalls: { poolId: string; trancheId: string; amount: BigNumber }[];
    maxCalls: { poolId: string; trancheId: string; userAddress: string }[];
    kycCalls: string[];
    phases: WithdrawPhase[];
}

function makeHarness(overrides: Partial<WithdrawPorts> = {}): Harness {
    const withdrawCalls: Harness['withdrawCalls'] = [];
    const maxCalls: Harness['maxCalls'] = [];
    const kycCalls: string[] = [];

    const waitable = (): WaitableTransaction => ({
        wait: (): Promise<unknown> => Promise.resolve({ status: 1 }),
    });

    const ports: WithdrawPorts = {
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
    if (overrides.ensureKyc) {
        const wrapped = overrides.ensureKyc;
        ports.ensureKyc = (address: `0x${string}`): Promise<unknown> => {
            kycCalls.push(address);
            return wrapped(address);
        };
    }

    const flow = new WithdrawFlow(ports);
    const phases: WithdrawPhase[] = [];
    flow.subscribe((s) => phases.push(s.phase));

    return { flow, withdrawCalls, maxCalls, kycCalls, phases };
}

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

    it('skips the KYC phase entirely when no ensureKyc port is supplied', async () => {
        const h = makeHarness();
        await h.flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: AMOUNT,
            userAddress: USER,
        });
        expect(h.phases).not.toContain('checking-kyc');
    });

    it('runs the optional KYC pre-check before opening the wallet', async () => {
        const h = makeHarness({
            ensureKyc: (): Promise<unknown> => Promise.resolve(null),
        });
        await h.flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: AMOUNT,
            userAddress: USER,
        });

        expect(h.kycCalls).toEqual([USER]);
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
            ensureKyc: (): Promise<unknown> => Promise.reject(boom),
        });
        await h.flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: AMOUNT,
            userAddress: USER,
        });

        expect(h.flow.state.phase).toBe('error');
        expect(h.flow.state.failure).toEqual({
            step: 'kyc',
            reason: 'failed',
            error: boom,
        });
        expect(h.withdrawCalls).toHaveLength(0);
        expect(h.maxCalls).toHaveLength(0);
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
