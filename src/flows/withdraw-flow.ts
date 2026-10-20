import { BigNumber } from 'ethers';

import { SponsoredCall } from '../domain/sponsored-calls';
import { classifyWalletFailure } from '../domain/wallet-errors';
import { KycParams } from '../facade/types';

import { BatchRevertedError, BatchSubmissionError } from './batch-errors';
import { Flow } from './flow';
import { WaitableTransaction } from './observable';

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
 * The run lifecycle — the re-entrancy guard, `state`, `isRunning`,
 * `subscribe`, `reset` — is `Flow`'s, shared with the deposit pipeline. It was
 * a second copy here until 2.7.0, which is two places for one guard to be
 * wrong.
 *
 * Same house rules as the deposit flow: no React, no copy, no I/O of its own.
 * `state` carries codes; the consumer owns every word a lender reads.
 *
 * ```ts
 * const flow = new WithdrawFlow(ports);
 * flow.subscribe(render);
 * await flow.start({ poolId, trancheId, amount: 'max', userAddress });
 * ```
 *
 * ## The sponsored path (2.10.0)
 *
 * Supply `submitCall` and the run never touches `withdraw` / `withdrawMax`:
 * it encodes the ONE `requestWithdrawal` call itself (`encodeWithdrawal`,
 * which `kasu.flows.withdraw()` defaults to `kasu.calls.requestWithdrawal`)
 * and hands it to the port, whose `wait()` settles it. `state.sponsored` says
 * which path this flow runs, from its first state.
 *
 * A submitted call's outcome is read with the batch path's taxonomy, and at
 * its word: `BatchRevertedError` → `reverted`; `BatchSubmissionError` → its
 * own outcome (`failed`, `pending`, `already-submitted`); ANY other throw from
 * `submitCall` or `wait()` → `pending`. The SDK cannot know whether an
 * unrecognised error left before or after the call was accepted, and calling
 * that `failed` invites a second withdrawal request. `submitSponsoredCall` is
 * the port body that already speaks this.
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
 * `kyc` only exists when the consumer supplies `getKycSignature`. kasu-mobile
 * does, to fail early and legibly when a lender's KYC has lapsed rather than
 * let the on-chain call revert; kasu-ui does not.
 */
export type WithdrawStep = 'kyc' | 'request';

export type WithdrawFailure =
    | { step: WithdrawStep; reason: 'cancelled' }
    | { step: WithdrawStep; reason: 'failed'; error: unknown }
    | {
          /**
           * Sponsored path only: the call is KNOWN to revert (or reverted) —
           * nothing was requested. `revertError` is the contract's error name
           * (`'CannotProcessRequestIfClearingIsPending'`,
           * `'InsufficientSharesBalance'`, …) or `''`.
           */
          step: 'request';
          reason: 'reverted';
          revertError: string;
          error: unknown;
      }
    | {
          /**
           * Sponsored path only — NOT failures. `pending`: the call was, or
           * may have been, accepted and nothing proves whether it ran; never
           * render it as a failure, which invites a second request.
           * `already-submitted`: the port refused it because an earlier one
           * was proven.
           */
          step: 'request';
          reason: 'pending' | 'already-submitted';
          error: unknown;
      };

// ---------------------------------------------------------------------------
// Ports, input, state
// ---------------------------------------------------------------------------

