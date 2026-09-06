import { FlowStore } from './observable';

/**
 * The run lifecycle both flows share: one run at a time, every transition
 * published, and a `reset()` that is safe to call in the middle of one.
 *
 * `DepositFlow` and `WithdrawFlow` each carried their own copy of this — the
 * re-entrancy guard, the `try/finally` around the run, `state`, `isRunning`,
 * `subscribe`, `reset`. Two copies of a guard is two places for a guard to be
 * wrong, on the money path, which is the same reason the pipelines themselves
 * moved out of the applications.
 *
 * ## The guard and the run token are separate, and both matter
 *
 * `_runToken` is the re-entrancy guard: claimed synchronously, before the
 * first `await`, so a double tap cannot launch two pipelines. The store's
 * `generation` is the abandonment mechanism: an in-flight run holds the value
 * it claimed, and every `patch` and `isCurrent` checkpoint it makes after
 * `reset()` is dropped.
 *
 * `reset()` releases the guard IMMEDIATELY rather than waiting for the
 * abandoned run to notice. It has to: a run parked on a wallet prompt that
 * never answers is a promise that may never settle, and a consumer that has
 * left that screen must be able to start a new run in the same tick. The
 * abandoned run's `finally` therefore releases the guard only if it still
 * holds it — by then a NEW run may own it, and clearing it there would let a
 * third run start alongside the second.
 */
export abstract class Flow<S, I> {
    protected readonly _store: FlowStore<S>;

    /**
     * The token of the run currently holding the guard, or `null` when none
     * does. Not a boolean: releasing the guard has to be attributable to the
     * run that claimed it.
     */
    private _runToken: number | null = null;

    protected constructor(initial: S) {
        this._store = new FlowStore<S>(initial);
    }

    /** The current state. Every transition is also published to `subscribe`. */
    get state(): S {
        return this._store.state;
    }

    /** True while a run is in flight, including while parked. */
    get isRunning(): boolean {
        return this._runToken !== null;
    }

    /**
     * Observe every transition. Returns the unsubscribe function.
     *
     * The listener is not called on subscribe; read `state` for the value it
     * starts from.
     */
    subscribe(listener: (state: S) => void): () => void {
        return this._store.subscribe(listener);
    }

    /**
     * Run the pipeline. Resolves when it reaches a terminal phase — it does
     * not reject, because every outcome a consumer can act on is in `state`.
     *
     * A second call while one is in flight is a no-op: one submission per
     * intent, however many times the button is pressed.
     */
    async start(input: I): Promise<void> {
        if (this._runToken !== null) return;
        this._store.reset();
        const token = this._store.beginRun();
        this._runToken = token;
        try {
            await this._run(input, token);
        } finally {
            if (this._runToken === token) this._runToken = null;
        }
    }

    /**
     * Back to `idle`, abandoning any run in flight: its remaining transitions
     * are dropped, whatever it is parked on is unparked, and the guard is
     * released at once so `start()` is accepted in the SAME tick. Subscribers
     * are kept — the consumer watching the last run is the one watching the
     * next.
     */
    reset(): void {
        this._runToken = null;
        // Bump the generation BEFORE unparking, so the abandoned run's next
        // checkpoint already reads as superseded.
        this._store.reset();
        this._onAbandon();
    }

    /**
     * Hook for a flow that parks: unpark it. Called by `reset()` after the
     * generation has been bumped, so anything the abandoned run does with the
     * result is dropped.
     */
    protected _onAbandon(): void {
        // A flow with nothing parked has nothing to unpark.
    }

    /** The pipeline itself. `token` is this run's; check it after every await. */
    protected abstract _run(input: I, token: number): Promise<void>;
}
