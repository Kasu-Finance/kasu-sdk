import { Provider } from '@ethersproject/providers';
import { BigNumber, Signer } from 'ethers';

import { IERC20MetadataAbi__factory } from '../contracts';
import {
    DepositFlow,
    DepositPorts,
    WaitableTransaction,
    WithdrawFlow,
    WithdrawPorts,
} from '../flows';
import { UserLending } from '../services/UserLending/user-lending';

import { DepositsFacade } from './deposits';
import { READ_ONLY_MESSAGE } from './read-only';
import { KycParams, StableAsset } from './types';

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

/** Every withdraw port has an SDK default; `ensureKyc` has no default at all. */
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
 */
export class FlowsFacade {
    constructor(
        private readonly _deposits: DepositsFacade,
        private readonly _userLending: UserLending,
        private readonly _signerOrProvider: Provider | Signer,
        private readonly _stableAsset: StableAsset | undefined,
        private readonly _chainId: string,
    ) {}

    /**
     * A deposit pipeline. `readAllowance`, `approve`, `deposit` and
     * `buildKycParams` default to the SDK's own implementations; pass any of
     * them to override (kasu-ui approves through its sponsored-gas path, for
     * one).
     */
    deposit(
        ports: DepositFlowPortOverrides,
        opts?: { contractTtlMs?: number },
    ): DepositFlow {
        return new DepositFlow(
            {
                buildKycParams: (userAddress: `0x${string}`): KycParams =>
                    this._userLending.buildKycSignatureParams(
                        userAddress,
                        this._chainId,
                    ),
                readAllowance: (
                    owner: string,
                    spender: string,
                ): Promise<BigNumber> =>
                    this._erc20().allowance(owner, spender),
                approve: async (
                    spender: string,
                    amount: BigNumber,
                ): Promise<WaitableTransaction> => {
                    this._assertWritable();
                    // The EXACT amount the flow asked for. Nothing here rounds
                    // it up, and nothing here substitutes MaxUint256.
                    return await this._erc20().approve(spender, amount);
                },
                deposit: (params) => this._deposits.deposit(params),
                ...ports,
            },
            opts,
        );
    }

    /** A withdrawal pipeline. Both write ports default to `kasu.deposits`. */
    withdraw(ports: WithdrawFlowPortOverrides = {}): WithdrawFlow {
        return new WithdrawFlow({
            withdraw: (params) =>
                this._deposits.withdraw({
                    poolId: params.poolId,
                    trancheId: params.trancheId,
                    amount: params.amount,
                }),
            withdrawMax: (poolId, trancheId, userAddress) =>
                this._deposits.withdrawMax(poolId, trancheId, userAddress),
            ...ports,
        });
    }

    /**
     * The chain's stable token, bound to whatever this instance holds. Built
     * per call rather than cached: it is one `new Contract`, and caching it
     * would outlive a `connect()` that replaced the signer.
     */
    private _erc20(): ReturnType<typeof IERC20MetadataAbi__factory.connect> {
        const address = this._stableAsset?.address;
        if (!address) {
            throw new Error(
                'Kasu: this chain config has no stableAsset; pass readAllowance and approve ports explicitly',
            );
        }
        return IERC20MetadataAbi__factory.connect(
            address,
            this._signerOrProvider,
        );
    }

    private _assertWritable(): void {
        if (!Signer.isSigner(this._signerOrProvider)) {
            throw new Error(READ_ONLY_MESSAGE);
        }
    }
}
