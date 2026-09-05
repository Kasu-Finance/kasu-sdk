import { BigNumber } from 'ethers';

import {
    asContractType,
    buildLegacyContractRequestMessage,
    buildLoanAgreementSignMessage,
    encodeDepositData,
    GenerateContractResponse,
} from '../domain/loan-contract';
import { isUnpredictableGas, isUserRejected } from '../domain/wallet-errors';
import { DepositParams, KycParams } from '../facade/types';

import { FlowStore } from './observable';

/**
 * The KYC-gated deposit pipeline, headless.
 *
 * This is the state machine kasu-ui and kasu-mobile each hand-wrote and then
 * had to keep in step by hand: sign an auth message, generate the loan
 * agreement, park while the lender reads it, sign it, approve the EXACT amount,
 * fetch the KYC signature, submit, wait. Two implementations of one money path
 * is one too many, so it lives here once and each application drives it from
 * its own UI.
 *
 * **No React, no copy, no I/O of its own.** Every side effect is an injected
 * port and every observable state is a code — `{ step: 'approve', reason:
 * 'cancelled' }`, never "USDC approval was cancelled in your wallet". The
 * applications keep their own `DEPOSIT_STEP_ERRORS` tables and map the codes to
 * their words, in their design system and their language. Nothing in this file
 * may be shown to a lender.
 *
 * ## Order, and why each step is where it is
 *
 * 1. **Allowance pre-check** — before anything is signed, because it decides
 *    `approvalRequired`, which decides `stepTotal`. A badge that said "3 of 4"
 *    and then silently became "3 of 3" would be describing a pipeline the
 *    lender is not in. A failed read assumes an approve IS needed: the safe
 *    default is a redundant approval, never a reverted deposit.
 * 2. **`generating-sign`** — the lender signs the auth message
 *    (`buildLoanAgreementSignMessage`, or the legacy builder). kasu-backend
 *    reconstructs that string byte-for-byte to verify the signature.
 * 3. **`generating-fetch`** — the agreements service returns the contract.
 * 4. **`awaiting-accept`** — the run PARKS on a promise the consumer settles
 *    with `acceptContract()` or `declineContract()`. This is the only point at
 *    which a lender is committing to anything.
 * 5. **`accepting-sign`** — the acceptance signature, which becomes the
 *    on-chain `depositData` via `encodeDepositData`.
 * 6. **The 5-minute TTL guard** — checked AFTER the accept, because that is
 *    where the idling happens. An expired agreement is refused here rather than
 *    broadcast as a transaction that cannot succeed.
 * 7. **`approve`** — the EXACT amount, never `MaxUint256`. House rule, and it
 *    is why the allowance drops to zero after every deposit and why step 1
 *    reads it fresh rather than trusting a cache.
 * 8. **`request-sign` / `request-confirm`** — KYC signature, then the deposit,
 *    then the receipt.
 *
 * ## Failure codes
 *
 * A wallet rejection (`isUserRejected`) is `'cancelled'` — the lender changed
 * their mind, and telling them something broke would be a lie. A reverted gas
 * estimate on the request step (`isUnpredictableGas`) is
 * `'insufficient-balance'` — nothing was refused, the transaction simply cannot
 * succeed as composed. Everything else is `'failed'` and carries the original
 * error for the consumer's crash reporter.
 *
 * ```ts
 * const flow = new DepositFlow(ports);
 * const stop = flow.subscribe((s) => render(s));
 * await flow.start({ poolId, trancheId, amount, spender, userAddress, ... });
 * // …the consumer shows `flow.state.contract` and calls:
 * await flow.acceptContract();
 * ```
 */

// ---------------------------------------------------------------------------
// Codes
// ---------------------------------------------------------------------------

/**
 * Where the run is. `success`, `declined` and `error` are terminal; everything
 * else is in flight.
 */
export type DepositPhase =
    | 'idle'
    | 'generating-sign'
    | 'generating-fetch'
    | 'awaiting-accept'
    | 'accepting-sign'
    | 'approve'
    | 'request-sign'
    | 'request-confirm'
    | 'success'
    | 'declined'
    | 'error';