export interface WithdrawPorts {
    /**
     * Build the Nexera KYC params for the pre-check. Defaults to
     * `kasu.deposits.buildKycParams`, exactly as the deposit flow's does.
     */
    buildKycParams?(
        userAddress: `0x${string}`,
    ): KycParams | Promise<KycParams>;
    /**
     * Exchange those params for a signature at the consumer's own backend, and
     * so verify the lender's KYC BEFORE the wallet is opened — a lapsed one
     * surfaces as `{ step: 'kyc' }` instead of an opaque revert. The
     * withdrawal call itself does not carry the signature.
     *
     * Supplying this port is what turns the pre-check on; there is no default,
     * because the SDK does not know the application's backend. This is the
     * same pair the deposit flow uses, rather than the opaque `ensureKyc` of
     * earlier drafts, so one KYC pre-check exists across both money paths.
     */
    getKycSignature?(params: KycParams): Promise<unknown>;
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
    /**
     * Submit ONE encoded call through a sponsored submitter (a gas-sponsoring
     * relay) and return a handle whose `wait()` settles it. Supplying it is
     * what turns the sponsored path on; it has no default, because how a call
     * is relayed is the application's business. Post `call.kind` and
     * `[call.call]` exactly as given — `submitSponsoredCall` does this, with
     * the polling and the receipt proof.
     *
     * Throw `BatchRevertedError` for a known revert and
     * `BatchSubmissionError(code, 'failed')` ONLY when nothing was sent; any
     * other throw — here or from `wait()` — is read as `pending`.
     */
    submitCall?(call: SponsoredCall): Promise<WaitableTransaction>;
    /**
     * Encode the withdrawal for `submitCall`. Defaults (in
     * `kasu.flows.withdraw()`) to `kasu.calls.requestWithdrawal`, which
     * converts the amount to shares exactly as `withdraw` / `withdrawMax`
     * do. Only read when `submitCall` is supplied.
     */
    encodeWithdrawal?(params: {
        poolId: string;
        trancheId: string;
        amount: BigNumber | 'max';
        userAddress: string;
    }): Promise<SponsoredCall>;
}

export interface WithdrawFlowInput {
    poolId: string;
    trancheId: string;
    /**
     * The amount in BASE units, or the literal `'max'`.
     *
     * `'max'` is not "the balance as I last read it": it routes to the
     * all-shares request, whose share count is the lender's tranche
     * `balanceOf`, read by the SDK at submission rather than converted from
     * an asset figure. Deciding max-ness from a number the consumer read a
     * moment ago is how dust gets stranded in a tranche, so the decision is a
     * code, made by the consumer, and carried here intact.
     */
    amount: BigNumber | 'max';
    userAddress: `0x${string}`;
}

export interface WithdrawState {
    phase: WithdrawPhase;
    step: WithdrawStep | null;
    /** True when this run routed through the all-shares call. */
    isMax: boolean;
    /**
     * True when this flow submits through `submitCall` — fixed when the flow
     * is built, so it is right from the first state, `idle` included.
     */
    sponsored: boolean;
    failure: WithdrawFailure | null;
}

const INITIAL: WithdrawState = {
    phase: 'idle',
    step: null,
    isMax: false,
    sponsored: false,
    failure: null,
};

/** What a KYC pre-check with no `buildKycParams` to call fails with. */
export const NO_KYC_PARAMS_MESSAGE =
    'WithdrawFlow: getKycSignature was supplied without buildKycParams; build the flow with kasu.flows.withdraw() or pass both';

/** What a sponsored run with no `encodeWithdrawal` to call fails with. */
export const NO_WITHDRAWAL_ENCODER_MESSAGE =
    'WithdrawFlow: submitCall was supplied without encodeWithdrawal; build the flow with kasu.flows.withdraw() or pass both';

/** What a sponsored run fails with when the encoder returned another kind of call. */
export const NOT_A_WITHDRAWAL_CALL_MESSAGE =
    'WithdrawFlow: encodeWithdrawal returned a call that is not a withdrawal';

/**
 * A `submitCall` rejection, read with the batch path's taxonomy. A submission
 * outcome is taken at its word FIRST — never through the wallet classifier,
 * which would read a relay's "request rejected" as the lender's own doing —
 * and anything unrecognised is `pending`: it may have left.
 */
function classifySponsored(err: unknown): WithdrawFailure {
    if (err instanceof BatchSubmissionError) {
        return err.outcome === 'failed'
            ? { step: 'request', reason: 'failed', error: err }
            : { step: 'request', reason: err.outcome, error: err };
    }
    if (err instanceof BatchRevertedError) {
        return {
            step: 'request',
            reason: 'reverted',
            revertError: err.revertError,
            error: err,
        };
    }
    return { step: 'request', reason: 'pending', error: err };
}

// ---------------------------------------------------------------------------
// The flow
// ---------------------------------------------------------------------------

