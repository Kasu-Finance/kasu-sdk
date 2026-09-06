import { BigNumber } from 'ethers';

import { classifyWalletFailure } from '../domain/wallet-errors';
import { KycParams } from '../facade/types';

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
    | { step: WithdrawStep; reason: 'failed'; error: unknown };

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

/** What a KYC pre-check with no `buildKycParams` to call fails with. */
export const NO_KYC_PARAMS_MESSAGE =
    'WithdrawFlow: getKycSignature was supplied without buildKycParams; build the flow with kasu.flows.withdraw() or pass both';

// ---------------------------------------------------------------------------
// The flow
// ---------------------------------------------------------------------------

export class WithdrawFlow extends Flow<WithdrawState, WithdrawFlowInput> {
    constructor(private readonly _ports: WithdrawPorts) {
        super(INITIAL);
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
}