/**
 * The four steps a lender sees as a badge. `approve` drops out of the sequence
 * when the allowance already covers the deposit, which is why `stepIndex` and
 * `stepTotal` are published rather than derived by each consumer.
 */
export type DepositStep = 'generate' | 'confirm' | 'approve' | 'request';

/**
 * Why a run did not reach `success`, as a code plus the step it happened on.
 *
 * The consumer maps this to its own words. `error` carries the underlying
 * throw for a crash reporter — a `cancelled` and a `contract-expired` do not,
 * because neither is a fault worth reporting.
 */
export type DepositFailure =
    | { step: DepositStep; reason: 'cancelled' }
    | { step: DepositStep; reason: 'failed'; error: unknown }
    | { step: 'request'; reason: 'insufficient-balance'; error: unknown }
    | { step: 'request'; reason: 'contract-expired' };

// ---------------------------------------------------------------------------
// Ports
// ---------------------------------------------------------------------------

/** Anything with a `wait()` — an ethers `ContractTransaction`, or a fake. */
export interface WaitableTransaction {
    wait(): Promise<unknown>;
}

/** What the KYC signing service hands back. */
export interface KycSignature {
    signature: string;
    blockExpiration: number | string;
}

/**
 * The `/contract/generate` body, assembled by the flow and posted by the
 * consumer's own port — through its server-side proxy (kasu-ui) or straight to
 * the agreements service (kasu-mobile). The SDK never makes the call itself and
 * never learns the URL or the key.
 */
export interface GenerateContractRequest {
    /**
     * The lender's address, LOWERCASED. The legacy message embeds this casing
     * and kasu-backend rebuilds the string from the body, so the two must
     * agree.
     */
    address: string;
    /** Signature over `signedMessage`. */
    signature: string;
    /** ms-epoch. The same value `signedMessage` states — do not re-clock it. */
    timestamp: number;
    /**
     * The exact text that was signed. Sent so a consumer can log or assert on
     * it; the backend rebuilds it from the other fields rather than trusting
     * this one.
     */
    signedMessage: string;
    poolId: string;
    trancheId: string;
    /** `'0'` for a variable-rate deposit. */
    fixedTermConfigId: string;
    /**
     * The deposit in DISPLAY units, forwarded verbatim from
     * `DepositFlowInput.depositAmount`. kasu-backend cross-checks it against
     * the leading number of `amountLabel`.
     */
    depositAmount?: number;
    /** The four human-readable fields, present only on the new format. */
    strategyName?: string;
    region?: string;
    optionName?: string;
    amountLabel?: string;
}

/**
 * The human-readable `/contract/generate` format (BD deck slide 19): the lender
 * signs a statement naming the strategy, region, option and amount.
 *
 * `amountLabel` must be derived from the same value as `depositAmount` — the
 * backend refuses a message that states an amount other than the one being
 * executed. The SDK does not format it, because formatting is the
 * application's (and its locale's) business.
 */
export interface LoanAgreementRequest {
    format: 'loan-agreement';
    strategyName: string;
    region: string;
    optionName: string;
    amountLabel: string;
}

/**
 * The legacy `I request contract content for {address} at {timestamp}.`
 * format, which kasu-backend still accepts and `/contract/resolve` has no
 * alternative to.
 */
export interface LegacyContractRequest {
    format: 'legacy';
}

export type ContractMessageRequest =
    | LoanAgreementRequest
    | LegacyContractRequest;

/**
 * Every side effect the pipeline needs, injected.
 *
 * `kasu.flows.deposit()` fills `readAllowance`, `approve`, `deposit` and
 * `buildKycParams` from the SDK's own signer-bound implementations; the three
 * that reach the consumer's own backend or wallet have no sensible default and
 * are always supplied by the application.
 */
