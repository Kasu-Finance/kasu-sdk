import { BigNumber, utils } from 'ethers';

import {
    asContractType,
    buildLegacyContractRequestMessage,
    buildLoanAgreementSignMessage,
    encodeDepositData,
    GenerateContractResponse,
} from '../domain/loan-contract';
import { decodeRevert } from '../domain/revert-errors';
import {
    classifyWalletFailure,
    isUnpredictableGas,
} from '../domain/wallet-errors';
import { DepositParams, KycParams } from '../facade/types';

import { Flow } from './flow';
import { WaitableTransaction } from './observable';

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
 * their mind, and telling them something broke would be a lie. Only a WALLET
 * call is ever classified that way: the HTTP ports are always `'failed'`,
 * because a backend that words a refusal "declined" did not involve the
 * lender's wallet. A revert on the request step is read for WHAT reverted: a
 * protocol error the ABI declares is `'reverted'` with the name, and only a
 * token balance or allowance failure — or a revert nothing can decode — stays
 * `'insufficient-balance'`. Everything else is `'failed'` and carries the
 * original error for the consumer's crash reporter.
 *
 * ## Both signatures are checked before they are used
 *
 * A wallet is not obliged to hand back 65 bytes, and `encodeDepositData` will
 * not catch one that does not: `defaultAbiCoder` encodes any even-length hex
 * as `bytes`, `0x` included, so a malformed acceptance signature becomes a
 * `depositData` blob that is broadcast, mined, and then can never be verified
 * by the agreements service. Both personal signs are therefore length-checked
 * where they are taken, and a bad one fails the step it was taken on rather
 * than the one it would eventually have broken.
 *
 * ```ts
 * const flow = new DepositFlow(ports);
 * const stop = flow.subscribe((s) => render(s));
 * await flow.start({ poolId, trancheId, amount, userAddress, ... });
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
    | {
          step: 'request';
          reason: 'reverted';
          /**
           * The custom error the contract reverted with, exactly as the ABI
           * declares it — `'ClearingIsPending'`, `'LendingPoolIsStopped'`,
           * `'UserNotKycd'`, and the rest of
           * `ILendingPoolManagerAbi` / `IKasuAllowListAbi`.
           *
           * Render `reverted` with generic copy and special-case only the
           * names you have words for: a contract upgrade can add an error, and
           * a consumer that assumed the set was closed would have nothing to
           * show for the new one.
           */
          revertError: string;
          error: unknown;
      }
    | { step: 'request'; reason: 'contract-expired' };

// ---------------------------------------------------------------------------
// Ports
// ---------------------------------------------------------------------------

export type { WaitableTransaction };

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

/** Construction options. `kasu.flows.deposit()` fills `spender` in. */
export interface DepositFlowOptions {
    /** Agreement validity window; defaults to `CONTRACT_TTL_MS`. */
    contractTtlMs?: number;
    /**
     * The ERC-20 spender every run approves and deposits through, when the
     * input does not name one. `kasu.flows.deposit()` passes this chain's
     * `contracts.LendingPoolManager`, which is the only contract the default
     * deposit port calls.
     */
    spender?: string;
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
    /**
     * The ERC-20 spender, when it is NOT this chain's `LendingPoolManager`.
     *
     * Leave it out: `kasu.flows.deposit()` defaults it from the chain config,
     * and the default deposit port calls no other contract. It exists for a
     * consumer that replaced the `deposit` port with one that spends
     * somewhere else — a wrong spender is an approval granted to the wrong
     * contract and then a revert diagnosed as `insufficient-balance`.
     */
    spender?: string;
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

/** What a run without a spender, from either source, fails with. */
export const NO_SPENDER_MESSAGE =
    'DepositFlow: no ERC-20 spender; build the flow with kasu.flows.deposit() or pass `spender` on the input';

/** What a malformed auth signature fails the generate step with. */
export const INVALID_AUTH_SIGNATURE_MESSAGE =
    'DepositFlow: the wallet returned a malformed authentication signature; expected 65 bytes of 0x-prefixed hex';

/** What a malformed acceptance signature fails the confirm step with. */
export const INVALID_ACCEPTANCE_SIGNATURE_MESSAGE =
    'DepositFlow: the wallet returned a malformed acceptance signature; expected 65 bytes of 0x-prefixed hex';

/**
 * Is this an EIP-191 personal sign, in the only shape the protocol accepts?
 *
 * 65 bytes — `r`, `s`, `v` — 0x-prefixed. Nothing downstream checks it: the
 * ABI coder takes any even-length hex as `bytes`, so `'0x'` and a 64-byte
 * string both encode happily into a `depositData` the agreements service then
 * cannot verify against anything. The check has to happen where the signature
 * is taken, which is here.
 */
function isPersonalSignature(signature: unknown): signature is string {
    return utils.isHexString(signature, 65);
}

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

/**
 * How the park ends, as data.
 *
 * It used to be signalled by throwing tagged `Error`s and sniffing them again
 * on the way out, which meant a port error whose message happened to read
 * `contract-declined` ENDED THE RUN AS A DECLINE — a lender's deposit
 * abandoned on a string coincidence. A discriminated result cannot be
 * counterfeited by an error message: `failed` carries the throw, and only
 * `declineContract()` can produce `declined`.
 */
type AcceptOutcome =
    | { kind: 'accepted'; signature: string }
    | { kind: 'declined' }
    | { kind: 'failed'; error: unknown }
    /** `reset()` unparked it. The run's token check drops everything after. */
    | { kind: 'abandoned' };

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
 * The request step's extra outcomes, in the order the evidence supports.
 *
 * A revert is read for WHAT reverted before it is read as a shortfall.
 * `requestDepositWithKyc` reverts for a whole family of declared reasons —
 * `LendingPoolIsStopped`, `ClearingIsPending`, `UserNotKycd`, `UserBlocked`,
 * `UserNotInAllowList`, `InvalidTranche`, `BlockExpired` — and every one of
 * them used to arrive as `insufficient-balance`, which told a fully funded
 * lender to top up a wallet that was never short while their pool was simply
 * mid-clearing. So: a decoded protocol error is `reverted` and names itself.
 *
 * Only a token balance or allowance failure — or revert data nothing can
 * decode, on the `UNPREDICTABLE_GAS_LIMIT` ethers raises for a failed gas
 * estimate — is still `insufficient-balance`, which is the case that reason
 * was named for and the one where topping up is genuinely the answer.
 */
function classifyRequest(err: unknown): DepositFailure {
    const revert = decodeRevert(err);
    if (revert?.family === 'protocol') {
        return {
            step: 'request',
            reason: 'reverted',
            revertError: revert.name,
            error: err,
        };
    }
    if (revert !== null || isUnpredictableGas(err)) {
        return { step: 'request', reason: 'insufficient-balance', error: err };
    }
    return classifyWalletFailure('request', err);
}

// ---------------------------------------------------------------------------
// The flow
// ---------------------------------------------------------------------------

export class DepositFlow extends Flow<DepositState, DepositFlowInput> {
    private readonly _ttlMs: number;
    private readonly _defaultSpender: string | undefined;
    private readonly _now: () => number;

    /**
     * The accept handshake. The run parks on this promise; `acceptContract`,
     * `declineContract` and `reset` each settle it with an `AcceptOutcome`.
     * Cleared the moment it settles so a stale resolver from an abandoned run
     * can never leak into the next one.
     */
    private _accept: { settle: (outcome: AcceptOutcome) => void } | null = null;

    /**
     * The run token that is between `acceptContract()` and the wallet
     * settling, or `null`.
     *
     * A token rather than a boolean, because the flag has to belong to the RUN
     * that set it: after `reset()` out of a wallet prompt that never answers,
     * the abandoned run's `finally` may not arrive for minutes, and a boolean
     * left standing refuses both Accept and Decline on every run after it.
     * A stale token simply is not the current generation.
     */
    private _acceptingFor: number | null = null;

    constructor(
        private readonly _ports: DepositPorts,
        opts?: DepositFlowOptions,
    ) {
        super(INITIAL);
        this._ttlMs = opts?.contractTtlMs ?? CONTRACT_TTL_MS;
        this._defaultSpender = opts?.spender;
        // Called through the ports object, never captured off it: a consumer
        // whose clock is a method on its own object keeps its `this`.
        this._now = (): number => _ports.now?.() ?? Date.now();
    }

    /**
     * Sign the agreement and resume the parked run. A no-op when nothing is
     * parked, so a double tap cannot sign twice.
     */
    async acceptContract(): Promise<void> {
        const bridge = this._accept;
        const contract = this._store.state.contract;
        if (!bridge || !contract || this._isAccepting()) return;
        const token = this._store.generation;
        this._acceptingFor = token;
        this._store.patch(
            {
                phase: 'accepting-sign',
                ...badgeFor('confirm', this._store.state.approvalRequired),
            },
            token,
        );
        try {
            const signature = await this._ports.signMessage(
                contract.contractMessage,
            );
            // Checked HERE, not at the encoder: this is the signature the
            // agreements service verifies the deposit against, and a wallet
            // that returned something other than 65 bytes has not signed
            // anything. Failing the confirm step names the step that produced
            // it; letting it through would put an unverifiable blob on chain.
            if (!isPersonalSignature(signature)) {
                bridge.settle({
                    kind: 'failed',
                    error: new Error(INVALID_ACCEPTANCE_SIGNATURE_MESSAGE),
                });
                return;
            }
            bridge.settle({ kind: 'accepted', signature });
        } catch (err) {
            // A WALLET error, and the only one this flow classifies as a
            // possible cancellation on the confirm step.
            bridge.settle({ kind: 'failed', error: err });
        } finally {
            // Only if this run still holds it: a `reset()` during the prompt
            // may have started another one, and that one's flag is its own.
            if (this._acceptingFor === token) this._acceptingFor = null;
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
        if (!bridge || this._isAccepting()) return;
        this._accept = null;
        bridge.settle({ kind: 'declined' });
    }

    /** True only while THIS generation is waiting on the acceptance signature. */
    private _isAccepting(): boolean {
        return (
            this._acceptingFor !== null &&
            this._store.isCurrent(this._acceptingFor)
        );
    }

    /** `reset()`: unpark the abandoned run and drop its handshake. */
    protected override _onAbandon(): void {
        const bridge = this._accept;
        this._accept = null;
        this._acceptingFor = null;
        bridge?.settle({ kind: 'abandoned' });
    }

    // -----------------------------------------------------------------------

    protected async _run(
        input: DepositFlowInput,
        token: number,
    ): Promise<void> {
        this._accept = null;
        this._acceptingFor = null;
        const ports = this._ports;
        const owner = input.userAddress.toLowerCase();

        // 0. The spender, from the input or from the chain config the facade
        //    built this flow with. Without one there is nothing to read an
        //    allowance against and nothing to approve — and guessing would
        //    grant an approval to the wrong contract.
        const spender = input.spender ?? this._defaultSpender;
        if (!spender) {
            this._fail(token, true, {
                step: 'generate',
                reason: 'failed',
                error: new Error(NO_SPENDER_MESSAGE),
            });
            return;
        }

        // 1. Allowance pre-check. Decides `approvalRequired` — and therefore
        //    the badge total — before the lender is shown a single step. Read
        //    live, never cached: an exact-amount approval is fully consumed by
        //    the deposit it paid for, so a stale allowance is exactly the value
        //    that would wrongly skip the approve and revert the deposit.
        let approvalRequired = true;
        try {
            const allowance = await ports.readAllowance(owner, spender);
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
            this._fail(
                token,
                approvalRequired,
                classifyWalletFailure('generate', err),
            );
            return;
        }
        // The same EIP-191 shape as the acceptance, and the same reason to
        // check it: kasu-backend verifies this one to decide whether to issue
        // an agreement at all, so a malformed signature is a 4xx that says
        // nothing about which step produced it. Named here instead.
        if (!isPersonalSignature(signature)) {
            this._fail(token, approvalRequired, {
                step: 'generate',
                reason: 'failed',
                error: new Error(INVALID_AUTH_SIGNATURE_MESSAGE),
            });
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
        const outcome = await new Promise<AcceptOutcome>((resolve) => {
            this._accept = { settle: resolve };
            this._store.patch(
                {
                    phase: 'awaiting-accept',
                    contract,
                    ...badgeFor('confirm', approvalRequired),
                },
                token,
            );
        });
        this._accept = null;
        // An abandoned run lands here too — `reset()` unparks it. The token
        // check is what tells the two apart.
        if (!this._store.isCurrent(token)) return;
        if (outcome.kind === 'declined') {
            this._store.patch(
                { phase: 'declined', ...badgeFor('confirm', approvalRequired) },
                token,
            );
            return;
        }
        if (outcome.kind !== 'accepted') {
            if (outcome.kind === 'failed') {
                this._fail(
                    token,
                    approvalRequired,
                    classifyWalletFailure('confirm', outcome.error),
                );
            }
            return;
        }

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

        // The acceptance signature is already known to be 65 bytes, but the
        // encoder also reads `timestamp`, `contractVersion` and
        // `contractType` off a response the SDK did not produce. `start()`
        // promises it does not reject, so anything that throws in here becomes
        // a failure the consumer can render rather than an unhandled rejection
        // in an application that was told it never had to catch one.
        let depositData: string;
        try {
            depositData = encodeDepositData({
                signature: outcome.signature,
                timestamp: contract.timestamp,
                contractVersion: contract.contractVersion,
                contractType: asContractType(contract.contractType),
            });
        } catch (err) {
            this._fail(token, approvalRequired, {
                step: 'request',
                reason: 'failed',
                error: err,
            });
            return;
        }

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
                const tx = await ports.approve(spender, input.amount);
                await tx.wait();
            } catch (err) {
                this._fail(
                    token,
                    approvalRequired,
                    classifyWalletFailure('approve', err),
                );
                return;
            }
            if (!this._store.isCurrent(token)) return;
        }

        // 7. Request — KYC signature, then the deposit and its receipt.
        this._store.patch(
            { phase: 'request-sign', ...badgeFor('request', approvalRequired) },
            token,
        );

        // The two KYC ports reach the consumer's own backend, so they fail the
        // way the generate step does: `failed`, with the error kept. Running
        // them through the rejection classifier would let a backend wording —
        // "Declined", "request rejected" — end a run as "you cancelled in your
        // wallet", with the real error discarded and nothing to report.
        let kyc: KycSignature;
        try {
            const kycParams = await ports.buildKycParams(
                owner as `0x${string}`,
            );
            kyc = await ports.getKycSignature(kycParams);
        } catch (err) {
            this._fail(token, approvalRequired, {
                step: 'request',
                reason: 'failed',
                error: err,
            });
            return;
        }
        if (!this._store.isCurrent(token)) return;

        try {
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
