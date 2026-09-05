import { BigNumber } from 'ethers';

import { isUserRejected } from '../domain/wallet-errors';

import { WaitableTransaction } from './deposit-flow';
import { FlowStore } from './observable';

/**
 * The withdrawal pipeline, headless — the small sibling of `DepositFlow`.
 *
 * Much less happens here, and that is the point of it being separate: no loan
 * agreement, no approval (the lender is handing tranche shares back, not
 * granting a spend), no on-chain KYC payload. What survives is the shape both
 * applications need — an observable phase, one `'max'`-aware submission, and
 * the same `cancelled` / `failed` split, so a lender who pressed Reject is
 * never told something broke.
 *
 * Same house rules as the deposit flow: no React, no copy, no I/O of its own.
 * `state` carries codes; the consumer owns every word a lender reads.
 *
 * ```ts
 * const flow = new WithdrawFlow(ports);
 * flow.subscribe(render);
 * await flow.start({ poolId, trancheId, amount: 'max', userAddress });
 * ```
 */

// ---------------------------------------------------------------------------
// Codes
// ---------------------------------------------------------------------------

export type WithdrawPhase =
    | 'idle'
    | 'checking-kyc'
    | 'request-sign'
    | 'request-confirm'
    | 'success'
    | 'error';

/**
 * `kyc` only exists when the consumer supplies `ensureKyc`. kasu-mobile does,
 * to fail early and legibly when a lender's KYC has lapsed rather than let the
 * on-chain call revert; kasu-ui does not.
 */
export type WithdrawStep = 'kyc' | 'request';

export type WithdrawFailure =
    | { step: WithdrawStep; reason: 'cancelled' }
    | { step: WithdrawStep; reason: 'failed'; error: unknown };

// ---------------------------------------------------------------------------
// Ports, input, state
// ---------------------------------------------------------------------------

export interface WithdrawPorts {
    /**
     * Optional pre-check. Reject to stop the run before the wallet is opened —
     * a lapsed KYC surfaces as `{ step: 'kyc' }` instead of an opaque revert.
     */
    ensureKyc?(userAddress: `0x${string}`): Promise<unknown>;
    /** `requestWithdrawalInAsset`. Defaults to `kasu.deposits.withdraw`. */
    withdraw(params: {
        poolId: string;
        trancheId: string;
        amount: BigNumber;
    }): Promise<WaitableTransaction>;
    /** `requestWithdrawalMax`. Defaults to `kasu.deposits.withdrawMax`. */
    withdrawMax(
        poolId: string,
        trancheId: string,
        userAddress: string,
    ): Promise<WaitableTransaction>;
}

export interface WithdrawFlowInput {
    poolId: string;
    trancheId: string;
    /**
     * The amount in BASE units, or the literal `'max'`.
     *
     * `'max'` is not "the balance as I last read it": it routes to the
     * all-shares contract call, which resolves the balance on chain at
     * execution. Deciding max-ness from a number the consumer read a moment ago
     * is how dust gets stranded in a tranche, so the decision is a code, made
     * by the consumer, and carried here intact.
     */
    amount: BigNumber | 'max';
    userAddress: `0x${string}`;
}

export interface WithdrawState {
    phase: WithdrawPhase;
    step: WithdrawStep | null;
    /** True when this run routed through the all-shares call. */
    isMax: boolean;
    failure: WithdrawFailure | null;
}

const INITIAL: WithdrawState = {
    phase: 'idle',
    step: null,
    isMax: false,
    failure: null,
};

function classify(step: WithdrawStep, err: unknown): WithdrawFailure {
    return isUserRejected(err)
        ? { step, reason: 'cancelled' }
        : { step, reason: 'failed', error: err };
}

// ---------------------------------------------------------------------------
// The flow
// ---------------------------------------------------------------------------

export class WithdrawFlow {
    private readonly _store = new FlowStore<WithdrawState>(INITIAL);
    private _running = false;

    constructor(private readonly _ports: WithdrawPorts) {}

    get state(): WithdrawState {
        return this._store.state;
    }

    get isRunning(): boolean {
        return this._running;
    }

    subscribe(listener: (state: WithdrawState) => void): () => void {
        return this._store.subscribe(listener);
    }

    /**
     * Run the pipeline. Resolves on a terminal phase and never rejects; the
     * outcome is in `state`. A second call while one is in flight is a no-op,
     * for the same reason the deposit flow guards it — one submission per
     * intent, however many times the button is pressed.
     */
    async start(input: WithdrawFlowInput): Promise<void> {
        if (this._running) return;
        this._running = true;
        try {
            await this._run(input);
        } finally {
            this._running = false;
        }
    }

    /** Back to `idle`, abandoning any run in flight. Subscribers are kept. */
    reset(): void {
        this._store.reset();
    }

    private async _run(input: WithdrawFlowInput): Promise<void> {
        this._store.reset();
        const token = this._store.beginRun();
        const isMax = input.amount === 'max';

        if (this._ports.ensureKyc) {
            this._store.patch(
                { phase: 'checking-kyc', step: 'kyc', isMax },
                token,
            );
            try {
                await this._ports.ensureKyc(input.userAddress);
            } catch (err) {
                this._store.patch(
                    { phase: 'error', failure: classify('kyc', err) },
                    token,
                );
                return;
            }
            if (!this._store.isCurrent(token)) return;
        }

        this._store.patch(
            { phase: 'request-sign', step: 'request', isMax },
            token,
        );
        try {
            const tx =
                input.amount === 'max'
                    ? await this._ports.withdrawMax(
                          input.poolId,
                          input.trancheId,
                          input.userAddress.toLowerCase(),
                      )
                    : await this._ports.withdraw({
                          poolId: input.poolId,
                          trancheId: input.trancheId,
                          amount: input.amount,
                      });
            this._store.patch({ phase: 'request-confirm' }, token);
            await tx.wait();
        } catch (err) {
            this._store.patch(
                { phase: 'error', failure: classify('request', err) },
                token,
            );
            return;
        }
        if (!this._store.isCurrent(token)) return;

        this._store.patch({ phase: 'success' }, token);
    }
}
