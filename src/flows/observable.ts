/**
 * The tiny observable-state kernel both flows are built on.
 *
 * Deliberately not a framework store: no React, no signals, no dependency.
 * A flow is a long asynchronous run that has to publish every transition to
 * whatever is rendering it, and has to be able to abandon a run that the
 * consumer walked away from. That is the whole requirement, and it is 60 lines.
 *
 * The `generation` counter is the abandonment mechanism. `reset()` bumps it;
 * an in-flight run captured the previous value, so every later `patch` it
 * attempts is dropped and every `isCurrent` checkpoint tells it to stop. It is
 * what makes `reset()` safe to call mid-flight — the run cannot resurrect a
 * dead state or, worse, drive the UI back into a phase the consumer has left.
 */
export class FlowStore<S> {
    private _state: S;
    private _generation = 0;
    private readonly _listeners = new Set<(state: S) => void>();

    constructor(private readonly _initial: S) {
        this._state = _initial;
    }

    get state(): S {
        return this._state;
    }

    /** The run token an in-flight pipeline captures at `start()`. */
    get generation(): number {
        return this._generation;
    }

    /** False once `reset()` (or a later `start()`) has superseded `token`. */
    isCurrent(token: number): boolean {
        return this._generation === token;
    }

    /**
     * Subscribe to every transition. Returns the unsubscribe function; calling
     * it twice is harmless.
     *
     * Listeners are NOT called on subscribe — read `state` for the current
     * value. A listener that throws is not allowed to break the pipeline or
     * starve the listeners registered after it, so throws are swallowed.
     */
    subscribe(listener: (state: S) => void): () => void {
        this._listeners.add(listener);
        return () => {
            this._listeners.delete(listener);
        };
    }

    /**
     * Merge `next` into the state and notify, unless `token` names a
     * superseded run.
     */
    patch(next: Partial<S>, token?: number): void {
        if (token !== undefined && !this.isCurrent(token)) return;
        this._state = { ...this._state, ...next };
        for (const listener of [...this._listeners]) {
            try {
                listener(this._state);
            } catch {
                // A consumer's rendering fault is its own problem; the pipeline
                // owns real money and keeps going.
            }
        }
    }

    /**
     * Back to the initial state, abandoning any in-flight run.
     *
     * Subscribers are kept: the consumer that was watching the last run is the
     * one that will watch the next.
     */
    reset(): void {
        this._generation += 1;
        this.patch(this._initial);
    }

    /** Claim the next run token. Any earlier run is abandoned. */
    beginRun(): number {
        this._generation += 1;
        return this._generation;
    }
}