export interface DepositPorts {
    /** EIP-191 personal sign. Rejects when the lender refuses. */
    signMessage(message: string): Promise<string>;
    /** POST the generate request; resolve with the agreements service's reply. */
    generateContract(
        req: GenerateContractRequest,
    ): Promise<GenerateContractResponse>;
    /** Build the Nexera KYC params. Defaults to `kasu.deposits.buildKycParams`. */
    buildKycParams(
        userAddress: `0x${string}`,
    ): KycParams | Promise<KycParams>;
    /** Exchange those params for a signature at the consumer's own backend. */
    getKycSignature(params: KycParams): Promise<KycSignature>;
    /** ERC-20 `allowance(owner, spender)`, in base units. */
    readAllowance(owner: string, spender: string): Promise<BigNumber>;
    /** ERC-20 `approve(spender, amount)`. The flow only ever passes the EXACT amount. */
    approve(spender: string, amount: BigNumber): Promise<WaitableTransaction>;
    /** `requestDepositWithKyc`. Defaults to `kasu.deposits.deposit`. */
    deposit(params: DepositParams): Promise<WaitableTransaction>;
    /** ms-epoch clock. Defaults to `Date.now`; injected so the TTL is testable. */
    now?(): number;
}

// ---------------------------------------------------------------------------
// Input and state
// ---------------------------------------------------------------------------

export interface DepositFlowInput {
    poolId: string;
    trancheId: string;
    /** The deposit in BASE units (6dp for USDC and AUDD). */
    amount: BigNumber;
    /** `'0'` for a variable-rate deposit. */
    fixedTermConfigId: string;
    userAddress: `0x${string}`;
    /** The ERC-20 spender — `contracts.LendingPoolManager` on this chain. */
    spender: string;
    /** Which signed-message format to use, and its fields. */
    contractMessage: ContractMessageRequest;
    /**
     * The deposit in DISPLAY units, for the generate request only.
     *
     * NOT derived from `amount`: turning base units back into a display number
     * is formatting, and formatting is the application's job — it is also the
     * application that produced `amountLabel`, and kasu-backend refuses the two
     * if they disagree. Pass the same value both were built from.
     */
    depositAmount?: number;
}

export interface DepositState {
    phase: DepositPhase;
    /** The step `phase` belongs to; `null` only while idle. */
    step: DepositStep | null;
    /** 1-based badge position of `step`; `0` while idle. */
    stepIndex: number;
    /** `4`, or `3` when the allowance already covers the deposit. */
    stepTotal: number;
    /** Whether the approve step is in scope for this run. */
    approvalRequired: boolean;
    /** The generated agreement, from `generating-fetch` onwards. */
    contract: GenerateContractResponse | null;
    /** Set with `phase: 'error'`, cleared by `reset()`. */
    failure: DepositFailure | null;
}

/** Generated agreements are valid for five minutes upstream. */
export const CONTRACT_TTL_MS = 5 * 60 * 1000;

const INITIAL: DepositState = {
    phase: 'idle',
    step: null,
    stepIndex: 0,
    stepTotal: 4,
    approvalRequired: true,
    contract: null,
    failure: null,
};

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const DECLINED = 'contract-declined';

interface TaggedError {
    kasuFlowReason?: string;
}

function declinedError(): Error {
    return Object.assign(new Error(DECLINED), { kasuFlowReason: DECLINED });
}

/**
 * The marker `reset()` uses to unpark an abandoned run. It never reaches a
 * consumer: the run checks its own token before classifying anything.
 */
function abandonedError(): Error {
    return Object.assign(new Error('flow-abandoned'), {
        kasuFlowReason: 'flow-abandoned',
    });
}

function isDeclined(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    return (
        (err as Error & TaggedError).kasuFlowReason === DECLINED ||
        err.message === DECLINED
    );
}

/** 1-based badge position, with `approve` dropped when it is out of scope. */
function stepIndexOf(step: DepositStep, approvalRequired: boolean): number {
    const order: DepositStep[] = approvalRequired
        ? ['generate', 'confirm', 'approve', 'request']
        : ['generate', 'confirm', 'request'];
    return order.indexOf(step) + 1;
}

function badgeFor(
    step: DepositStep,
    approvalRequired: boolean,
): Pick<DepositState, 'step' | 'stepIndex' | 'stepTotal'> {
    return {
        step,
        stepIndex: stepIndexOf(step, approvalRequired),
        stepTotal: approvalRequired ? 4 : 3,
    };
}

