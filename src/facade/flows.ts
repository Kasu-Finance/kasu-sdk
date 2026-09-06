import { BigNumber } from 'ethers';

import type { IERC20MetadataAbi } from '../contracts';
import {
    DepositFlow,
    DepositFlowOptions,
    DepositPorts,
    WaitableTransaction,
    WithdrawFlow,
    WithdrawPorts,
} from '../flows';

import { DepositsFacade } from './deposits';
import { READ_ONLY_MESSAGE } from './read-only';
import { KycParams } from './types';

/**
 * The ports a consumer MUST supply for a deposit, plus optional overrides for
 * the ones the SDK can serve itself.
 *
 * The three required ones all reach the application's own backend or wallet:
 * the SDK has no opinion on how a lender signs, which proxy the agreements
 * service sits behind, or where the KYC signature is fetched — and it must not
 * learn any of them, because it is a public package.
 */
export type DepositFlowPortOverrides = Pick<
    DepositPorts,
    'signMessage' | 'generateContract' | 'getKycSignature'
> &
    Partial<DepositPorts>;

/**
 * Every withdraw port has an SDK default except `getKycSignature`, which has
 * no default at all and which turns the KYC pre-check on by being supplied.
 */
export type WithdrawFlowPortOverrides = Partial<WithdrawPorts>;

/**
 * Builds `DepositFlow` / `WithdrawFlow` instances wired to THIS Kasu instance:
 * its chain's stable token, its `LendingPoolManager`, its signer.
 *
 * ```ts
 * const flow = kasu.connect(signer).flows.deposit({
 *   signMessage: (m) => signer.signMessage(m),
 *   generateContract: (req) => postToMyProxy(req),
 *   getKycSignature: (p) => postToMyBackend(p),
 * });
 * ```
 *
 * A flow built from a read-only instance constructs fine and reads fine — the
 * write ports throw `READ_ONLY_MESSAGE` when the run reaches them, exactly as
 * `kasu.deposits.deposit` does. Constructing is not the mistake; submitting is.
 *
 * It holds the `DepositsFacade` and NOTHING the facade already owns: no
 * `UserLending`, no chain id, no signer. Two paths to one behaviour is how the
 * KYC params a flow built came to differ from the ones `kasu.deposits`
 * built — the same class of drift the flows themselves exist to end.
 */
export class FlowsFacade {
    constructor(
        private readonly _deposits: DepositsFacade,
        /**
         * The chain's stable token, bound to whatever the Kasu instance holds.
         * A factory rather than a contract: it is one `new Contract`, and a
         * cached binding would outlive the config it was built from.
         */
        private readonly _erc20: () => IERC20MetadataAbi,
        /** The read-only flag `Kasu` already computed — never re-derived here. */
        private readonly _isReadOnly: boolean,
        /**
         * The ERC-20 spender every deposit run approves: this chain's
         * `LendingPoolManager`, which is the only contract the default deposit
         * port calls. Passed to the flow so a consumer never has to hand-wire
         * an address whose only wrong value grants an approval to the wrong
         * contract.
         */
        private readonly _spender: string,
    ) {}

    /**
     * A deposit pipeline. `readAllowance`, `approve`, `deposit` and
     * `buildKycParams` default to the SDK's own implementations; pass any of
     * them to override (kasu-ui approves through its sponsored-gas path, for
     * one).
     *
     * Each default is applied per key with `??`, not by spreading `ports` over
     * them: `{ ...defaults, ...ports }` lets an EXPLICITLY undefined value
     * delete the default it was meant to keep, and
     * `approve: sponsoredGas ? sponsoredApprove : undefined` is exactly how a
     * consumer writes a conditional override.
     */
    deposit(
        ports: DepositFlowPortOverrides,
        opts?: DepositFlowOptions,
    ): DepositFlow {
        return new DepositFlow(
            {
                signMessage: ports.signMessage,
                generateContract: ports.generateContract,
                getKycSignature: ports.getKycSignature,
                buildKycParams:
                    ports.buildKycParams ??
                    ((userAddress: `0x${string}`): KycParams =>
                        this._deposits.buildKycParams(userAddress)),
                readAllowance:
                    ports.readAllowance ??
                    ((owner: string, spender: string): Promise<BigNumber> =>
                        this._erc20().allowance(owner, spender)),
                approve:
                    ports.approve ??
                    (async (
                        spender: string,
                        amount: BigNumber,
                    ): Promise<WaitableTransaction> => {
                        this._assertWritable();
                        // The EXACT amount the flow asked for. Nothing here
                        // rounds it up, and nothing here substitutes
                        // MaxUint256.
                        return await this._erc20().approve(spender, amount);
                    }),
                deposit:
                    ports.deposit ??
                    ((params): Promise<WaitableTransaction> =>
                        this._deposits.deposit(params)),
                now: ports.now,
            },
            {
                contractTtlMs: opts?.contractTtlMs,
                // Per key here too, for the same reason the ports are: an
                // explicit `spender: undefined` must not delete the default.
                spender: opts?.spender ?? this._spender,
            },
        );
    }

    /**
     * A withdrawal pipeline. Both write ports and `buildKycParams` default to
     * this instance; supplying `getKycSignature` turns the KYC pre-check on.
     * Defaults are applied per key, for the reason `deposit()` gives.
     */
    withdraw(ports: WithdrawFlowPortOverrides = {}): WithdrawFlow {
        return new WithdrawFlow({
            buildKycParams:
                ports.buildKycParams ??
                ((userAddress: `0x${string}`): KycParams =>
                    this._deposits.buildKycParams(userAddress)),
            getKycSignature: ports.getKycSignature,
            withdraw:
                ports.withdraw ??
                ((params): Promise<WaitableTransaction> =>
                    this._deposits.withdraw({
                        poolId: params.poolId,
                        trancheId: params.trancheId,
                        amount: params.amount,
                    })),
            withdrawMax:
                ports.withdrawMax ??
                ((
                    poolId: string,
                    trancheId: string,
                    userAddress: string,
                ): Promise<WaitableTransaction> =>
                    this._deposits.withdrawMax(poolId, trancheId, userAddress)),
        });
    }

    private _assertWritable(): void {
        if (this._isReadOnly) {
            throw new Error(READ_ONLY_MESSAGE);
        }
    }
}