export class WithdrawFlow extends Flow<WithdrawState, WithdrawFlowInput> {
    constructor(private readonly _ports: WithdrawPorts) {
        super({
            ...INITIAL,
            sponsored: typeof _ports.submitCall === 'function',
        });
    }

    protected async _run(
        input: WithdrawFlowInput,
        token: number,
    ): Promise<void> {
        const ports = this._ports;
        const isMax = input.amount === 'max';

        // 1. The optional KYC pre-check: build the params, exchange them for a
        //    signature. Both ports reach the application's own backend, so a
        //    throw here is ALWAYS `failed` — running it through the wallet
        //    rejection classifier would let a backend's "Declined" be reported
        //    to a lender as something they did, with the real error dropped.
        if (ports.getKycSignature) {
            this._store.patch(
                { phase: 'checking-kyc', step: 'kyc', isMax },
                token,
            );
            try {
                if (!ports.buildKycParams) {
                    throw new Error(NO_KYC_PARAMS_MESSAGE);
                }
                const params = await ports.buildKycParams(input.userAddress);
                await ports.getKycSignature(params);
            } catch (err) {
                this._store.patch(
                    {
                        phase: 'error',
                        failure: { step: 'kyc', reason: 'failed', error: err },
                    },
                    token,
                );
                return;
            }
            if (!this._store.isCurrent(token)) return;
        }

        if (ports.submitCall) {
            await this._runSponsored(input, token, isMax);
            return;
        }

        // 2. The submission. This one IS a wallet call, so it keeps the
        //    `cancelled` / `failed` split.
        this._store.patch(
            { phase: 'request-sign', step: 'request', isMax },
            token,
        );
        try {
            const tx =
                input.amount === 'max'
                    ? await ports.withdrawMax(
                          input.poolId,
                          input.trancheId,
                          input.userAddress.toLowerCase(),
                      )
                    : await ports.withdraw({
                          poolId: input.poolId,
                          trancheId: input.trancheId,
                          amount: input.amount,
                      });
            this._store.patch({ phase: 'request-confirm' }, token);
            await tx.wait();
        } catch (err) {
            this._store.patch(
                {
                    phase: 'error',
                    failure: classifyWalletFailure('request', err),
                },
                token,
            );
            return;
        }
        if (!this._store.isCurrent(token)) return;

        this._store.patch({ phase: 'success' }, token);
    }

    /**
     * 2'. The sponsored submission: encode, re-check the run, submit, settle.
     *
     * The encode reads the chain (the shares), so a run abandoned during it
     * must stop BEFORE `submitCall` — nothing has been sent yet, and an
     * abandoned run must never send. A throw while encoding is `failed`:
     * nothing left. After `submitCall` is called, only the taxonomy decides.
     */
    private async _runSponsored(
        input: WithdrawFlowInput,
        token: number,
        isMax: boolean,
    ): Promise<void> {
        const ports = this._ports;
        // Only reached when `submitCall` is supplied; narrows it for below.
        if (!ports.submitCall) return;
        this._store.patch(
            { phase: 'request-sign', step: 'request', isMax },
            token,
        );

        let call: SponsoredCall;
        try {
            if (!ports.encodeWithdrawal) {
                throw new Error(NO_WITHDRAWAL_ENCODER_MESSAGE);
            }
            call = await ports.encodeWithdrawal({
                poolId: input.poolId,
                trancheId: input.trancheId,
                amount: input.amount,
                userAddress: input.userAddress,
            });
            if ((call as Partial<SponsoredCall> | null)?.kind !== 'withdrawal') {
                throw new Error(NOT_A_WITHDRAWAL_CALL_MESSAGE);
            }
        } catch (err) {
            this._store.patch(
                {
                    phase: 'error',
                    failure: { step: 'request', reason: 'failed', error: err },
                },
                token,
            );
            return;
        }
        if (!this._store.isCurrent(token)) return;

        try {
            const tx = await ports.submitCall(call);
            this._store.patch({ phase: 'request-confirm' }, token);
            await tx.wait();
        } catch (err) {
            this._store.patch(
                { phase: 'error', failure: classifySponsored(err) },
                token,
            );
            return;
        }
        if (!this._store.isCurrent(token)) return;

        this._store.patch({ phase: 'success' }, token);
    }
}