/**
 * The `cancelled` / `failed` split, on every step but `request`.
 *
 * A lender who pressed Reject is not a fault. Reporting one as the other is
 * how a support queue fills with people who did exactly what they meant to.
 */
function classify(step: DepositStep, err: unknown): DepositFailure {
    return isUserRejected(err)
        ? { step, reason: 'cancelled' }
        : { step, reason: 'failed', error: err };
}

/**
 * The request step has a third outcome. `UNPREDICTABLE_GAS_LIMIT` here is
 * almost always `transferFrom` reverting on a balance that cannot cover the
 * deposit, and it takes precedence: nothing was refused by the lender, so
 * inviting a retry would just reproduce it.
 */
function classifyRequest(err: unknown): DepositFailure {
    if (isUnpredictableGas(err)) {
        return { step: 'request', reason: 'insufficient-balance', error: err };
    }
    return classify('request', err);
}

// ---------------------------------------------------------------------------
// The flow
// ---------------------------------------------------------------------------

export class DepositFlow {
    private readonly _store = new FlowStore<DepositState>(INITIAL);
    private readonly _ttlMs: number;
    private readonly _now: () => number;

    /**
     * The accept handshake. The run parks on this promise; `acceptContract`
     * resolves it with the acceptance signature and `declineContract` rejects
     * it. Cleared the moment it settles so a stale resolver from an abandoned
     * run can never leak into the next one.
     */
    private _accept: {
        resolve: (signature: string) => void;
        reject: (err: Error) => void;
    } | null = null;

    /**
     * Re-entrancy guard. Claimed synchronously, before the first `await`, so a
     * double-click cannot launch two pipelines that share `_accept` and fire
     * two on-chain deposits.
     */
    private _running = false;

    /**
     * True between `acceptContract()` and the wallet settling. It guards a
     * double tap, and it is why `_accept` is NOT cleared before the signature
     * comes back: keeping the handshake reachable is what lets `reset()` unpark
     * a run whose wallet prompt is still open.
     */
    private _accepting = false;

    constructor(
        private readonly _ports: DepositPorts,
        opts?: { contractTtlMs?: number },
    ) {
        this._ttlMs = opts?.contractTtlMs ?? CONTRACT_TTL_MS;
        // Called through the ports object, never captured off it: a consumer
        // whose clock is a method on its own object keeps its `this`.
        this._now = (): number => _ports.now?.() ?? Date.now();
    }

    /** The current state. Every transition is also published to `subscribe`. */
    get state(): DepositState {
        return this._store.state;
    }

    /** True while a run is in flight, including while parked on the agreement. */
    get isRunning(): boolean {
        return this._running;
    }

    /**
     * Observe every transition. Returns the unsubscribe function.
     *
     * The listener is not called on subscribe; read `state` for the value it
     * starts from.
     */
    subscribe(listener: (state: DepositState) => void): () => void {
        return this._store.subscribe(listener);
    }

    /**
     * Run the pipeline. Resolves when it reaches a terminal phase — it does not
     * reject, because every outcome a consumer can act on is in `state.failure`.
     *
     * A second call while one is in flight is a no-op.
     */
    async start(input: DepositFlowInput): Promise<void> {
        if (this._running) return;
        this._running = true;
        try {
            await this._run(input);
        } finally {
            this._running = false;
        }
    }

    /**
     * Sign the agreement and resume the parked run. A no-op when nothing is
     * parked, so a double tap cannot sign twice.
     */
    async acceptContract(): Promise<void> {
        const bridge = this._accept;
        const contract = this._store.state.contract;
        if (!bridge || !contract || this._accepting) return;
        this._accepting = true;
        const token = this._store.generation;
        this._store.patch(
            {
                phase: 'accepting-sign',
                ...badgeFor('confirm', this._store.state.approvalRequired),
            },
            token,
        );
        try {
            bridge.resolve(
                await this._ports.signMessage(contract.contractMessage),
            );
        } catch (err) {
            bridge.reject(err as Error);
        } finally {
            this._accepting = false;
        }
    }

