/**
 * Flows: the headless money-path state machines.
 *
 * `domain/` holds rules that are pure functions. These are the same idea one
 * level up — a rule that unfolds over time, with side effects the consumer
 * injects as ports. They own the ORDER of a deposit and a withdrawal, the
 * guards around them, and the codes that describe where a run got to. They own
 * no UI, no framework, no network and no words.
 *
 * Every application drove its own copy of the deposit pipeline before this, and
 * the copies had already started to differ.
 */
export { Flow } from './flow';
export { FlowStore } from './observable';
export type { WaitableTransaction } from './observable';

export {
    CONTRACT_TTL_MS,
    DepositFlow,
    NO_SPENDER_MESSAGE,
} from './deposit-flow';
export type {
    ContractMessageRequest,
    DepositFailure,
    DepositFlowInput,
    DepositFlowOptions,
    DepositPhase,
    DepositPorts,
    DepositState,
    DepositStep,
    GenerateContractRequest,
    KycSignature,
    LegacyContractRequest,
    LoanAgreementRequest,
} from './deposit-flow';

export { NO_KYC_PARAMS_MESSAGE, WithdrawFlow } from './withdraw-flow';
export type {
    WithdrawFailure,
    WithdrawFlowInput,
    WithdrawPhase,
    WithdrawPorts,
    WithdrawState,
    WithdrawStep,
} from './withdraw-flow';