    /**
     * Back out of the agreement. The run ends on `declined` — a legitimate
     * choice, not a failure, and `state.failure` stays null.
     *
     * Ignored once `acceptContract()` has opened the wallet: an agreement in
     * the middle of being signed cannot also be refused. `reset()` is the way
     * out of a prompt that never answers.
     */
    declineContract(): void {
        const bridge = this._accept;
        if (!bridge || this._accepting) return;
        this._accept = null;
        bridge.reject(declinedError());
    }

    /**
     * Back to `idle`, abandoning any run in flight: its remaining transitions
     * are dropped and a parked handshake is unparked. Subscribers are kept.
     */
    reset(): void {
        const bridge = this._accept;
        this._accept = null;
        this._store.reset();
        bridge?.reject(abandonedError());
    }

    // -----------------------------------------------------------------------

    private async _run(input: DepositFlowInput): Promise<void> {
        this._store.reset();
        this._accept = null;
        const token = this._store.beginRun();
        const ports = this._ports;
        const owner = input.userAddress.toLowerCase();

        // 1. Allowance pre-check. Decides `approvalRequired` — and therefore
        //    the badge total — before the lender is shown a single step. Read
        //    live, never cached: an exact-amount approval is fully consumed by
        //    the deposit it paid for, so a stale allowance is exactly the value
        //    that would wrongly skip the approve and revert the deposit.
        let approvalRequired = true;
        try {
            const allowance = await ports.readAllowance(owner, input.spender);
            approvalRequired = allowance.lt(input.amount);
        } catch {
            // A read failure is not a reason to skip an approval. Assume one is
            // needed: the cost is a redundant approve, the alternative is a
            // reverted deposit.
            approvalRequired = true;
        }
        if (!this._store.isCurrent(token)) return;

        // 2. Generate — sign the auth message.
        this._store.patch(
            {
                approvalRequired,
                phase: 'generating-sign',
                ...badgeFor('generate', approvalRequired),
            },
            token,
        );

        const timestamp = this._now();
        const signedMessage = buildAuthMessage(input, owner, timestamp);
        let signature: string;
        try {
            signature = await ports.signMessage(signedMessage);
        } catch (err) {
            this._fail(token, approvalRequired, classify('generate', err));
            return;
        }
        if (!this._store.isCurrent(token)) return;

        // 3. Generate — POST the request.
        this._store.patch(
            {
                phase: 'generating-fetch',
                ...badgeFor('generate', approvalRequired),
            },
            token,
        );
        let contract: GenerateContractResponse;
        try {
            contract = await ports.generateContract({
                address: owner,
                signature,
                timestamp,
                signedMessage,
                poolId: input.poolId,
                trancheId: input.trancheId,
                fixedTermConfigId: input.fixedTermConfigId,
                depositAmount: input.depositAmount,
                ...displayFieldsOf(input.contractMessage),
            });
        } catch (err) {
            // Never a wallet rejection: this step is an HTTP call, and the
            // lender's wallet was not involved in it. A backend that happened
            // to echo the words "user rejected" must not be reported to them as
            // something they did.
            this._fail(token, approvalRequired, {
                step: 'generate',
                reason: 'failed',
                error: err,
            });
            return;
        }
        if (!this._store.isCurrent(token)) return;

        // 4. Park on the agreement until the consumer accepts or declines.
        let acceptedSignature: string;
        try {
            acceptedSignature = await new Promise<string>((resolve, reject) => {
                this._accept = { resolve, reject };
                this._store.patch(
                    {
                        phase: 'awaiting-accept',
                        contract,
                        ...badgeFor('confirm', approvalRequired),
                    },
                    token,
                );
            });
        } catch (err) {
            this._accept = null;
            // An abandoned run lands here too — `reset()` unparks by rejecting.
            // The token check is what tells the two apart.
            if (!this._store.isCurrent(token)) return;
            if (isDeclined(err)) {
                this._store.patch(
                    {
                        phase: 'declined',
                        ...badgeFor('confirm', approvalRequired),
                    },
                    token,
                );
                return;
            }
            this._fail(token, approvalRequired, classify('confirm', err));
            return;
        }
        this._accept = null;
        if (!this._store.isCurrent(token)) return;

        // 5. TTL guard. Checked here because this is where the idling happens:
        //    the lender has just spent as long as they wanted reading. An
        //    expired agreement is refused rather than broadcast — the on-chain
        //    call would revert, after a wallet prompt and a gas estimate, with
        //    nothing on screen explaining why.
        if (this._now() > contract.timestamp + this._ttlMs) {
            this._fail(token, approvalRequired, {
                step: 'request',
                reason: 'contract-expired',
            });
            return;
        }

        const depositData = encodeDepositData({
            signature: acceptedSignature,
            timestamp: contract.timestamp,
            contractVersion: contract.contractVersion,
            contractType: asContractType(contract.contractType),
        });

        // 6. Approve — the EXACT amount, never `MaxUint256`. House rule: an
        //    unlimited allowance outlives the deposit it was granted for, and a
        //    later exploit of the spender would drain a wallet that has long
        //    since stopped lending.
        if (approvalRequired) {
            this._store.patch(
                { phase: 'approve', ...badgeFor('approve', approvalRequired) },
                token,
            );
            try {
                const tx = await ports.approve(input.spender, input.amount);
                await tx.wait();
            } catch (err) {
                this._fail(token, approvalRequired, classify('approve', err));
                return;
            }
            if (!this._store.isCurrent(token)) return;
        }

        // 7. Request — KYC signature, deposit, receipt.
        this._store.patch(
            { phase: 'request-sign', ...badgeFor('request', approvalRequired) },
            token,
        );
        try {
            const kycParams = await ports.buildKycParams(
                owner as `0x${string}`,
            );
            const kyc = await ports.getKycSignature(kycParams);
            const tx = await ports.deposit({
                poolId: input.poolId,
                trancheId: input.trancheId,
                amount: input.amount,
                kycSignature: {
                    blockExpiration: kyc.blockExpiration,
                    signature: kyc.signature,
                },
                depositData,
                fixedTermConfigId: input.fixedTermConfigId,
            });
            this._store.patch(
                {
                    phase: 'request-confirm',
                    ...badgeFor('request', approvalRequired),
                },
                token,
            );
            await tx.wait();
        } catch (err) {
            this._fail(token, approvalRequired, classifyRequest(err));
            return;
        }
        if (!this._store.isCurrent(token)) return;

        this._store.patch(
            { phase: 'success', ...badgeFor('request', approvalRequired) },
            token,
        );
    }

    private _fail(
        token: number,
        approvalRequired: boolean,
        failure: DepositFailure,
    ): void {
        this._store.patch(
            {
                phase: 'error',
                failure,
                ...badgeFor(failure.step, approvalRequired),
            },
            token,
        );
    }
}

// ---------------------------------------------------------------------------
// Message building
// ---------------------------------------------------------------------------

/**
 * The auth message, in whichever format the consumer asked for. Both builders
 * are the byte-exact protocol strings from `domain/loan-contract` — the string
 * signed here and the body posted from `_run` state the SAME timestamp and the
 * SAME lowercased address, because kasu-backend rebuilds one from the other.
 */
function buildAuthMessage(
    input: DepositFlowInput,
    owner: string,
    timestamp: number,
): string {
    if (input.contractMessage.format === 'legacy') {
        return buildLegacyContractRequestMessage(owner, timestamp);
    }
    const { strategyName, region, optionName, amountLabel } =
        input.contractMessage;
    return buildLoanAgreementSignMessage({
        strategyName,
        region,
        optionName,
        amountLabel,
        timestamp,
    });
}

/**
 * The four display fields, present only on the new format. The backend picks
 * its verification path on their presence: all four → the human-readable
 * format, any missing → the legacy string.
 */
function displayFieldsOf(
    message: ContractMessageRequest,
): Pick<
    GenerateContractRequest,
    'strategyName' | 'region' | 'optionName' | 'amountLabel'
> {
    if (message.format === 'legacy') return {};
    return {
        strategyName: message.strategyName,
        region: message.region,
        optionName: message.optionName,
        amountLabel: message.amountLabel,
    };
}
